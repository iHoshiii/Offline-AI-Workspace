import { useRef } from 'react';

type MessageInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export function MessageInput({ value, onChange, onSubmit, disabled }: MessageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // We will handle the upload logic in page.tsx
      const event = new CustomEvent('upload-file', { detail: file });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="relative flex w-full flex-col gap-2">
      <div className="glass-effect relative flex items-end gap-2 rounded-[28px] border border-slate-700/50 p-2 shadow-premium transition-all focus-within:border-accent/50 focus-within:ring-4 focus-within:ring-accent/10">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.txt,.md,.docx"
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-800/50 text-slate-400 transition hover:bg-slate-700 hover:text-slate-100"
          title="Upload document"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </button>

        <textarea
          value={value}
          rows={1}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              onSubmit();
            }
          }}
          className="max-h-48 min-h-[44px] w-full resize-none bg-transparent px-2 py-3 text-[15px] leading-relaxed text-slate-100 placeholder-slate-500 outline-none"
          placeholder="Ask your local AI..."
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${target.scrollHeight}px`;
          }}
        />

        <button
          type="button"
          disabled={disabled || !value.trim()}
          onClick={onSubmit}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-slate-950 transition-all hover:scale-105 hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>
      <p className="px-4 text-[10px] text-slate-500 text-center uppercase tracking-widest">
        Local & Private · {disabled ? 'Processing...' : 'Ready'}
      </p>
    </div>
  );
}
