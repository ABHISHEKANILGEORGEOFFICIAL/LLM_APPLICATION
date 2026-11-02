# SYNAPSE — Intelligent Document Retrieval & Question Answering Platform

**SYNAPSE** is a research-oriented document intelligence platform engineered for semantic understanding, dense vector retrieval, and evidence-grounded question answering using lightweight language models on standard consumer CPUs without requiring GPUs or paid commercial APIs.

---

## 1. Architectural Highlights

- **Visual Identity & Design System**: Luxury editorial aesthetic (Warm Ivory `#F7F5F0`, Soft Sand `#EAE5DC`, Deep Charcoal `#24231F`, Muted Bronze `#A68155`, and Olive `#777B60`). Clean typography pairing Playfair Display, Inter, and IBM Plex Mono.
- **Document Processing**: Complete native ingestion for **PDF** (`PyMuPDF`), **DOCX** (`python-docx`), **PPTX** (`python-pptx`), and **TXT** with exact page and slide tracking.
- **Semantic Embeddings**: `sentence-transformers/all-MiniLM-L6-v2` generating 384-dimensional dense vectors with L2 normalization.
- **Vector Search Engine**: Persistent `FAISS` Inner Product (Cosine Similarity) index with metadata mapping and document-level isolation.
- **Lightweight LLM Generation**: Local CPU inference via `google/flan-t5-small` paired with an extractive synthesis fallback for guaranteed zero-hallucination answers.
- **Research Evaluation Module**: Live empirical benchmarking computing **Precision@K**, **Recall@K**, **Mean Reciprocal Rank (MRR)**, **ROUGE-L**, and **Token-Level F1**.

---

## 2. Platform Structure

1. **Landing Page**: Editorial introduction, interactive semantic node visualizer, architectural features, workflow steps, and tech stack details.
2. **Dashboard**: Dynamic metric cards (Total Documents, Processed Pages, Indexed Chunks, Questions Answered), recent documents table, quick actions, and live AI system status.
3. **Document Upload**: Drag-and-drop zone with real-time stage progression (`EXTRACTION` → `CHUNKING` → `EMBEDDING` → `INDEXING`). Duplicate prevention via SHA-256 content hashing.
4. **Document Library**: Grid and List views, multi-format filter (PDF, DOCX, PPTX, TXT), search by title, and deletion with vector store synchronization.
5. **Document Workspace**: Two-panel split view featuring extracted text previews with page jumping, alongside a localized RAG QA assistant.
6. **Semantic Search**: Meaning-based retrieval with similarity bars, configurable similarity cutoffs, Top-K sliders, and a TF-IDF baseline comparison.
7. **AI Question Answering**: Multi-turn grounded Q&A with clickable source citations, page attribution, and latency telemetry.
8. **Research & Evaluation**: Automated benchmark evaluation between TF-IDF and MiniLM with interactive Recharts comparative bar charts.
9. **Analytics**: Real-time telemetry, storage breakdown by file type (Donut Chart), and query performance logs.
10. **Settings**: Configurable chunk sizes, chunk overlaps, Top-K parameters, similarity thresholds, and CPU model inspection.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom luxury editorial tokens
- **Animations & Icons**: Framer Motion & Lucide React
- **Data Visualization**: Recharts

### Backend
- **Framework**: Python 3.13 + FastAPI + Uvicorn
- **ORM & Database**: SQLAlchemy + SQLite (`synapse.db`)
- **NLP & Deep Learning**:
  - `sentence-transformers` (`all-MiniLM-L6-v2`)
  - `transformers` (`google/flan-t5-small`)
  - `faiss-cpu` (Dense Vector Index)
  - `scikit-learn` (TF-IDF Baseline)
  - `rouge-score` (Academic Benchmark Metrics)
- **Document Extractors**: `pymupdf` (PDF), `python-docx` (DOCX), `python-pptx` (PPTX)

---

## 4. Setup and Execution Instructions

### Prerequisites
- Python 3.10+ (Tested on Python 3.13)
- Node.js 18+ and npm

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt

# (Optional) Seed sample documents
python seed_data.py

# Run FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API documentation is available at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://127.0.0.1:5173` in your browser.

---

## 5. API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/documents/upload` | Upload and vectorize PDF, DOCX, PPTX, or TXT file |
| `GET` | `/api/documents` | Retrieve all documents |
| `GET` | `/api/documents/{id}` | Retrieve document metadata |
| `GET` | `/api/documents/{id}/content` | Retrieve document chunks and summary |
| `DELETE` | `/api/documents/{id}` | Delete document and prune FAISS vector index |
| `POST` | `/api/search` | Execute dense semantic or TF-IDF keyword search |
| `POST` | `/api/qa/ask` | Execute RAG grounded answer generation with citations |
| `POST` | `/api/evaluation/run` | Execute scientific benchmark (MRR, Precision@K, ROUGE-L) |
| `GET` | `/api/analytics/overview` | Fetch live system operational statistics |
| `GET` | `/api/analytics/usage` | Fetch query latency history and document distributions |
| `GET` | `/api/settings` | Retrieve NLP hyperparameters |
| `PUT` | `/api/settings` | Update NLP hyperparameters |
| `GET` | `/api/health` | System health check and model status |

---

## 6. Evaluation Methodology

The scientific evaluation module (`backend/app/services/evaluation_service.py`) executes queries against:
1. **Sparse TF-IDF Baseline**: Lexical term-frequency / inverse-document-frequency ranking.
2. **Dense MiniLM Semantic Vectors**: Cosine similarity across 384-dimensional continuous space.
3. **Flan-T5 RAG Pipeline**: Generated responses compared against gold standard references.

Evaluation metrics calculated:
- **Precision@K** ($K \in \{1, 3, 5\}$): Proportion of top-K results containing relevant ground-truth concepts.
- **Mean Reciprocal Rank (MRR)**: Evaluates the rank depth of the first relevant passage.
- **ROUGE-L**: Longest common subsequence matching between generated answers and reference text.
- **Token F1**: Harmonic mean of lexical precision and recall.
- **Retrieval & Generation Latency (ms)**: End-to-end CPU execution speed.
