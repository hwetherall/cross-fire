import type { DebateRound } from '@/lib/types';
import { PairedCard } from './PairedCard';

interface RoundSectionProps {
  round: DebateRound;
  bluePending?: boolean;
}

export function RoundSection({ round, bluePending = false }: RoundSectionProps) {
  return (
    <div className="space-y-3">
      {/* Round header */}
      <div>
        <h3 className="text-[14px] font-medium text-gray-900 dark:text-zinc-100">
          Round {round.roundNumber}
        </h3>
        <p className="text-[12px] text-gray-500 dark:text-zinc-400 mt-0.5">
          {round.redTeam.summary}
        </p>
      </div>

      {/* Resolved from prior banner */}
      {round.redTeam.resolvedFromPrior && round.redTeam.resolvedFromPrior.length > 0 && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-2 dark:border-green-900/50 dark:bg-green-950/40">
          <p className="text-[12px] text-green-800 dark:text-green-200">
            Red Team accepted resolution of:{' '}
            <span className="font-medium">
              {round.redTeam.resolvedFromPrior.join(', ')}
            </span>
          </p>
        </div>
      )}

      {/* Paired cards */}
      <div className="space-y-3">
        {round.redTeam.objections.map((objection) => {
          const response = round.blueTeam.responses.find(
            (r) => r.objectionId === objection.id
          );
          return (
            <PairedCard
              key={objection.id}
              objection={objection}
              response={response}
              bluePending={bluePending}
            />
          );
        })}
      </div>
    </div>
  );
}
