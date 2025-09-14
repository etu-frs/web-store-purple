import type { Metadata } from 'next';
import './globals.css';
import { ClientProviders } from '@/components/shared/ClientProviders';
import { Toaster } from '@/components/ui/toaster';

// Font imports with error handling for build environments
let belleza: any = { className: '', variable: '--font-belleza' };
let alegreya: any = { className: '', variable: '--font-alegreya' };

try {
  const { Belleza, Alegreya } = require('next/font/google');
  
  belleza = Belleza({
    subsets: ['latin'],
    weight: ['400'],
    variable: '--font-belleza',
    display: 'swap',
  });

  alegreya = Alegreya({
    subsets: ['latin'],
    style: ['normal', 'italic'],
    variable: '--font-alegreya',
    display: 'swap',
  });
} catch (error) {
  console.warn('Google Fonts not available, using fallback fonts');
}

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
