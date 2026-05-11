import math
import json
from typing import Any
from app.db.sqlite_client import add_memory, list_all_memories
from app.services.ollama_client import ollama_client

def cosine_similarity(v1: list[float], v2: list[float]) -> float:
    dot_product = sum(a * b for a, b in zip(v1, v2))
    magnitude1 = math.sqrt(sum(a * a for a in v1))
    magnitude2 = math.sqrt(sum(b * b for b in v2))
    if not magnitude1 or not magnitude2:
        return 0.0
    return dot_product / (magnitude1 * magnitude2)

class MemoryService:
    async def save_interaction(self, chat_id: int, user_input: str, assistant_response: str):
        # We store the interaction as a memory
        content = f"User: {user_input}\nAssistant: {assistant_response}"
        embedding = await ollama_client.get_embeddings(content)
        await add_memory(chat_id, content, embedding)

    async def get_relevant_memories(self, query: str, limit: int = 3) -> str:
        query_embedding = await ollama_client.get_embeddings(query)
        memories = await list_all_memories()
        
        scored_memories = []
        for mem in memories:
            mem_embedding = json.loads(mem["embedding"])
            score = cosine_similarity(query_embedding, mem_embedding)
            scored_memories.append((score, mem["content"]))
        
        # Sort by score descending
        scored_memories.sort(key=lambda x: x[0], reverse=True)
        
        relevant = [content for score, content in scored_memories[:limit] if score > 0.7]
        if not relevant:
            return ""
            
        return "\n---\n".join(relevant)

memory_service = MemoryService()
