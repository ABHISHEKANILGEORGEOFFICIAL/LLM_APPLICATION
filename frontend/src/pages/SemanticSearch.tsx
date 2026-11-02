import React, { useState } from 'react';
import { 
  Search, 
  Layers, 
  ExternalLink, 
  SlidersHorizontal, 
  Loader2, 
  BookOpen, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { SearchResult, DocumentItem } from '../types';

interface SemanticSearchProps {
  documents: DocumentItem[];
  onOpenDocument: (documentId: number, pageNumber?: number) => void;
}

export const SemanticSearch: React.FC<SemanticSearchProps> = ({ documents, onOpenDocument }) => {
  const [query, setQuery] = useState<string>('');
  const [selectedDocId, setSelectedDocId] = useState<number | undefined>(undefined);
  const [topK, setTopK] = useState<number>(4);
  const [threshold, setThreshold] = useState<number>(0.2);
  const [mode, setMode] = useState<'semantic' | 'keyword'>('semantic');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [retrievalTime, setRetrievalTime] = useState<number | null>(null);
  const [totalSearched, setTotalSearched] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchedOnce, setSearchedOnce] = useState<boolean>(false);

  const sampleQueries = [
    'What are the major challenges associated with renewable energy adoption?',
    'How do smart inverters stabilize electrical power grids?',
    'What role does self-attention play in transformer neural architectures?',
    'Why are lightweight language models viable on consumer CPUs?',
  ];

  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const q = customQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setSearchedOnce(true);
    try {
      const res = await api.search(q, selectedDocId, topK, threshold, mode);
      setResults(res.results);
      setRetrievalTime(res.retrieval_time_ms);
      setTotalSearched(res.total_chunks_searched);
    } catch (err: any) {
      alert(`Search failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-[#DDD7CC] pb-6">
        <span className="text-xs font-mono uppercase tracking-widest text-[#A68155] font-semibold">
          Vector Retrieval Engine
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-[#24231F] mt-1">
          Semantic Search Engine
        </h1>
        <p className="text-sm text-[#858078] mt-1">
          Retrieve relevant passages based on conceptual and contextual similarity even when the exact words differ.
        </p>
      </div>

      {/* Main Search Input & Controls */}
      <div className="p-6 rounded-2xl border border-[#DDD7CC] bg-white/80 shadow-editorial space-y-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-[#858078] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by meaning, not just keywords..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-28 py-3.5 rounded-xl border border-[#DDD7CC] bg-[#F7F5F0] text-sm text-[#24231F] focus:outline-none focus:border-[#A68155] font-medium"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-lg bg-[#24231F] text-[#F7F5F0] text-xs font-medium hover:bg-[#A68155] disabled:opacity-50 transition-colors flex items-center space-x-1.5"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Search</span>}
            </button>
          </div>

          {/* Sample Queries */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-[#858078]">
              Try sample conceptual inquiries:
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleQueries.map((sq, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setQuery(sq);
                    handleSearch(undefined, sq);
                  }}
                  className="px-2.5 py-1 rounded bg-[#EAE5DC]/60 hover:bg-[#EAE5DC] text-[11px] text-[#24231F] transition-colors border border-[#DDD7CC]/70"
                >
                  "{sq}"
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Filter & Tuning Parameters */}
        <div className="pt-4 border-t border-[#DDD7CC] grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
          {/* Method selector */}
          <div>
            <label className="text-[#858078] text-[10px] uppercase block mb-1">
              Retrieval Model:
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="w-full p-2 rounded border border-[#DDD7CC] bg-[#F7F5F0] text-[#24231F] focus:outline-none focus:border-[#A68155]"
            >
              <option value="semantic">Semantic (all-MiniLM-L6-v2)</option>
              <option value="keyword">Keyword Baseline (TF-IDF)</option>
            </select>
          </div>

          {/* Document filter */}
          <div>
            <label className="text-[#858078] text-[10px] uppercase block mb-1">
              Document Scope:
            </label>
            <select
              value={selectedDocId || ''}
              onChange={(e) => setSelectedDocId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full p-2 rounded border border-[#DDD7CC] bg-[#F7F5F0] text-[#24231F] focus:outline-none focus:border-[#A68155]"
            >
              <option value="">All Documents ({documents.length})</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.original_name}
                </option>
              ))}
            </select>
          </div>

          {/* Top-K */}
          <div>
            <div className="flex items-center justify-between text-[#858078] text-[10px] uppercase mb-1">
              <span>Top-K Results:</span>
              <span className="text-[#24231F] font-semibold">{topK}</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="w-full accent-[#A68155]"
            />
          </div>

          {/* Threshold */}
          <div>
            <div className="flex items-center justify-between text-[#858078] text-[10px] uppercase mb-1">
              <span>Similarity Cutoff:</span>
              <span className="text-[#24231F] font-semibold">{threshold}</span>
            </div>
            <input
              type="range"
              min={0.0}
              max={0.8}
              step={0.05}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full accent-[#A68155]"
            />
          </div>
        </div>
      </div>

      {/* Results Header */}
      {searchedOnce && (
        <div className="flex items-center justify-between text-xs font-mono text-[#858078] px-1">
          <div>
            Found <span className="font-semibold text-[#24231F]">{results.length}</span> matching passages
            across <span className="font-semibold text-[#24231F]">{totalSearched}</span> vector chunks.
          </div>
          {retrievalTime !== null && (
            <div className="text-[#72816B]">
              Latency: {retrievalTime} ms
            </div>
          )}
        </div>
      )}

      {/* Results List */}
      <div className="space-y-4">
        {results.map((res, idx) => (
          <div
            key={idx}
            className="p-6 rounded-xl border border-[#DDD7CC] bg-white/90 hover:border-[#A68155] transition-all shadow-sm space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-[#A68155]" />
                <span className="font-serif text-sm font-semibold text-[#24231F]">
                  {res.document_name}
                </span>
                <span className="text-[11px] font-mono text-[#858078] bg-[#EAE5DC] px-2 py-0.5 rounded border border-[#DDD7CC]">
                  Page {res.page_number}
                </span>
              </div>

              {/* Similarity Bar */}
              <div className="flex items-center space-x-3 text-xs font-mono">
                <span className="text-[#858078] text-[10px] uppercase">Similarity:</span>
                <div className="w-24 h-2 rounded-full bg-[#EAE5DC] overflow-hidden">
                  <div
                    className="h-full bg-[#A68155]"
                    style={{ width: `${Math.min(res.similarity_score * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="font-semibold text-[#24231F]">{res.similarity_score}</span>
              </div>
            </div>

            {/* Passage Text */}
            <p className="text-xs text-[#24231F] leading-relaxed bg-[#F7F5F0] p-4 rounded-lg border border-[#DDD7CC]/60 italic">
              "{res.content}"
            </p>

            <div className="flex items-center justify-between pt-2 text-[10px] font-mono">
              <span className="text-[#777B60]">{res.retrieval_method}</span>
              <button
                onClick={() => onOpenDocument(res.document_id, res.page_number)}
                className="text-[#A68155] hover:underline flex items-center space-x-1"
              >
                <span>Open in Workspace</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {searchedOnce && results.length === 0 && !loading && (
          <div className="p-12 text-center border border-dashed border-[#DDD7CC] rounded-xl bg-white/40">
            <p className="text-xs text-[#858078]">
              No passages exceeded the similarity threshold of {threshold}. Try lowering the cutoff or rephrasing your query.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
