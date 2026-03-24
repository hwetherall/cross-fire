import type { DebateConfig, DebateRound, RedTeamOutput, BlueTeamOutput, FinalSummary, RevisedDocument, DocumentChange, Objection, ObjectionCategory } from './types';
import { RedTeamOutputSchema, BlueTeamOutputSchema } from './schemas';
import { callOpenRouter } from './openrouter';
import { getModelId } from './models';
import {
  buildRedTeamSystemPrompt,
  buildRedTeamRound1UserPrompt,
  buildRedTeamFollowUpUserPrompt,
  buildBlueTeamSystemPrompt,
  buildBlueTeamUserPrompt,
  buildRewriteSystemPrompt,
  buildRewriteUserPrompt,
} from './prompts';
import { runSearches } from './search';
import { deriveRevisionItems } from './derive';
import { parseLLMJson } from './utils';
import type { z } from 'zod';

export type DebateEvent =
  | { type: 'progress'; data: { round: number; phase: string } }
  | { type: 'redRound'; data: { roundNumber: number; redTeam: RedTeamOutput } }
  | { type: 'round'; data: DebateRound }
  | { type: 'summary'; data: FinalSummary }
  | { type: 'rewrite'; data: RevisedDocument };

async function callWithRetry<T>(
  model: string,
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  schema: z.ZodType<T>,
  temperature: number,
  maxTokens = 4096,
  maxRetries = 2
): Promise<T> {
  const msgsCopy = [...messages];

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const raw = await callOpenRouter({
      model,
      messages: msgsCopy,
      temperature,
      max_tokens: maxTokens,
    });

    try {
      const parsed = parseLLMJson(raw);
      const result = schema.safeParse(parsed);
      if (result.success) return result.data;

      const errorMsg = result.error.message;
      console.warn(`Validation failed (attempt ${attempt + 1}):`, errorMsg);

      msgsCopy.push({
        role: 'assistant',
        content: raw,
      });
      msgsCopy.push({
        role: 'user',
        content: `Your previous response had validation errors: ${errorMsg}. Please fix and respond with valid JSON only.`,
      });
    } catch (parseErr) {
      console.warn(`JSON parse failed (attempt ${attempt + 1}):`, parseErr);

      msgsCopy.push({
        role: 'user',
        content: `Your previous response was not valid JSON. Please respond with valid JSON only, no markdown wrapping, no preamble.`,
      });
    }
  }

  throw new Error(`Failed to get valid response after ${maxRetries + 1} attempts`);
}

