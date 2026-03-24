# Crossfire Prompt Improvements — Analysis & Proposals

Based on a close reading of `prompts.ts` alongside the actual Market Research and Exec Summary debate transcripts (GPT-5.4 Red vs Opus 4.6 Blue, Samsung satellite broadband), here are the concrete issues observed and proposed fixes.

---

## 1. The "Phantom Document Update" Problem

**What happened:** In the Market Research debate, Round 2 became almost entirely about Red Team re-raising items that Blue Team had *conceded with specific fixes* in Round 1 — but the fixes weren't in the document yet. Red Team said things like "This remains in the document exactly as before, despite your concession." Blue Team's Round 2 summary was essentially an apology: *"This is a revision-tracking and quality-control failure on our side."*

The result: 12 of 12 Round 2 objections were about non-applied fixes, not new substantive issues. The entire round was wasted on a structural misunderstanding.

**Root cause:** The follow-up prompt (`buildRedTeamFollowUpUserPrompt`) does include a warning about this — `"The document you are reading has NOT been modified yet."` — but it's clearly not working well enough. The warning is buried in a block of instructions, and the document itself is re-appended at the bottom, which naturally draws the model's attention back to the unchanged text.

**Proposed fix:**

```typescript
// In buildRedTeamFollowUpUserPrompt, restructure the prompt so the 
// "document hasn't changed" instruction is impossible to miss:

return `## CRITICAL CONTEXT
The document below is the ORIGINAL, UNMODIFIED version. All agreed changes 
will be applied after the debate concludes. This is by design.

Your job in this round is to evaluate the QUALITY OF THE BLUE TEAM'S 
PROPOSED RESPONSES — not to re-check whether the document text has changed.

Scoring guide:
- Blue Team proposed a concrete, specific fix → RESOLVED (add to resolvedFromPrior)
- Blue Team's defense was substantive and persuasive → RESOLVED
- Blue Team's proposed fix is vague, incomplete, or misses the point → RE-RAISE with new reasoning
- Blue Team's response reveals a NEW issue → raise as new objection
- Blue Team simply acknowledged but proposed no concrete change → RE-RAISE

DO NOT re-raise an item solely because the document text hasn't changed. 
That is expected. Evaluate the proposed fix, not the current document state.

...`
```

Additionally, consider **not re-appending the full document in Round 2+** unless the model genuinely needs to reference it. Appending it invites re-reading and re-flagging. Instead, append only the relevant quoted passages from the objections under discussion.

---

## 2. Red Team Objection Count Is Too High

**What happened:** Round 1 produced 12 objections in both debates. The prompt says *"A real executive in a 30-minute review would catch 5-12 things, not 30."* — but 12 is at the top of that range and the debates feel exhausting by Round 2. The Market Research debate ended with 24 total objections across 2 rounds.

**The real issue:** 12 first-round objections means the Blue Team response is enormous, the follow-up is enormous, and convergence takes longer. The claude.md spec says the healthy pattern is "Round 1: 6-10 objections." The prompt allows up to 12, and models maximize.

**Proposed fix:**

In `buildRedTeamSystemPrompt`, tighten the guidance:

```
- Prioritize ruthlessly. You have time for 6-8 objections, maximum. 
  A real executive reviews a 10-page document in 20 minutes — they catch 
  the 6 things that matter, not the 12 things they could theoretically flag. 
  If you find yourself listing more than 8 items, you are not prioritizing; 
  you are cataloguing. Cut the weakest items.
```

This is a small change but it shifts the model's target from "find everything" to "find the right things." Quality over quantity.

---

## 3. Blue Team Is Too Deferential

**What happened:** In the Market Research debate, Blue Team conceded on 10 of 12 Round 1 items (R1-01 through R1-12). Only R1-03 and R1-09 got partial pushback, and even those were soft. The Exec Summary debate shows the same pattern. The `buildBlueTeamSystemPrompt` says *"Innovera doesn't fold just because a client pushes"* — but in practice, it folds almost every time.

**Why this matters:** The value of the debate format is the *tension*. If Blue Team concedes everything, you get a fancy proofreading tool, not a stress test. Real strategic disagreements (like R1-06 on sovereignty positioning, or R1-08 on build-vs-partner) deserved genuine pushback, not gracious concession.

**Proposed fix:**

Add explicit "when to stand firm" calibration to the Blue Team system prompt:

```
## Calibration: When to Concede vs. When to Fight

Your natural instinct will be to concede too much. Resist it. Here's 
the calibration:

- **Errors and cosmetic issues:** Concede quickly. These are easy wins 
  and fighting them makes you look defensive.
- **Gaps:** Assess honestly. If it's a real gap, concede. If it was a 
  deliberate scope decision, explain why — and hold your ground.
- **Clarification:** Provide the clarification, acknowledge if the 
  document should have been clearer. Easy.
- **Disagreements:** THIS IS WHERE YOU EARN YOUR FEE. If the client's 
  insider perspective reveals something your analysis missed, concede. 
  But if your analytical framework is sound and the client is applying 
  an incumbent's bias, say so respectfully and hold. Innovera's job is 
  to challenge the client's assumptions, not validate them. At least 
  30-40% of strategic disagreements should result in a genuine "defend" 
  or "partial" — not a blanket concession.

A debate where Blue Team concedes >80% of items is not a debate. 
It's a proofreading session.
```

