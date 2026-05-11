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
    // Use message.id if available, otherwise fallback to created_at as a temporary ID
    const idToUse = message.id || message.created_at;
    console.log('Starting edit for:', idToUse);
    setEditingId(idToUse);
    setEditContent(message.content);
  };

  const handleSaveEdit = () => {
    // We only call the backend if we have a real numerical ID
    const realId = messages.find(m => (m.id || m.created_at) == editingId)?.id;
    if (realId && editContent.trim()) {
      onEditMessage(realId, editContent.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden px-4 py-5 sm:px-6">
      <div className="space-y-4 overflow-y-auto pr-2">
        {messages.map((message, index) => {
          const isUser = message.role === 'user';
          const currentId = message.id || message.created_at;
          const isEditing = editingId == currentId;
          const isFileMessage = message.content.includes('📄') || message.content.includes('✅ Document');

          return (
            <div 
              key={`${message.created_at}-${index}`} 
              className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'} animate-message`}
            >
              <div className={`max-w-[90%] min-w-[180px] rounded-[24px] p-5 shadow-soft border relative transition-all ${
                isUser 
                  ? 'bg-accent text-white border-accent/20' 
                  : 'bg-surface2 text-text-primary border-border'
              }`}>
                {/* Action Bar */}
                {!isEditing && (
                  <div className={`mb-3 flex items-center justify-between border-b pb-2 ${isUser ? 'border-white/20' : 'border-border'}`}>
                    <div className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold ${isUser ? 'text-white/70' : 'text-text-muted'}`}>
                      <span>{isUser ? 'You' : 'AI'}</span>
                      <span>•</span>
                      <span>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(message)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all active:scale-95 ${
                          isUser ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-accent text-white hover:opacity-90 shadow-md'
                        }`}
                      >
                        ✎ EDIT
                      </button>
                      <button
                        onClick={() => {
                          if (message.id) onDeleteMessage(message.id);
                        }}
                        className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all active:scale-95 ${
                          isUser ? 'bg-white/20 text-white hover:bg-rose-400' : 'bg-surface3 text-rose-500 border border-border hover:bg-rose-50/10'
                        }`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {isFileMessage && !isEditing && (
                  <div className="mb-2 flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                    <FileIcon /> Attached Document
                  </div>
                )}

                {isEditing ? (
                  <div className="flex flex-col gap-3 min-w-[280px]">
                    <div className="text-[10px] font-bold uppercase text-white/80 mb-1 flex justify-between">
                      <span>Editing Mode</span>
                      <span className="opacity-50">Press ESC to cancel</span>
                    </div>
                    <textarea
                      autoFocus
                      className="w-full bg-black/30 border border-white/30 rounded-xl p-4 text-sm text-white placeholder-white/40 outline-none focus:ring-4 ring-white/10"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setEditingId(null);
                        if (e.key === 'Enter' && e.ctrlKey) handleSaveEdit();
                      }}
                      rows={5}
                    />
                    <div className="flex justify-end gap-3 mt-1">
                      <button 
                        onClick={() => setEditingId(null)}
                        className="text-[10px] font-black uppercase text-white/70 hover:text-white px-3"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSaveEdit}
                        className="text-[11px] font-black uppercase bg-white text-blue-700 px-6 py-2.5 rounded-xl hover:bg-blue-50 shadow-2xl active:translate-y-0.5 transition-all"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`markdown-body text-[15px] leading-relaxed ${isUser ? 'text-white' : ''} ${isFileMessage ? 'font-medium italic opacity-90' : ''}`}
                    dangerouslySetInnerHTML={renderMarkdown(message.content)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
      {isTyping ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface3 p-4 text-text-primary italic text-sm animate-pulse">
          Assistant is typing...
        </div>
      ) : null}
    </div>
  );
}
