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
    <div className="mt-4 flex w-full items-end gap-3 rounded-3xl border border-slate-700 bg-surface p-4">
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
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-800 text-slate-400 transition hover:bg-slate-700 hover:text-slate-100"
        title="Upload PDF, TXT, MD, or DOCX"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
      </button>
      <textarea
        value={value}
        rows={2}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            onSubmit();
          }
        }}
        className="min-h-[72px] w-full resize-none rounded-2xl border border-slate-700 bg-surface px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        placeholder="Ask anything or upload a file (PDF, TXT, MD, DOCX)…"
      />
      <button
        type="button"
        disabled={disabled || !value.trim()}
        onClick={onSubmit}
        className="inline-flex h-12 shrink-0 items-center justify-center rounded-2xl bg-accent px-5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Send
      </button>
    </div>
  );
}