---

## 4. The "Suggested Resolution" Field Undermines Red Team's Role

**What happened:** Nearly every Red Team objection includes a detailed `suggestedResolution` that basically writes the fix. For example, R1-11 in Market Research doesn't just flag the SpaceX decision gap — it prescribes a three-scenario decision matrix with specific scenarios. This makes Red Team do Blue Team's job and turns the "debate" into "Red Team writes the revision list, Blue Team agrees."

**Proposed fix:**

In the Red Team output format, reframe `suggestedResolution`:

```json
{
  "suggestedResolution": "optional — a brief indication of what would 
    satisfy you, NOT a detailed specification of the fix. You are the 
    executive identifying the problem, not the consultant designing the 
    solution. One sentence, maximum two."
}
```

And in the system prompt:

```
- When suggesting resolutions, be brief. Say what would satisfy you 
  ("I need to see the IRR under three launch scenarios"), not how to 
  build it ("Add a decision matrix with columns for..."). The consulting 
  team's job is to design the fix. Your job is to define the bar.
```

---

## 5. Missing "Document Type" Lens System

**What happened:** Both debates review a Samsung satellite broadband document. The Red Team persona is configured with company/role/industry — but there's no calibration for *document type*. A market research report should be challenged differently than an exec summary, a pitch deck, or a technical assessment. The claude.md mentions `lib/lenses.ts` for review lens paragraphs, but `prompts.ts` never uses it.

**Proposed fix:**

Add a `documentType` field to `DebateConfig` and inject a lens paragraph into the Red Team system prompt:

```typescript
const lenses: Record<string, string> = {
  'exec-summary': `This is an executive summary — a decision document. 
    You expect: a clear recommendation, the 2-3 strongest supporting 
    arguments, key risks with mitigations, and a concrete next-steps 
    framework. You will be especially critical of: unsupported claims, 
    missing decision frameworks, and anything that reads as analysis 
    rather than recommendation.`,
    
  'market-research': `This is a market research report. You expect: 
    defensible market sizing with clear methodology, competitive 
    landscape with specific players and positions, segment-level 
    analysis with prioritization rationale, and evidence-backed 
    conclusions. You will be especially critical of: top-down TAM 
    claims without bottom-up validation, missing competitors, 
    unsubstantiated growth assumptions, and geographic generalizations.`,
    
  'pitch-deck': `This is a pitch deck. You expect: a compelling 
    narrative arc, clear problem-solution framing, credible financials, 
    and a specific ask. You will be especially critical of: logical 
    gaps in the narrative, unrealistic projections, missing competitive 
    responses, and anything that would lose a skeptical board in the 
    first 5 slides.`,
    
  'technical-assessment': `This is a technical assessment. You expect: 
    rigorous methodology, clear evaluation criteria, honest capability 
    gaps, and actionable recommendations. You will be especially 
    critical of: hand-waving over technical complexity, missing 
    integration risks, and vendor/technology bias.`
};
```

Then in `buildRedTeamSystemPrompt`:

