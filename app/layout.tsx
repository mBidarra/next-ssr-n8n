import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Agent + Ingestion | Next + n8n',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-br">
      <body className="min-h-screen text-gray-900">
        {children}
      </body>
    </html>
  );
}