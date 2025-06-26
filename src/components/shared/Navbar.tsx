
"use client";

import Link from 'next/link';
import { ShoppingCart, Heart, User, Sun, Moon, Menu, Home, Package, MessageSquare, ListOrdered, LogIn, Settings, Lock, MessageSquarePlus } from 'lucide-react'; // Added MessageSquarePlus
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle as RadixDialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const navLinksDefinition = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products", label: "Products", icon: Package },
  { href: "/qna", label: "Q&A", icon: MessageSquare },
  { href: "/track-order", label: "Track Order", icon: ListOrdered },
];

const NavbarComponent = () => {
  const { cart, wishlist, theme, toggleTheme, isAdminAuthenticated, adminLogin, adminLogout, isAuthInitialized, appDataLoaded, isChatbotIconVisible, setIsChatbotIconVisible, homepageSettings } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistItemCount = wishlist.length;

  const [animateBadge, setAnimateBadge] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    if (cartItemCount > 0) {
      intervalId = setInterval(() => {
        setAnimateBadge(true);
        timeoutId = setTimeout(() => {
          setAnimateBadge(false);
        }, 500); 
      }, 10000); 
    } else {
      setAnimateBadge(false); 
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
      setAnimateBadge(false); 
    };
  }, [cartItemCount]);


  const handleAdminLoginSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (adminLogin(loginPassword)) {
      setIsLoginDialogOpen(false);
      setLoginPassword('');
      router.push('/admin');
    } else {
      setLoginError('Invalid password. Please try again.');
    }
  }, [adminLogin, loginPassword, router]);
  
  const handleRestoreChatbot = () => {
    setIsChatbotIconVisible(true);
    toast({
        title: "Chatbot Restored",
        description: "The chatbot icon is back!",
    });
    if (isSheetOpen) setIsSheetOpen(false); // Close sheet if open
  };
  
  const commonNavButtons = useCallback((isMobile = false) => (
      <>
        {navLinksDefinition.map(link => (
          <Button key={link.href} variant="ghost" asChild className={`justify-start ${isMobile ? 'w-full text-lg py-3' : ''}`}>
            <Link href={link.href} onClick={() => isMobile && setIsSheetOpen(false)}>
              <link.icon className="mr-2 h-5 w-5" />
              {link.label}
            </Link>
          </Button>
        ))}
        {isAdminAuthenticated && ( 
          <Button variant="ghost" asChild className={`justify-start ${isMobile ? 'w-full text-lg py-3' : ''}`}>
            <Link href="/admin" onClick={() => isMobile && setIsSheetOpen(false)}>
              <Settings className="mr-2 h-5 w-5" />
              Admin
            </Link>
          </Button>
        )}
      </>
    ), [isAdminAuthenticated]);

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="text-3xl font-headline font-bold text-primary">
            {homepageSettings.storeName || 'MyDukaan'}
          </Link>

          <div className="hidden lg:flex items-center space-x-2"> 
            {commonNavButtons()}
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2">
            {!isChatbotIconVisible && (
                <Button variant="ghost" size="icon" onClick={handleRestoreChatbot} aria-label="Restore Chatbot" title="Restore Chatbot">
                    <MessageSquarePlus className="h-6 w-6 text-primary" />
                </Button>
            )}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/cart" aria-label={`Shopping Cart, ${cartItemCount} items`} className="relative">
                <ShoppingCart className="h-6 w-6" />
                {appDataLoaded && cartItemCount > 0 && (
                  <Badge variant="destructive" className={cn(
                    "absolute top-1 right-1 h-4 w-4 p-0 flex items-center justify-center text-xs transform-gpu",
                    animateBadge && "animate-pulse-badge"
                  )}>
                    {cartItemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            <Button variant="ghost" size="icon" asChild className="hidden lg:flex relative">
              <Link href="/wishlist" aria-label={`Wishlist, ${wishlistItemCount} items`}>
                <Heart className="h-6 w-6" />
                {appDataLoaded && wishlistItemCount > 0 && (
                  <Badge variant="destructive" className="absolute top-1 right-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
                    {wishlistItemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={`Toggle theme to ${theme === 'light' ? 'dark' : 'light'} mode`} className="hidden lg:flex">
              {theme === 'light' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
            </Button>

            {isAuthInitialized && (
              <div className="hidden lg:flex">
                {isAdminAuthenticated ? (
                  <Button variant="outline" size="sm" onClick={() => { adminLogout(); router.push('/'); }} aria-label="Admin logout">
                    <LogIn className="mr-2 h-4 w-4 transform rotate-180" /> Logout
                  </Button>
                ) : (
                  <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" aria-label="Admin login">
                        <User className="mr-2 h-4 w-4" /> Login
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                )}
              </div>
            )}


            <div className="lg:hidden">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open menu">
                    <Menu className="h-7 w-7" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-xs p-6 overflow-y-auto">
                  <SheetTitle className="sr-only">Main menu</SheetTitle>
                  <div className="flex flex-col space-y-3">
                    <Link href="/" className="text-2xl font-headline font-bold text-primary mb-4" onClick={() => setIsSheetOpen(false)}>
                       {homepageSettings.storeName || 'MyDukaan'}
                    </Link>
                    
                    {commonNavButtons(true)}

                    {!isChatbotIconVisible && (
                         <Button variant="ghost" onClick={handleRestoreChatbot} className="w-full justify-start text-lg py-3" aria-label="Restore Chatbot">
                            <MessageSquarePlus className="mr-2 h-5 w-5 text-primary" /> Restore Chatbot
                        </Button>
                    )}
                    <Button variant="ghost" asChild className="w-full justify-start text-lg py-3">
                      <Link href="/wishlist" onClick={() => setIsSheetOpen(false)}>
                        <Heart className="mr-2 h-5 w-5" />
                        Wishlist {appDataLoaded && wishlistItemCount > 0 && <Badge variant="destructive" className="ml-auto">{wishlistItemCount}</Badge>}
                      </Link>
                    </Button>
                    
                    <Button variant="ghost" onClick={() => { toggleTheme(); setIsSheetOpen(false); }} className="w-full justify-start text-lg py-3" aria-label={`Toggle theme to ${theme === 'light' ? 'dark' : 'light'} mode`}>
                      {theme === 'light' ? <Moon className="mr-2 h-5 w-5" /> : <Sun className="mr-2 h-5 w-5" />}
                      Toggle Theme
                    </Button>

                    {isAuthInitialized && (
                      isAdminAuthenticated ? (
                        <Button variant="outline" className="w-full text-lg py-3" onClick={() => { adminLogout(); router.push('/'); setIsSheetOpen(false); }} aria-label="Admin logout">
                          <LogIn className="mr-2 h-5 w-5 transform rotate-180" /> Logout
                        </Button>
                      ) : (
                        <Dialog open={isLoginDialogOpen} onOpenChange={(open) => { if (!open) {setLoginError(''); setLoginPassword('');} setIsLoginDialogOpen(open); }}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full text-lg py-3" onClick={() => {setIsSheetOpen(false); setIsLoginDialogOpen(true); }} aria-label="Admin login">
                                    <User className="mr-2 h-5 w-5" /> Login
                                </Button>
                            </DialogTrigger>
                          </Dialog>
                      )
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {isAuthInitialized && !isAdminAuthenticated && ( 
        <Dialog open={isLoginDialogOpen} onOpenChange={(open) => { if (!open) { setLoginError(''); setLoginPassword(''); } setIsLoginDialogOpen(open); }}>
            <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <RadixDialogTitle className="font-headline text-2xl">Admin Login</RadixDialogTitle>
                <DialogDescription>
                Enter your password to access the admin dashboard.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdminLoginSubmit} className="grid gap-4 py-4">
                <div className="space-y-2">
                <Label htmlFor="password-modal-main" className="flex items-center">
                    <Lock className="mr-2 h-4 w-4 text-muted-foreground" /> Password
                </Label>
                <Input
                    id="password-modal-main"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                />
                </div>
                {loginError && (
                <p className="text-sm text-destructive">{loginError}</p>
                )}
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => {setIsLoginDialogOpen(false); setLoginError(''); setLoginPassword('');}}>Cancel</Button>
                    <Button type="submit">
                        <LogIn className="mr-2 h-5 w-5" /> Login
                    </Button>
                </DialogFooter>
            </form>
            </DialogContent>
        </Dialog>
      )}
    </nav>
  );
};
NavbarComponent.displayName = "NavbarComponent"; 
export const Navbar = React.memo(NavbarComponent);
