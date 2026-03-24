import type { DashboardIssue } from './buildIssueList';

interface VerdictBarProps {
  issues: DashboardIssue[];
  totalRounds: number;
}

type VerdictState = 'ready' | 'needs-revision' | 'not-ready';

const dotColors: Record<VerdictState, string> = {
  ready: '#639922',
  'needs-revision': '#EF9F27',
  'not-ready': '#E24B4A',
};

function computeVerdict(issues: DashboardIssue[]): {
  state: VerdictState;
  text: string;
} {
  const hasEscalated = issues.some((i) => i.finalStatus === 'escalated');
  const criticalOrHighUnresolved = issues.filter(
    (i) =>
      (i.severity === 'critical' || i.severity === 'high') &&
      i.finalStatus !== 'resolved'
  );
  const allResolved = issues.every((i) => i.finalStatus === 'resolved');
  const hasCritical = issues.some((i) => i.severity === 'critical');

  if (hasEscalated) {
    const count = issues.filter((i) => i.finalStatus === 'escalated').length;
    return {
      state: 'not-ready',
      text: `Not ready — ${count} item${count !== 1 ? 's' : ''} escalated for leadership discussion`,
    };
  }

  if (criticalOrHighUnresolved.length > 0) {
    const critCount = criticalOrHighUnresolved.filter(
      (i) => i.severity === 'critical'
    ).length;
    const highCount = criticalOrHighUnresolved.filter(
      (i) => i.severity === 'high'
    ).length;
    const parts: string[] = [];
    if (critCount > 0) parts.push(`${critCount} critical gap${critCount !== 1 ? 's' : ''}`);
    if (highCount > 0) parts.push(`${highCount} high-severity issue${highCount !== 1 ? 's' : ''}`);
    return {
      state: 'needs-revision',
      text: `Needs revision — ${parts.join(', ')}`,
    };
  }

  if (allResolved && !hasCritical) {
    const resolvedCount = issues.filter((i) => i.finalStatus === 'resolved').length;
    return {
      state: 'ready',
      text: `Ready with minor fixes — ${resolvedCount} item${resolvedCount !== 1 ? 's' : ''} resolved`,
    };
  }

  return {
    state: 'needs-revision',
    text: 'Needs revision',
  };
}

export function VerdictBar({ issues, totalRounds }: VerdictBarProps) {
  const { state, text } = computeVerdict(issues);
  const fixCount = issues.filter(
    (i) => i.latestResponse?.responseType === 'fix' || i.latestResponse?.responseType === 'concede'
  ).length;

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-gray-50 px-4 py-3 dark:bg-zinc-900">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="inline-block w-[10px] h-[10px] rounded-full shrink-0"
          style={{ backgroundColor: dotColors[state] }}
        />
        <span className="text-[15px] font-medium text-gray-900 dark:text-zinc-100 truncate">
          {text}
        </span>
      </div>
      <span className="text-[12px] text-gray-500 dark:text-zinc-400 shrink-0">
        {totalRounds} round{totalRounds !== 1 ? 's' : ''}, {issues.length} objection{issues.length !== 1 ? 's' : ''}, {fixCount} fix{fixCount !== 1 ? 'es' : ''} proposed
      </span>
    </div>
  );
}
