
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, ListOrdered, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import dynamic from 'next/dynamic';
import { PageLoader } from "@/components/shared/PageLoader";

const Navbar = dynamic(() => import('@/components/shared/Navbar').then(mod => mod.Navbar), { 
  ssr: false,
  loading: () => <div className="h-20 bg-card/80 border-b shadow-sm"></div> 
});
const DynamicFooter = dynamic(() => import('@/components/shared/Footer').then(mod => mod.Footer), { 
  ssr: false,
  loading: () => <div className="h-40 bg-muted border-t"></div>
});


export default function TrackOrderPage() {
  const [orderIdInput, setOrderIdInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { getOrderById, appDataLoaded } = useAppContext(); // Use unified loading flag

  const orderIdFromQuery = searchParams.get('orderId');

  useEffect(() => {
    if (!appDataLoaded) return; 

    if (orderIdFromQuery) {
      setOrderIdInput(orderIdFromQuery);
      setIsLoading(true);
      // Use a timeout to give Firestore a moment to deliver the order via snapshot
      setTimeout(() => {
        const orderExists = getOrderById(orderIdFromQuery);
        if (orderExists) {
          router.push(`/order-confirmation/${orderIdFromQuery}`);
        } else {
          toast({
            title: "Order Not Found",
            description: `We couldn't find an order with ID: ${orderIdFromQuery}. Please check the ID and try again.`,
            variant: "destructive",
          });
          setIsLoading(false);
        }
      }, 500); // A small delay might help consistency
    } else {
        if(isLoading && !orderIdInput) {
             setIsLoading(false);
        }
    }
  }, [orderIdFromQuery, appDataLoaded, getOrderById, router, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appDataLoaded) {
      toast({ title: "System Busy", description: "Please wait a moment and try again.", variant: "destructive" });
      return;
    }
    const trimmedOrderId = orderIdInput.trim();
    if (!trimmedOrderId) {
      toast({
        title: "Order ID Required",
        description: "Please enter your order ID to track.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    // No need to check for existence here, just navigate.
    // The useEffect will handle the logic on the destination page.
    router.push(`/track-order?orderId=${trimmedOrderId}`);
  };

  if (!appDataLoaded) {
    return <PageLoader message="Initializing order tracking..." />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <ListOrdered className="mx-auto h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-4xl font-headline">Track Your Order</CardTitle>
              <CardDescription className="text-lg text-muted-foreground font-body">
                Enter your order ID below to see its current status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="orderId" className="flex items-center">
                    <Search className="mr-2 h-4 w-4 text-muted-foreground" /> Order ID
                  </Label>
                  <Input
                    id="orderId"
                    type="text"
                    placeholder="e.g., order_123abc_xyz789"
                    value={orderIdInput}
                    onChange={(e) => setOrderIdInput(e.target.value)}
                    required
                    className="text-base"
                    disabled={isLoading} 
                  />
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-5 w-5" /> Track Order
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <DynamicFooter />
    </div>
  );
}

    