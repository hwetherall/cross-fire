'use client';

import { useEffect, useRef, useState } from 'react';
import type { DebateRound, FinalSummary, RevisedDocument as RevisedDocumentType } from '@/lib/types';
import { RoundCard } from './RoundCard';
import { DebateSummary } from './DebateSummary';
import { RevisedDocument } from './RevisedDocument';

type Tab = 'transcript' | 'revised';

interface DebateViewerProps {
  rounds: DebateRound[];
  summary: FinalSummary | null;
  revisedDocument: RevisedDocumentType | null;
  isRunning: boolean;
  error: string | null;
  onExport: (format: 'json' | 'markdown') => void;
}

export function DebateViewer({ rounds, summary, revisedDocument, isRunning, error, onExport }: DebateViewerProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>('transcript');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [rounds.length, summary, revisedDocument]);

  // Auto-switch to revised tab when it becomes available
  useEffect(() => {
    if (revisedDocument) {
      setActiveTab('revised');
    }
  }, [revisedDocument]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 max-w-md text-center">
          <p className="text-red-800 font-medium mb-1">Debate Error</p>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (rounds.length === 0 && !isRunning) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4 opacity-20">&#9876;</div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Crossfire</h2>
          <p className="text-sm text-gray-500">
            Configure the client persona, paste a document, and run the debate. Red Team will
            critique as the client executive, Blue Team will defend as the Innovera consultant.
          </p>
        </div>
      </div>
    );
  }

  const hasContent = rounds.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Tab Bar — only show once we have content */}
      {hasContent && (
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4">
          <div className="flex items-center justify-between">
            <div className="flex">
              <button
                onClick={() => setActiveTab('transcript')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'transcript'
                    ? 'border-blue-500 text-blue-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Debate Transcript
              </button>
              <button
                onClick={() => setActiveTab('revised')}
                disabled={!revisedDocument}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'revised'
                    ? 'border-emerald-500 text-emerald-700'
                    : revisedDocument
                      ? 'border-transparent text-gray-500 hover:text-gray-700'
                      : 'border-transparent text-gray-300 cursor-not-allowed'
                }`}
              >
                Suggested Final Output
                {!revisedDocument && isRunning && summary && (
                  <span className="ml-2 inline-block w-3 h-3 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
                )}
              </button>
            </div>

            {/* Export buttons */}
            {summary && (
              <div className="flex gap-2">
                <button
                  onClick={() => onExport('json')}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Export JSON
                </button>
                <button
                  onClick={() => onExport('markdown')}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Export Markdown
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 p-4">
          {activeTab === 'transcript' && (
            <>
              {rounds.map((round) => (
                <RoundCard key={round.roundNumber} round={round} />
              ))}
              {summary && <DebateSummary summary={summary} />}
            </>
          )}

          {activeTab === 'revised' && revisedDocument && (
            <RevisedDocument data={revisedDocument} />
          )}

          {activeTab === 'revised' && !revisedDocument && isRunning && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4" />
                <p className="text-sm text-gray-600">Rewriting document with proposed revisions...</p>
                <p className="text-xs text-gray-400 mt-1">Using Claude Opus 4.6</p>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
