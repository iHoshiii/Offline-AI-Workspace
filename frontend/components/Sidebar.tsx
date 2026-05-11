import { useState, type MouseEvent, type KeyboardEvent } from 'react';

type Conversation = {
  id: number;
  title: string;
};

type SidebarProps = {
  conversations: Conversation[];
  activeConversationId: number | null;
  onSelectConversation: (conversationId: number) => void;
  onCreateConversation: () => void;
  onDeleteConversation: (conversationId: number) => void;
  onRenameConversation: (conversationId: number, newTitle: string) => void;
  onSummarizeConversation: (conversationId: number) => void;
  onClearMemories: () => void;
  onOpenMemoryManager: () => void;
  onOpenSettings: () => void;
};

export function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  onRenameConversation,
  onSummarizeConversation,
  onClearMemories,
  onOpenMemoryManager,
  onOpenSettings,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const startEditing = (event: MouseEvent, conversation: Conversation) => {
    event.stopPropagation();
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const handleRename = () => {
    if (editingId && editTitle.trim()) {
      onRenameConversation(editingId, editTitle.trim());
      setEditingId(null);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') handleRename();
    if (event.key === 'Escape') setEditingId(null);
  };

  return (
    <aside className="h-full w-full max-w-xs border-r border-border bg-surface2 px-4 py-5 text-sm text-text-primary flex flex-col glass-effect rounded-[32px] overflow-hidden">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Conversations</p>
          <h1 className="mt-2 text-lg font-semibold text-text-primary">Workspace</h1>
        </div>
        <div className="flex gap-2">
          {activeConversationId && (
            <button
              title="Summarize current chat"
              className="rounded-full bg-surface3 border border-border px-3 py-1 text-sm font-medium text-text-muted transition hover:bg-surface2"
              onClick={() => onSummarizeConversation(activeConversationId)}
            >
              Σ
            </button>
          )}
          <button
            className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-background transition hover:opacity-80"
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              onCreateConversation();
            }}
          >
            New
          </button>
        </div>
      </div>

      <div className="space-y-2 overflow-y-auto">
        {activeConversationId === null && (
          <div className="group relative flex flex-col gap-1 w-full rounded-2xl border border-accent bg-surface3 p-4 text-left transition animate-pulse">
            <p className="flex-1 truncate font-medium text-text-primary italic opacity-70">New Conversation...</p>
            <p className="text-[10px] text-text-muted uppercase tracking-widest">Waiting for first message</p>
          </div>
        )}
        {conversations.length === 0 && activeConversationId !== null ? (
          <div className="rounded-2xl bg-surface p-4 text-sm text-text-muted">
            No conversations yet. Start a new chat.
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={
                'group relative flex flex-col gap-1 w-full rounded-2xl border p-4 text-left transition ' +
                (conversation.id === activeConversationId
                  ? 'border-accent bg-surface3 text-text-primary'
                  : 'border-transparent bg-surface hover:border-accent/50')
              }
              onClick={() => onSelectConversation(conversation.id)}
            >
              {editingId === conversation.id ? (
                <input
                  autoFocus
                  className="w-full bg-transparent outline-none border-b border-accent py-1 text-text-primary"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={handleKeyDown}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <div className="flex items-center justify-between">
                  <p className="flex-1 truncate font-medium text-text-primary">{conversation.title}</p>
                  <div className="flex items-center gap-2 opacity-40 transition-opacity hover:opacity-100">
                    <button
                      title="Rename"
                      className="p-1 text-text-muted hover:text-text-primary"
                      onClick={(e) => startEditing(e, conversation)}
                    >
                      ✎
                    </button>
                    <button
                      title="Delete"
                      className="p-1 text-text-muted hover:text-rose-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this conversation?')) {
                          onDeleteConversation(conversation.id);
                        }
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-auto border-t border-border pt-4 space-y-4">
        <div className="px-4 py-3 bg-surface3 rounded-2xl border border-border">
          <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">System Awareness</p>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-text-muted">Local AI Status</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active
              </span>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button 
              onClick={() => { if(confirm('Wipe all AI long-term memories? This cannot be undone.')) onClearMemories(); }}
              className="flex-1 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-[10px] font-bold text-rose-400 uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
            >
              Wipe
            </button>
            <button 
              onClick={onOpenMemoryManager}
              className="flex-1 py-1.5 rounded-xl border border-border bg-surface px-2 text-[10px] font-bold text-text-primary uppercase tracking-widest hover:bg-surface2 transition-all"
            >
              Manage
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={onOpenSettings}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border p-3 text-text-muted transition hover:bg-surface3 hover:text-text-primary"
          >
            <span className="text-lg">⚙</span>
            <span className="text-xs font-bold uppercase tracking-widest">Settings</span>
          </button>
          <div 
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border p-3 text-text-muted transition bg-surface"
          >
            <span className="text-lg">🤖</span>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest text-accent font-bold">Model</span>
              <span className="text-[10px] font-bold text-text-primary">Phi-3 Mini</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
