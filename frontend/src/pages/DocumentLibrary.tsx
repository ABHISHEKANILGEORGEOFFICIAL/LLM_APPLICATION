import React, { useState } from 'react';
import { 
  FileText, 
  Trash2, 
  Search, 
  ExternalLink, 
  LayoutGrid, 
  List as ListIcon, 
  Layers, 
  Calendar, 
  Database,
  Filter
} from 'lucide-react';
import { DocumentItem } from '../types';
import { api } from '../services/api';

interface DocumentLibraryProps {
  documents: DocumentItem[];
  onDocumentDeleted: (id: number) => void;
  onOpenWorkspace: (id: number) => void;
  setCurrentPage: (page: string) => void;
}

export const DocumentLibrary: React.FC<DocumentLibraryProps> = ({
  documents,
  onDocumentDeleted,
  onOpenWorkspace,
  setCurrentPage,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.original_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.file_type.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this document and remove its embeddings from FAISS?')) {
      return;
    }
    setDeletingId(id);
    try {
      await api.deleteDocument(id);
      onDocumentDeleted(id);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#DDD7CC] pb-6 gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#A68155] font-semibold">
            Knowledge Repository
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-[#24231F] mt-1">
            Document Library
          </h1>
          <p className="text-sm text-[#858078] mt-1">
            Inspect, manage, and explore all vectorized files in the localized knowledge base.
          </p>
        </div>

        <button
          onClick={() => setCurrentPage('upload')}
          className="px-4 py-2.5 rounded bg-[#24231F] text-[#F7F5F0] text-sm font-medium hover:bg-[#A68155] transition-all self-start md:self-auto shadow-sm"
        >
          + Upload Document
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-[#DDD7CC] bg-white/70 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#858078] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter documents by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#DDD7CC] bg-[#F7F5F0] text-xs text-[#24231F] focus:outline-none focus:border-[#A68155]"
          />
        </div>

        {/* Filters and View Switcher */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Type filter */}
          <div className="flex items-center space-x-1 text-xs">
            {['all', 'pdf', 'docx', 'pptx', 'txt'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1.5 rounded uppercase font-mono text-[11px] transition-colors ${
                  typeFilter === t
                    ? 'bg-[#24231F] text-[#F7F5F0]'
                    : 'bg-[#EAE5DC]/60 text-[#858078] hover:bg-[#EAE5DC]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center border border-[#DDD7CC] rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 ${viewMode === 'grid' ? 'bg-[#EAE5DC] text-[#24231F]' : 'text-[#858078]'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 ${viewMode === 'list' ? 'bg-[#EAE5DC] text-[#24231F]' : 'text-[#858078]'}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Document Grid / List */}
      {filteredDocs.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[#DDD7CC] rounded-2xl bg-white/40">
          <FileText className="w-10 h-10 text-[#858078] mx-auto mb-3 opacity-60" />
          <h3 className="font-serif text-lg font-semibold text-[#24231F]">No documents found</h3>
          <p className="text-xs text-[#858078] mt-1">Try refining your search filter or upload a new file.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onOpenWorkspace(doc.id)}
              className="p-6 rounded-xl border border-[#DDD7CC] bg-white/80 hover:border-[#A68155] transition-all cursor-pointer shadow-sm group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#EAE5DC] text-[#777B60] border border-[#DDD7CC]">
                    {doc.file_type}
                  </span>
                  <button
                    onClick={(e) => handleDelete(e, doc.id)}
                    disabled={deletingId === doc.id}
                    className="p-1 rounded text-[#858078] hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-serif text-base font-semibold text-[#24231F] group-hover:text-[#A68155] transition-colors line-clamp-2 mb-2">
                  {doc.original_name}
                </h3>

                <div className="space-y-1.5 text-[11px] font-mono text-[#858078] mt-4">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-3.5 h-3.5 text-[#A68155]" />
                    <span>Pages: {doc.total_pages}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Database className="w-3.5 h-3.5 text-[#777B60]" />
                    <span>Chunks: {doc.chunk_count}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-[#858078]" />
                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#DDD7CC] mt-6 flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#72816B] uppercase font-semibold">
                  {doc.processing_status}
                </span>
                <span className="text-xs font-mono text-[#A68155] group-hover:translate-x-1 transition-transform flex items-center space-x-1">
                  <span>Workspace</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-[#DDD7CC] rounded-xl bg-white/80 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#DDD7CC] bg-[#EAE5DC]/40 text-[#858078] font-mono uppercase text-[10px]">
                <th className="p-3.5">Document</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Pages</th>
                <th className="p-3.5">Indexed Chunks</th>
                <th className="p-3.5">Uploaded</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD7CC]">
              {filteredDocs.map((doc) => (
                <tr
                  key={doc.id}
                  onClick={() => onOpenWorkspace(doc.id)}
                  className="hover:bg-[#F7F5F0] transition-colors cursor-pointer group"
                >
                  <td className="p-3.5 font-medium text-[#24231F]">
                    {doc.original_name}
                  </td>
                  <td className="p-3.5 font-mono uppercase text-[#777B60]">
                    <span className="px-1.5 py-0.5 rounded bg-[#EAE5DC] text-[10px] border border-[#DDD7CC]">
                      {doc.file_type}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-[#858078]">{doc.total_pages}</td>
                  <td className="p-3.5 font-mono text-[#858078]">{doc.chunk_count}</td>
                  <td className="p-3.5 font-mono text-[#858078]">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3.5">
                    <span className="text-[10px] font-mono uppercase text-[#72816B] font-semibold">
                      {doc.processing_status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={(e) => handleDelete(e, doc.id)}
                      className="text-[#858078] hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
    </div>
  );
};
