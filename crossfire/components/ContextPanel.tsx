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
  { value: 'market-research', label: 'Market Research' },
  { value: 'demand-validation', label: 'Demand Validation' },
  { value: 'competitor-intelligence', label: 'Competitor Intelligence' },
  { value: 'product-technology', label: 'Product & Technology' },
  { value: 'go-to-market', label: 'Go To Market' },
  { value: 'business-model', label: 'Business Model' },
  { value: 'finance-operations', label: 'Finance & Operations' },
  { value: 'unit-economics', label: 'Unit Economics' },
  { value: 'team-execution', label: 'Team & Execution' },
  { value: 'legal-ip', label: 'Legal & IP' },
  { value: 'full-summary', label: 'Full Summary' },
];

export function ContextPanel({ config, onChange }: ContextPanelProps) {
  const update = (partial: Partial<ContextConfig>) =>
    onChange({ ...config, ...partial });

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-zinc-300">Client Persona</h3>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">Agent Name</label>
        <select
          value={config.documentType}
          onChange={(e) => update({ documentType: e.target.value as DocumentType })}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        >
          {documentTypes.map((dt) => (
            <option key={dt.value} value={dt.value}>
              {dt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">Company Name</label>
        <input
          type="text"
          value={config.clientCompany}
          onChange={(e) => update({ clientCompany: e.target.value })}
          placeholder="e.g., Samsung"
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">Industry</label>
        <input
          type="text"
          value={config.clientIndustry}
          onChange={(e) => update({ clientIndustry: e.target.value })}
          placeholder="e.g., Consumer electronics & semiconductors"
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">Client Role</label>
        <input
          type="text"
          value={config.clientRole}
          onChange={(e) => update({ clientRole: e.target.value })}
          placeholder="e.g., C-Suite and Corporate Innovation Team"
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">
          Additional Context <span className="text-gray-400 dark:text-zinc-500">(optional)</span>
        </label>
        <textarea
          value={config.clientContext}
          onChange={(e) => update({ clientContext: e.target.value })}
          placeholder="Any extra context about the client's situation..."
          rows={2}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-y dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-zinc-400">ESL Mode</label>
          <p className="text-xs text-gray-400 dark:text-zinc-500">Client&apos;s first language is not English</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={config.eslEnabled}
          onClick={() => update({ eslEnabled: !config.eslEnabled })}
          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer ${
            config.eslEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-zinc-600'
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
