import { useState } from 'react';

type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
};

export function SettingsModal({ isOpen, onClose, theme, onThemeChange }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-[32px] border border-border bg-surface shadow-premium glass-effect">
        <div className="flex items-center justify-between border-b border-border px-8 py-6">
          <h2 className="text-xl font-bold text-text-primary">System Settings</h2>
          <button onClick={onClose} className="rounded-full bg-surface2 p-2 text-text-muted transition hover:bg-surface3 hover:text-text-primary">
            ✕
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Preferences Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">Preferences</h3>
            
            <div className="flex items-center justify-between rounded-2xl bg-surface2 p-4 border border-border">
              <div>
                <p className="font-medium text-text-primary">Appearance</p>
                <p className="text-xs text-text-muted">Toggle between dark and light mode</p>
              </div>
              <div className="flex rounded-xl bg-background p-1 border border-border">
                <button 
                  onClick={() => onThemeChange('light')}
                  className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${theme === 'light' ? 'bg-accent text-white shadow-lg' : 'text-text-muted hover:text-text-primary'}`}
                >
                  Light
                </button>
                <button 
                  onClick={() => onThemeChange('dark')}
                  className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${theme === 'dark' ? 'bg-accent text-white shadow-lg' : 'text-text-muted hover:text-text-primary'}`}
                >
                  Dark
                </button>
              </div>
            </div>
          </div>

          {/* Model Info Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">Model Configuration</h3>
            <div className="rounded-2xl bg-surface2 p-4 border border-border">
              <p className="text-sm text-text-primary">Current Model: <span className="font-mono text-accent">phi3:latest</span></p>
              <p className="mt-2 text-xs text-text-muted">Running on local Ollama instance (127.0.0.1:11434)</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border px-8 py-6 flex justify-end">
          <button 
            onClick={onClose}
            className="rounded-2xl bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:opacity-80 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
