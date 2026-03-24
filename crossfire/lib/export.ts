import type { DebateConfig, DebateRound, FinalSummary, RevisedDocument } from './types';

export function exportAsJson(
  config: DebateConfig,
  rounds: DebateRound[],
  summary: FinalSummary,
  revisedDocument?: RevisedDocument | null
): string {
  return JSON.stringify(
    { config, rounds, finalSummary: summary, ...(revisedDocument ? { revisedDocument } : {}) },
    null,
    2
  );
}

export function exportAsMarkdown(
  config: DebateConfig,
  rounds: DebateRound[],
  summary: FinalSummary,
  revisedDocument?: RevisedDocument | null
): string {
  const lines: string[] = [];

  lines.push(`# Crossfire Debate Report`);
  lines.push('');
  lines.push(`**Client:** ${config.clientRole} at ${config.clientCompany}`);
  lines.push(`**Industry:** ${config.clientIndustry}`);
  lines.push(`**Agent Name:** ${config.documentType}`);
  lines.push(`**ESL Mode:** ${config.eslEnabled ? 'Yes' : 'No'}`);
  lines.push(`**Red Team:** ${config.redTeamModel} | **Blue Team:** ${config.blueTeamModel}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const round of rounds) {
    lines.push(`## Round ${round.roundNumber}`);
    lines.push('');

    lines.push(`### Red Team`);
    lines.push(`> ${round.redTeam.summary}`);
    lines.push('');

    if (round.redTeam.resolvedFromPrior?.length) {
      lines.push(`*Accepted as resolved:* ${round.redTeam.resolvedFromPrior.join(', ')}`);
      lines.push('');
    }

    for (const obj of round.redTeam.objections) {
      lines.push(
        `**${obj.id}** [${obj.category}/${obj.severity}]`
      );
      lines.push(`> "${obj.quote}"`);
      lines.push('');
      lines.push(obj.objection);
      if (obj.suggestedResolution) {
        lines.push(`*Suggested:* ${obj.suggestedResolution}`);
      }
      lines.push('');
    }

    lines.push(`### Blue Team`);
    lines.push(`> ${round.blueTeam.summary}`);
    lines.push('');

    for (const resp of round.blueTeam.responses) {
      lines.push(
        `**Re: ${resp.objectionId}** [${resp.responseType}] — ${resp.status}`
      );
      lines.push(resp.explanation);
      if (resp.proposedChange) {
        lines.push(`*Proposed Change:* ${resp.proposedChange}`);
      }
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  }

  lines.push(`## Final Summary`);
  lines.push('');
  lines.push(`| Metric | Count |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Total Objections | ${summary.totalObjections} |`);
  lines.push(`| Resolved | ${summary.resolved} |`);
  lines.push(`| Unresolved | ${summary.unresolved} |`);
  lines.push(`| Escalated | ${summary.escalated} |`);
  lines.push('');

  lines.push(`**By Category:**`);
  for (const [cat, count] of Object.entries(summary.byCategory)) {
    if (count > 0) lines.push(`- ${cat}: ${count}`);
  }
  lines.push('');

  lines.push(`**Recommendation:** ${summary.recommendation}`);

  if (revisedDocument) {
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push(`## Suggested Final Output`);
    lines.push('');
    lines.push(`*${revisedDocument.summary}*`);
    lines.push('');

    lines.push(`### Changelog`);
    lines.push('');
    for (const change of revisedDocument.changes) {
      lines.push(`**${change.location}** (${change.objectionIds.join(', ')})`);
      lines.push(`- **Original:** ${change.original}`);
      lines.push(`- **Revised:** ${change.revised}`);
      lines.push(`- **Reason:** ${change.reason}`);
      lines.push('');
    }

    lines.push(`### Revised Document`);
    lines.push('');
    lines.push(revisedDocument.rewrittenDocument);
  }

  return lines.join('\n');
}
