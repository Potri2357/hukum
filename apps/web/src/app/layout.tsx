import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Hukum — Premium High-Scale E-Commerce Marketplace',
  description:
    'Discover, compare and buy premium electronics with blazing speed, instant prefix search, and horizontal scalability.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-surface text-ink-900 antialiased">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
