import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  Layers, 
  BookOpen, 
  ShieldCheck, 
  Trash2, 
  Clock, 
  Cpu, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { QAResponse, DocumentItem } from '../types';

interface AIQuestionAnsweringProps {
  documents: DocumentItem[];
  onOpenDocument: (documentId: number, pageNumber?: number) => void;
}

interface MessageHistoryItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  responseMeta?: QAResponse;
}

export const AIQuestionAnswering: React.FC<AIQuestionAnsweringProps> = ({
  documents,
  onOpenDocument,
}) => {
  const [question, setQuestion] = useState<string>('');
  const [selectedDocId, setSelectedDocId] = useState<number | undefined>(undefined);
  const [generationMethod, setGenerationMethod] = useState<'flan_t5' | 'extractive'>('flan_t5');
  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<MessageHistoryItem[]>([]);

  const suggestedQuestions = [
    'What are the primary challenges of renewable energy adoption?',
    'How do smart inverters help stabilize electrical frequency?',
    'What are self-attention mechanisms in transformer models?',
    'Why can lightweight models run on CPU without requiring an NVIDIA GPU?',
  ];

  const handleSend = async (e?: React.FormEvent, customQ?: string) => {
    if (e) e.preventDefault();
    const queryToSend = customQ || question;
    if (!queryToSend.trim()) return;

    const userMsg: MessageHistoryItem = {
      id: Math.random().toString(),
      role: 'user',
      content: queryToSend,
    };

    setHistory((prev) => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await api.askQuestion(queryToSend, selectedDocId, 4, 0.2, generationMethod);
      const aiMsg: MessageHistoryItem = {
        id: Math.random().toString(),
        role: 'assistant',
        content: res.answer,
        responseMeta: res,
      };
      setHistory((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: MessageHistoryItem = {
        id: Math.random().toString(),
        role: 'assistant',
        content: `Error: ${err.message || 'Failed to generate grounded answer.'}`,
      };
      setHistory((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear conversation history?')) {
      setHistory([]);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#DDD7CC] pb-6 gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#A68155] font-semibold">
            Evidence-Grounded RAG Pipeline
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-[#24231F] mt-1">
            Ask your documents anything.
          </h1>
          <p className="text-sm text-[#858078] mt-1">
            Get meaningful answers strictly grounded in your indexed knowledge base, backed by verifiable citations.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="px-3.5 py-1.5 rounded border border-[#DDD7CC] bg-white text-xs text-[#858078] hover:text-red-600 hover:border-red-200 transition-colors flex items-center space-x-1 self-start md:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Conversation</span>
          </button>
        )}
      </div>

      {/* Scope and Model Configuration Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-[#DDD7CC] bg-white/70 text-xs font-mono">
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="flex items-center space-x-2">
            <span className="text-[#858078] uppercase text-[10px]">Scope:</span>
            <select
              value={selectedDocId || ''}
              onChange={(e) => setSelectedDocId(e.target.value ? Number(e.target.value) : undefined)}
              className="p-1.5 rounded border border-[#DDD7CC] bg-[#F7F5F0] text-[#24231F] focus:outline-none"
            >
              <option value="">Entire Knowledge Base ({documents.length} files)</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.original_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[#858078] uppercase text-[10px]">Model:</span>
            <select
              value={generationMethod}
              onChange={(e) => setGenerationMethod(e.target.value as any)}
              className="p-1.5 rounded border border-[#DDD7CC] bg-[#F7F5F0] text-[#24231F] focus:outline-none"
            >
              <option value="flan_t5">google/flan-t5-small (Instruction-Tuned)</option>
              <option value="extractive">Extractive Semantic Synthesis (Strict)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[10px] text-[#72816B]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Hallucination Prevention Active</span>
        </div>
      </div>

      {/* Suggested Questions */}
      {history.length === 0 && (
        <div className="p-6 rounded-2xl border border-[#DDD7CC] bg-white/60 space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-[#A68155] font-semibold">
            Suggested Inquiries
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {suggestedQuestions.map((sq, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuestion(sq);
                  handleSend(undefined, sq);
                }}
                className="p-3 text-left rounded-lg border border-[#DDD7CC] bg-white hover:border-[#A68155] hover:bg-[#F7F5F0] transition-all text-xs text-[#24231F] shadow-sm flex items-center justify-between group"
              >
                <span>"{sq}"</span>
                <ChevronRight className="w-4 h-4 text-[#858078] group-hover:text-[#A68155] shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Conversation Thread */}
      <div className="space-y-6">
        {history.map((msg) => (
          <div
            key={msg.id}
            className={`p-6 rounded-2xl border transition-all ${
              msg.role === 'user'
                ? 'bg-[#EAE5DC]/40 border-[#DDD7CC] ml-auto max-w-2xl'
                : 'bg-white border-[#DDD7CC] shadow-editorial'
            }`}
          >
            {/* Header info */}
            <div className="flex items-center justify-between text-xs pb-3 border-b border-[#DDD7CC]/60 mb-3">
              <span className="font-mono uppercase text-[10px] tracking-wider font-semibold text-[#858078] flex items-center space-x-1.5">
                {msg.role === 'user' ? (
                  <span>User Question</span>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#A68155]" />
                    <span className="text-[#24231F]">Synapse RAG Core</span>
                  </>
                )}
              </span>

              {msg.responseMeta && (
                <span className="text-[10px] font-mono text-[#777B60] bg-[#EAE5DC] px-2 py-0.5 rounded border border-[#DDD7CC]">
                  {msg.responseMeta.model_used}
                </span>
              )}
            </div>

            {/* Content text */}
            <div className="text-xs md:text-sm text-[#24231F] leading-relaxed whitespace-pre-wrap font-sans">
              {msg.content}
            </div>

            {/* Citations and Evidence References */}
            {msg.responseMeta && msg.responseMeta.citations.length > 0 && (
              <div className="mt-6 pt-4 border-t border-[#DDD7CC] space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#858078] flex items-center justify-between">
                  <span>Supporting Evidence & Citations:</span>
                  <span>Click to view in document</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {msg.responseMeta.citations.map((cite, idx) => (
                    <div
                      key={idx}
                      onClick={() => onOpenDocument(cite.document_id, cite.page_number)}
                      className="p-3 rounded-lg border border-[#DDD7CC] bg-[#F7F5F0] hover:border-[#A68155] cursor-pointer transition-colors text-xs group"
                    >
                      <div className="flex items-center justify-between font-mono text-[11px] text-[#A68155] mb-1">
                        <span className="truncate max-w-[180px] font-medium text-[#24231F]">
                          {cite.document_name}
                        </span>
                        <span>Page {cite.page_number}</span>
                      </div>
                      <p className="text-[11px] text-[#858078] line-clamp-2 italic">
                        "{cite.snippet}"
                      </p>
                      <div className="mt-2 text-[10px] font-mono text-[#72816B] flex items-center justify-between">
                        <span>Relevance: {cite.similarity_score}</span>
                        <span className="group-hover:underline flex items-center space-x-1">
                          <span>Inspect page</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-[#858078] pt-2">
                  <span>Retrieval: {msg.responseMeta.retrieval_latency_ms} ms</span>
                  <span>Generation: {msg.responseMeta.generation_latency_ms} ms</span>
                  <span>Total: {msg.responseMeta.total_latency_ms} ms</span>
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="p-8 rounded-2xl border border-[#DDD7CC] bg-white shadow-editorial text-center space-y-4 animate-pulse">
            <div className="flex items-center justify-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#A68155] animate-ping"></span>
              <span className="w-2 h-2 rounded-full bg-[#72816B] animate-ping delay-75"></span>
              <span className="w-2 h-2 rounded-full bg-[#24231F] animate-ping delay-150"></span>
            </div>
            <div className="font-serif text-base font-semibold text-[#24231F]">
              Retrieving Evidence & Synthesizing Answer...
            </div>
            <p className="text-xs text-[#858078] max-w-sm mx-auto font-mono">
              Running dense vector similarity search in FAISS & processing with {generationMethod}.
            </p>
          </div>
        )}
      </div>

      {/* Floating Query Input */}
      <form onSubmit={handleSend} className="sticky bottom-6 z-20">
        <div className="relative shadow-editorial-lg rounded-2xl bg-white border border-[#DDD7CC] overflow-hidden p-1.5">
          <input
            type="text"
            placeholder="Type your question grounded in uploaded documents..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full pl-5 pr-28 py-3.5 text-xs md:text-sm text-[#24231F] focus:outline-none bg-transparent"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl bg-[#24231F] text-[#F7F5F0] text-xs font-medium hover:bg-[#A68155] disabled:opacity-50 transition-colors flex items-center space-x-2 shadow-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Ask</span>
          </button>
        </div>
      </form>
    </div>
  );
};
