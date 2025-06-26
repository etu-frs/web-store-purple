
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image'; 
import { useAppContext } from '@/contexts/AppContext';
import type { Order, OrderStatusUpdate } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertTriangle, ShoppingBag, Home, Truck, PackageCheck, CheckSquare, ClipboardList, XCircle, Package, Loader2, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import dynamic from 'next/dynamic';
import { PageLoader } from "@/components/shared/PageLoader";
import { useToast } from '@/hooks/use-toast'; // Import useToast

const Navbar = dynamic(() => import('@/components/shared/Navbar').then(mod => mod.Navbar), { 
  ssr: false,
  loading: () => <div className="h-20 bg-card/80 border-b shadow-sm"></div> 
});
const DynamicFooter = dynamic(() => import('@/components/shared/Footer').then(mod => mod.Footer), { 
  ssr: false,
  loading: () => <div className="h-40 bg-muted border-t"></div>
});


const statusIcons: Record<OrderStatusUpdate['status'], React.ElementType> = {
  'Pending Approval': ClipboardList,
  'Processing': Package,
  'Ready for Shipment': PackageCheck,
  'Shipped': Truck,
  'Out for Delivery': Truck,
  'Delivered': CheckSquare,
  'Cancelled': XCircle,
  'Refunded': XCircle, 
};


