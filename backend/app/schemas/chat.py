from pydantic import BaseModel, Field
from typing import List, Optional

class ChatRequest(BaseModel):
    chat_id: Optional[int] = None
    message: str = Field(..., min_length=1)
    temperature: float = Field(0.2, ge=0.0, le=1.0)
    max_tokens: int = Field(400, ge=64, le=1024)

class ChatSummary(BaseModel):
    id: int
    title: str
    created_at: str
    updated_at: str

class MessageSchema(BaseModel):
    role: str
    content: str
    created_at: str

class ConversationDetail(BaseModel):
    chat: ChatSummary
    messages: List[MessageSchema]
