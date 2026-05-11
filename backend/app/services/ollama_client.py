import json
from typing import AsyncGenerator
import httpx
from app.config import MODEL_NAME, OLLAMA_API_URL, MAX_HISTORY_MESSAGES
from app.db.sqlite_client import get_messages

SYSTEM_PROMPT = (
    "You are an efficient offline AI assistant optimized for low-end hardware. "
    "Answer clearly, stay concise, and avoid unnecessary verbosity."
)

class OllamaClient:
    def __init__(self) -> None:
        self.client = httpx.AsyncClient(timeout=None)

    async def build_prompt(self, chat_id: int, user_input: str, memories: str = "") -> str:
        messages = await get_messages(chat_id, limit=MAX_HISTORY_MESSAGES)
        
        system_text = SYSTEM_PROMPT
        if memories:
            system_text += f"\n\nRelevant context from past conversations:\n{memories}"
            
        prompt_lines = [system_text, ""]
        for message in messages:
            role = "User" if message["role"] == "user" else "Assistant"
            prompt_lines.append(f"{role}: {message['content']}")
        prompt_lines.append(f"User: {user_input}")
        prompt_lines.append("Assistant:")
        return "\n".join(prompt_lines)

    async def stream_completion(self, chat_id: int, user_input: str, temperature: float, max_tokens: int, memories: str = "") -> AsyncGenerator[str, None]:
        prompt = await self.build_prompt(chat_id, user_input, memories)
        url = f"{OLLAMA_API_URL}/api/generate"
        payload = {
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": True,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens,
            }
        }

        async with self.client.stream("POST", url, json=payload) as response:
            response.raise_for_status()
            async for raw_line in response.aiter_lines():
                if not raw_line:
                    continue

                try:
                    payload_chunk = json.loads(raw_line)
                except json.JSONDecodeError:
                    continue

                text = payload_chunk.get("response")
                if text:
                    yield text
                
                if payload_chunk.get("done"):
                    break

    async def get_embeddings(self, text: str) -> list[float]:
        url = f"{OLLAMA_API_URL}/api/embeddings"
        payload = {
            "model": MODEL_NAME,
            "prompt": text,
        }
        response = await self.client.post(url, json=payload)
        response.raise_for_status()
        return response.json()["embedding"]

    async def close(self) -> None:
        await self.client.aclose()

ollama_client = OllamaClient()
