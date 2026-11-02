import React from 'react';
import { 
  FileText, 
  Layers, 
  HelpCircle, 
  Clock, 
  Search, 
  ArrowUpRight, 
  Sparkles, 
  Upload, 
  Cpu, 
  Database, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { AnalyticsOverview, DocumentItem } from '../types';

interface DashboardProps {
  overview: AnalyticsOverview | null;
  documents: DocumentItem[];
  setCurrentPage: (page: string) => void;
  setSelectedDocumentId: (id: number) => void;
  loading: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  overview,
  documents,
  setCurrentPage,
  setSelectedDocumentId,
  loading,
}) => {
  const recentDocs = documents.slice(0, 5);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#DDD7CC] pb-6 gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#A68155] font-semibold">
            Control Console
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-[#24231F] mt-1">
            Your Knowledge Workspace
          </h1>
          <p className="text-sm text-[#858078] mt-1">
            Everything you need to explore, search, and understand your documents.
          </p>
        </div>

        {/* Quick launch buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentPage('upload')}
            className="px-4 py-2.5 rounded bg-[#24231F] text-[#F7F5F0] text-sm font-medium hover:bg-[#A68155] transition-all flex items-center space-x-2 shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
          <button
            onClick={() => setCurrentPage('qa')}
            className="px-4 py-2.5 rounded border border-[#DDD7CC] bg-white text-[#24231F] text-sm font-medium hover:border-[#A68155] transition-all flex items-center space-x-2 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-[#A68155]" />
            <span>Ask a Question</span>
          </button>
        </div>
      </div>

      {/* Dynamic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: 'Total Documents',
            value: overview?.total_documents ?? '...',
            sub: 'Persistent records',
            icon: FileText,
            color: 'text-[#24231F]',
          },
          {
            label: 'Total Pages Processed',
            value: overview?.total_pages ?? '...',
            sub: 'Extracted & parsed',
            icon: Layers,
            color: 'text-[#A68155]',
          },
          {
            label: 'Indexed Chunks',
            value: overview?.indexed_chunks ?? '...',
            sub: 'Vectorized in FAISS',
            icon: Database,
            color: 'text-[#777B60]',
          },
          {
            label: 'Questions Answered',
            value: overview?.questions_answered ?? '...',
            sub: 'Grounded RAG queries',
            icon: HelpCircle,
            color: 'text-[#72816B]',
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-xl border border-[#DDD7CC] bg-white/70 shadow-sm flex flex-col justify-between hover:border-[#A68155] transition-all"
            >
              <div className="flex items-center justify-between text-[#858078] mb-3">
                <span className="text-xs font-mono uppercase tracking-wider">{card.label}</span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="font-serif text-3xl font-semibold text-[#24231F] mb-1">
                {card.value}
              </div>
              <div className="text-[11px] font-mono text-[#858078]">{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Recent Documents & AI System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Documents */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold text-[#24231F]">
              Recent Documents
            </h2>
            <button
              onClick={() => setCurrentPage('library')}
              className="text-xs font-mono text-[#A68155] hover:underline flex items-center space-x-1"
            >
              <span>View Library</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentDocs.length === 0 ? (
            <div className="p-8 rounded-xl border border-dashed border-[#DDD7CC] bg-white/50 text-center">
              <p className="text-sm text-[#858078]">No documents in the system yet.</p>
              <button
                onClick={() => setCurrentPage('upload')}
                className="mt-3 px-4 py-2 rounded bg-[#24231F] text-[#F7F5F0] text-xs font-medium"
              >
                Upload your first document
              </button>
            </div>
          ) : (
            <div className="border border-[#DDD7CC] rounded-xl bg-white/80 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#DDD7CC] bg-[#EAE5DC]/40 text-[#858078] font-mono uppercase text-[10px]">
                    <th className="p-3.5">Document Name</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Pages</th>
                    <th className="p-3.5">Chunks</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD7CC]">
                  {recentDocs.map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-[#F7F5F0] transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedDocumentId(doc.id);
                        setCurrentPage('workspace');
                      }}
                    >
                      <td className="p-3.5 font-medium text-[#24231F]">
                        <div className="truncate max-w-xs">{doc.original_name}</div>
                      </td>
                      <td className="p-3.5 font-mono uppercase text-[#777B60]">
                        <span className="px-1.5 py-0.5 rounded bg-[#EAE5DC] text-[10px] border border-[#DDD7CC]">
                          {doc.file_type}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[#858078]">{doc.total_pages}</td>
                      <td className="p-3.5 font-mono text-[#858078]">{doc.chunk_count}</td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase ${
                            doc.processing_status === 'completed'
                              ? 'bg-[#72816B]/15 text-[#72816B]'
                              : doc.processing_status === 'failed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          <span>{doc.processing_status}</span>
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <span className="text-xs font-mono text-[#A68155] group-hover:underline">
                          Open &rarr;
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Quick Actions Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => setCurrentPage('upload')}
              className="p-3.5 rounded-lg border border-[#DDD7CC] bg-white hover:border-[#A68155] text-left transition-all"
            >
              <div className="text-xs font-semibold text-[#24231F]">Upload New Document</div>
              <div className="text-[11px] text-[#858078] mt-0.5">PDF, DOCX, PPTX, TXT</div>
            </button>
            <button
              onClick={() => setCurrentPage('search')}
              className="p-3.5 rounded-lg border border-[#DDD7CC] bg-white hover:border-[#A68155] text-left transition-all"
            >
              <div className="text-xs font-semibold text-[#24231F]">Search Documents</div>
              <div className="text-[11px] text-[#858078] mt-0.5">Semantic cosine ranking</div>
            </button>
            <button
              onClick={() => setCurrentPage('qa')}
              className="p-3.5 rounded-lg border border-[#DDD7CC] bg-white hover:border-[#A68155] text-left transition-all"
            >
              <div className="text-xs font-semibold text-[#24231F]">Ask a Question</div>
              <div className="text-[11px] text-[#858078] mt-0.5">Evidence-grounded RAG</div>
            </button>
          </div>
        </div>

        {/* Right Column: AI System Overview */}
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-semibold text-[#24231F]">
            AI System Overview
          </h2>

          <div className="p-5 rounded-xl border border-[#DDD7CC] bg-white/80 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-[#DDD7CC]">
              <Cpu className="w-4 h-4 text-[#A68155]" />
              <span className="text-xs font-mono uppercase tracking-wider text-[#24231F] font-semibold">
                Operational Pipeline
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="text-[#858078] font-mono text-[10px] uppercase">Embedding Engine</div>
                <div className="font-mono text-xs text-[#24231F] font-medium mt-0.5">
                  {overview?.active_embedding_model || 'sentence-transformers/all-MiniLM-L6-v2'}
                </div>
                <div className="text-[10px] text-[#777B60] mt-0.5">384-dimensional dense vectors</div>
              </div>

              <div>
                <div className="text-[#858078] font-mono text-[10px] uppercase">Generation Engine</div>
                <div className="font-mono text-xs text-[#24231F] font-medium mt-0.5">
                  {overview?.active_generation_model || 'google/flan-t5-small (CPU)'}
                </div>
                <div className="text-[10px] text-[#777B60] mt-0.5">Instruction-tuned seq2seq</div>
              </div>

              <div>
                <div className="text-[#858078] font-mono text-[10px] uppercase">Vector Database</div>
                <div className="font-mono text-xs text-[#72816B] font-semibold mt-0.5 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#72816B]"></span>
                  <span>{overview?.vector_store_status || 'FAISS IndexFlatIP (Active)'}</span>
                </div>
              </div>

              <div>
                <div className="text-[#858078] font-mono text-[10px] uppercase">Backend Status</div>
                <div className="font-mono text-xs text-[#24231F] mt-0.5">
                  {overview?.database_status || 'SQLite WAL Persistence'}
                </div>
              </div>

              <div className="pt-2 border-t border-[#DDD7CC] flex items-center justify-between text-[11px] font-mono text-[#858078]">
                <span>Avg Retrieval:</span>
                <span className="text-[#24231F] font-semibold">
                  {overview?.average_retrieval_time_ms ? `${overview.average_retrieval_time_ms} ms` : 'Ready'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[#DDD7CC] bg-[#EAE5DC]/40 text-xs text-[#858078] space-y-2">
            <div className="font-semibold text-[#24231F] font-serif text-sm">Privacy & Security</div>
            <p className="leading-relaxed">
              All documents, chunk encodings, and vector indexes remain fully localized on your machine. No documents are transmitted to external commercial clouds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
