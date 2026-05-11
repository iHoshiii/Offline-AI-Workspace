import { useEffect, useState } from 'react';

type Memory = {
  id: number;
  chat_id: number;
  content: string;
  created_at: string;
};

type MemoryManagerProps = {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
};

export function MemoryManager({ isOpen, onClose, apiBase }: MemoryManagerProps) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchMemories();
    }
  }, [isOpen]);

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/chat/memories`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMemories(data);
      } else {
        setMemories([]);
      }
    } catch (err) {
      console.error('Failed to fetch memories', err);
      setMemories([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteMemory = async (id: number) => {
    try {
      await fetch(`${apiBase}/chat/memories/${id}`, { method: 'DELETE' });
      setMemories((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Failed to delete memory', err);
    }
  };

  const filteredMemories = memories.filter((m) => 
    m.content.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="flex h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-[32px] border border-border bg-surface2 shadow-premium glass-effect">
        <div className="flex items-center justify-between border-b border-border px-8 py-6">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Semantic Memory Manager</h2>
            <p className="text-sm text-text-muted">View and manage exactly what the AI has learned about you.</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-surface3 p-2 text-text-muted transition hover:bg-accent hover:text-white">
            ✕
          </button>
        </div>

        <div className="px-8 py-4">
          <input
            type="text"
            placeholder="Search through AI memories..."
            className="w-full rounded-2xl border border-border bg-surface3 px-4 py-3 text-text-primary placeholder:text-text-muted/50 outline-none focus:border-accent transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-text-muted italic">Loading memory index...</div>
          ) : filteredMemories.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-text-muted italic">No memories found.</div>
          ) : (
            filteredMemories.map((memory) => (
              <div key={memory.id} className="group relative rounded-2xl border border-border bg-surface3 p-4 transition hover:border-accent">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed text-text-primary whitespace-pre-wrap">{memory.content}</p>
                    <div className="mt-3 flex items-center gap-3 text-[10px] uppercase tracking-widest text-text-muted">
                      <span>Chat ID: {memory.chat_id}</span>
                      <span>•</span>
                      <span>{new Date(memory.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteMemory(memory.id)}
                    className="shrink-0 rounded-xl bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-400 transition hover:bg-rose-500 hover:text-white"
                  >
                    Forget
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