export default function OrderConfirmationPage() {
  const routeParams = useParams();
  const router = useRouter();
  const { getOrderById, appDataLoaded } = useAppContext();
  const { toast } = useToast(); // Initialize toast
  
  const [currentOrderId, setCurrentOrderId] = useState<string>('');
  const [order, setOrder] = useState<Order | null | undefined>(undefined); 

  useEffect(() => {
    const oidFromParams = routeParams.orderId;
    if (typeof oidFromParams === 'string') {
      setCurrentOrderId(oidFromParams);
    } else {
      setCurrentOrderId('');
    }
  }, [routeParams.orderId]);

  useEffect(() => {
    if (currentOrderId && appDataLoaded) { // Fetch order only if appDataLoaded
      const foundOrder = getOrderById(currentOrderId);
      setOrder(foundOrder); // Will be null if not found, or the order object
    } else if (!appDataLoaded) {
      setOrder(undefined); // Still loading app data
    }
  }, [currentOrderId, getOrderById, appDataLoaded]); 

  const handleCopyOrderId = async (orderIdToCopy: string) => {
    try {
      await navigator.clipboard.writeText(orderIdToCopy);
      toast({
        title: "Copied to Clipboard!",
        description: `Order ID: ${orderIdToCopy} has been copied.`,
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy Order ID to clipboard.",
        variant: "destructive",
      });
      console.error('Failed to copy order ID: ', err);
    }
  };

  if (!appDataLoaded || order === undefined) {
    return <PageLoader message={appDataLoaded ? `Loading order ${currentOrderId}...` : "Initializing..."} />;
  }

  if (!order) { // appDataLoaded is true, but order not found
    return (
      <>
        <Navbar />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center text-center min-h-[calc(100vh-15rem)]">
          <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
          <h1 className="text-3xl font-headline mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find an order with the ID: <span className="font-mono">{currentOrderId || "N/A"}</span>.
            Please check the ID or contact support if you believe this is an error.
          </p>
          <div className="flex space-x-4">
            <Button asChild variant="outline">
                <Link href="/">
                    <Home className="mr-2 h-4 w-4"/> Go to Homepage
                </Link>
            </Button>
            <Button asChild>
                <Link href="/products">
                    <ShoppingBag className="mr-2 h-4 w-4"/> Continue Shopping
                </Link>
            </Button>
          </div>
        </main>
        <DynamicFooter />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="max-w-3xl mx-auto shadow-xl">
          <CardHeader className="text-center bg-primary/10 py-8">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <CardTitle className="text-4xl font-headline text-primary">Order Confirmed!</CardTitle>
            <CardDescription className="text-lg text-muted-foreground font-body mt-2">
              Thank you for your purchase, {order.customerName}!
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="text-center">
                <div className="text-muted-foreground inline-flex items-center">
                  <span>Your Order ID is: </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleCopyOrderId(order.id)} 
                    className="p-0 h-auto ml-1 group"
                    aria-label={`Copy order ID ${order.id}`}
                    title="Click to copy Order ID"
                  >
                    <Badge variant="secondary" className="text-base px-3 py-1 group-hover:bg-primary/20 transition-colors">
                      {order.id}
                      <Copy className="ml-2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Badge>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Order placed on: {format(new Date(order.createdAt), 'PPPp')}</p>
            </div>
            
            <Separator />

             <div>
                <h3 className="text-xl font-semibold mb-3 font-headline">Order Status Timeline</h3>
                <ScrollArea className="max-h-60 pr-2">
                    <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-2">                  
                    {order.statusHistory.map((statusUpdate, index) => { // Already sorted by timestamp desc in context
                        const IconComponent = statusIcons[statusUpdate.status] || ClipboardList;
                        const isCurrent = statusUpdate.status === order.currentStatus && index === 0; // Check if it's the most recent AND matches currentStatus

                        return (
                        <li key={index} className="mb-6 ml-6 last:mb-0">            
                            <span className={`absolute flex items-center justify-center w-6 h-6 bg-primary/20 rounded-full -left-3 ring-4 ring-background ${isCurrent ? 'ring-primary/50' : ''}`}>
                                <IconComponent className="w-3 h-3 text-primary" />
                            </span>
                            <h4 className="flex items-center mb-0.5 text-md font-semibold text-gray-900 dark:text-white">
                                {statusUpdate.status}
                                {isCurrent && ( 
                                    <Badge variant="default" className="ml-2 capitalize bg-primary/80 text-primary-foreground">{order.currentStatus}</Badge>
                                )}
                            </h4>
                            <time className="block mb-1 text-xs font-normal leading-none text-gray-400 dark:text-gray-500">
                                {format(new Date(statusUpdate.timestamp), 'MMM d, yyyy, HH:mm')}
                            </time>
                            {statusUpdate.notes && <p className="text-xs font-normal text-gray-500 dark:text-gray-400 bg-muted/30 p-1 rounded-md">{statusUpdate.notes}</p>}
                        </li>
                        );
                    })}
                    </ol>
                </ScrollArea>
            </div>


            <Separator />

            <div>
              <h3 className="text-xl font-semibold mb-3 font-headline">Order Summary</h3>
              <ScrollArea className="max-h-48 pr-2">
                {order.items.map(item => (
                  <div key={item.productId} className="flex justify-between items-center py-3 border-b last:border-b-0">
                    <div className="flex items-center">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </ScrollArea>
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2 font-headline">Shipping Address</h3>
                    <address className="not-italic text-muted-foreground text-sm space-y-0.5">
                        <p>{order.shippingAddress.fullName}</p>
                        <p>{order.shippingAddress.streetAddress}</p>
                        <p>{order.shippingAddress.district}, {order.shippingAddress.state}</p>
                        <p>Phone: {order.shippingAddress.phone}</p>
                    </address>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2 font-headline">Payment Information</h3>
                    <p className="text-sm text-muted-foreground">Method: {order.paymentMethod}</p>
                    {order.paymentMethod === 'Credit Card' && <p className="text-xs text-muted-foreground italic">(Details are securely processed and not stored here)</p>}
                </div>
            </div>
            
            <Separator />
            
            <div className="space-y-1 text-right">
              {order.discountAmount && order.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>${(order.totalPrice + order.discountAmount).toFixed(2)}</span>
                </div>
              )}
               {order.discountAmount && order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                    <span className="text-muted-foreground">Discount ({order.discountCode}):</span>
                    <span>-${order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Paid:</span>
                <span className="text-primary">${order.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <Separator />

            <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                    We'll send you an email when your order ships. You can track your order status using your order ID.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Button asChild variant="outline">
                    <Link href="/">
                        <Home className="mr-2 h-4 w-4"/> Back to Homepage
                    </Link>
                </Button>
                 <Button asChild>
                    <Link href="/products">
                        <ShoppingBag className="mr-2 h-4 w-4"/> Continue Shopping
                    </Link>
                </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <DynamicFooter />
    </>
  );
}
    

    
