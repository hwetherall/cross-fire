import type { Response } from '@/lib/types';
import { StatusIndicator } from './CategoryBadge';

const responseTypeLabels: Record<Response['responseType'], { label: string; color: string }> = {
  fix: { label: 'Fix', color: 'text-green-700 bg-green-100' },
  defend: { label: 'Defend', color: 'text-blue-700 bg-blue-100' },
  concede: { label: 'Concede', color: 'text-red-700 bg-red-100' },
  partial: { label: 'Partial', color: 'text-amber-700 bg-amber-100' },
  escalate: { label: 'Escalate', color: 'text-purple-700 bg-purple-100' },
};

export function ResponseCard({ response }: { response: Response }) {
  const typeInfo = responseTypeLabels[response.responseType];

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-blue-700">Re: {response.objectionId}</span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${typeInfo.color}`}
          >
            {typeInfo.label}
          </span>
        </div>
        <StatusIndicator status={response.status} />
      </div>
      <p className="text-sm text-gray-900">{response.explanation}</p>
      {response.proposedChange && (
        <div className="mt-2 rounded bg-green-50 border border-green-200 p-2">
          <p className="text-xs font-medium text-green-800">Proposed Change:</p>
          <p className="text-xs text-green-700 mt-1">{response.proposedChange}</p>
        </div>
      )}
    </div>
  );
}
