import type { Objection, Response } from '@/lib/types';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { SeverityDot } from '@/components/shared/SeverityDot';
import { StatusBadge } from '@/components/shared/StatusBadge';

const responseTypeColors: Record<string, { bg: string; text: string }> = {
  fix: { bg: '#EAF3DE', text: '#3B6D11' },
  defend: { bg: '#E0EDFE', text: '#2B5EA7' },
  concede: { bg: '#FCEBEB', text: '#A32D2D' },
  partial: { bg: '#FAEEDA', text: '#854F0B' },
  escalate: { bg: '#EEEDFE', text: '#534AB7' },
};

interface PairedCardProps {
  objection: Objection;
  response: Response | undefined;
  bluePending?: boolean;
}

export function PairedCard({ objection, response, bluePending = false }: PairedCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden dark:border-zinc-700 dark:bg-zinc-900">
      {/* Red Team — Objection */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-mono text-gray-400 dark:text-zinc-500">{objection.id}</span>
          <CategoryBadge category={objection.category} />
          <SeverityDot severity={objection.severity} />
          <span className="text-[11px] text-gray-400 dark:text-zinc-500">{objection.severity}</span>
        </div>

        <div className="border-l-2 border-orange-300 dark:border-orange-600 pl-3 mb-3">
          <p className="text-[12px] italic text-gray-500 dark:text-zinc-400 leading-relaxed">
            &ldquo;{objection.quote}&rdquo;
          </p>
        </div>

        <p className="text-[13px] text-gray-800 dark:text-zinc-200 leading-relaxed">
          {objection.objection}
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-dashed border-gray-200 dark:border-zinc-600" />

      {/* Blue Team — Response */}
      {response ? (
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-medium text-gray-500 dark:text-zinc-400">Blue</span>
            <ResponseTypeBadge type={response.responseType} />
            <StatusBadge status={response.status} />
          </div>

          <div className="border-l-2 border-blue-300 dark:border-blue-600 pl-3">
            <p className="text-[13px] text-gray-800 dark:text-zinc-200 leading-relaxed">
              {response.explanation}
            </p>
          </div>

          {response.proposedChange && (
            <div className="mt-3 rounded-md bg-gray-50 p-3 dark:bg-zinc-800/80">
              <p className="text-[11px] uppercase tracking-[0.04em] text-gray-400 dark:text-zinc-500 font-medium mb-1">
                Proposed change
              </p>
              <p className="text-[12px] text-gray-700 dark:text-zinc-300 leading-relaxed">
                {response.proposedChange}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4">
          {bluePending ? (
            <div className="flex items-center gap-2 text-[12px] text-blue-600 dark:text-blue-400">
              <span className="inline-block w-3.5 h-3.5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin dark:border-blue-900 dark:border-t-blue-400" />
              Blue Team is responding...
            </div>
          ) : (
            <p className="text-[12px] text-gray-400 dark:text-zinc-500 italic">No response recorded.</p>
          )}
        </div>
      )}
    </div>
  );
}

function ResponseTypeBadge({ type }: { type: string }) {
  const style = responseTypeColors[type] || { bg: '#F3F4F6', text: '#6B7280' };
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {type}
    </span>
  );
}
