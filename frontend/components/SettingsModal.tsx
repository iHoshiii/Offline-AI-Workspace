import { useState } from 'react';

type ThemeType = 'light' | 'dark' | 'modern';

type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
};

export function SettingsModal({ isOpen, onClose, theme, onThemeChange }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div 
        className="w-full max-w-md overflow-hidden rounded-[32px] border border-border bg-surface shadow-2xl glass-effect"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-8 py-6">
          <h2 className="text-xl font-bold text-text-primary">System Settings</h2>
          <button 
            onClick={onClose} 
            className="rounded-full bg-surface2 p-2 text-text-muted transition-all hover:bg-accent hover:text-white cursor-pointer active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Preferences Section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted opacity-80">Preferences</h3>
            
            <div className="flex flex-col gap-4 rounded-2xl bg-surface2 p-5 border border-border shadow-sm">
              <div>
                <p className="font-bold text-text-primary">Appearance</p>
                <p className="text-xs text-text-muted">Choose your interface style</p>
              </div>
              <div className="grid grid-cols-3 rounded-2xl bg-background p-1.5 border border-border gap-1">
                <button 
                  type="button"
                  onClick={() => onThemeChange('dark')}
                  className={`relative rounded-xl px-2 py-2.5 text-xs font-bold transition-all duration-300 cursor-pointer ${
                    theme === 'dark' 
                    ? 'bg-accent text-white shadow-lg ring-2 ring-accent/20' 
                    : 'text-text-muted hover:bg-accent/10 hover:text-accent'
                  }`}
                >
                  Black
                </button>
                <button 
                  type="button"
                  onClick={() => onThemeChange('modern')}
                  className={`relative rounded-xl px-2 py-2.5 text-xs font-bold transition-all duration-300 cursor-pointer ${
                    theme === 'modern' 
                    ? 'bg-accent text-white shadow-lg ring-2 ring-accent/20' 
                    : 'text-text-muted hover:bg-accent/10 hover:text-accent'
                  }`}
                >
                  Modern
                </button>
                <button 
                  type="button"
                  onClick={() => onThemeChange('light')}
                  className={`relative rounded-xl px-2 py-2.5 text-xs font-bold transition-all duration-300 cursor-pointer ${
                    theme === 'light' 
                    ? 'bg-accent text-white shadow-lg ring-2 ring-accent/20' 
                    : 'text-text-muted hover:bg-accent/10 hover:text-accent'
                  }`}
                >
                  Light
                </button>
              </div>
            </div>
          </div>

          {/* Model Status Section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted opacity-80">System Connectivity</h3>
            <div className="rounded-2xl bg-surface2 p-5 border border-border">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-text-primary">Local Backend</p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Connected
                </div>
              </div>
              <p className="mt-2 text-xs text-text-muted leading-relaxed">Your data is stored locally and never leaves this machine.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border px-8 py-6 flex justify-end">
          <button 
            onClick={onClose}
            className="rounded-2xl bg-accent px-10 py-3 text-sm font-bold text-white shadow-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
