
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger, SidebarInset, useSidebar } from '@/components/ui/sidebar';
import { Home, Package, ListOrdered, MessageSquareText, BarChart3, Users, Settings, LogOut, ShieldAlert, Moon, Sun, Loader2, ExternalLink, LayoutDashboard, TicketPercent, BrainCircuit, Bot } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';


// Custom Header component to access sidebar state for conditional rendering
const CustomSidebarHeader = () => {
  const { homepageSettings } = useAppContext();
  // useSidebar hook can only be called from a component wrapped in SidebarProvider
  // To use it here, CustomSidebarHeader must be a child of Sidebar or called from a component that is.
  // For simplicity in this direct modification, we'll rely on group-data attributes.
  return (
    <SidebarHeader className="p-4 group-data-[state=collapsed]:py-4 group-data-[state=collapsed]:px-2">
      <div className="flex items-center group-data-[state=expanded]:justify-between group-data-[state=collapsed]:justify-center">
        <Link href="/admin" className="text-2xl font-headline font-bold text-sidebar-primary group-data-[state=collapsed]:hidden">
          {homepageSettings.storeName || 'MyDukaan'}
        </Link>
        <SidebarTrigger /> {/* This trigger will now always be visible and toggle the state */}
      </div>
    </SidebarHeader>
  );
};


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdminAuthenticated, adminLogout, theme, toggleTheme, isAuthInitialized, homepageSettings } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isAuthInitialized && !isAdminAuthenticated && pathname.startsWith('/admin') && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [isAuthInitialized, isAdminAuthenticated, router, pathname]);

  if (!isAuthInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2"/> Authenticating...
      </div>
    );
  }

  if (!isAdminAuthenticated && pathname.startsWith('/admin') && pathname !== '/admin/login') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <ShieldAlert className="h-8 w-8 text-destructive mr-2"/> Redirecting to login...
      </div>
    );
  }

  if (!isAdminAuthenticated && pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isAdminAuthenticated && pathname.startsWith('/admin')) {
      const adminNavLinks = [
        { href: "/admin", label: "Dashboard", icon: Home },
        { href: "/admin/homepage-settings", label: "Homepage", icon: LayoutDashboard },
        { href: "/admin/products", label: "Products", icon: Package },
        { href: "/admin/orders", label: "Orders", icon: ListOrdered },
        { href: "/admin/coupons", label: "Coupons", icon: TicketPercent },
        { href: "/admin/qna", label: "Q&A", icon: MessageSquareText },
        { href: "/admin/reviews", label: "Reviews", icon: Users },
        { href: "/admin/reports", label: "Reports", icon: BarChart3 },
        { href: "/admin/ai-analytics", label: "AI Analytics", icon: BrainCircuit },
        { href: "/admin/chatbot-settings", label: "Chatbot", icon: Bot },
      ];

      return (
        <SidebarProvider defaultOpen>
          <Sidebar collapsible="icon" side="left" variant="sidebar" className="border-r">
            <CustomSidebarHeader />
            <SidebarContent className="p-2">
              <SidebarMenu>
                {adminNavLinks.map(link => (
                  <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href))}
                      tooltip={{children: link.label, side: 'right', className: 'font-body'}}
                    >
                      <Link href={link.href}>
                        <link.icon />
                        <span>{link.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="p-4 border-t">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            tooltip={{children: "Return to Store", side: 'right', className: 'font-body'}}
                        >
                            <Link href="/">
                                <ExternalLink />
                                <span>Return to Store</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={toggleTheme}
                            tooltip={{children: `Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`, side: 'right', className: 'font-body'}}
                        >
                            {theme === 'light' ? <Moon /> : <Sun />}
                            <span>Toggle Theme</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={() => { adminLogout(); router.push('/'); }}
                            className="hover:bg-destructive/20 hover:text-destructive"
                            tooltip={{children: "Logout", side: 'right', className: 'font-body'}}
                        >
                            <LogOut />
                            <span>Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset className="bg-muted/30">
            <div className="flex items-center justify-between p-4 border-b md:hidden sticky top-0 bg-background z-30">
                <Link href="/admin" className="text-xl font-headline font-bold text-primary">
                  {homepageSettings.storeName || 'MyDukaan'} Admin
                </Link>
                <SidebarTrigger />
            </div>
            <div className="p-4 md:p-6 lg:p-8">
            {children}
            </div>
          </SidebarInset>
          <Toaster />
        </SidebarProvider>
      );
  }

  return <>{children}</>;
}
