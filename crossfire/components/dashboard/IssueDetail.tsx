import type { DashboardIssue } from './buildIssueList';
import { TimelineStrip } from '@/components/shared/TimelineStrip';

interface IssueDetailProps {
  issue: DashboardIssue;
}

export function IssueDetail({ issue }: IssueDetailProps) {
  const response = issue.latestResponse;

  return (
    <div className="pl-[64px] pr-4 pb-4 space-y-3">
      {/* Timeline */}
      <TimelineStrip timeline={issue.timeline} />

      {/* Document quote */}
      <div className="border-l-2 border-gray-200 pl-3">
        <p className="text-[12px] italic text-gray-500 leading-relaxed">
          &ldquo;{issue.quote}&rdquo;
        </p>
      </div>

      {/* Client objection */}
      <div>
        <p className="text-[11px] uppercase tracking-[0.04em] text-gray-400 font-medium mb-1">
          Client objection
        </p>
        <p className="text-[13px] text-gray-800 leading-relaxed">
          {issue.objection}
        </p>
      </div>

      {/* Innovera response */}
      {response && (
        <div>
          <p className="text-[11px] uppercase tracking-[0.04em] text-gray-400 font-medium mb-1">
            Innovera response
          </p>
          <p className="text-[13px] text-gray-800 leading-relaxed">
            {response.explanation}
          </p>
        </div>
      )}

      {/* Proposed change */}
      {response?.proposedChange && (
        <div>
          <p className="text-[11px] uppercase tracking-[0.04em] text-gray-400 font-medium mb-1">
            Proposed change
          </p>
          <div className="rounded-md bg-gray-50 p-3">
            <p className="text-[12px] text-gray-700 leading-relaxed">
              {response.proposedChange}
            </p>
          </div>
        </div>
      )}

      {/* Status note for unresolved/escalated */}
      {issue.finalStatus !== 'resolved' && (
        <div
          className="rounded-md bg-gray-50 p-3 border-l-2"
          style={{
            borderLeftColor:
              issue.finalStatus === 'escalated' ? '#534AB7' : '#EF9F27',
          }}
        >
          <p className="text-[12px] text-gray-700">
            {issue.finalStatus === 'escalated'
              ? 'This item was escalated — it requires real client input that cannot be resolved in simulation.'
              : 'This item remains unresolved after all debate rounds.'}
          </p>
        </div>
      )}
    </div>
  );
}
