import { type MouseEvent } from 'react';

type Conversation = {
  id: number;
  title: string;
};

type SidebarProps = {
  conversations: Conversation[];
  activeConversationId: number | null;
  onSelectConversation: (conversationId: number) => void;
  onCreateConversation: () => void;
};

export function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onCreateConversation,
}: SidebarProps) {
  return (
    <aside className="h-full w-full max-w-xs border-r border-border bg-surface2 px-4 py-5 text-sm text-slate-200">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Conversations</p>
          <h1 className="mt-2 text-lg font-semibold">Workspace</h1>
        </div>
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

      <div className="space-y-2">
        {conversations.length === 0 ? (
          <div className="rounded-2xl bg-surface p-4 text-sm text-slate-400">
            No conversations yet. Start a new chat.
          </div>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              className={
                'w-full rounded-2xl border p-4 text-left transition ' +
                (conversation.id === activeConversationId
                  ? 'border-accent bg-surface3 text-white'
                  : 'border-transparent bg-surface hover:border-slate-600')
              }
              onClick={() => onSelectConversation(conversation.id)}
            >
              <p className="font-medium text-slate-100">{conversation.title}</p>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
