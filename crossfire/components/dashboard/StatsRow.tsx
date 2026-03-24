import type { DashboardIssue } from './buildIssueList';

interface StatsRowProps {
  issues: DashboardIssue[];
}

export function StatsRow({ issues }: StatsRowProps) {
  const total = issues.length;
  const resolved = issues.filter((i) => i.finalStatus === 'resolved').length;
  const unresolved = issues.filter((i) => i.finalStatus === 'unresolved').length;
  const escalated = issues.filter((i) => i.finalStatus === 'escalated').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard label="Objections" value={total} color="text-gray-900 dark:text-zinc-100" />
      <StatCard label="Resolved" value={resolved} color="text-green-700 dark:text-green-400" />
      <StatCard label="Unresolved" value={unresolved} color="text-amber-700 dark:text-amber-400" />
      <StatCard label="Escalated" value={escalated} color="text-purple-700 dark:text-purple-400" />
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-md bg-gray-50 p-3 text-center dark:bg-zinc-900">
      <div className={`text-[22px] font-medium ${color}`}>{value}</div>
      <div className="text-[11px] text-gray-500 dark:text-zinc-400">{label}</div>
    </div>
  );
}
