'use client';

import type { ObjectionCategory } from '@/lib/types';
import type { DashboardIssue } from './buildIssueList';

interface FilterPillsProps {
  issues: DashboardIssue[];
  activeFilter: ObjectionCategory | null;
  onFilterChange: (category: ObjectionCategory | null) => void;
}

const categoryOrder: ObjectionCategory[] = [
  'gap',
  'error',
  'disagreement',
  'clarification',
  'cosmetic',
];

export function FilterPills({ issues, activeFilter, onFilterChange }: FilterPillsProps) {
  const categoryCounts = new Map<ObjectionCategory, number>();
  for (const issue of issues) {
    categoryCounts.set(issue.category, (categoryCounts.get(issue.category) || 0) + 1);
  }

  const activeCategories = categoryOrder.filter((cat) => (categoryCounts.get(cat) || 0) > 0);

  return (
    <div className="flex flex-wrap gap-2">
      <Pill
        label="All"
        active={activeFilter === null}
        onClick={() => onFilterChange(null)}
      />
      {activeCategories.map((cat) => (
        <Pill
          key={cat}
          label={`${cat.charAt(0).toUpperCase() + cat.slice(1)} (${categoryCounts.get(cat)})`}
          active={activeFilter === cat}
          onClick={() => onFilterChange(activeFilter === cat ? null : cat)}
        />
      ))}
    </div>
  );
}

function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
        active
          ? 'bg-gray-900 text-white'
          : 'bg-transparent border border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400'
      }`}
    >
      {label}
    </button>
  );
}
