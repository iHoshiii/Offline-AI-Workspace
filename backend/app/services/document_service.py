from io import BytesIO
from pypdf import PdfReader
from app.services.ollama_client import ollama_client
from app.db.sqlite_client import add_memory

class DocumentService:
    async def process_pdf(self, chat_id: int, file_content: bytes):
        reader = PdfReader(BytesIO(file_content))
        full_text = ""
        for page in reader.pages:
            full_text += page.extract_text() + "\n"
        
        # Simple chunking by paragraph or fixed length
        chunks = self._chunk_text(full_text, chunk_size=1000)
        
        for chunk in chunks:
            if not chunk.strip():
                continue
            embedding = await ollama_client.get_embeddings(chunk)
            await add_memory(chat_id, f"Document: {chunk}", embedding)

    def _chunk_text(self, text: str, chunk_size: int) -> list[str]:
        words = text.split()
        chunks = []
        current_chunk = []
        current_size = 0
        
        for word in words:
            current_chunk.append(word)
            current_size += len(word) + 1
            if current_size >= chunk_size:
                chunks.append(" ".join(current_chunk))
                current_chunk = []
                current_size = 0
        
        if current_chunk:
            chunks.append(" ".join(current_chunk))
        return chunks

document_service = DocumentService()
