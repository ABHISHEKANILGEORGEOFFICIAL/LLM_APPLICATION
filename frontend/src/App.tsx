import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { DocumentUpload } from './pages/DocumentUpload';
import { DocumentLibrary } from './pages/DocumentLibrary';
import { DocumentWorkspace } from './pages/DocumentWorkspace';
import { SemanticSearch } from './pages/SemanticSearch';
import { AIQuestionAnswering } from './pages/AIQuestionAnswering';
import { ResearchEvaluation } from './pages/ResearchEvaluation';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { api } from './services/api';
import { DocumentItem, AnalyticsOverview } from './types';

export function App() {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [systemHealthy, setSystemHealthy] = useState<boolean>(true);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [docs, ov] = await Promise.all([
        api.getDocuments(),
        api.getAnalyticsOverview(),
      ]);
      setDocuments(docs);
      setOverview(ov);
      setSystemHealthy(true);
      if (docs.length > 0 && !selectedDocumentId) {
        setSelectedDocumentId(docs[0].id);
      }
    } catch (err) {
      console.warn('Backend not yet reachable:', err);
      setSystemHealthy(false);
    } finally {
      setLoadingInitial(false);
    }
  };

  const handleDocumentUploaded = (newDoc: DocumentItem) => {
    setDocuments((prev) => [newDoc, ...prev.filter((d) => d.id !== newDoc.id)]);
    setSelectedDocumentId(newDoc.id);
    api.getAnalyticsOverview().then(setOverview).catch(() => {});
  };

  const handleDocumentDeleted = (id: number) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (selectedDocumentId === id) {
      setSelectedDocumentId(null);
    }
    api.getAnalyticsOverview().then(setOverview).catch(() => {});
  };

  const handleOpenWorkspace = (docId: number, pageNumber?: number) => {
    setSelectedDocumentId(docId);
    setCurrentPage('workspace');
  };

  // If on landing page, show full-screen luxury landing page
  if (currentPage === 'landing') {
    return <LandingPage onLaunch={() => setCurrentPage('dashboard')} />;
  }

  return (
    <div className="flex h-screen bg-[#F7F5F0] overflow-hidden">
      {/* Editorial Navigation Sidebar */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        systemStatus={{
          healthy: systemHealthy,
          vectors: overview?.indexed_chunks || 0,
          embeddingModel: overview?.active_embedding_model || 'all-MiniLM-L6-v2',
        }}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 h-screen overflow-y-auto">
        {currentPage === 'dashboard' && (
          <Dashboard
            overview={overview}
            documents={documents}
            setCurrentPage={setCurrentPage}
            setSelectedDocumentId={setSelectedDocumentId}
            loading={loadingInitial}
          />
        )}

        {currentPage === 'upload' && (
          <DocumentUpload
            onUploadSuccess={handleDocumentUploaded}
            setCurrentPage={setCurrentPage}
          />
        )}

        {currentPage === 'library' && (
          <DocumentLibrary
            documents={documents}
            onDocumentDeleted={handleDocumentDeleted}
            onOpenWorkspace={handleOpenWorkspace}
            setCurrentPage={setCurrentPage}
          />
        )}

        {currentPage === 'workspace' && (
          <DocumentWorkspace
            documentId={selectedDocumentId}
            onBack={() => setCurrentPage('library')}
          />
        )}

        {currentPage === 'search' && (
          <SemanticSearch
            documents={documents}
            onOpenDocument={handleOpenWorkspace}
          />
        )}

        {currentPage === 'qa' && (
          <AIQuestionAnswering
            documents={documents}
            onOpenDocument={handleOpenWorkspace}
          />
        )}

        {currentPage === 'research' && <ResearchEvaluation />}

        {currentPage === 'analytics' && <Analytics />}

        {currentPage === 'settings' && <Settings />}
      </main>
    </div>
  );
}

export default App;
