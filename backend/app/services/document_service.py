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
        import asyncio
        # Simple chunking by paragraph or fixed length
        chunks = [c for c in self._chunk_text(full_text, chunk_size=1000) if c.strip()]
        
        async def process_chunk(chunk):
            embedding = await ollama_client.get_embeddings(chunk)
            await add_memory(chat_id, f"Document: {chunk}", embedding)
            
        # Process in batches to avoid overwhelming Ollama
        batch_size = 5
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i + batch_size]
            await asyncio.gather(*(process_chunk(chunk) for chunk in batch))

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
