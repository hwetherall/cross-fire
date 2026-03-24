import type { Objection } from '@/lib/types';
import { CategoryBadge, SeverityBadge } from './CategoryBadge';

export function ObjectionCard({ objection }: { objection: Objection }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50/50 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-mono font-bold text-red-700">{objection.id}</span>
        <CategoryBadge category={objection.category} />
        <SeverityBadge severity={objection.severity} />
      </div>
      <blockquote className="border-l-2 border-red-300 pl-3 my-2 text-sm text-gray-600 italic">
        &ldquo;{objection.quote}&rdquo;
      </blockquote>
      <p className="text-sm text-gray-900 mt-2">{objection.objection}</p>
      {objection.suggestedResolution && (
        <p className="text-xs text-gray-500 mt-2">
          <span className="font-medium">Suggested:</span> {objection.suggestedResolution}
        </p>
      )}
    </div>
  );
}
