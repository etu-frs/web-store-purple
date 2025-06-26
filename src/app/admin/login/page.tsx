
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, LogIn, ArrowLeft } from 'lucide-react';
import Image from 'next/image';


export default function AdminLoginPage() {
  const { isAdminAuthenticated, adminLogin, homepageSettings } = useAppContext();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAdminAuthenticated) {
      router.push('/admin');
    }
  }, [isAdminAuthenticated, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (adminLogin(password)) {
      router.push('/admin');
    } else {
      setError('Invalid password. Please try again.');
    }
  };

  // Prevent re-render if already authenticated and navigating away
  if (isAdminAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="font-body">Redirecting to admin dashboard...</p>
    </div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
           <Link href="/" className="text-3xl font-headline font-bold text-primary mx-auto mb-4">
            {homepageSettings.storeName || 'MyDukaan'}
          </Link>
          <CardTitle className="text-3xl font-headline">Admin Login</CardTitle>
          <CardDescription className="font-body">
            Enter your password to access the {homepageSettings.storeName || 'MyDukaan'} dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center font-body">
                <Lock className="mr-2 h-4 w-4 text-muted-foreground" /> Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-base"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive font-body">{error}</p>
            )}
            <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-body">
              <LogIn className="mr-2 h-5 w-5" /> Login
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Return to Store
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
