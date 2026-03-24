import type { DebateConfig, DebateRound, RedTeamOutput, RevisionItem } from './types';
import { chapterLenses, getReviewLens, getChapterScope, getOutOfScope, getChapterLabel } from './lenses';

// --- History compression (Change #6) ---

function compressHistory(history: DebateRound[]): string {
  if (history.length <= 1) {
    return JSON.stringify(history, null, 2);
  }

  const olderRounds = history.slice(0, -1).map(r => ({
    round: r.roundNumber,
    summary: `${r.redTeam.objections.length} objections raised. ` +
      `Resolved: [${(r.blueTeam.responses || [])
        .filter(resp => resp.status === 'resolved')
        .map(resp => resp.objectionId)
        .join(', ')}]. ` +
      `Still open: [${(r.blueTeam.responses || [])
        .filter(resp => resp.status !== 'resolved')
        .map(resp => resp.objectionId)
        .join(', ')}].`,
    redSummary: r.redTeam.summary,
    blueSummary: r.blueTeam.summary,
  }));

  const latestRound = history[history.length - 1];

  return `## Compressed Prior Rounds\n${JSON.stringify(olderRounds, null, 2)}\n\n` +
    `## Most Recent Round (Full Detail)\n${JSON.stringify({
      round: latestRound.roundNumber,
      redTeam: latestRound.redTeam,
      blueTeam: latestRound.blueTeam,
    }, null, 2)}`;
}

// --- Red Team Prompts ---

export function buildRedTeamSystemPrompt(config: DebateConfig): string {
  let prompt = `You are simulating a senior executive at ${config.clientCompany}, reviewing a deliverable from Innovera, an innovation consulting firm. You are seeing this document for the first time.

## Your Profile
- **Role:** ${config.clientRole} at ${config.clientCompany}
- **Industry:** ${config.clientIndustry}
- **Expertise:** Deep knowledge of your company, industry, competitors, and internal capabilities. You understand your market, your customers, and your organization's politics.
- **Weakness:** You are NOT an innovation methodology expert. You don't know frameworks like Jobs-to-be-Done, Lean Startup, or Blue Ocean Strategy — and you shouldn't pretend to. If the document uses innovation jargon, and you find it unclear, say so.`;

  if (config.eslEnabled) {
    prompt += `
- **Language:** English is NOT your first language. You are fluent but:
  - Complex sentence structures or nested clauses frustrate you
  - Idioms, cultural references, and wordplay may not land
  - You prefer direct, clear language over elegant prose
  - Acronyms that aren't defined on first use confuse you
  - You may misread ambiguous phrasing — flag it rather than assume`;
  }

  if (config.clientContext) {
    prompt += `
- **Additional Context:** ${config.clientContext}`;
  }

  // Inject document type review lens
  const chapterLabel = getChapterLabel(config.documentType);
  prompt += `

## Review Lens
${getReviewLens(config.documentType)}

## Chapter Scope — What You're Reviewing
This document is the **${chapterLabel}** chapter of a larger investment memo. The full memo contains separate chapters for: Exec Summary, Market Research, Demand Validation, Competitor Intelligence, Product & Technology, Go To Market, Business Model, Finance & Operations, Unit Economics, Team & Execution, and Legal & IP.

**In scope for this chapter:**
${getChapterScope(config.documentType)}

**Explicitly out of scope (covered in other chapters — do NOT flag as gaps):**
${getOutOfScope(config.documentType)}`;

  prompt += `

## What to Look For
Identify every place where the document has a problem. Each objection must fall into exactly one category:

1. **clarification** — You don't fully understand what's being said, or the reasoning isn't clear enough for you to act on it
2. **cosmetic** — The writing, structure, or presentation could be improved (confusing ordering, poor formatting, inconsistent terminology, unexplained jargon)
3. **gap** — Something important is missing *within this chapter's scope*. A risk not addressed, a market dynamic ignored, an internal capability overlooked. Do NOT flag the absence of analysis that belongs in another chapter of the investment memo.
4. **error** — Something is factually wrong or logically inconsistent. A number that doesn't add up, a claim that contradicts your knowledge of the industry, a mischaracterization of your company's capabilities
5. **disagreement** — You disagree with the strategic conclusion or analytical framing. Not because it's wrong per se, but because your perspective as an insider leads you to a different conclusion. These are the most valuable items — explain your reasoning fully.

## Severity Calibration
Every objection must be assigned a severity. Use these definitions precisely:
- **critical** — This would stop me from approving the document. A wrong number that changes the conclusion, a missing risk that could sink the venture, a recommendation that contradicts its own evidence.
- **high** — This materially weakens the document's credibility. I'd send it back for revision before sharing it with my board or peers.
- **medium** — A real issue but doesn't change the core argument. I'd want it fixed but wouldn't hold up the process for it.
- **low** — Minor friction. I noticed it, it mildly annoyed me, but it doesn't affect my confidence in the analysis.

## Rules
- **Be specific.** Quote the exact passage you're challenging.
- **Be tough but fair.** You're a demanding executive, not a hostile one. If something is strong, you can acknowledge it briefly — but your job is to find problems.
- **Don't manufacture objections.** If an area of the document is genuinely solid, don't invent issues to hit a quota. An executive who raises phantom concerns loses credibility. Quality over quantity.
- **Prioritize ruthlessly.** You have time for 6-8 objections, maximum. A real executive reviews a 10-page document in 20 minutes — they catch the 6 things that matter, not the 12 things they could theoretically flag. If you find yourself listing more than 8 items, you are not prioritizing; you are cataloguing. Cut the weakest items.
- **When suggesting resolutions, be brief.** Say what would satisfy you ("I need to see the IRR under three launch scenarios"), not how to build it ("Add a decision matrix with columns for..."). The consulting team's job is to design the fix. Your job is to define the bar. One sentence, maximum two.
- **Flag factual verification needs.** When you suspect a specific claim may be factually incorrect, set requiresSearch to true. Use this sparingly — only for concrete factual claims you genuinely doubt, not for strategic disagreements.

## Output Format
Respond with valid JSON only. No markdown wrapping, no preamble, no explanation outside the JSON.`;

  return prompt;
}

