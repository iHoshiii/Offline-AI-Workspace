# Offline AI Workspace

Offline AI Workspace is an offline-first productivity platform built for low-end hardware. It combines a lightweight local AI backend with a modern web frontend, optimized for CPU-only systems, minimal RAM usage, and fast startup.

## Architecture

- **Frontend:** Next.js + React + TypeScript + Tailwind CSS
- **Backend:** FastAPI + Uvicorn + Python async patterns
- **AI Runtime:** Ollama local inference
- **Primary Model:** Phi-3 Mini
- **Database:** SQLite
- **Vector DB-ready:** Modular design allows ChromaDB integration later

## Repository layout

- `frontend/`  client app with chat UI, markdown rendering, and streaming updates
- `backend/`  FastAPI service with chat persistence and Ollama integration
- `docs/`  roadmap and project notes
- `.env.example`  shared environment configuration example

## Quick start

### Backend

1. Install Python 3.11+.
2. Create a virtual environment and install dependencies:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r backend/requirements.txt
   ```
3. Run Ollama locally and verify the service is reachable:
   ```powershell
   ollama serve
   ```
4. Start the backend:
   ```powershell
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
5. Verify health:
   ```powershell
   curl http://localhost:8000/health
   ```

> Note: Phase 1 currently uses SQLite for local chat persistence. MySQL can be added later if you need a dedicated server database.

### Frontend

1. Install Node.js 20+.
2. Install dependencies:
   ```powershell
   cd frontend
   npm install
   ```
3. Start the frontend:
   ```powershell
   npm run dev
   ```
4. Open `http://localhost:3000`

## Design principles

- Lightweight, modular, and CPU-friendly.
- Minimal external dependencies.
- Streaming chat and markdown rendering.
- Offline-first architecture with local SQLite persistence.

## Future expansion

- Add ChromaDB semantic memory and RAG document workflows.
- Add AI tool calling and automation.
- Add workspace sync, export, and security features.
