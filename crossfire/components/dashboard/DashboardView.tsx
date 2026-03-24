'use client';

import { useState, useMemo } from 'react';
import type { DebateRound, FinalSummary, ObjectionCategory } from '@/lib/types';
import { buildIssueList } from './buildIssueList';
import { VerdictBar } from './VerdictBar';
import { StatsRow } from './StatsRow';
import { FilterPills } from './FilterPills';
import { IssueList } from './IssueList';

interface DashboardViewProps {
  rounds: DebateRound[];
  summary: FinalSummary | null;
  isRunning: boolean;
}

export function DashboardView({ rounds, summary, isRunning }: DashboardViewProps) {
  const [activeFilter, setActiveFilter] = useState<ObjectionCategory | null>(null);

  const allIssues = useMemo(() => buildIssueList(rounds), [rounds]);

  const filteredIssues = useMemo(
    () =>
      activeFilter
        ? allIssues.filter((issue) => issue.category === activeFilter)
        : allIssues,
    [allIssues, activeFilter]
  );

  if (allIssues.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-gray-500 dark:text-zinc-400">No issues found in the debate data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <VerdictBar issues={allIssues} totalRounds={rounds.length} />
      <StatsRow issues={allIssues} />
      <FilterPills
        issues={allIssues}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      <IssueList issues={filteredIssues} />

      {isRunning && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
            <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin dark:border-zinc-600 dark:border-t-zinc-300" />
            Debate in progress — issues will update as rounds complete
          </div>
        </div>
      )}
    </div>
  );
}
