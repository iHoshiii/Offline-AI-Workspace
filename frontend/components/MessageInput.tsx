type MessageInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export function MessageInput({ value, onChange, onSubmit, disabled }: MessageInputProps) {
  return (
    <div className="mt-4 flex w-full items-end gap-3 rounded-3xl border border-slate-700 bg-surface p-4">
      <textarea
        value={value}
        rows={2}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[72px] w-full resize-none rounded-2xl border border-slate-700 bg-surface px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        placeholder="Ask anything…"
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
