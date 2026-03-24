'use client';

import { useState, useEffect } from 'react';
import type { DebateRound, FinalSummary, RevisedDocument as RevisedDocumentType } from '@/lib/types';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { TranscriptView } from '@/components/transcript/TranscriptView';
import { RevisedDocument } from '@/components/RevisedDocument';
import { ThemeToggle } from '@/components/ThemeToggle';

type Tab = 'dashboard' | 'transcript' | 'revised';

interface OutputPanelProps {
  rounds: DebateRound[];
  summary: FinalSummary | null;
  revisedDocument: RevisedDocumentType | null;
  isRunning: boolean;
  isRewriting: boolean;
  hasStartedDebate: boolean;
  error: string | null;
  config: { clientCompany: string; documentType: string };
  onExport: (format: 'json' | 'markdown') => void;
}

export function OutputPanel({
  rounds,
  summary,
  revisedDocument,
  isRunning,
  isRewriting,
  hasStartedDebate,
  error,
  config,
  onExport,
}: OutputPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  // Auto-switch to revised tab when document arrives
  useEffect(() => {
    if (revisedDocument) {
      setActiveTab('revised');
    }
  }, [revisedDocument]);

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 max-w-md text-center dark:border-red-900/50 dark:bg-red-950/40">
          <p className="text-red-800 dark:text-red-200 font-medium mb-1">Debate Error</p>
          <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state — no debate started
  if (!hasStartedDebate && rounds.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4 opacity-20">&#9876;</div>
          <h2 className="text-lg font-semibold text-gray-700 dark:text-zinc-300 mb-2">Crossfire</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Configure the client persona, paste a document, and run the debate. Red Team will
            critique as the client executive, Blue Team will defend as the Innovera consultant.
          </p>
        </div>
      </div>
    );
  }

  // Loading state — debate started but no rounds yet
  if (isRunning && rounds.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-block w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin dark:border-zinc-600 dark:border-t-zinc-300" />
            <p className="text-[15px] font-medium text-gray-800 dark:text-zinc-200">
              Preparing debate...
            </p>
          </div>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Loading models and starting Round 1. This typically takes 30-60 seconds.
          </p>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
            <div className="h-full rounded-full bg-gray-400 dark:bg-zinc-500 animate-pulse w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  const hasContent = rounds.length > 0;
  const debateComplete = summary !== null;

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      {hasContent && (
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between py-2">
            {/* Brand + context label */}
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-[14px] font-semibold text-gray-900 dark:text-zinc-100 shrink-0">Crossfire</span>
              {config.clientCompany && (
                <span className="text-[12px] text-gray-400 dark:text-zinc-500 truncate">
                  {config.clientCompany} — {config.documentType.replace(/-/g, ' ')}
                </span>
              )}
            </div>

            {/* Tab group + export */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <ThemeToggle />
              {/* Segmented tab bar */}
              <div className="flex rounded-lg border border-gray-200 overflow-hidden dark:border-zinc-700">
                <TabButton
                  label="Dashboard"
                  active={activeTab === 'dashboard'}
                  onClick={() => setActiveTab('dashboard')}
                />
                <TabButton
                  label="Transcript"
                  active={activeTab === 'transcript'}
                  onClick={() => setActiveTab('transcript')}
                />
                <TabButton
                  label="Revised output"
                  active={activeTab === 'revised'}
                  disabled={!revisedDocument}
                  loading={isRewriting && !revisedDocument}
                  onClick={() => setActiveTab('revised')}
                />
              </div>

              {/* Export buttons */}
              {debateComplete && (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onExport('json')}
                    className="rounded-md border border-gray-200 px-2.5 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    JSON
                  </button>
                  <button
                    onClick={() => onExport('markdown')}
                    className="rounded-md border border-gray-200 px-2.5 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Markdown
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <DashboardView rounds={rounds} summary={summary} isRunning={isRunning} />
        )}

        {activeTab === 'transcript' && (
          <TranscriptView
            rounds={rounds}
            summary={summary}
            isRunning={isRunning}
            isRewriting={isRewriting}
          />
        )}

        {activeTab === 'revised' && revisedDocument && (
          <div className="p-4">
            <RevisedDocument data={revisedDocument} />
          </div>
        )}

        {activeTab === 'revised' && !revisedDocument && isRewriting && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mb-4 dark:border-zinc-700 dark:border-t-zinc-400" />
              <p className="text-sm text-gray-600 dark:text-zinc-400">
                Rewriting document with proposed revisions...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  label,
  active,
  disabled,
  loading,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 text-[12px] font-medium transition-colors ${
        active
          ? 'bg-gray-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
          : disabled
            ? 'text-gray-300 cursor-not-allowed dark:text-zinc-600'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
      }`}
    >
      {label}
      {loading && (
        <span className="ml-1.5 inline-block w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin align-middle dark:border-zinc-600 dark:border-t-zinc-300" />
      )}
    </button>
  );
}
