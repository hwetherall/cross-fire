import type { ObjectionCategory, ObjectionSeverity } from '@/lib/types';

const categoryColors: Record<ObjectionCategory, string> = {
  clarification: 'bg-teal-100 text-teal-800',
  cosmetic: 'bg-amber-100 text-amber-800',
  gap: 'bg-orange-100 text-orange-800',
  error: 'bg-red-100 text-red-800',
  disagreement: 'bg-purple-100 text-purple-800',
};

const severityDots: Record<ObjectionSeverity, string> = {
  low: 'bg-gray-400',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  critical: 'bg-red-600',
};

export function CategoryBadge({ category }: { category: ObjectionCategory }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[category]}`}
    >
      {category}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: ObjectionSeverity }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-600">
      <span className={`inline-block h-2 w-2 rounded-full ${severityDots[severity]}`} />
      {severity}
    </span>
  );
}

export function StatusIndicator({ status }: { status: 'resolved' | 'unresolved' | 'escalated' }) {
  if (status === 'resolved') {
    return <span className="text-green-600 text-sm font-medium">&#10003; Resolved</span>;
  }
  if (status === 'escalated') {
    return <span className="text-purple-600 text-sm font-medium">&#9873; Escalated</span>;
  }
  return <span className="text-orange-500 text-sm font-medium">&#9888; Unresolved</span>;
}