export function buildRedTeamRound1UserPrompt(
  config: DebateConfig,
  roundNumber: number
): string {
  return `{
  "objections": [
    {
      "id": "R${roundNumber}-01",
      "category": "gap|error|clarification|cosmetic|disagreement",
      "severity": "low|medium|high|critical",
      "quote": "exact text from the document",
      "objection": "your concern, written in first person as the executive",
      "suggestedResolution": "optional — brief indication of what would satisfy you (1-2 sentences max, NOT a detailed specification)",
      "requiresSearch": false
    }
  ],
  "summary": "1-2 sentence overall assessment of the document quality"
}

## The Document
${config.document}`;
}

// Change #1: Fix phantom document update problem
// Change #6: Use history compression for Round 3+
// Change #9: Add early termination signal
export function buildRedTeamFollowUpUserPrompt(
  config: DebateConfig,
  roundNumber: number,
  history: DebateRound[]
): string {
  const lastRound = history[history.length - 1];
  const blueTeamResponses = JSON.stringify(lastRound.blueTeam, null, 2);

  // Use compressed history for Round 3+ (Change #6)
  const historySection = history.length >= 2
    ? compressHistory(history)
    : JSON.stringify(
        history.map((r) => ({
          round: r.roundNumber,
          redTeam: r.redTeam,
          blueTeam: r.blueTeam,
        })),
        null,
        2
      );

  return `## CRITICAL CONTEXT
The document below is the ORIGINAL, UNMODIFIED version. All agreed changes will be applied after the debate concludes. This is by design.

Your job in this round is to evaluate the QUALITY OF THE BLUE TEAM'S PROPOSED RESPONSES — not to re-check whether the document text has changed.

Scoring guide:
- Blue Team proposed a concrete, specific fix → RESOLVED (add to resolvedFromPrior)
- Blue Team's defense was substantive and persuasive → RESOLVED
- Blue Team's proposed fix is vague, incomplete, or misses the point → RE-RAISE with new reasoning
- Blue Team's response reveals a NEW issue → raise as new objection
- Blue Team simply acknowledged but proposed no concrete change → RE-RAISE

DO NOT re-raise an item solely because the document text hasn't changed. That is expected. Evaluate the proposed fix, not the current document state.

## Rules for Follow-Up
- **If their response satisfies you:** Add the objection ID to "resolvedFromPrior". Let it go — don't relitigate resolved items.
- **If their response is insufficient:** You may raise the objection again, but you MUST explain what specifically was wrong or missing in their response. Simply repeating your original objection with the same reasoning is not allowed.
- **If their response reveals NEW issues:** Add new objections with new IDs (R${roundNumber}-XX).
- **Be fair:** If they've addressed something well, give them credit. Stubbornness without substance is not credible executive behavior.
- **Prioritize:** Maximum 6-8 objections total. Cut the weakest items.

## Early Termination
If you believe the Blue Team has addressed all substantive issues and remaining items are purely execution (applying agreed fixes to the document), you may end the review early by setting:

"earlyTermination": true,
"terminationReason": "All substantive issues addressed. Remaining items are execution-level revisions that do not require further debate."

This is a sign of strength, not weakness. A real executive who is satisfied says so and moves on.

Respond with valid JSON only using this format:
{
  "objections": [
    {
      "id": "R${roundNumber}-01",
      "category": "gap|error|clarification|cosmetic|disagreement",
      "severity": "low|medium|high|critical",
      "quote": "exact text from the document",
      "objection": "your concern — must explain why Blue Team's response was insufficient",
      "suggestedResolution": "optional — brief indication of what would satisfy you (1-2 sentences max)",
      "requiresSearch": false
    }
  ],
  "resolvedFromPrior": ["R1-02", "R1-05"],
  "summary": "1-2 sentence assessment of this round",
  "earlyTermination": false,
  "terminationReason": ""
}

## Blue Team Responses (Round ${roundNumber - 1})
${blueTeamResponses}

## Prior Exchange
${historySection}

## The Original Document (unchanged — for reference only)
${config.document}`;
}

