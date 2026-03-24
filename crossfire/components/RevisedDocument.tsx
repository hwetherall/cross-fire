'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { RevisedDocument as RevisedDocumentType } from '@/lib/types';

interface RevisedDocumentProps {
  data: RevisedDocumentType;
}

export function RevisedDocument({ data }: RevisedDocumentProps) {
  const [activeTab, setActiveTab] = useState<'document' | 'changelog'>('document');
  const [copiedDoc, setCopiedDoc] = useState(false);

  const handleCopyDocument = () => {
    navigator.clipboard.writeText(data.rewrittenDocument);
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/40">
        <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-200 mb-1">Revision Summary</h3>
        <p className="text-sm text-emerald-800 dark:text-emerald-300">{data.summary}</p>
        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
          {data.changes.length} change{data.changes.length !== 1 ? 's' : ''} applied
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-zinc-700">
        <button
          onClick={() => setActiveTab('document')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'document'
              ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Revised Document
        </button>
        <button
          onClick={() => setActiveTab('changelog')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'changelog'
              ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Changelog ({data.changes.length})
        </button>
      </div>

      {/* Document View — Rich Text */}
      {activeTab === 'document' && (
        <div>
          <div className="flex justify-end mb-2">
            <button
              onClick={handleCopyDocument}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {copiedDoc ? 'Copied!' : 'Copy Markdown'}
            </button>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 sm:p-8 dark:border-zinc-700 dark:bg-zinc-900">
            <article
              className={[
                'prose prose-sm sm:prose-base max-w-none',
                /* Light — tuned grays */
                'prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-li:text-gray-700',
                'prose-blockquote:border-gray-300 prose-blockquote:text-gray-600',
                'prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline',
                'prose-code:rounded prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:text-gray-800 prose-code:before:content-none prose-code:after:content-none',
                'prose-pre:bg-gray-100 prose-pre:text-gray-800',
                'prose-table:text-sm prose-th:bg-gray-50 prose-th:p-2 prose-td:p-2 prose-th:border prose-td:border prose-th:border-gray-200 prose-td:border-gray-200',
                /* Dark — explicit light text (do not use prose-invert: it fights the gray utilities above) */
                'dark:text-zinc-200',
                'dark:prose-headings:text-zinc-50 dark:prose-p:text-zinc-200 dark:prose-strong:text-white dark:prose-li:text-zinc-200',
                'dark:prose-blockquote:border-zinc-600 dark:prose-blockquote:text-zinc-300',
                'dark:prose-a:text-blue-400',
                'dark:prose-code:bg-zinc-800 dark:prose-code:text-zinc-100',
                'dark:prose-pre:bg-zinc-950 dark:prose-pre:text-zinc-200',
                'dark:prose-th:bg-zinc-800 dark:prose-th:border-zinc-600 dark:prose-td:border-zinc-600',
                'dark:prose-hr:border-zinc-600',
                /* Markdown/HTML that ships Tailwind text-* classes (e.g. gray-700 on dark bg) */
                'dark:[&_.text-gray-900]:!text-zinc-50 dark:[&_.text-gray-800]:!text-zinc-100 dark:[&_.text-gray-700]:!text-zinc-200',
                'dark:[&_.text-gray-600]:!text-zinc-300 dark:[&_.text-gray-500]:!text-zinc-400',
                'dark:[&_.text-slate-900]:!text-zinc-50 dark:[&_.text-slate-800]:!text-zinc-100 dark:[&_.text-slate-700]:!text-zinc-200',
                'dark:[&_.text-slate-600]:!text-zinc-300 dark:[&_.text-slate-500]:!text-zinc-400',
              ].join(' ')}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {data.rewrittenDocument}
              </ReactMarkdown>
            </article>
          </div>
        </div>
      )}

      {/* Changelog View */}
      {activeTab === 'changelog' && (
        <div className="space-y-3">
          {data.changes.map((change, i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-200 bg-white overflow-hidden dark:border-zinc-700 dark:bg-zinc-900"
            >
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between dark:border-zinc-700 dark:bg-zinc-800/80">
                <span className="text-sm font-medium text-gray-800 dark:text-zinc-200">
                  {change.location}
                </span>
                <div className="flex gap-1">
                  {change.objectionIds.map((id) => (
                    <span
                      key={id}
                      className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-zinc-700 dark:text-zinc-300"
                    >
                      {id}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <span className="text-xs font-medium text-red-600 uppercase tracking-wide">Original</span>
                  <div className="mt-1 rounded border border-red-100 bg-red-50 p-2.5 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/50 dark:text-red-200">
                    {change.original}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Revised</span>
                  <div className="mt-1 rounded border border-emerald-100 bg-emerald-50 p-2.5 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/50 dark:text-emerald-200">
                    {change.revised}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wide">Reason</span>
                  <p className="mt-1 text-sm text-gray-700 dark:text-zinc-300">{change.reason}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
