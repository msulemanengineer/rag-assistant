export interface ChatRequest {
  question: string;
  top_k?: number;
}

export interface Source {
  label: string;
  document: string;
  page: number;
  similarity: number;
  text: string;
}

export interface ChatResponse {
  answer: string;
  sources: Source[];
  model: string | null;
}

export interface HealthResponse {
  status: string;
  index_ready: boolean;
  llm_configured: boolean;
}

export interface DocumentInfo {
  name: string;
  chunk_count: number;
  page_count: number;
}

export interface DocumentsResponse {
  documents: DocumentInfo[];
  total_chunks: number;
  embedding_model: string | null;
}
