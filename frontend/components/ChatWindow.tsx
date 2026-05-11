import { marked } from 'marked';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

type ChatWindowProps = {
  messages: Message[];
  isTyping: boolean;
};

const renderMarkdown = (markdown: string) => ({ __html: marked.parse(markdown) });

export function ChatWindow({ messages, isTyping }: ChatWindowProps) {
  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden px-4 py-5 sm:px-6">
      <div className="space-y-4 overflow-y-auto pr-2">
        {messages.map((message, index) => {
          const isUser = message.role === 'user';
          return (
            <div 
              key={`${message.created_at}-${index}`} 
              className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'} animate-message`}
            >
              <div className={`max-w-[85%] rounded-[24px] p-4 shadow-soft border ${
                isUser 
                  ? 'bg-accent text-slate-950 border-sky-400/20' 
                  : 'bg-surface2 text-slate-100 border-slate-800'
              }`}>
                <div className={`mb-1 flex items-center gap-2 text-[10px] uppercase tracking-widest ${isUser ? 'text-slate-900/60' : 'text-slate-500'}`}>
                  <span className="font-bold">{isUser ? 'You' : 'AI Assistant'}</span>
                  <span>•</span>
                  <span>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div
                  className={`markdown-body text-[15px] leading-relaxed ${isUser ? 'prose-invert-dark' : ''}`}
                  dangerouslySetInnerHTML={renderMarkdown(message.content)}
                />
              </div>
            </div>
          );
        })}
      </div>
      {isTyping ? (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-surface3 p-4 text-slate-300">
          Assistant is typing...
        </div>
      ) : null}
    </div>
  );
}
