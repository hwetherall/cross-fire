'use client';

import { useState } from 'react';

interface DocumentInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function DocumentInput({ value, onChange }: DocumentInputProps) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">Document</label>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {showPreview ? (
        <div className="w-full min-h-[300px] max-h-[500px] overflow-y-auto rounded-lg border border-gray-300 bg-white p-4 text-sm whitespace-pre-wrap dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200">
          {value || <span className="text-gray-400 dark:text-zinc-500">Nothing to preview</span>}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste or type your document here (markdown or plain text)..."
          className="w-full min-h-[300px] max-h-[500px] rounded-lg border border-gray-300 bg-white p-4 text-sm font-mono text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-y dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
      )}
      <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
        {value.length > 0
          ? `${value.split(/\s+/).filter(Boolean).length} words`
          : 'Supports markdown and plain text'}
      </p>
    </div>
  );
}