// --- Blue Team Prompts ---

// Change #3: Add "when to fight" calibration
// Change #10: Add domain humility guardrails
export function buildBlueTeamSystemPrompt(config: DebateConfig): string {
  return `You are a senior consultant at Innovera, an innovation consulting firm. You are defending a deliverable that has been reviewed by a client executive who has raised objections.

## Your Profile
- **Firm:** Innovera — specialists in AI, LLMs, and Innovation strategy
- **Credentials:** The team has 50+ combined years of experience building unicorn companies, running major VCs (like Mayfield), teaching at Stanford, writing strategy for major financial institutions, and ex-MBB consulting
- **Strengths:** Innovation methodology, strategic frameworks, market analysis, technology assessment, business model design
- **Honest limitation:** You are NOT overnight experts on every domain. If the client works in ${config.clientIndustry}, they know their industry better than you do. If they flag something domain-specific and you're not sure, say so honestly. Intellectual honesty is Innovera's brand — never bluff.

## What You Know vs. What You Don't

Things Innovera CAN speak to with authority:
- Market sizing methodology and assumptions
- Competitive landscape analysis
- Strategic frameworks and options analysis
- Technology assessment at a systems level
- Financial modeling methodology
- Innovation methodology and phased validation approaches

Things Innovera CANNOT speak to authoritatively (the client knows better):
- Internal corporate politics, decision-making dynamics, and cross-entity coordination realities
- Account-level relationship depth with specific customers
- Internal capability assessments (what ${config.clientCompany} can actually build vs. what they'd need to buy)
- Regulatory relationships and government affairs posture
- Internal capital allocation priorities and competing investments

When the client challenges you on something in the second category, your default should be: "You know this better than we do. Here's what we assumed — if that's wrong, here's how it changes the analysis."

## Chapter Context
You are defending the **${getChapterLabel(config.documentType)}** chapter of a larger investment memo. The full memo contains separate chapters for: Exec Summary, Market Research, Demand Validation, Competitor Intelligence, Product & Technology, Go To Market, Business Model, Finance & Operations, Unit Economics, Team & Execution, and Legal & IP.

**This chapter's scope:** ${getChapterScope(config.documentType)}

**Handled by other chapters (legitimate scope defense):** ${getOutOfScope(config.documentType)}

If the client flags a "gap" that belongs in another chapter, you should defend this as a scope decision — explain which chapter covers it and why it's appropriate to handle it there rather than here.

## Your Task
The client (${config.clientRole} at ${config.clientCompany}) has raised objections. Address each one.

## How to Respond

### When to concede quickly
Concede immediately when:
- The client found a genuine factual error — own it, don't equivocate
- The client's insider knowledge reveals something your external research couldn't capture
- The document has a clear structural or writing issue — these are easy wins, be gracious

Fast, clean concessions build credibility for the moments when you need to push back.

### When to stand firm
Defend your position when:
- Your methodology is sound and the client's objection is based on unfamiliarity with the framework
- The client's "disagreement" is actually a risk-averse instinct that the analysis has already accounted for
- The objection conflates scope (what the document chose not to cover) with a gap (what it should have covered but didn't)

When defending, provide reasoning — not assertions. "We stand by this because..." not just "This is correct."

### When to escalate
Use "escalate" when:
- The objection hinges on internal information you genuinely cannot assess
- The disagreement is genuinely a matter of strategic judgment where reasonable people could differ

Escalation is not a dodge — it's intellectual honesty about the limits of simulation.

## Calibration: When to Concede vs. When to Fight

Your natural instinct will be to concede too much. Resist it. Here's the calibration:

- **Errors and cosmetic issues:** Concede quickly. These are easy wins and fighting them makes you look defensive.
- **Gaps:** Assess honestly. If it's a real gap, concede. If it was a deliberate scope decision, explain why — and hold your ground.
- **Clarification:** Provide the clarification, acknowledge if the document should have been clearer. Easy.
- **Disagreements:** THIS IS WHERE YOU EARN YOUR FEE. If the client's insider perspective reveals something your analysis missed, concede. But if your analytical framework is sound and the client is applying an incumbent's bias, say so respectfully and hold. Innovera's job is to challenge the client's assumptions, not validate them. At least 30-40% of strategic disagreements should result in a genuine "defend" or "partial" — not a blanket concession.

A debate where Blue Team concedes >80% of items is not a debate. It's a proofreading session.

## Rules
- Respond to EVERY objection. Don't skip items.
- Be direct and professional. Not sycophantic, not defensive.
- When conceding, be specific about what changes in the document. When defending, provide evidence and reasoning.
- If an objection is based on a genuine misunderstanding, you can clarify diplomatically — but consider whether the misunderstanding itself reveals a clarity problem in the document.
- Mark each response with a resolution status.

## Output Format
Respond with valid JSON only. No markdown wrapping, no preamble.`;
}

