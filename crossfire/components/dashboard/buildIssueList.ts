import type {
  DebateRound,
  ObjectionCategory,
  ObjectionSeverity,
  ResolutionStatus,
  Response,
} from '@/lib/types';

export interface TimelineEntry {
  round: number;
  redAction: 'raised' | 're-raised' | 'accepted';
  blueAction: string;
  blueStatus: ResolutionStatus;
}

export interface DashboardIssue {
  id: string;
  category: ObjectionCategory;
  severity: ObjectionSeverity;
  quote: string;
  objection: string;
  suggestedResolution?: string;
  raisedInRound: number;
  timeline: TimelineEntry[];
  latestResponse: Response | null;
  finalStatus: ResolutionStatus;
}

const severityOrder: Record<ObjectionSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const statusOrder: Record<ResolutionStatus, number> = {
  escalated: 0,
  unresolved: 1,
  resolved: 2,
};

export function buildIssueList(rounds: DebateRound[]): DashboardIssue[] {
  const issues = new Map<string, DashboardIssue>();

  for (const round of rounds) {
    for (const objection of round.redTeam.objections) {
      const response = round.blueTeam.responses.find(
        (r) => r.objectionId === objection.id
      );

      if (issues.has(objection.id)) {
        const existing = issues.get(objection.id)!;
        existing.timeline.push({
          round: round.roundNumber,
          redAction: 're-raised',
          blueAction: response?.responseType || 'none',
          blueStatus: response?.status || 'unresolved',
        });
        existing.latestResponse = response || existing.latestResponse;
        existing.finalStatus = response?.status || 'unresolved';
      } else {
        issues.set(objection.id, {
          id: objection.id,
          category: objection.category,
          severity: objection.severity,
          quote: objection.quote,
          objection: objection.objection,
          suggestedResolution: objection.suggestedResolution,
          raisedInRound: round.roundNumber,
          timeline: [
            {
              round: round.roundNumber,
              redAction: 'raised',
              blueAction: response?.responseType || 'none',
              blueStatus: response?.status || 'unresolved',
            },
          ],
          latestResponse: response || null,
          finalStatus: response?.status || 'unresolved',
        });
      }
    }

    if (round.redTeam.resolvedFromPrior) {
      for (const resolvedId of round.redTeam.resolvedFromPrior) {
        if (issues.has(resolvedId)) {
          const existing = issues.get(resolvedId)!;
          existing.timeline.push({
            round: round.roundNumber,
            redAction: 'accepted',
            blueAction: 'n/a',
            blueStatus: 'resolved',
          });
          existing.finalStatus = 'resolved';
        }
      }
    }
  }

  return Array.from(issues.values()).sort((a, b) => {
    const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (sevDiff !== 0) return sevDiff;
    return statusOrder[a.finalStatus] - statusOrder[b.finalStatus];
  });
}
