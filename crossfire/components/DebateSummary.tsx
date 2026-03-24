import type { FinalSummary, ObjectionCategory } from '@/lib/types';
import { CategoryBadge, SeverityBadge } from './CategoryBadge';

const categoryOrder: ObjectionCategory[] = [
  'error',
  'gap',
  'disagreement',
  'clarification',
  'cosmetic',
];

export function DebateSummary({ summary }: { summary: FinalSummary }) {
  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden bg-gray-50">
      <div className="bg-gray-800 text-white px-4 py-3">
        <h3 className="font-semibold">Final Summary</h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox label="Total Objections" value={summary.totalObjections} />
          <StatBox label="Resolved" value={summary.resolved} color="text-green-700" />
          <StatBox label="Unresolved" value={summary.unresolved} color="text-orange-600" />
          <StatBox label="Escalated" value={summary.escalated} color="text-purple-600" />
        </div>

        {/* By Category */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">By Category</h4>
          <div className="flex flex-wrap gap-2">
            {categoryOrder
              .filter((cat) => summary.byCategory[cat] > 0)
              .map((cat) => (
                <div key={cat} className="flex items-center gap-1">
                  <CategoryBadge category={cat} />
                  <span className="text-sm font-medium text-gray-700">
                    {summary.byCategory[cat]}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Top Unresolved */}
        {summary.topUnresolved.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Top Unresolved Items
            </h4>
            <div className="space-y-2">
              {summary.topUnresolved.map((obj) => (
                <div
                  key={obj.id}
                  className="flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50/50 p-3"
                >
                  <span className="text-xs font-mono font-bold text-orange-700 shrink-0">
                    {obj.id}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CategoryBadge category={obj.category} />
                      <SeverityBadge severity={obj.severity} />
                    </div>
                    <p className="text-sm text-gray-900">{obj.objection}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendation */}
        <div className="rounded-lg bg-white border border-gray-200 p-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Recommendation</h4>
          <p className="text-sm text-gray-900">{summary.recommendation}</p>
        </div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  color = 'text-gray-900',
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="rounded-lg bg-white border border-gray-200 p-3 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
