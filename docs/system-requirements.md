# System Requirements

The Offline AI Workspace is specifically designed to be lightweight and efficient, making it accessible for users with older or lower-specification hardware.

---

## Minimum Requirements

*   **Operating System**: Windows 10/11 (64-bit), macOS 12+, or modern Linux distribution.
*   **Processor (CPU)**: Any modern Quad-core processor (Intel i3/i5 7th Gen+ or AMD Ryzen 3+). The system uses CPU-based inference via Ollama.
*   **Memory (RAM)**: 8 GB. This is the minimum required to run the OS, the AI model (like Phi-3 or Llama-3 8B), and the web interface simultaneously.
*   **Storage**: 10 GB of available space.
    *   Application files: < 500 MB.
    *   AI Models: 2 GB to 5 GB depending on the model chosen.
*   **Network**: Required only for initial installation and downloading models via Ollama. Once set up, the application is 100% offline.

---

## Recommended Specifications

For a smoother experience with faster response times:

*   **Processor (CPU)**: Hexa-core or higher (Intel i7/i9 or AMD Ryzen 7/9).
*   **Memory (RAM)**: 16 GB. This allows for better multi-tasking and larger document processing.
*   **Storage**: SSD (Solid State Drive) is highly recommended for faster database access and model loading.

---

## Model Compatibility

The workspace performance depends heavily on the model you choose in Ollama:

| Model | Req. RAM | Best For |
| :--- | :--- | :--- |
| **Phi-3 Mini** | 4 GB | Ultra-fast, low-end systems |
| **Mistral / Llama 3 (8B)** | 8 GB | Balanced performance and intelligence |
| **Llama 3 (70B)** | 32 GB+ | High-end workstations only |

---

## Software Dependencies

*   **Ollama**: Must be installed and running in the background.
*   **Node.js**: Version 18 or higher.
*   **Python**: Version 3.10 or higher.
