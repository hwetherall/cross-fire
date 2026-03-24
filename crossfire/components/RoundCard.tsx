import type { DebateRound } from '@/lib/types';
import { ObjectionCard } from './ObjectionCard';
import { ResponseCard } from './ResponseCard';

export function RoundCard({ round }: { round: DebateRound }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
        <h3 className="font-semibold text-sm">Round {round.roundNumber}</h3>
      </div>

      <div className="p-4 space-y-6">
        {/* Red Team Section */}
        <div>
          <h4 className="text-sm font-semibold text-red-700 mb-1 flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
            Red Team — Client Review
          </h4>
          <p className="text-xs text-gray-500 mb-3 italic">{round.redTeam.summary}</p>

          {round.redTeam.resolvedFromPrior && round.redTeam.resolvedFromPrior.length > 0 && (
            <p className="text-xs text-green-700 mb-3">
              Accepted as resolved: {round.redTeam.resolvedFromPrior.join(', ')}
            </p>
          )}

          <div className="space-y-3">
            {round.redTeam.objections.map((obj) => (
              <ObjectionCard key={obj.id} objection={obj} />
            ))}
          </div>
        </div>

        {/* Blue Team Section */}
        <div>
          <h4 className="text-sm font-semibold text-blue-700 mb-1 flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-blue-500" />
            Blue Team — Innovera Response
          </h4>
          <p className="text-xs text-gray-500 mb-3 italic">{round.blueTeam.summary}</p>

          <div className="space-y-3">
            {round.blueTeam.responses.map((resp) => (
              <ResponseCard key={resp.objectionId} response={resp} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
