
"use client";

import React from 'react';
import { AppProvider } from '@/contexts/AppContext';
// import { ThemeProvider } from 'next-themes'; // Or your custom theme provider
import StoreChatbot from './StoreChatbot'; // Added chatbot import

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  // If using next-themes:
  // return (
  //   <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  //     <AppProvider>{children}</AppProvider>
  //   </ThemeProvider>
  // );

  // For custom theme handling or just AppProvider:
  return (
    <AppProvider>
      {children}
      <StoreChatbot />
    </AppProvider>
  );
}
