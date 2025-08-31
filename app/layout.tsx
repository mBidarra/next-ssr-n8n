import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Agent + Ingestion | Next + n8n',
};

/**
 * Root layout applies the global background defined in globals.css and wraps children
 * in a flex container for consistent spacing. We intentionally omit any static
 * header markup here; per‑page layouts should handle their own top bar or branding.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-br">
      <body className="min-h-screen text-gray-900">
        {children}
      </body>
    </html>
  );
}