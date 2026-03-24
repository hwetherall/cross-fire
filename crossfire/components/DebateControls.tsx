'use client';

interface DebateControlsProps {
  maxRounds: number;
  searchEnabled: boolean;
  onMaxRoundsChange: (value: number) => void;
  onSearchEnabledChange: (value: boolean) => void;
  onStart: () => void;
  isRunning: boolean;
  currentRound: number;
  totalRounds: number;
  phase: string;
}

export function DebateControls({
  maxRounds,
  searchEnabled,
  onMaxRoundsChange,
  onSearchEnabledChange,
  onStart,
  isRunning,
  currentRound,
  totalRounds,
  phase,
}: DebateControlsProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-zinc-300">Debate Settings</h3>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">
          Max Rounds: <span className="font-bold text-gray-900 dark:text-zinc-100">{maxRounds}</span>
        </label>
        <input
          type="range"
          min={1}
          max={8}
          value={maxRounds}
          onChange={(e) => onMaxRoundsChange(Number(e.target.value))}
          disabled={isRunning}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400 dark:text-zinc-500">
          <span>1</span>
          <span>8</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-zinc-400">Web Search</label>
          <p className="text-xs text-gray-400 dark:text-zinc-500">Fact-check flagged claims via Tavily</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={searchEnabled}
          onClick={() => onSearchEnabledChange(!searchEnabled)}
          disabled={isRunning}
          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer ${
            searchEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-zinc-600'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
              searchEnabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <button
        onClick={onStart}
        disabled={isRunning}
        className={`w-full rounded-lg py-3 px-4 text-sm font-semibold text-white transition-colors ${
          isRunning
            ? 'bg-gray-400 cursor-not-allowed dark:bg-zinc-600'
            : 'bg-gray-900 hover:bg-gray-800 cursor-pointer dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'
        }`}
      >
        {isRunning ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {phase}
          </span>
        ) : (
          'Run Debate'
        )}
      </button>

      {isRunning && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500 dark:text-zinc-400">
            <span>
              Round {currentRound} of {totalRounds}
            </span>
            <span>{phase}</span>
          </div>
          <div className="h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{
                width: `${(currentRound / totalRounds) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
