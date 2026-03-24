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
      <StatCard label="Objections" value={total} color="text-gray-900" />
      <StatCard label="Resolved" value={resolved} color="text-green-700" />
      <StatCard label="Unresolved" value={unresolved} color="text-amber-700" />
      <StatCard label="Escalated" value={escalated} color="text-purple-700" />
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
    <div className="rounded-md bg-gray-50 p-3 text-center">
      <div className={`text-[22px] font-medium ${color}`}>{value}</div>
      <div className="text-[11px] text-gray-500">{label}</div>
    </div>
  );
}
