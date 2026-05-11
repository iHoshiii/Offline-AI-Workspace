import { useState } from 'react';
import { marked } from 'marked';

type Message = {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

type ChatWindowProps = {
  messages: Message[];
  isTyping: boolean;
  onDeleteMessage: (messageId: number) => void;
  onEditMessage: (messageId: number, newContent: string) => void;
};

const renderMarkdown = (markdown: string) => ({ __html: marked.parse(markdown) });

const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1.5 align-text-bottom"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
);

export function ChatWindow({ messages, isTyping, onDeleteMessage, onEditMessage }: ChatWindowProps) {
  const [editingId, setEditingId] = useState<any>(null);
  const [editContent, setEditContent] = useState('');

  const startEditing = (message: Message) => {
    if (!message.id) return; // Wait for sync
    setEditingId(message.id);
    setEditContent(message.content);
  };

  const handleSaveEdit = () => {
    if (editingId && editContent.trim()) {
      onEditMessage(editingId, editContent.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden px-4 py-5 sm:px-6">
      <div className="space-y-6 overflow-y-auto pr-2">
        {messages.map((message, index) => {
          const isUser = message.role === 'user';
          const isSyncing = !message.id;
          const isEditing = editingId && editingId == message.id;
          const isFileMessage = message.content.includes('📄') || message.content.includes('✅ Document');

          return (
            <div 
              key={`${message.created_at}-${index}`} 
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-message group`}
            >
              {/* Message Header */}
              <div className={`mb-1.5 flex items-center gap-2 text-[9px] uppercase tracking-[0.15em] font-bold ${isUser ? 'mr-4 text-text-muted' : 'ml-4 text-text-muted'}`}>
                <span>{isUser ? 'You' : 'AI Assistant'}</span>
                <span className="opacity-30">•</span>
                <span>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {isSyncing && <span className="ml-2 text-accent animate-pulse">Syncing...</span>}
              </div>

              <div className={`max-w-[85%] min-w-[160px] rounded-[24px] p-5 shadow-premium border relative transition-all group-hover:shadow-xl ${
                isUser 
                  ? 'bg-accent text-white border-accent/20' 
                  : 'bg-surface2 text-text-primary border-border'
              }`}>
                {/* Floating Action Pill - Only shows when synced */}
                {!isEditing && !isSyncing && (
                  <div className="absolute -top-3 right-4 flex items-center gap-1 bg-surface3 border border-border rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 z-20">
                    <button
                      onClick={(e) => { e.stopPropagation(); startEditing(message); }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter text-text-primary hover:bg-accent hover:text-white transition-colors cursor-pointer"
                    >
                      ✎ Edit
                    </button>
                    <div className="w-[1px] h-3 bg-border"></div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteMessage(message.id!); }}
                      className="flex items-center justify-center w-7 h-7 rounded-full text-text-muted hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <span className="text-[10px]">✕</span>
                    </button>
                  </div>
                )}

                {isEditing ? (
                  <div className="flex flex-col gap-3 min-w-[280px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">Editing Message</span>
                      <button onClick={() => setEditingId(null)} className="text-[10px] text-white/40 hover:text-white cursor-pointer">Cancel</button>
                    </div>
                    <textarea
                      autoFocus
                      className="w-full bg-black/20 border border-white/20 rounded-xl p-4 text-sm text-white outline-none focus:ring-2 ring-white/20 resize-none"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setEditingId(null);
                        if (e.key === 'Enter' && e.ctrlKey) handleSaveEdit();
                      }}
                      rows={4}
                    />
                    <button 
                      onClick={handleSaveEdit}
                      className="w-full bg-white text-blue-600 py-2.5 rounded-xl text-[11px] font-black uppercase shadow-xl hover:bg-blue-50 transition-all active:scale-95 cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    {isFileMessage && (
                      <div className={`mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${isUser ? 'text-white/60' : 'text-emerald-500'}`}>
                        <FileIcon /> File Attached
                      </div>
                    )}
                    <div
                      className={`markdown-body text-[15px] leading-relaxed ${isUser ? 'text-white' : ''}`}
                      dangerouslySetInnerHTML={renderMarkdown(message.content)}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {isTyping ? (
        <div className="flex items-center gap-2 ml-6 text-text-muted animate-pulse mt-4">
          <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
          <span className="text-xs font-bold uppercase tracking-widest">Assistant is thinking...</span>
        </div>
      ) : null}
    </div>
  );
}
