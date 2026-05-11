import json
from fastapi import APIRouter, HTTPException, Request, UploadFile, File
from fastapi.responses import StreamingResponse
from app.db.sqlite_client import append_message, create_chat, delete_chat, get_chat, get_messages, list_chats, update_chat_title
from app.schemas.chat import ChatRequest, ChatSummary, ConversationDetail, UpdateChatRequest
from app.services.ollama_client import ollama_client
from app.services.memory_service import memory_service
from app.services.document_service import document_service

router = APIRouter(prefix="/chat")

async def _stream_response_generator(chat_id: int, user_message: str, temperature: float, max_tokens: int, memories: str = ""):
    assistant_text = ""
    yield json.dumps({"type": "meta", "chat_id": chat_id}) + "\n"

    try:
        async for chunk in ollama_client.stream_completion(chat_id, user_message, temperature, max_tokens, memories):
            assistant_text += chunk
            yield json.dumps({"type": "chunk", "text": chunk}) + "\n"
    except Exception as exc:
        yield json.dumps({"type": "error", "message": str(exc)}) + "\n"
        return

    trimmed = assistant_text.strip()
    if trimmed:
        await append_message(chat_id, "assistant", trimmed)
        # Save this interaction to semantic memory
        await memory_service.save_interaction(chat_id, user_message, trimmed)
        yield json.dumps({"type": "done", "text": trimmed}) + "\n"

@router.post("/stream")
async def chat_stream(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message text is required.")

    chat_id = request.chat_id
    if chat_id is None:
        title = request.message.strip()[:80].replace("\n", " ")
        chat_id = await create_chat(title or "New chat")
    else:
        chat = await get_chat(chat_id)
        if chat is None:
            raise HTTPException(status_code=404, detail="Chat not found.")

    await append_message(chat_id, "user", request.message.strip())

    # Retrieve relevant memories from past conversations
    memories = await memory_service.get_relevant_memories(request.message.strip())

    return StreamingResponse(
        _stream_response_generator(chat_id, request.message.strip(), request.temperature, request.max_tokens, memories),
        media_type="application/json",
    )

@router.get("/conversations")
async def get_conversations() -> list[ChatSummary]:
    return await list_chats()

@router.get("/conversations/{chat_id}")
async def get_conversation(chat_id: int) -> ConversationDetail:
    chat = await get_chat(chat_id)
    if chat is None:
        raise HTTPException(status_code=404, detail="Chat not found.")
    messages = await get_messages(chat_id, limit=50)
    return {"chat": chat, "messages": messages}

@router.delete("/conversations/{chat_id}")
async def remove_conversation(chat_id: int):
    chat = await get_chat(chat_id)
    if chat is None:
        raise HTTPException(status_code=404, detail="Chat not found.")
    await delete_chat(chat_id)
    return {"status": "success", "message": "Conversation deleted."}

@router.patch("/conversations/{chat_id}")
async def rename_conversation(chat_id: int, request: UpdateChatRequest):
    chat = await get_chat(chat_id)
    if chat is None:
        raise HTTPException(status_code=404, detail="Chat not found.")
    await update_chat_title(chat_id, request.title)
    return {"status": "success", "message": "Conversation renamed."}

@router.delete("/conversations/{chat_id}/messages/{message_id}")
async def remove_message(chat_id: int, message_id: int):
    # Verify chat exists
    chat = await get_chat(chat_id)
    if chat is None:
        raise HTTPException(status_code=404, detail="Chat not found.")
    
    success = await delete_message(message_id)
    if not success:
        raise HTTPException(status_code=404, detail="Message not found.")
    
    return {"status": "success", "message": "Message and associated memory deleted."}

@router.post("/conversations/{chat_id}/upload")
async def upload_document(chat_id: int, file: UploadFile = File(...)):
    chat = await get_chat(chat_id)
    if chat is None:
        raise HTTPException(status_code=404, detail="Chat not found.")
    
    if file.filename.endswith('.pdf'):
        content = await file.read()
        await document_service.process_pdf(chat_id, content)
    elif file.filename.endswith(('.txt', '.md')):
        content = await file.read()
        await document_service.process_text(chat_id, content.decode('utf-8'))
    elif file.filename.endswith('.docx'):
        content = await file.read()
        await document_service.process_docx(chat_id, content)
    else:
        raise HTTPException(status_code=400, detail="Only PDF, TXT, MD, and DOCX files are supported.")
    
    return {"status": "success", "message": f"Document '{file.filename}' processed and added to chat memory."}
    
@router.post("/conversations/{chat_id}/summarize")
async def summarize_conversation(chat_id: int):
    chat = await get_chat(chat_id)
    if chat is None:
        raise HTTPException(status_code=404, detail="Chat not found.")
    
    messages = await get_messages(chat_id, limit=100)
    if not messages:
        return {"summary": "No messages to summarize."}
    
    chat_text = "\n".join([f"{m['role']}: {m['content']}" for m in messages])
    prompt = (
        "You are an expert summarizer. Please provide a concise, bullet-pointed summary of the following conversation. "
        "Focus on the key questions asked and the main conclusions reached.\n\n"
        f"Conversation:\n{chat_text}\n\n"
        "Summary:"
    )
    
    summary = await ollama_client.get_completion(prompt, temperature=0.3, max_tokens=300)
    return {"summary": summary.strip()}
