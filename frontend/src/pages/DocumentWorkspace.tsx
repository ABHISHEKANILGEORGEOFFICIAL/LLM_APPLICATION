import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Layers, 
  Send, 
  Sparkles, 
  Loader2, 
  BookOpen, 
  ChevronRight, 
  ArrowLeft,
  ShieldCheck,
  Clock,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { DocumentContent, QAResponse } from '../types';

interface DocumentWorkspaceProps {
  documentId: number | null;
  onBack: () => void;
}

export const DocumentWorkspace: React.FC<DocumentWorkspaceProps> = ({ documentId, onBack }) => {
  const [contentData, setContentData] = useState<DocumentContent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [question, setQuestion] = useState<string>('');
  const [qaLoading, setQaLoading] = useState<boolean>(false);
  const [qaResult, setQaResult] = useState<QAResponse | null>(null);

  useEffect(() => {
    if (!documentId) return;
    loadDocumentContent(documentId);
  }, [documentId]);

  const loadDocumentContent = async (id: number) => {
    setLoading(true);
    try {
      const data = await api.getDocumentContent(id);
      setContentData(data);
      if (data.chunks.length > 0) {
        setSelectedPage(data.chunks[0].page_number);
      }
    } catch (err: any) {
      alert(`Failed to load document: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToAsk = customQuery || question;
    if (!queryToAsk.trim() || !documentId) return;

    setQaLoading(true);
    try {
      const res = await api.askQuestion(queryToAsk, documentId, 4, 0.2, 'flan_t5');
      setQaResult(res);
    } catch (err: any) {
      alert(`QA generation failed: ${err.message}`);
    } finally {
      setQaLoading(false);
    }
  };

  if (!documentId) {
    return (
      <div className="p-12 text-center text-[#858078]">
        No document selected. Please pick a document from the Library.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#A68155]" />
        <span className="font-mono text-xs text-[#858078]">Loading document workspace...</span>
      </div>
    );
  }

  const doc = contentData?.document;
  const chunks = contentData?.chunks || [];
  const uniquePages = Array.from(new Set(chunks.map((c) => c.page_number))).sort((a, b) => a - b);
  const activePageChunks = chunks.filter((c) => c.page_number === selectedPage);

  const suggestedQuestions = [
    `What are the core ideas discussed in ${doc?.original_name}?`,
    `What specific challenges or conclusions are highlighted on page ${selectedPage}?`,
    `Summarize the key takeaways and methodologies.`,
  ];

  return (
    <div className="h-[calc(100vh-1rem)] flex flex-col bg-[#F7F5F0] overflow-hidden">
      {/* Top Bar */}
      <div className="px-6 py-3.5 border-b border-[#DDD7CC] bg-white/70 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded hover:bg-[#EAE5DC] text-[#858078] hover:text-[#24231F] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-serif text-base font-semibold text-[#24231F] truncate max-w-md">
              {doc?.original_name}
            </h1>
            <div className="text-[10px] font-mono text-[#858078] flex items-center space-x-2">
              <span className="uppercase text-[#777B60]">{doc?.file_type}</span>
              <span>•</span>
              <span>{doc?.total_pages} Pages</span>
              <span>•</span>
              <span>{doc?.chunk_count} Chunks</span>
            </div>
          </div>
        </div>

        {/* Page selector pills */}
        <div className="flex items-center space-x-1.5 text-xs font-mono">
          <span className="text-[#858078] mr-1 hidden sm:inline">Jump to Page:</span>
          {uniquePages.map((pg) => (
            <button
              key={pg}
              onClick={() => setSelectedPage(pg)}
              className={`px-2 py-1 rounded text-[11px] ${
                selectedPage === pg
                  ? 'bg-[#A68155] text-[#F7F5F0] font-semibold'
                  : 'bg-[#EAE5DC] text-[#24231F] hover:bg-[#DDD7CC]'
              }`}
            >
              P.{pg}
            </button>
          ))}
        </div>
      </div>

      {/* Two-Panel Workspace Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#DDD7CC] overflow-hidden">
        {/* LEFT PANEL: Document Preview & Extracted Text */}
        <div className="h-full flex flex-col overflow-y-auto p-6 space-y-6">
          {/* Document Summary */}
          <div className="p-4 rounded-xl border border-[#DDD7CC] bg-[#EAE5DC]/30">
            <div className="text-xs font-mono uppercase text-[#A68155] font-semibold mb-1">
              Document Synthesis
            </div>
            <p className="text-xs text-[#24231F] leading-relaxed italic">
              "{contentData?.summary}"
            </p>
          </div>

          {/* Active Page Extracted Text */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DDD7CC]">
              <span className="text-xs font-mono uppercase tracking-wider text-[#858078]">
                Page {selectedPage} Content ({activePageChunks.length} Chunks)
              </span>
              <span className="text-[10px] font-mono text-[#777B60]">
                Verified Page Attribution
              </span>
            </div>

            {activePageChunks.length === 0 ? (
              <p className="text-xs text-[#858078]">No text recorded for this page.</p>
            ) : (
              activePageChunks.map((chunk) => (
                <div
                  key={chunk.id}
                  className="p-4 rounded-lg border border-[#DDD7CC] bg-white text-xs leading-relaxed text-[#24231F] shadow-sm hover:border-[#A68155] transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#858078] mb-2">
                    <span>Chunk #{chunk.chunk_index + 1}</span>
                    <span>{chunk.word_count} words</span>
                  </div>
                  <p className="whitespace-pre-wrap">{chunk.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Document-Specific AI QA Assistant */}
        <div className="h-full flex flex-col overflow-y-auto p-6 space-y-6 bg-white/40">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#72816B] font-semibold">
              Localized RAG Assistant
            </span>
            <h2 className="font-serif text-xl font-semibold text-[#24231F] mt-1">
              Inquire into this Document
            </h2>
            <p className="text-xs text-[#858078] mt-0.5">
              Queries are strictly constrained to retrieved evidence from <span className="font-medium text-[#24231F]">{doc?.original_name}</span>.
            </p>
          </div>

          {/* Suggested Questions */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-[#858078] uppercase">
              Suggested Explorations:
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuestion(q);
                    handleAsk(undefined, q);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-[#DDD7CC] bg-white text-[11px] text-[#24231F] hover:border-[#A68155] hover:bg-[#F7F5F0] transition-all text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Question Form */}
          <form onSubmit={handleAsk} className="relative">
            <input
              type="text"
              placeholder="Ask a question about this document..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full pl-4 pr-12 py-3 rounded-xl border border-[#DDD7CC] bg-white text-xs text-[#24231F] focus:outline-none focus:border-[#A68155] shadow-sm"
            />
            <button
              type="submit"
              disabled={qaLoading || !question.trim()}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-[#24231F] text-[#F7F5F0] hover:bg-[#A68155] disabled:opacity-50 transition-colors"
            >
              {qaLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </form>

          {/* QA Output Display */}
          {qaLoading && (
            <div className="p-8 rounded-xl border border-[#DDD7CC] bg-white/70 text-center space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#A68155] mx-auto" />
              <div className="text-xs font-mono text-[#24231F] font-medium">
                Searching dense vector space & synthesizing answer...
              </div>
              <div className="text-[10px] font-mono text-[#858078]">
                Model: google/flan-t5-small • Top-K Chunks
              </div>
            </div>
          )}

          {qaResult && !qaLoading && (
            <div className="p-5 rounded-xl border border-[#DDD7CC] bg-white shadow-sm space-y-4">
              <div className="flex items-center justify-between text-xs pb-3 border-b border-[#DDD7CC]">
                <span className="flex items-center space-x-1.5 font-semibold text-[#24231F]">
                  <Sparkles className="w-3.5 h-3.5 text-[#A68155]" />
                  <span>Synthesized Answer</span>
                </span>
                <span className="font-mono text-[10px] text-[#72816B] bg-[#72816B]/10 px-2 py-0.5 rounded">
                  {qaResult.model_used}
                </span>
              </div>

              <div className="text-xs text-[#24231F] leading-relaxed whitespace-pre-wrap">
                {qaResult.answer}
              </div>

              {/* Citations list */}
              {qaResult.citations.length > 0 && (
                <div className="pt-3 border-t border-[#DDD7CC] space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#858078]">
                    Grounded Evidence Citations:
                  </div>
                  <div className="space-y-1.5">
                    {qaResult.citations.map((cite, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedPage(cite.page_number)}
                        className="p-2 rounded border border-[#DDD7CC] bg-[#F7F5F0] hover:border-[#A68155] cursor-pointer transition-colors text-[11px]"
                      >
                        <div className="flex items-center justify-between font-mono text-[#A68155]">
                          <span>Page {cite.page_number} (Chunk #{cite.chunk_id})</span>
                          <span className="text-[10px] text-[#858078]">
                            Sim: {cite.similarity_score}
                          </span>
                        </div>
                        <p className="text-[#858078] text-[10px] mt-0.5 line-clamp-1 italic">
                          "{cite.snippet}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-[10px] font-mono text-[#858078] pt-2 flex items-center justify-between">
                <span>Total Latency: {qaResult.total_latency_ms} ms</span>
                <span>Context tokens: {qaResult.context_tokens}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
