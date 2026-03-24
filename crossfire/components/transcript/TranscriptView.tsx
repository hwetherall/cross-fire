import type { DebateRound, FinalSummary } from '@/lib/types';
import { RoundSection } from './RoundSection';

interface TranscriptViewProps {
  rounds: DebateRound[];
  summary: FinalSummary | null;
  isRunning: boolean;
}

export function TranscriptView({ rounds, summary, isRunning }: TranscriptViewProps) {
  if (rounds.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-gray-500">No transcript data yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {rounds.map((round) => (
        <RoundSection key={round.roundNumber} round={round} />
      ))}

      {/* Summary recommendation */}
      {summary && (
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
          <p className="text-[11px] uppercase tracking-[0.04em] text-gray-400 font-medium mb-1">
            Recommendation
          </p>
          <p className="text-[13px] text-gray-800 leading-relaxed">
            {summary.recommendation}
          </p>
        </div>
      )}

      {isRunning && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            Debate in progress...
          </div>
        </div>
      )}
    </div>
  );
}
