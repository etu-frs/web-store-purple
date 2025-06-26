
"use client";

import { Loader2 } from 'lucide-react';
import React from 'react';

const PageLoaderComponent: React.FC<{ message?: string }> = ({ message = "Loading MyDukaan..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] w-full bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg text-muted-foreground font-body">{message}</p>
    </div>
  );
};
PageLoaderComponent.displayName = 'PageLoaderComponent';
export const PageLoader = React.memo(PageLoaderComponent);
