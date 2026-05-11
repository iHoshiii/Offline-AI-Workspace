# 📖 How to Use the Offline AI Workspace

Welcome to your private, high-performance local AI workspace! This guide covers everything you need to get started.

---

## 🛠️ Installation & Setup

Before starting, please ensure your machine meets the [System Requirements](./system-requirements.md).

### 1. Prerequisites
*   **Node.js** (v18+) - For the frontend.
*   **Python** (3.10+) - For the backend.
*   **Ollama** - The engine that runs the AI models locally. [Download Ollama here](https://ollama.com/).

### 2. Backend Setup
1.  Navigate to the `backend` folder:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Start the backend server:
    ```bash
    uvicorn app.main:app --reload
    ```
    *The API will run on `http://127.0.0.1:8000`.*

### 3. Frontend Setup
1.  Navigate to the `frontend` folder:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    *The UI will run on `http://localhost:3000`.*

---

## 🧩 Navigation & Features

### 1. Chatting
*   **New Chat**: Click the **"New"** button in the sidebar to start a fresh session. You'll see a pulsing "New Conversation" placeholder until your first message.
*   **Markdown Support**: The AI renders code blocks, tables, and bold text beautifully.

### 2. Document Intelligence (RAG)
*   **Upload**: Click the **↑** (Upload) button in the message bar.
*   **Supported Files**: PDF, TXT, MD, DOCX.
*   **How it works**: Once uploaded, the AI "learns" the document. You can ask questions like *"What does the contract say about termination?"* and it will answer based on the file.

### 3. System Awareness
*   **Local Awareness**: The AI can monitor your PC's hardware (CPU/RAM/Disk) and read local files if you mention them (e.g., *"Read the readme.md in the current folder"*).
*   **Sidebar Widget**: View your AI status and Memory Sync state in real-time.

### 4. Memory Management (Privacy)
*   **Chat Summary**: Click the **Σ** (Sigma) button in the sidebar header to generate a concise summary of the active chat.
*   **Delete Messages**: Hover over any message and click the red **✕** to wipe it from the chat and from the AI's long-term memory.
*   **Memory Manager**: Click **"Manage"** in the sidebar to view, search, and selectively delete specific facts the AI has learned.
*   **Nuclear Wipe**: Click **"Wipe"** to clear the entire long-term memory index.

---

## 🚀 Pro Tips
*   **Predictive Context**: You don't need to upload every file. If you say *"Look at my package.json,"* the AI will automatically try to find and read it from your workspace!
*   **Performance**: If the AI feels slow, try a smaller model in Ollama (like `phi3` or `llama3:8b`).

---

## 🔒 Privacy Guarantee
Everything in this workspace stays on **your machine**. No data is sent to the cloud. Your `workspace.db` and uploaded documents never leave your local environment.
