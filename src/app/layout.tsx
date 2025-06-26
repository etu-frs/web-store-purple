import type { Metadata } from 'next';
import './globals.css';
import { ClientProviders } from '@/components/shared/ClientProviders';
import { Toaster } from '@/components/ui/toaster';
import { Belleza, Alegreya } from 'next/font/google';

const belleza = Belleza({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-belleza',
  display: 'swap',
});

const alegreya = Alegreya({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-alegreya',
  display: 'swap',
});

// Simplified metadata to prevent build errors and ensure stability
export const metadata: Metadata = {
    title: 'MyDukaan - Your Online Store',
    description: `Discover a wide range of products at MyDukaan. Your one-stop shop for electronics, books, clothing, home goods, and more. Quality products and excellent customer service.`,
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${belleza.className} ${alegreya.className}`}>
      <head>
        <link rel="preconnect" href="https://placehold.co" />
      </head>
      <body className="font-body antialiased">
        <ClientProviders>
          {children}
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  );
}
