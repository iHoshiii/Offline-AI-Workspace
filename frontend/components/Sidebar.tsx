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
};

export function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  onRenameConversation,
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
    <aside className="h-full w-full max-w-xs border-r border-slate-800 bg-surface2 px-4 py-5 text-sm text-slate-200 flex flex-col glass-effect rounded-[32px] overflow-hidden">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Conversations</p>
          <h1 className="mt-2 text-lg font-semibold">Workspace</h1>
        </div>
        <div className="flex gap-2">
          {activeConversationId && (
            <button
              title="Summarize current chat"
              className="rounded-full bg-surface3 border border-slate-700 px-3 py-1 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
              onClick={() => onSummarizeConversation(activeConversationId)}
            >
              Σ
            </button>
          )}
          <button
            className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-slate-950 transition hover:bg-sky-300"
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
        {conversations.length === 0 ? (
          <div className="rounded-2xl bg-surface p-4 text-sm text-slate-400">
            No conversations yet. Start a new chat.
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={
                'group relative flex flex-col gap-1 w-full rounded-2xl border p-4 text-left transition ' +
                (conversation.id === activeConversationId
                  ? 'border-accent bg-surface3 text-white'
                  : 'border-transparent bg-surface hover:border-slate-600')
              }
              onClick={() => onSelectConversation(conversation.id)}
            >
              {editingId === conversation.id ? (
                <input
                  autoFocus
                  className="w-full bg-transparent outline-none border-b border-accent py-1"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={handleKeyDown}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <div className="flex items-center justify-between">
                  <p className="flex-1 truncate font-medium text-slate-100">{conversation.title}</p>
                  <div className="flex items-center gap-2 opacity-40 transition-opacity hover:opacity-100">
                    <button
                      title="Rename"
                      className="p-1 text-slate-400 hover:text-white"
                      onClick={(e) => startEditing(e, conversation)}
                    >
                      ✎
                    </button>
                    <button
                      title="Delete"
                      className="p-1 text-slate-400 hover:text-rose-400"
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

      <div className="mt-auto border-t border-slate-800/50 pt-4 space-y-4">
        <div className="px-4 py-2 bg-surface3 rounded-2xl border border-slate-800/50">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">System Awareness</p>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Local AI Status</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Memory Sync</span>
              <span className="text-slate-300">Semantic Enabled</span>
            </div>
          </div>
        </div>
        <button className="flex w-full items-center gap-3 rounded-2xl p-4 text-slate-400 transition hover:bg-surface3 hover:text-white">
          <span>⚙</span>
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </aside>
  );
}
