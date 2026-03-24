'use client';

import type { DocumentType } from '@/lib/types';

interface ContextConfig {
  clientCompany: string;
  clientIndustry: string;
  clientRole: string;
  clientContext: string;
  eslEnabled: boolean;
  documentType: DocumentType;
}

interface ContextPanelProps {
  config: ContextConfig;
  onChange: (config: ContextConfig) => void;
}

const documentTypes: { value: DocumentType; label: string }[] = [
  { value: 'exec-summary', label: 'Exec Summary' },
  { value: 'full-summary', label: 'Full Summary' },
  { value: 'demand-validation', label: 'Demand Validation' },
  { value: 'competitor-analysis', label: 'Competitor Analysis' },
  { value: 'market-research', label: 'Market Research' },
];

export function ContextPanel({ config, onChange }: ContextPanelProps) {
  const update = (partial: Partial<ContextConfig>) =>
    onChange({ ...config, ...partial });

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Client Persona</h3>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Agent Name</label>
        <select
          value={config.documentType}
          onChange={(e) => update({ documentType: e.target.value as DocumentType })}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        >
          {documentTypes.map((dt) => (
            <option key={dt.value} value={dt.value}>
              {dt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Company Name</label>
        <input
          type="text"
          value={config.clientCompany}
          onChange={(e) => update({ clientCompany: e.target.value })}
          placeholder="e.g., Samsung"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Industry</label>
        <input
          type="text"
          value={config.clientIndustry}
          onChange={(e) => update({ clientIndustry: e.target.value })}
          placeholder="e.g., Consumer electronics & semiconductors"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Client Role</label>
        <input
          type="text"
          value={config.clientRole}
          onChange={(e) => update({ clientRole: e.target.value })}
          placeholder="e.g., C-Suite and Corporate Innovation Team"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Additional Context <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          value={config.clientContext}
          onChange={(e) => update({ clientContext: e.target.value })}
          placeholder="Any extra context about the client's situation..."
          rows={2}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-y"
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-medium text-gray-600">ESL Mode</label>
          <p className="text-xs text-gray-400">Client&apos;s first language is not English</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={config.eslEnabled}
          onClick={() => update({ eslEnabled: !config.eslEnabled })}
          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer ${
            config.eslEnabled ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
              config.eslEnabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
