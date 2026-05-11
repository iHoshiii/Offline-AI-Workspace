from io import BytesIO
from pypdf import PdfReader
from docx import Document
from app.services.ollama_client import ollama_client
from app.db.sqlite_client import add_memory

class DocumentService:
    async def process_pdf(self, chat_id: int, file_content: bytes):
        reader = PdfReader(BytesIO(file_content))
        full_text = ""
        for page in reader.pages:
            full_text += page.extract_text() + "\n"
        await self._store_chunks(chat_id, full_text)

    async def process_text(self, chat_id: int, text: str):
        await self._store_chunks(chat_id, text)

    async def process_docx(self, chat_id: int, file_content: bytes):
        doc = Document(BytesIO(file_content))
        full_text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        await self._store_chunks(chat_id, full_text)

    async def _store_chunks(self, chat_id: int, full_text: str):
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