// Change #7: Extract changelog from inline change markers
function extractChangesFromMarkers(document: string): DocumentChange[] {
  const changes: DocumentChange[] = [];
  const pattern = /<!--CHANGE objectionId="([^"]*)" reason="([^"]*)"-->([\s\S]*?)<!--\/CHANGE-->/g;
  let match;

  while ((match = pattern.exec(document)) !== null) {
    changes.push({
      location: `Near objection ${match[1]}`,
      original: '(see original document)',
      revised: match[3].trim(),
      reason: match[2],
      objectionIds: [match[1]],
    });
  }

  return changes;
}

// Strip change markers from the final document
function stripChangeMarkers(document: string): string {
  return document.replace(/<!--CHANGE objectionId="[^"]*" reason="[^"]*"-->/g, '')
    .replace(/<!--\/CHANGE-->/g, '');
}

export async function* runDebate(config: DebateConfig): AsyncGenerator<DebateEvent> {
  const history: DebateRound[] = [];
  const redModelId = getModelId(config.redTeamModel);
  const blueModelId = getModelId(config.blueTeamModel);

  // Bump token budget for long documents (spec: >5000 words → 6144)
  const docWordCount = config.document.split(/\s+/).length;
  const maxTokens = docWordCount > 5000 ? 6144 : 4096;

  for (let round = 1; round <= config.maxRounds; round++) {
    // Emit progress so the stream stays alive
    yield { type: 'progress', data: { round, phase: 'Red Team reviewing document...' } };

    // 1. Build Red Team prompt
    const redSystemPrompt = buildRedTeamSystemPrompt(config);
    const redUserPrompt =
      round === 1
        ? buildRedTeamRound1UserPrompt(config, round)
        : buildRedTeamFollowUpUserPrompt(config, round, history);

    // 2. Call Red Team
    const redParsed = await callWithRetry<RedTeamOutput>(
      redModelId,
      [
        { role: 'system', content: redSystemPrompt },
        { role: 'user', content: redUserPrompt },
      ],
      RedTeamOutputSchema,
      0.7,
      maxTokens
    );

    // Change #9: Check for early termination signal
    if (redParsed.earlyTermination && round > 1) {
      // Emit the red round with no new objections, then break
      yield {
        type: 'redRound',
        data: { roundNumber: round, redTeam: redParsed },
      };
      yield { type: 'progress', data: { round, phase: redParsed.terminationReason || 'Red Team ended debate early — all substantive issues addressed.' } };
      break;
    }

    // Emit Red Team output immediately so the UI can render objections
    // while Blue Team is still generating responses.
    yield {
      type: 'redRound',
      data: {
        roundNumber: round,
        redTeam: redParsed,
      },
    };

    // Emit progress before Blue Team call
    yield { type: 'progress', data: { round, phase: 'Blue Team responding...' } };

    // 3. Optional web search
    let searchResults: string | null = null;
    if (config.searchEnabled) {
      const searchItems = redParsed.objections.filter((o) => o.requiresSearch);
      if (searchItems.length > 0) {
        yield { type: 'progress', data: { round, phase: `Verifying ${searchItems.length} claim(s)...` } };
        searchResults = await runSearches(searchItems);
      }
    }

    // 4. Build Blue Team prompt
    const blueSystemPrompt = buildBlueTeamSystemPrompt(config);
    const blueUserPrompt = buildBlueTeamUserPrompt(
      config,
      round,
      redParsed,
      history,
      searchResults
    );

    // 5. Call Blue Team
    const blueParsed = await callWithRetry<BlueTeamOutput>(
      blueModelId,
      [
        { role: 'system', content: blueSystemPrompt },
        { role: 'user', content: blueUserPrompt },
      ],
      BlueTeamOutputSchema,
      0.4,
      maxTokens
    );

    // 6. Assemble round
    const debateRound: DebateRound = {
      roundNumber: round,
      redTeam: redParsed,
      blueTeam: blueParsed,
    };

    history.push(debateRound);
    yield { type: 'round', data: debateRound };

    // 7. Early termination checks
    const allResolved = blueParsed.responses.every((r) => r.status === 'resolved');
    const noNewObjections = round > 1 && redParsed.objections.length === 0;
    if ((allResolved || noNewObjections) && round > 1) {
      yield { type: 'progress', data: { round, phase: 'All items resolved — ending debate early.' } };
      break;
    }
  }

  // 8. Generate final summary
  yield { type: 'summary', data: generateFinalSummary(history) };

  // 9. Generate revised document (Change #7: single merged call with inline markers)
  const revisionItems = deriveRevisionItems(history);
  if (revisionItems.length > 0) {
    const rewriteModelId = getModelId('opus-4.6');
    // Use generous token budget — the rewrite outputs the full document
    const rewriteMaxTokens = Math.max(16384, maxTokens * 3);

    yield { type: 'progress', data: { round: 0, phase: 'Rewriting document with proposed revisions...' } };

    const rawRewrite = await callOpenRouter({
      model: rewriteModelId,
      messages: [
        { role: 'system', content: buildRewriteSystemPrompt() },
        { role: 'user', content: buildRewriteUserPrompt(config, revisionItems, history) },
      ],
      temperature: 0.3,
      max_tokens: rewriteMaxTokens,
      jsonMode: false,
    });

    // Extract changelog from inline markers, then strip them for clean document
    const changes = extractChangesFromMarkers(rawRewrite);
    const cleanDocument = stripChangeMarkers(rawRewrite).trim();
    const changeSummary = `${changes.length} changes applied across ${revisionItems.length} revision items.`;

    yield {
      type: 'rewrite',
      data: {
        rewrittenDocument: cleanDocument,
        changes,
        summary: changeSummary,
      },
    };
  }
}

function generateFinalSummary(history: DebateRound[]): FinalSummary {
  const allObjections: Objection[] = [];
  const resolvedIds = new Set<string>();
  const escalatedIds = new Set<string>();

  for (const round of history) {
    for (const obj of round.redTeam.objections) {
      allObjections.push(obj);
    }

    if (round.redTeam.resolvedFromPrior) {
      for (const id of round.redTeam.resolvedFromPrior) {
        resolvedIds.add(id);
      }
    }

    for (const resp of round.blueTeam.responses) {
      if (resp.status === 'resolved') {
        resolvedIds.add(resp.objectionId);
      } else if (resp.status === 'escalated') {
        escalatedIds.add(resp.objectionId);
      }
    }
  }

  const uniqueObjections = new Map<string, Objection>();
  for (const obj of allObjections) {
    uniqueObjections.set(obj.id, obj);
  }

  const total = uniqueObjections.size;
  const resolved = [...uniqueObjections.keys()].filter((id) => resolvedIds.has(id)).length;
  const escalated = [...uniqueObjections.keys()].filter((id) => escalatedIds.has(id)).length;
  const unresolved = total - resolved - escalated;

  const byCategory: Record<ObjectionCategory, number> = {
    clarification: 0,
    cosmetic: 0,
    gap: 0,
    error: 0,
    disagreement: 0,
  };

  for (const obj of uniqueObjections.values()) {
    byCategory[obj.category]++;
  }

  const topUnresolved = [...uniqueObjections.values()].filter(
    (obj) => !resolvedIds.has(obj.id) && !escalatedIds.has(obj.id)
  );

  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  topUnresolved.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  let recommendation: string;
  const criticalUnresolved = topUnresolved.filter(
    (o) => o.severity === 'critical' || o.severity === 'high'
  );

  if (criticalUnresolved.length === 0 && unresolved <= 2) {
    recommendation =
      'The document is ready for client delivery with minor revisions based on resolved items.';
  } else if (criticalUnresolved.length <= 2) {
    recommendation =
      'The document needs targeted revisions to address the remaining high-priority objections before client delivery.';
  } else {
    recommendation =
      'The document requires significant revision. Multiple critical/high-severity objections remain unresolved. Recommend a revision cycle before client delivery.';
  }

  return {
    totalObjections: total,
    resolved,
    unresolved,
    escalated,
    byCategory,
    topUnresolved: topUnresolved.slice(0, 5),
    recommendation,
  };
}
