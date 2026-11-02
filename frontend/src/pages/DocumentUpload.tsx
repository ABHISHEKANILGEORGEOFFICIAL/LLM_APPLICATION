import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Loader2, 
  Layers, 
  ShieldCheck,
  Database
} from 'lucide-react';
import { api } from '../services/api';
import { DocumentItem } from '../types';

interface DocumentUploadProps {
  onUploadSuccess: (newDoc: DocumentItem) => void;
  setCurrentPage: (page: string) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUploadSuccess, setCurrentPage }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [activeStage, setActiveStage] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadedDoc, setUploadedDoc] = useState<DocumentItem | null>(null);

  const stages = [
    'FILE UPLOADED & VALIDATED',
    'TEXT EXTRACTION & PAGE BOUNDARIES',
    'SEMANTIC CHUNKING',
    'EMBEDDING GENERATION (MiniLM)',
    'FAISS VECTOR INDEXING',
    'READY FOR SEARCH & QA',
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setErrorMsg(null);
      setUploadedDoc(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setErrorMsg(null);
      setUploadedDoc(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setErrorMsg(null);
    setActiveStage(0);
    setUploadProgress(15);

    // Dynamic stage progression simulation while request finishes
    const interval = setInterval(() => {
      setActiveStage((prev) => {
        if (prev < 4) {
          setUploadProgress((prevProg) => Math.min(prevProg + 18, 90));
          return prev + 1;
        }
        return prev;
      });
    }, 700);

    try {
      const doc = await api.uploadDocument(selectedFile);
      clearInterval(interval);
      setActiveStage(5);
      setUploadProgress(100);
      setUploadedDoc(doc);
      onUploadSuccess(doc);
    } catch (err: any) {
      clearInterval(interval);
      setErrorMsg(err.message || 'Upload and indexing failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-[#DDD7CC] pb-6">
        <span className="text-xs font-mono uppercase tracking-widest text-[#A68155] font-semibold">
          Ingestion Engine
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-[#24231F] mt-1">
          Document Upload & Semantic Vectorization
        </h1>
        <p className="text-sm text-[#858078] mt-1">
          Divide incoming documents into structured semantic chunks, generate high-density 384-dimensional vector embeddings, and store them directly into FAISS.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all bg-white/70 shadow-sm ${
          selectedFile
            ? 'border-[#A68155] bg-[#EAE5DC]/20'
            : 'border-[#DDD7CC] hover:border-[#A68155]'
        }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-[#EAE5DC] text-[#A68155] flex items-center justify-center mx-auto mb-4 shadow-sm">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="font-serif text-xl font-semibold text-[#24231F] mb-1">
          {selectedFile ? selectedFile.name : 'Drag & drop your document here'}
        </h3>
        <p className="text-xs text-[#858078] max-w-sm mx-auto mb-6">
          {selectedFile
            ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for processing`
            : 'Supports PDF, Word (DOCX), PowerPoint (PPTX), and plain text (TXT) files up to 50MB.'}
        </p>

        <div className="flex items-center justify-center space-x-3">
          <label className="px-5 py-2.5 rounded bg-[#24231F] text-[#F7F5F0] text-xs font-medium cursor-pointer hover:bg-[#A68155] transition-all shadow-sm">
            <span>Browse Files</span>
            <input
              type="file"
              accept=".pdf,.docx,.pptx,.txt"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>

          {selectedFile && !uploading && (
            <button
              onClick={handleUploadSubmit}
              className="px-5 py-2.5 rounded bg-[#A68155] text-[#F7F5F0] text-xs font-medium hover:bg-[#8C6940] transition-all shadow-sm flex items-center space-x-2"
            >
              <span>Start Ingestion</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Processing Pipeline Stages */}
      {(uploading || uploadedDoc || errorMsg) && (
        <div className="p-6 rounded-xl border border-[#DDD7CC] bg-white/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold text-[#24231F]">
              Ingestion Pipeline Progress
            </span>
            <span className="text-xs font-mono text-[#A68155] font-semibold">
              {uploadProgress}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-[#EAE5DC] overflow-hidden">
            <div
              className="h-full bg-[#A68155] transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>

          {/* Step list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {stages.map((stage, idx) => {
              const isPast = activeStage > idx;
              const isCurrent = activeStage === idx;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs font-mono flex items-center space-x-3 transition-colors ${
                    isPast
                      ? 'border-[#72816B]/40 bg-[#72816B]/5 text-[#72816B]'
                      : isCurrent
                      ? 'border-[#A68155] bg-[#A68155]/10 text-[#A68155] font-semibold'
                      : 'border-[#DDD7CC] text-[#858078] opacity-60'
                  }`}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-4 h-4 text-[#72816B]" />
                  ) : isCurrent && uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#A68155]" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                  )}
                  <span>{stage}</span>
                </div>
              );
            })}
          </div>

          {/* Success Summary */}
          {uploadedDoc && (
            <div className="p-4 rounded-lg bg-[#72816B]/10 border border-[#72816B]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-[#24231F]">
                  Document Ready: {uploadedDoc.original_name}
                </div>
                <div className="text-[11px] font-mono text-[#72816B] mt-0.5">
                  Extracted {uploadedDoc.total_pages} pages • {uploadedDoc.chunk_count} indexed vector chunks
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage('library')}
                  className="px-3.5 py-1.5 rounded bg-[#24231F] text-[#F7F5F0] text-xs font-medium hover:bg-[#A68155] transition-colors"
                >
                  View Library
                </button>
                <button
                  onClick={() => setCurrentPage('search')}
                  className="px-3.5 py-1.5 rounded border border-[#DDD7CC] bg-white text-[#24231F] text-xs font-medium hover:border-[#A68155] transition-colors"
                >
                  Search Passages
                </button>
              </div>
            </div>
          )}

          {/* Error display */}
          {errorMsg && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
