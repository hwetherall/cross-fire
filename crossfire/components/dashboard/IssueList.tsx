'use client';

import { useState } from 'react';
import type { DashboardIssue } from './buildIssueList';
import { IssueRow } from './IssueRow';

interface IssueListProps {
  issues: DashboardIssue[];
}

export function IssueList({ issues }: IssueListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (issues.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-sm text-gray-500">No issues match the current filter.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 divide-y divide-gray-100 overflow-hidden">
      {issues.map((issue) => (
        <IssueRow
          key={issue.id}
          issue={issue}
          isExpanded={expandedId === issue.id}
          onToggle={() =>
            setExpandedId(expandedId === issue.id ? null : issue.id)
          }
        />
      ))}
    </div>
  );
}
