import type { DebateRound, FinalSummary } from '@/lib/types';
import { RoundSection } from './RoundSection';

interface TranscriptViewProps {
  rounds: DebateRound[];
  summary: FinalSummary | null;
  isRunning: boolean;
  isRewriting: boolean;
}

export function TranscriptView({ rounds, summary, isRunning, isRewriting }: TranscriptViewProps) {
  if (rounds.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-gray-500 dark:text-zinc-400">No transcript data yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {rounds.map((round) => (
        <RoundSection
          key={round.roundNumber}
          round={round}
          bluePending={round.streamStatus === 'red-complete'}
        />
      ))}

      {/* Summary recommendation */}
      {summary && (
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-[11px] uppercase tracking-[0.04em] text-gray-400 dark:text-zinc-500 font-medium mb-1">
            Recommendation
          </p>
          <p className="text-[13px] text-gray-800 dark:text-zinc-200 leading-relaxed">
            {summary.recommendation}
          </p>
        </div>
      )}

      {isRunning && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
            <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin dark:border-zinc-600 dark:border-t-zinc-300" />
            Debate in progress...
          </div>
        </div>
      )}

      {!isRunning && isRewriting && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
            <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin dark:border-zinc-600 dark:border-t-zinc-300" />
            Debate complete. Building revised document...
          </div>
        </div>
      )}
    </div>
  );
}
