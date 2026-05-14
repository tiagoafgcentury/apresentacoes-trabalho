import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Portal de Apresentações | Century',
  description: 'Portal interno de apresentações executivas da Century.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className} style={{ margin: 0, padding: 0, background: '#020617' }} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
