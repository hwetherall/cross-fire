'use client';

import type { DashboardIssue } from './buildIssueList';
import { SeverityDot } from '@/components/shared/SeverityDot';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { IssueDetail } from './IssueDetail';

interface IssueRowProps {
  issue: DashboardIssue;
  isExpanded: boolean;
  onToggle: () => void;
}

export function IssueRow({ issue, isExpanded, onToggle }: IssueRowProps) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 cursor-pointer transition-colors dark:hover:bg-zinc-800/80"
      >
        {/* ID */}
        <span className="text-[11px] font-mono text-gray-400 dark:text-zinc-500 w-[44px] shrink-0">
          {issue.id}
        </span>

        {/* Severity dot */}
        <SeverityDot severity={issue.severity} />

        {/* Category badge */}
        <CategoryBadge category={issue.category} />

        {/* Title */}
        <span className="text-[13px] text-gray-800 dark:text-zinc-200 truncate flex-1 min-w-0">
          {issue.objection}
        </span>

        {/* Status badge */}
        <StatusBadge status={issue.finalStatus} />

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-gray-400 dark:text-zinc-500 shrink-0 transition-transform ${
            isExpanded ? 'rotate-90' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Expanded detail */}
      {isExpanded && <IssueDetail issue={issue} />}
    </div>
  );
}
