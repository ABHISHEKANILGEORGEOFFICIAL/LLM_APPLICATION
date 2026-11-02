import {
  DocumentItem,
  DocumentContent,
  SearchResponse,
  QAResponse,
  AnalyticsOverview,
  SettingsConfig,
  EvaluationResult,
} from '../types';

const API_BASE = 'http://127.0.0.1:8000/api';

export const api = {
  // Health
  checkHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Backend health check failed');
    return res.json();
  },

  // Documents
  getDocuments: async (): Promise<DocumentItem[]> => {
    const res = await fetch(`${API_BASE}/documents`);
    if (!res.ok) throw new Error('Failed to fetch documents');
    return res.json();
  },

  getDocument: async (id: number): Promise<DocumentItem> => {
    const res = await fetch(`${API_BASE}/documents/${id}`);
    if (!res.ok) throw new Error('Failed to fetch document');
    return res.json();
  },

  getDocumentContent: async (id: number): Promise<DocumentContent> => {
    const res = await fetch(`${API_BASE}/documents/${id}/content`);
    if (!res.ok) throw new Error('Failed to fetch document content');
    return res.json();
  },

  uploadDocument: async (file: File): Promise<DocumentItem> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  },

  deleteDocument: async (id: number): Promise<{ message: string; id: number }> => {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete document');
    return res.json();
  },

  // Search
  search: async (
    query: string,
    documentId?: number,
    topK: number = 4,
    similarityThreshold: number = 0.2,
    mode: 'semantic' | 'keyword' = 'semantic'
  ): Promise<SearchResponse> => {
    const res = await fetch(`${API_BASE}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        document_id: documentId || null,
        top_k: topK,
        similarity_threshold: similarityThreshold,
        mode,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Search failed' }));
      throw new Error(err.detail || 'Search failed');
    }
    return res.json();
  },

  // QA
  askQuestion: async (
    question: string,
    documentId?: number,
    topK: number = 4,
    similarityThreshold: number = 0.2,
    generationMethod: 'flan_t5' | 'extractive' = 'flan_t5'
  ): Promise<QAResponse> => {
    const res = await fetch(`${API_BASE}/qa/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        document_id: documentId || null,
        top_k: topK,
        similarity_threshold: similarityThreshold,
        generation_method: generationMethod,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'QA generation failed' }));
      throw new Error(err.detail || 'QA generation failed');
    }
    return res.json();
  },

  // Analytics
  getAnalyticsOverview: async (): Promise<AnalyticsOverview> => {
    const res = await fetch(`${API_BASE}/analytics/overview`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  getAnalyticsUsage: async () => {
    const res = await fetch(`${API_BASE}/analytics/usage`);
    if (!res.ok) throw new Error('Failed to fetch usage metrics');
    return res.json();
  },

  // Settings
  getSettings: async (): Promise<SettingsConfig> => {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  updateSettings: async (settings: SettingsConfig): Promise<SettingsConfig> => {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  // Evaluation
  runEvaluation: async (kVals: number[] = [1, 3, 5]): Promise<EvaluationResult> => {
    const res = await fetch(`${API_BASE}/evaluation/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ k_values: kVals }),
    });
    if (!res.ok) throw new Error('Evaluation failed');
    return res.json();
  },
};