```typescript
if (config.documentType && lenses[config.documentType]) {
  prompt += `\n\n## Document Type Context\n${lenses[config.documentType]}`;
}
```

---

## 6. Round 2+ History Compression Is Missing

**What happened:** `buildRedTeamFollowUpUserPrompt` dumps the full JSON history of all prior rounds *plus* the full document into the user prompt. For a 10-page document with 12 objections and 12 responses, this is an enormous context payload by Round 2, and it will be crushing by Round 3.

**The claude.md spec explicitly says:** *"Compress prior history in later rounds. Keep current round full; summarize older rounds to essentials."*

**Proposed fix:**

Add a history compression function and use it for rounds 3+:

```typescript
function compressHistory(history: DebateRound[]): string {
  // Keep the most recent round in full
  // Summarize older rounds to: what was raised, what resolved, what's open
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
        .join(', ')}].`
  }));
  
  const latestRound = history[history.length - 1];
  
  return `## Compressed Prior Rounds\n${JSON.stringify(olderRounds, null, 2)}\n\n` +
    `## Most Recent Round (Full Detail)\n${JSON.stringify({
      round: latestRound.roundNumber,
      redTeam: latestRound.redTeam,
      blueTeam: latestRound.blueTeam
    }, null, 2)}`;
}
```

---

## 7. Changelog + Rewrite Is a Token Bomb

**What happened:** The current flow makes two massive LLM calls at the end: one for the changelog (JSON) and one for the full document rewrite (plain text). Both include the full document and all revision items. For a long document with 15+ revision items, this is expensive and fragile.

**Proposed fix — merge into one call with structured output:**

Instead of two separate calls, use a single rewrite call that produces the document with inline change markers. Then mechanically extract the changelog from the markers.

```typescript
export function buildRewriteSystemPrompt(): string {
  return `You are a senior editor at Innovera. Rewrite the document 
incorporating all revision items.

## Rules
- Address EVERY revision item. Do not skip any.
- Do NOT add new content beyond what the revisions call for.
- Preserve the original formatting style.
- The output should read as a polished, cohesive whole.

## Change Tracking
For every change you make, wrap the new text in a marker:
<!--CHANGE objectionId="R1-01" reason="brief reason"-->new text here<!--/CHANGE-->

This lets us mechanically extract what changed and why. 
Write the full document with these markers inline.
Output as plain markdown. No JSON wrapping, no preamble.`;
}
```

This gives you the rewrite *and* the changelog in one call, cutting token usage roughly in half for this phase.

---

## 8. The "requiresSearch" Field Is Underutilized

**What happened:** In the Market Research debate, R1-12 (the IEA misattribution) was a clear case where web search should have been flagged and used. Blue Team's response even says *"we cannot verify the specific '$200B in services' figure from any of these sources without further research."* But the search integration feels bolted on — there's no prompt guidance for Blue Team on *how* to use search results when they arrive.

**Proposed fix:**

In `buildBlueTeamUserPrompt`, when search results are present, add framing:

```typescript
if (searchResults) {
  prompt += `## Supplementary Research
The following web search results were retrieved to help verify 
factual claims flagged by the client.

How to use these:
- If search results CONFIRM the document's claim, cite the source 
  and strengthen your defense.
- If search results CONTRADICT the document's claim, concede 
  immediately and propose a correction with the verified data.
- If search results are INCONCLUSIVE, say so honestly. Do not 
  cherry-pick ambiguous results to defend a weak claim.
- Always prefer primary sources (company filings, government data, 
  peer-reviewed research) over secondary reporting.

${searchResults}
`;
}
```

---

## 9. Add an Early Termination Signal

**What happened:** The Market Research debate ran 2 rounds and produced 24 objections, all resolved. But it could have been detected mid-Round-2 that the debate had degenerated into "please apply the fixes you already agreed to." The system should recognize this pattern and terminate early.

**Proposed fix:**

Add a convergence check in the orchestrator, and give Red Team an explicit "we're done" signal:

In the Red Team follow-up prompt, add:

```
If you believe the Blue Team has addressed all substantive issues and 
remaining items are purely execution (applying agreed fixes to the 
document), you may end the review early by setting:

"earlyTermination": true,
"terminationReason": "All substantive issues addressed. Remaining 
  items are execution-level revisions that do not require further debate."

This is a sign of strength, not weakness. A real executive who is 
satisfied says so and moves on.
```

And in the orchestrator, check for this flag to break the round loop.

---

## 10. Blue Team Needs Domain Humility Guardrails

**What happened:** Blue Team occasionally makes confident claims about Samsung-specific internal matters (cross-affiliate coordination, specific account relationships, internal capability assessments) where an outside consultant genuinely wouldn't know. The prompt says *"never bluff"* but doesn't give the model enough scaffolding to recognize when it's bluffing.

**Proposed fix:**

Add explicit domain boundaries to the Blue Team system prompt:

```
## What You Know vs. What You Don't

Things Innovera CAN speak to with authority:
- Market sizing methodology and assumptions
- Competitive landscape analysis
- Strategic frameworks and options analysis
- Technology assessment at a systems level
- Financial modeling methodology
- Innovation methodology and phased validation approaches

Things Innovera CANNOT speak to authoritatively (the client knows better):
- Internal corporate politics, decision-making dynamics, and 
  cross-entity coordination realities
- Account-level relationship depth with specific customers
- Internal capability assessments (what Samsung can actually build 
  vs. what they'd need to buy)
- Regulatory relationships and government affairs posture
- Internal capital allocation priorities and competing investments

When the client challenges you on something in the second category, 
your default should be: "You know this better than we do. Here's 
what we assumed — if that's wrong, here's how it changes the analysis."
```

---

## Summary of Changes by Priority

| # | Change | Impact | Effort |
|---|--------|--------|--------|
| 1 | Fix phantom document update problem | **Critical** — wastes entire rounds | Low |
| 2 | Tighten Red Team objection count to 6-8 | High — improves convergence | Low |
| 3 | Add Blue Team "when to fight" calibration | High — restores debate tension | Low |
| 4 | Shorten Red Team suggested resolutions | Medium — clarifies roles | Low |
| 5 | Add document type lens system | High — sharpens critique quality | Medium |
| 6 | Implement history compression for Round 3+ | High — prevents context overflow | Medium |
| 7 | Merge changelog + rewrite into single call | Medium — cuts cost, reduces fragility | Medium |
| 8 | Improve search result usage framing | Medium — makes search actually useful | Low |
| 9 | Add early termination signal | Medium — prevents wasted rounds | Low |
| 10 | Add domain humility guardrails to Blue Team | Medium — improves realism | Low |
