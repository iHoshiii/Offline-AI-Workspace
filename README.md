# Offline AI Workspace

Offline AI Workspace is a high-performance, privacy-focused productivity platform designed for local hardware. It combines a professional glassmorphic interface with a powerful AI backend that remains 100% offline.

---

## Core Features

*   **Semantic Long-Term Memory**: The AI remembers facts across different chat sessions using local vector embeddings.
*   **Document Intelligence (RAG)**: Upload PDF, DOCX, or TXT files and interact with your documents locally.
*   **System Awareness**: Real-time hardware monitoring and predictive file-system access allows the AI to understand your local workspace environment.
*   **Premium User Experience**: A modern, glassmorphic design with optimized performance and responsive layouts.
*   **Data Sovereignty**: All processing and storage occurs on your local machine. Includes a Memory Manager for granular control over AI knowledge.

---

## Architecture

*   **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS.
*   **Backend:** FastAPI, Python Async, SQLite (Relational + Semantic Storage).
*   **AI Engine:** [Ollama](https://ollama.com/) (Local LLM & Embedding generation).

---

## Repository Structure

*   `frontend/` - Next.js client application.
*   `backend/` - FastAPI service and database logic.
*   `docs/` - Detailed documentation and project roadmap.

---

## Getting Started

Detailed installation steps, navigation guides, and technical specifications are available in the documentation:

*   [How to Use Guide](./docs/how-to-use.md)
*   [System Requirements](./docs/system-requirements.md)
*   [Project Roadmap](./docs/roadmap)

### Quick Execution
1.  **Backend**: `cd backend && uvicorn app.main:app --reload`
2.  **Frontend**: `cd frontend && npm run dev`

---

## Privacy and Data Control
All information is stored in a local SQLite database (`workspace.db`). The system operates without telemetry, cloud synchronization, or external tracking. Users maintain full authority over their data through the integrated Memory Manager.