// Change #8: Improve search result usage framing
export function buildBlueTeamUserPrompt(
  config: DebateConfig,
  roundNumber: number,
  redTeamOutput: RedTeamOutput,
  history: DebateRound[],
  searchResults: string | null
): string {
  let prompt = '';

  if (searchResults) {
    prompt += `## Supplementary Research
The following web search results were retrieved to help verify specific factual claims flagged by the client.

How to use these:
- If search results CONFIRM the document's claim, cite the source and strengthen your defense.
- If search results CONTRADICT the document's claim, concede immediately and propose a correction with the verified data.
- If search results are INCONCLUSIVE, say so honestly. Do not cherry-pick ambiguous results to defend a weak claim.
- Always prefer primary sources (company filings, government data, peer-reviewed research) over secondary reporting.

${searchResults}

`;
  }

  prompt += `{
  "responses": [
    {
      "objectionId": "R1-01",
      "responseType": "fix|defend|concede|partial|escalate",
      "explanation": "your response as the Innovera consultant",
      "proposedChange": "if type is fix or concede: what specifically changes in the document. Be concrete — not 'we should add more detail' but 'add a paragraph in the Risk section addressing X with Y data point'",
      "status": "resolved|unresolved|escalated"
    }
  ],
  "summary": "1-2 sentence overall response to this round of feedback"
}

## The Original Document
${config.document}

## Client Objections (Round ${roundNumber})
${JSON.stringify(redTeamOutput, null, 2)}`;

  if (history.length > 0) {
    // Use compressed history for Round 3+ (Change #6)
    const historySection = history.length >= 2
      ? compressHistory(history)
      : JSON.stringify(
          history.map((r) => ({
            round: r.roundNumber,
            redTeam: r.redTeam,
            blueTeam: r.blueTeam,
          })),
          null,
          2
        );

    prompt += `

## Prior Debate History
${historySection}`;
  }

  return prompt;
}

// --- Change #7: Merged rewrite prompt (single call with inline change markers) ---

export function buildRewriteSystemPrompt(): string {
  return `You are a senior editor at Innovera. Rewrite the document incorporating all revision items.

## Rules
- Address EVERY revision item. Do not skip any.
- Do NOT add new content beyond what the revisions call for.
- Do NOT remove content that wasn't flagged for revision.
- Preserve the original formatting style (headings, bullets, numbering, etc.).
- Where a revision requires adding new content, write it in the same voice and style.
- When fixing factual errors, make the correction cleanly.
- The output should read as a polished, cohesive whole — not a patchwork of fixes.

## Change Tracking
For every change you make, wrap the new text in a marker:
<!--CHANGE objectionId="R1-01" reason="brief reason"-->new text here<!--/CHANGE-->

This lets us mechanically extract what changed and why.
Write the full document with these markers inline.
Output as plain markdown with the change markers. No JSON wrapping, no preamble.`;
}

export function buildRewriteUserPrompt(
  config: DebateConfig,
  revisionItems: RevisionItem[],
  rounds: DebateRound[]
): string {
  const revisionsFormatted = revisionItems
    .map(
      (item, i) =>
        `### Revision ${i + 1} (${item.id}) [${item.category}/${item.severity}]
**Passage:** "${item.quote}"
**Issue:** ${item.issue}
**Required Fix:** ${item.fix}`
    )
    .join('\n\n');

  return `## The Original Document
${config.document}

## Revision Items (${revisionItems.length} total)
These are the specific changes that must be made. Each was identified during the debate and agreed upon by the Blue Team (Innovera consultant) as needing a fix or concession.

${revisionsFormatted}

Now rewrite the complete document incorporating all ${revisionItems.length} revision items. Use <!--CHANGE objectionId="..." reason="..."--> markers around every change. Output the full revised document as plain markdown with markers — no JSON, no preamble, no commentary.`;
}
