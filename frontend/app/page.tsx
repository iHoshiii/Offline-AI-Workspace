"use client";

import { useEffect, useMemo, useState } from 'react';
import { ChatWindow } from '../components/ChatWindow';
import { MessageInput } from '../components/MessageInput';
import { Sidebar } from '../components/Sidebar';

type Conversation = {
  id: number;
  title: string;
};

type Message = {
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

type ChatChunk = {
  type: string;
  text?: string;
  chat_id?: number;
  message?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

export default function HomePage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/chat/conversations`)
      .then((res) => res.json())
      .then((data) => setConversations(data))
      .catch(() => setConversations([]));
  }, []);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeChatId) ?? null,
    [conversations, activeChatId],
  );

  const sendMessage = async () => {
    if (!draft.trim()) return;
    setError(null);
    const userMessage: Message = {
      role: 'user',
      content: draft.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setDraft('');
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: activeChatId, message: userMessage.content }),
      });

      if (!response.body) {
        throw new Error('Streaming response not supported.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantDraft = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);
          if (!line) continue;

          try {
            const payload = JSON.parse(line) as ChatChunk;
            if (payload.type === 'meta' && typeof payload.chat_id === 'number') {
              setActiveChatId(payload.chat_id);
              const chatId = payload.chat_id;
              setConversations((prev) => {
                if (prev.some((item) => item.id === chatId)) return prev;
                return [{ id: chatId, title: userMessage.content.slice(0, 80) }, ...prev];
              });
            }
            if (payload.type === 'chunk' && payload.text) {
              assistantDraft += payload.text;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                const nextMessage = {
                  role: 'assistant' as const,
                  content: assistantDraft,
                  created_at: new Date().toISOString(),
                };

                if (last?.role === 'assistant') {
                  return [...prev.slice(0, -1), nextMessage];
                }
                return [...prev, nextMessage];
              });
            }
            if (payload.type === 'error') {
              setError(payload.message ?? 'Unknown backend error');
            }
          } catch {
            continue;
          }
        }
      }
    } catch (err) {
      setError((err as Error).message ?? 'Unable to connect to backend.');
    } finally {
      setIsTyping(false);
    }
  };

  const createNewConversation = () => {
    setActiveChatId(null);
    setMessages([]);
    setDraft('');
  };

  const selectConversation = async (conversationId: number) => {
    setError(null);
    setActiveChatId(conversationId);
    try {
      const response = await fetch(`${API_BASE}/chat/conversations/${conversationId}`);
      const data = await response.json();
      if (data?.messages) {
        setMessages(data.messages);
      }
    } catch {
      setError('Failed to load conversation.');
    }
  };

  const deleteConversation = async (conversationId: number) => {
    try {
      await fetch(`${API_BASE}/chat/conversations/${conversationId}`, { method: 'DELETE' });
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (activeChatId === conversationId) {
        setActiveChatId(null);
        setMessages([]);
      }
    } catch {
      setError('Failed to delete conversation.');
    }
  };

  const renameConversation = async (conversationId: number, newTitle: string) => {
    try {
      await fetch(`${API_BASE}/chat/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, title: newTitle } : c)),
      );
    } catch {
      setError('Failed to rename conversation.');
    }
  };

  return (
    <main className="min-h-screen bg-surface text-slate-100">
      <div className="mx-auto flex h-screen max-w-[1600px] gap-6 overflow-hidden px-4 py-5 sm:px-6">
        <Sidebar
          conversations={conversations}
          activeConversationId={activeChatId}
          onSelectConversation={selectConversation}
          onCreateConversation={createNewConversation}
          onDeleteConversation={deleteConversation}
          onRenameConversation={renameConversation}
        />
        <section className="flex flex-1 flex-col rounded-[32px] border border-slate-800 bg-surface3 shadow-soft">
          <div className="border-b border-slate-800 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-100">Chat</h2>
            <p className="mt-1 text-sm text-slate-400">Streaming responses, markdown rendering, and local message persistence.</p>
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <ChatWindow messages={messages} isTyping={isTyping} />
            <div className="border-t border-slate-800 px-6 pb-6 pt-4">
              {error ? <p className="mb-3 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
              <MessageInput value={draft} onChange={setDraft} onSubmit={sendMessage} disabled={isTyping} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
