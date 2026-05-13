import json
import asyncio
from fastapi import APIRouter, HTTPException, Request, UploadFile, File
from fastapi.responses import StreamingResponse
from app.db.sqlite_client import append_message, clear_all_memories, create_chat, delete_chat, delete_message, delete_memory, get_chat, get_messages, list_chats, list_all_memories, update_chat_title, update_message
from app.schemas.chat import ChatRequest, UpdateChatRequest, UpdateMessageRequest
from app.services.document_service import document_service
from app.services.memory_service import memory_service
from app.services.ollama_client import ollama_client

router = APIRouter(prefix="/chat")

async def _stream_response_generator(chat_id: int, user_message: str, temperature: float, max_tokens: int, memories: str = "", user_message_id: int = None):
    assistant_text = ""
    yield json.dumps({"type": "meta", "chat_id": chat_id, "user_message_id": user_message_id}) + "\n"

    saved = False
    try:
        async for chunk in ollama_client.stream_completion(chat_id, user_message, temperature, max_tokens, memories):
            assistant_text += chunk
            yield json.dumps({"type": "chunk", "text": chunk}) + "\n"
    except Exception as exc:
        yield json.dumps({"type": "error", "message": str(exc)}) + "\n"
    except asyncio.CancelledError:
        trimmed = assistant_text.strip()
        if trimmed and not saved:
            await append_message(chat_id, "assistant", trimmed)
            await memory_service.save_interaction(chat_id, user_message, trimmed)
            saved = True
        raise
    finally:
        if not saved:
            trimmed = assistant_text.strip()
            if trimmed:
                assistant_message_id = await append_message(chat_id, "assistant", trimmed)
                await memory_service.save_interaction(chat_id, user_message, trimmed)
                try:
                    yield json.dumps({"type": "done", "text": trimmed, "message_id": assistant_message_id}) + "\n"
                except:
                    pass
                saved = True

@router.post("/stream")
async def chat_stream(request: ChatRequest):
    chat_id = request.chat_id
    if chat_id is None:
        chat = await create_chat("New Conversation")
        chat_id = chat["id"]
    else:
        chat = await get_chat(chat_id)
        if chat is None:
            raise HTTPException(status_code=404, detail="Chat not found.")

    user_message_id = await append_message(chat_id, "user", request.message.strip())

    # Retrieve relevant memories from past conversations
    memories = await memory_service.get_relevant_memories(request.message.strip())

    return StreamingResponse(
        _stream_response_generator(chat_id, request.message.strip(), request.temperature, request.max_tokens, memories, user_message_id),
        media_type="application/json",
    )

@router.get("/conversations")
async def list_conversations():
    return await list_chats()

@router.get("/conversations/{chat_id}")
async def get_conversation(chat_id: int):
    chat = await get_chat(chat_id)
    if chat is None:
        raise HTTPException(status_code=404, detail="Chat not found.")
    messages = await get_messages(chat_id)
    return {"id": chat["id"], "title": chat["title"], "messages": messages}

@router.delete("/conversations/{chat_id}")
async def delete_conversation_route(chat_id: int):
    await delete_chat(chat_id)
    return {"status": "success"}

@router.patch("/conversations/{chat_id}")
async def rename_conversation(chat_id: int, request: UpdateChatRequest):
    await update_chat_title(chat_id, request.title)
    return {"status": "success"}

@router.post("/conversations/{chat_id}/upload")
async def upload_document(chat_id: int, file: UploadFile = File(...)):
    chat = await get_chat(chat_id)
    if chat is None:
        raise HTTPException(status_code=404, detail="Chat not found.")
    
    if file.filename.endswith('.pdf'):
        content = await file.read()
        await append_message(chat_id, "user", f"📄 **Attached File:** {file.filename}")
        await document_service.process_pdf(chat_id, content)
    elif file.filename.endswith(('.txt', '.md')):
        content = await file.read()
        await append_message(chat_id, "user", f"📄 **Attached File:** {file.filename}")
        await document_service.process_text(chat_id, content.decode('utf-8'))
    elif file.filename.endswith('.docx'):
        content = await file.read()
        await append_message(chat_id, "user", f"📄 **Attached File:** {file.filename}")
        await document_service.process_docx(chat_id, content)
    else:
        raise HTTPException(status_code=400, detail="Only PDF, TXT, MD, and DOCX files are supported.")
        
    return {"status": "success"}

@router.delete("/conversations/{chat_id}/messages/{message_id}")
async def delete_chat_message(chat_id: int, message_id: int):
    success = await delete_message(message_id)
    if not success:
        raise HTTPException(status_code=404, detail="Message not found.")
    return {"status": "success"}

@router.patch("/conversations/{chat_id}/messages/{message_id}")
async def edit_chat_message(chat_id: int, message_id: int, request: UpdateMessageRequest):
    await update_message(message_id, request.content)
    return {"status": "success"}

@router.post("/conversations/{chat_id}/summarize")
async def summarize_chat(chat_id: int):
    chat = await get_chat(chat_id)
    if chat is None:
        raise HTTPException(status_code=404, detail="Chat not found.")
    
    messages = await get_messages(chat_id)
    if not messages:
        return {"summary": "No messages to summarize."}
        
    summary = await document_service.summarize_conversation(messages)
    await append_message(chat_id, "assistant", f"📝 **Conversation Summary:**\n\n{summary}")
    return {"summary": summary}

@router.get("/memories")
async def list_memories():
    return await list_all_memories()

@router.delete("/memories")
async def clear_memories():
    await clear_all_memories()
    return {"status": "success"}

@router.delete("/memories/{memory_id}")
async def delete_specific_memory(memory_id: int):
    await delete_memory(memory_id)
    return {"status": "success"}
