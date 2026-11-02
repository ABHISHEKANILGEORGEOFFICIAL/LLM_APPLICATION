export interface DocumentItem {
  id: number;
  filename: string;
  original_name: string;
  file_type: string;
  file_size_bytes: number;
  total_pages: number;
  chunk_count: number;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  status_message?: string;
  created_at: string;
  updated_at: string;
}

export interface ChunkItem {
  id: number;
  document_id: number;
  chunk_index: number;
  page_number: number;
  content: string;
  word_count: number;
}

export interface DocumentContent {
  document: DocumentItem;
  chunks: ChunkItem[];
  summary: string;
}

export interface SearchResult {
  chunk_id: number;
  document_id: number;
  document_name: string;
  page_number: number;
  content: string;
  similarity_score: number;
  retrieval_method: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  retrieval_time_ms: number;
  total_chunks_searched: number;
}

export interface Citation {
  chunk_id: number;
  document_id: number;
  document_name: string;
  page_number: number;
  snippet: string;
  similarity_score: number;
}

export interface QAResponse {
  question: string;
  answer: string;
  citations: Citation[];
  retrieval_latency_ms: number;
  generation_latency_ms: number;
  total_latency_ms: number;
  model_used: string;
  is_fallback: boolean;
  context_tokens: number;
}

export interface AnalyticsOverview {
  total_documents: number;
  total_pages: number;
  indexed_chunks: number;
  questions_answered: number;
  average_retrieval_time_ms: number;
  average_generation_time_ms: number;
  active_embedding_model: string;
  active_generation_model: string;
  vector_store_status: string;
  database_status: string;
}

export interface SettingsConfig {
  chunk_size: number;
  chunk_overlap: number;
  top_k: number;
  similarity_threshold: number;
  embedding_model: string;
  generation_model: string;
  temperature: number;
  use_flan_t5: boolean;
}

export interface EvaluationResult {
  benchmark_dataset: string;
  total_evaluated_queries: number;
  retrieval_metrics: {
    keyword_tfidf: {
      mrr: number;
      avg_latency_ms: number;
      precision_at_k: Record<string, number>;
    };
    semantic_minilm: {
      mrr: number;
      avg_latency_ms: number;
      precision_at_k: Record<string, number>;
    };
  };
  qa_metrics: {
    avg_rouge_l: number;
    avg_token_f1: number;
    avg_rag_latency_ms: number;
    groundedness_support_rate: number;
  };
  comparison_chart_data: Array<{
    metric: string;
    TF_IDF: number;
    MiniLM_Semantic: number;
  }>;
  status: string;
}
