import type { DebateRound, RevisionItem, ObjectionSeverity } from './types';

const SEVERITY_ORDER: Record<ObjectionSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/**
 * Mechanically derive the revision checklist from debate rounds.
 * Collects all objections where Blue Team responded with 'fix' or 'concede',
 * deduplicates by quoted passage, and sorts by severity.
 */
export function deriveRevisionItems(rounds: DebateRound[]): RevisionItem[] {
  const items: RevisionItem[] = [];

  for (const round of rounds) {
    for (const response of round.blueTeam.responses) {
      if (response.responseType === 'fix' || response.responseType === 'concede') {
        const objection = round.redTeam.objections.find(
          (o) => o.id === response.objectionId
        );
        if (objection) {
          items.push({
            id: objection.id,
            category: objection.category,
            severity: objection.severity,
            quote: objection.quote,
            issue: objection.objection,
            fix: response.proposedChange || response.explanation,
          });
        }
      }
    }
  }

  // Deduplicate by quote (same passage might be raised across rounds)
  const seen = new Set<string>();
  const deduped = items.filter((item) => {
    const key = item.quote.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by severity: critical > high > medium > low
  deduped.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  return deduped;
}
