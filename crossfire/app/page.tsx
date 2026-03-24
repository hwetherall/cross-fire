'use client';

import { useState, useCallback } from 'react';
import type { DebateRound, FinalSummary, RevisedDocument, DocumentType } from '@/lib/types';
import { DEFAULT_PAIRING } from '@/lib/models';
import { exportAsJson, exportAsMarkdown } from '@/lib/export';
import { DocumentInput } from '@/components/DocumentInput';
import { ContextPanel } from '@/components/ContextPanel';
import { ModelSelector } from '@/components/ModelSelector';
import { DebateControls } from '@/components/DebateControls';
import { DebateViewer } from '@/components/DebateViewer';

export default function Home() {
  // Document
  const [document, setDocument] = useState('');

  // Context config
  const [contextConfig, setContextConfig] = useState({
    clientCompany: '',
    clientIndustry: '',
    clientRole: '',
    clientContext: '',
    eslEnabled: false,
    documentType: 'exec-summary' as DocumentType,
  });

  // Models
  const [redTeamModel, setRedTeamModel] = useState<string>(DEFAULT_PAIRING.redTeam);
  const [blueTeamModel, setBlueTeamModel] = useState<string>(DEFAULT_PAIRING.blueTeam);

  // Debate settings
  const [maxRounds, setMaxRounds] = useState(3);
  const [searchEnabled, setSearchEnabled] = useState(false);

  // Debate state
  const [rounds, setRounds] = useState<DebateRound[]>([]);
  const [summary, setSummary] = useState<FinalSummary | null>(null);
  const [revisedDocument, setRevisedDocument] = useState<RevisedDocument | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [phase, setPhase] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Collapsible left panel sections
  const [contextOpen, setContextOpen] = useState(true);

  const startDebate = useCallback(async () => {
    if (!document.trim()) {
      setError('Please paste a document to debate.');
      return;
    }
    if (!contextConfig.clientCompany.trim()) {
      setError('Please enter a client company name.');
      return;
    }

    setError(null);
    setRounds([]);
    setSummary(null);
    setRevisedDocument(null);
    setIsRunning(true);
    setCurrentRound(1);
    setPhase('Red Team reviewing document...');

    try {
      const response = await fetch('/api/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document,
          documentType: contextConfig.documentType,
          clientCompany: contextConfig.clientCompany,
          clientIndustry: contextConfig.clientIndustry || 'General',
          clientRole: contextConfig.clientRole || 'Senior Executive',
          clientContext: contextConfig.clientContext || undefined,
          eslEnabled: contextConfig.eslEnabled,
          redTeamModel,
          blueTeamModel,
          maxRounds,
          searchEnabled,
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`API error: ${response.status} — ${errBody}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line);
            if (event.type === 'heartbeat') {
              // Keep-alive ping, ignore
            } else if (event.type === 'progress') {
              setCurrentRound(event.data.round);
              setPhase(`Round ${event.data.round}: ${event.data.phase}`);
            } else if (event.type === 'round') {
              const round = event.data as DebateRound;
              setRounds((prev) => [...prev, round]);
              setCurrentRound(round.roundNumber + 1);
              setPhase(
                round.roundNumber < maxRounds
                  ? `Round ${round.roundNumber + 1}: Waiting...`
                  : 'Generating summary...'
              );
            } else if (event.type === 'summary') {
              setSummary(event.data as FinalSummary);
              setPhase('Rewriting document with proposed revisions...');
            } else if (event.type === 'rewrite') {
              setRevisedDocument(event.data as RevisedDocument);
            } else if (event.type === 'error') {
              throw new Error(event.data.message);
            }
          } catch (parseErr) {
            if (parseErr instanceof SyntaxError) {
              console.warn('Failed to parse NDJSON line:', line);
            } else {
              throw parseErr;
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsRunning(false);
      setPhase('');
    }
  }, [document, contextConfig, redTeamModel, blueTeamModel, maxRounds, searchEnabled]);

  const handleExport = useCallback(
    (format: 'json' | 'markdown') => {
      if (!summary) return;

      const config = {
        document,
        documentType: contextConfig.documentType,
        clientCompany: contextConfig.clientCompany,
        clientIndustry: contextConfig.clientIndustry || 'General',
        clientRole: contextConfig.clientRole || 'Senior Executive',
        clientContext: contextConfig.clientContext || undefined,
        eslEnabled: contextConfig.eslEnabled,
        redTeamModel,
        blueTeamModel,
        maxRounds,
        searchEnabled,
      };

      const content =
        format === 'json'
          ? exportAsJson(config, rounds, summary, revisedDocument)
          : exportAsMarkdown(config, rounds, summary, revisedDocument);

      const ext = format === 'json' ? 'json' : 'md';
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `crossfire-debate.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [document, contextConfig, redTeamModel, blueTeamModel, maxRounds, searchEnabled, rounds, summary, revisedDocument]
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Left Panel — Input */}
      <div className="w-full lg:w-[35%] lg:min-w-[380px] lg:max-w-[480px] border-r border-gray-200 bg-white overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">Crossfire</h1>
            <p className="text-xs text-gray-500">Innovera Debate Engine</p>
          </div>

          {/* Document Input */}
          <DocumentInput value={document} onChange={setDocument} />

          {/* Context Panel — Collapsible */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setContextOpen(!contextOpen)}
              className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Client Persona & Settings
              <span className={`transition-transform ${contextOpen ? 'rotate-180' : ''}`}>
                &#9660;
              </span>
            </button>
            {contextOpen && (
              <div className="p-4 space-y-4 border-t border-gray-200">
                <ContextPanel config={contextConfig} onChange={setContextConfig} />
                <div className="border-t border-gray-100 pt-4">
                  <ModelSelector
                    redTeamModel={redTeamModel}
                    blueTeamModel={blueTeamModel}
                    onRedChange={setRedTeamModel}
                    onBlueChange={setBlueTeamModel}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Debate Controls */}
          <DebateControls
            maxRounds={maxRounds}
            searchEnabled={searchEnabled}
            onMaxRoundsChange={setMaxRounds}
            onSearchEnabledChange={setSearchEnabled}
            onStart={startDebate}
            isRunning={isRunning}
            currentRound={currentRound}
            totalRounds={maxRounds}
            phase={phase}
          />
        </div>
      </div>

      {/* Right Panel — Output */}
      <div className="flex-1 overflow-y-auto">
        <DebateViewer
          rounds={rounds}
          summary={summary}
          revisedDocument={revisedDocument}
          isRunning={isRunning}
          error={error}
          onExport={handleExport}
        />
      </div>
    </div>
  );
}
