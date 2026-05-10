import asyncio
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

    async def build_prompt(self, chat_id: int, user_input: str) -> str:
        messages = await get_messages(chat_id, limit=MAX_HISTORY_MESSAGES)
        prompt_lines = [SYSTEM_PROMPT, ""]
        for message in messages:
            role = "User" if message["role"] == "user" else "Assistant"
            prompt_lines.append(f"{role}: {message['content']}")
        prompt_lines.append(f"User: {user_input}")
        prompt_lines.append("Assistant:")
        return "\n".join(prompt_lines)

    async def stream_completion(self, chat_id: int, user_input: str, temperature: float, max_tokens: int) -> AsyncGenerator[str, None]:
        prompt = await self.build_prompt(chat_id, user_input)
        url = f"{OLLAMA_API_URL}/v1/completions"
        payload = {
            "model": MODEL_NAME,
            "prompt": prompt,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True,
        }

        async with self.client.stream("POST", url, json=payload) as response:
            response.raise_for_status()
            async for raw_line in response.aiter_lines():
                if not raw_line:
                    continue

                trimmed = raw_line.strip()
                if trimmed.startswith("data:"):
                    trimmed = trimmed[5:].strip()
                if not trimmed:
                    continue

                try:
                    payload_chunk = json.loads(trimmed)
                except json.JSONDecodeError:
                    continue

                # Ollama returns incremental text in `choices[0].delta` or `choices[0].text`
                choice = payload_chunk.get("choices", [{}])[0]
                text = choice.get("delta") or choice.get("text")
                if text is None:
                    continue
                yield text

    async def close(self) -> None:
        await self.client.aclose()

ollama_client = OllamaClient()
