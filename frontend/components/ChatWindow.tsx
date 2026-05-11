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
};

const renderMarkdown = (markdown: string) => ({ __html: marked.parse(markdown) });

export function ChatWindow({ messages, isTyping, onDeleteMessage }: ChatWindowProps) {
  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden px-4 py-5 sm:px-6">
      <div className="space-y-4 overflow-y-auto pr-2">
        {messages.map((message, index) => {
          const isUser = message.role === 'user';
          return (
            <div 
              key={`${message.created_at}-${index}`} 
              className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'} animate-message group`}
            >
              <div className={`max-w-[85%] rounded-[24px] p-4 shadow-soft border relative ${
                isUser 
                  ? 'bg-accent text-white border-accent/20' 
                  : 'bg-surface2 text-text-primary border-border'
              }`}>
                {message.id && (
                  <button
                    onClick={() => onDeleteMessage(message.id!)}
                    className="absolute -top-2 -right-2 hidden h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg transition-all hover:scale-110 group-hover:flex"
                    title="Delete message from memory"
                  >
                    ✕
                  </button>
                )}
                <div className={`mb-1 flex items-center gap-2 text-[10px] uppercase tracking-widest ${isUser ? 'text-white/70' : 'text-text-muted'}`}>
                  <span className="font-bold">{isUser ? 'You' : 'AI Assistant'}</span>
                  <span>•</span>
                  <span>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div
                  className={`markdown-body text-[15px] leading-relaxed ${isUser ? 'text-white' : ''}`}
                  dangerouslySetInnerHTML={renderMarkdown(message.content)}
                />
              </div>
            </div>
          );
        })}
      </div>
      {isTyping ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface3 p-4 text-text-primary italic text-sm">
          Assistant is typing...
        </div>
      ) : null}
    </div>
  );
}
