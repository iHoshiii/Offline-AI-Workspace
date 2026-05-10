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
            <div key={`${message.created_at}-${index}`} className="rounded-3xl border border-slate-800 bg-surface3 p-4 shadow-soft">
              <div className="mb-2 flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-slate-500">
                <span>{isUser ? 'You' : 'Assistant'}</span>
                <span>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div
                className="prose prose-invert prose-p:text-slate-200 prose-a:text-accent prose-pre:bg-slate-900 prose-code:bg-slate-900 prose-code:px-1 prose-code:rounded"
                dangerouslySetInnerHTML={renderMarkdown(message.content)}
              />
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
