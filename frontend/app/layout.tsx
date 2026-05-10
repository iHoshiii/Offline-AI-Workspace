import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Offline AI Workspace',
  description: 'Offline-first AI assistant optimized for low-end hardware.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
