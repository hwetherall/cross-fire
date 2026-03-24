'use client';

import { MODELS, type ModelKey } from '@/lib/models';

interface ModelSelectorProps {
  redTeamModel: string;
  blueTeamModel: string;
  onRedChange: (model: string) => void;
  onBlueChange: (model: string) => void;
}

const modelEntries = Object.entries(MODELS) as [ModelKey, (typeof MODELS)[ModelKey]][];

export function ModelSelector({
  redTeamModel,
  blueTeamModel,
  onRedChange,
  onBlueChange,
}: ModelSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Model Configuration</h3>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" />
          Red Team (Attacker)
        </label>
        <select
          value={redTeamModel}
          onChange={(e) => onRedChange(e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        >
          {modelEntries.map(([key, model]) => (
            <option key={key} value={key}>
              {model.name} — {model.bestFor}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1" />
          Blue Team (Defender)
        </label>
        <select
          value={blueTeamModel}
          onChange={(e) => onBlueChange(e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        >
          {modelEntries.map(([key, model]) => (
            <option key={key} value={key}>
              {model.name} — {model.bestFor}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
