"use client";

import { useEffect, useMemo, useState, useRef } from 'react';
import { ChatWindow } from '../components/ChatWindow';
import { MessageInput } from '../components/MessageInput';
import { Sidebar } from '../components/Sidebar';
import { MemoryManager } from '../components/MemoryManager';
import { SettingsModal } from '../components/SettingsModal';

type ThemeType = 'light' | 'dark' | 'modern';

type Conversation = {
  id: number;
  title: string;
};

type Message = {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

type ChatChunk = {
  type: string;
  text?: string;
  chat_id?: number;
  message?: string;
  user_message_id?: number;
  message_id?: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

export default function HomePage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [typingChatId, setTypingChatId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMemoryManagerOpen, setIsMemoryManagerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeType>('dark');
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as ThemeType | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const toggleTheme = (newTheme: ThemeType) => {
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const fetchConversations = () => {
    fetch(`${API_BASE}/chat/conversations?t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => setConversations(data))
      .catch(() => setConversations([]));
  };

  const fetchMessages = (chatId: number) => {
    if (!chatId) return;
    fetch(`${API_BASE}/chat/conversations/${chatId}?t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.messages) {
          console.log('Fetched messages for sync:', data.messages);
          setMessages(data.messages);
        }
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setError('Failed to load messages.');
      });
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Safety valve: Clear stuck syncing labels automatically
  useEffect(() => {
    const interval = setInterval(() => {
      const hasUnsynced = messages.some(m => m.id === undefined || m.id === null);
      if (hasUnsynced && activeChatId && !typingChatId) {
        fetchMessages(activeChatId);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [messages, activeChatId, typingChatId]);

  useEffect(() => {
    const handleUpload = async (e: any) => {
      const file = e.detail;
      if (!activeChatId) {
        setError('Please select or create a chat first.');
        return;
      }

      setMessages((prev) => [...prev, { 
        role: 'user', 
        content: `📄 **Attached File:** ${file.name}`,
        created_at: new Date().toISOString()
      }]);

      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: `⏳ Processing "${file.name}"... please wait.`,
        created_at: new Date().toISOString()
      }]);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch(`${API_BASE}/chat/conversations/${activeChatId}/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.status === 'success') {
          fetchMessages(activeChatId);
        } else {
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { 
              role: 'assistant', 
              content: `❌ Upload failed: ${data.detail || 'Unknown error'}`,
              created_at: new Date().toISOString()
            }
          ]);
        }
      } catch (err) {
        console.error(err);
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { 
            role: 'assistant', 
            content: `❌ Error uploading file. Please try again.`,
            created_at: new Date().toISOString()
          }
        ]);
      }
    };

    window.addEventListener('upload-file', handleUpload);
    return () => window.removeEventListener('upload-file', handleUpload);
  }, [activeChatId]);

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setTypingChatId(null);
      setError('Generation stopped by user.');
      setTimeout(() => setError(null), 3000);
    }
  };

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
    setTypingChatId(activeChatId);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    let lastChatId = activeChatId;

    try {
      const response = await fetch(`${API_BASE}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: activeChatId, message: userMessage.content }),
        signal: controller.signal,
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
            if (payload.type === 'meta') {
              if (typeof payload.chat_id === 'number') {
                lastChatId = payload.chat_id;
                setActiveChatId(lastChatId);
                setTypingChatId(lastChatId);
                setConversations((prev) => {
                  if (prev.some((item) => item.id === lastChatId)) return prev;
                  return [{ id: lastChatId!, title: userMessage.content.slice(0, 80) }, ...prev];
                });
              }
              if (payload.user_message_id) {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const lastUserIdx = newMsgs.map(m => m.role).lastIndexOf('user');
                  if (lastUserIdx !== -1) {
                    newMsgs[lastUserIdx] = { ...newMsgs[lastUserIdx], id: payload.user_message_id };
                  }
                  return newMsgs;
                });
              }
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
            if (payload.type === 'done' && payload.message_id) {
              setMessages((prev) => {
                const newMsgs = [...prev];
                const lastAsstIdx = newMsgs.map(m => m.role).lastIndexOf('assistant');
                if (lastAsstIdx !== -1) {
                  newMsgs[lastAsstIdx] = { ...newMsgs[lastAsstIdx], id: payload.message_id };
                }
                return newMsgs;
              });
            }
          } catch { continue; }
        }
      }
      
      if (lastChatId) fetchMessages(lastChatId);
      
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setTimeout(() => { if (lastChatId) fetchMessages(lastChatId); }, 800);
      } else {
        setError(err.message ?? 'Unable to connect to backend.');
      }
    } finally {
      setTypingChatId(null);
      abortControllerRef.current = null;
    }
  };

  const selectConversation = async (conversationId: number) => {
    setActiveChatId(conversationId);
    fetchMessages(conversationId);
  };

  const deleteMessage = async (messageId: number) => {
    if (!activeChatId || !messageId) return;
    try {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      await fetch(`${API_BASE}/chat/conversations/${activeChatId}/messages/${messageId}`, { method: 'DELETE' });
    } catch {
      if (activeChatId) fetchMessages(activeChatId);
    }
  };

  const editMessage = async (messageId: number, newContent: string) => {
    if (!activeChatId || !messageId) return;
    try {
      const res = await fetch(`${API_BASE}/chat/conversations/${activeChatId}/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      });
      if (!res.ok) throw new Error('Edit failed');
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, content: newContent } : m)));
    } catch {
      if (activeChatId) fetchMessages(activeChatId);
    }
  };

  return (
    <div data-theme={theme} className="w-full">
      <main className="min-h-screen bg-background text-text-primary transition-colors duration-300">
        <div className="mx-auto flex h-screen max-w-[1600px] gap-6 overflow-hidden px-4 py-5 sm:px-6">
          <Sidebar
            conversations={conversations}
            activeConversationId={activeChatId}
            onSelectConversation={selectConversation}
            onCreateConversation={() => { setActiveChatId(null); setMessages([]); }}
            onDeleteConversation={async (id) => {
              await fetch(`${API_BASE}/chat/conversations/${id}`, { method: 'DELETE' });
              setConversations(prev => prev.filter(c => c.id !== id));
              if (activeChatId === id) { setActiveChatId(null); setMessages([]); }
            }}
            onRenameConversation={async (id, title) => {
              await fetch(`${API_BASE}/chat/conversations/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title }),
              });
              setConversations(prev => prev.map(c => c.id === id ? { ...c, title } : c));
            }}
            onSummarizeConversation={async (id) => {
              fetchMessages(id);
            }}
            onClearMemories={async () => {
              await fetch(`${API_BASE}/chat/memories`, { method: 'DELETE' });
            }}
            onOpenMemoryManager={() => setIsMemoryManagerOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
          <section className="flex flex-1 flex-col rounded-[32px] border border-border bg-surface shadow-premium glass-effect">
            <div className="border-b border-border px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Chat</h2>
                <p className="mt-1 text-sm text-text-muted">Local & Private Offline Workspace</p>
              </div>
              {activeChatId && (
                <button 
                  onClick={() => fetchMessages(activeChatId)}
                  className="p-2.5 rounded-xl hover:bg-surface2 text-text-muted hover:text-accent transition-all cursor-pointer group"
                  title="Force Sync with Database"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-active:rotate-180 transition-transform duration-500">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
                  </svg>
                </button>
              )}
            </div>
            <div className="flex flex-1 flex-col overflow-hidden">
              <ChatWindow 
                messages={messages} 
                isTyping={typingChatId !== null && typingChatId === activeChatId} 
                onDeleteMessage={deleteMessage}
                onEditMessage={editMessage}
              />
              <div className="border-t border-border px-6 pb-6 pt-4">
                {error ? <p className="mb-3 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
                <MessageInput 
                  value={draft} 
                  onChange={setDraft} 
                  onSubmit={sendMessage} 
                  onStop={stopGeneration}
                  disabled={typingChatId !== null} 
                />
              </div>
            </div>
          </section>
        </div>
        <MemoryManager isOpen={isMemoryManagerOpen} onClose={() => setIsMemoryManagerOpen(false)} apiBase={API_BASE} />
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} theme={theme} onThemeChange={toggleTheme} />
      </main>
    </div>
  );
}
