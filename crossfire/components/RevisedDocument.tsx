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
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <h3 className="text-sm font-semibold text-emerald-900 mb-1">Revision Summary</h3>
        <p className="text-sm text-emerald-800">{data.summary}</p>
        <p className="text-xs text-emerald-600 mt-2">
          {data.changes.length} change{data.changes.length !== 1 ? 's' : ''} applied
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('document')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'document'
              ? 'border-emerald-500 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Revised Document
        </button>
        <button
          onClick={() => setActiveTab('changelog')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'changelog'
              ? 'border-emerald-500 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
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
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              {copiedDoc ? 'Copied!' : 'Copy Markdown'}
            </button>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 sm:p-8">
            <article className="prose prose-sm sm:prose-base max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-li:text-gray-700 prose-blockquote:border-gray-300 prose-blockquote:text-gray-600 prose-table:text-sm prose-th:bg-gray-50 prose-th:p-2 prose-td:p-2 prose-th:border prose-td:border prose-th:border-gray-200 prose-td:border-gray-200">
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
              className="rounded-lg border border-gray-200 bg-white overflow-hidden"
            >
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-800">
                  {change.location}
                </span>
                <div className="flex gap-1">
                  {change.objectionIds.map((id) => (
                    <span
                      key={id}
                      className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                    >
                      {id}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <span className="text-xs font-medium text-red-600 uppercase tracking-wide">Original</span>
                  <div className="mt-1 rounded border border-red-100 bg-red-50 p-2.5 text-sm text-red-900">
                    {change.original}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Revised</span>
                  <div className="mt-1 rounded border border-emerald-100 bg-emerald-50 p-2.5 text-sm text-emerald-900">
                    {change.revised}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Reason</span>
                  <p className="mt-1 text-sm text-gray-700">{change.reason}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
