
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Frown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
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


export default function CartPage() {
  const { cart, updateCartQuantity, removeFromCart, clearCart, appDataLoaded } = useAppContext();

  if (!appDataLoaded) {
    return <PageLoader message="Loading your cart..." />;
  }

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateCartQuantity(productId, Math.max(0, newQuantity));
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const subtotal = calculateSubtotal();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-headline font-bold text-center mb-12">Your Shopping Cart</h1>

        {cart.length === 0 ? (
          <Card className="text-center py-12 shadow-lg">
            <CardHeader>
                <Frown className="mx-auto h-16 w-16 text-primary mb-4" />
              <CardTitle className="text-3xl font-headline">Your Cart is Empty</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6 font-body">Looks like you haven't added any items yet. Start exploring!</p>
              <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/products">
                  <ShoppingBag className="mr-2 h-5 w-5" /> Shop Now
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {cart.map((item) => (
                <Card key={item.productId} className="flex flex-col sm:flex-row items-center p-4 shadow-md">
                  <Link href={`/products/${item.productId}`} className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 relative rounded-md overflow-hidden mr-0 sm:mr-6 mb-4 sm:mb-0">
                    <Image src={item.image} alt={item.name} layout="fill" objectFit="cover" data-ai-hint="product image"/>
                  </Link>
                  <div className="flex-grow text-center sm:text-left">
                    <Link href={`/products/${item.productId}`} className="hover:text-primary">
                      <h2 className="text-xl font-headline mb-1">{item.name}</h2>
                    </Link>
                    <p className="text-muted-foreground text-sm mb-2">${item.price.toFixed(2)} per unit</p>
                    <div className="flex items-center justify-center sm:justify-start space-x-2 mb-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.productId, item.quantity - 1)} disabled={item.quantity <= 1} aria-label={`Decrease quantity of ${item.name}`}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val)) {
                                handleQuantityChange(item.productId, Math.max(1, Math.min(val, item.stock)));
                            }
                        }}
                        onBlur={(e) => { 
                            if(e.target.value === '' || parseInt(e.target.value) < 1) {
                                handleQuantityChange(item.productId, 1);
                            }
                        }}
                        min="1"
                        max={item.stock}
                        className="w-16 h-8 text-center px-1"
                        aria-label={`Quantity for ${item.name}`}
                      />
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.productId, item.quantity + 1)} disabled={item.quantity >= item.stock} aria-label={`Increase quantity of ${item.name}`}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                     {item.quantity >= item.stock && item.stock > 0 && <p className="text-xs text-orange-500">Max stock ({item.stock}) reached.</p>}
                     {item.stock === 0 && <p className="text-xs text-red-500">Out of stock.</p>}
                  </div>
                  <div className="flex flex-col items-center sm:items-end ml-0 sm:ml-auto mt-4 sm:mt-0">
                    <p className="text-lg font-semibold text-primary mb-2 sm:mb-4">${(item.price * item.quantity).toFixed(2)}</p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" aria-label={`Remove ${item.name} from cart`}>
                          <X className="h-5 w-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Item?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove "{item.name}" from your cart?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => removeFromCart(item.productId)} className="bg-destructive hover:bg-destructive/90">Remove</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              ))}
              <div className="text-right mt-6">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive" aria-label="Clear entire cart">
                      <Trash2 className="mr-2 h-4 w-4" /> Clear Cart
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear Entire Cart?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove all items from your shopping cart? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={clearCart} className="bg-destructive hover:bg-destructive/90">Clear Cart</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-headline">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xl font-semibold">
                    <span>Total</span>
                    <span className="text-primary">${subtotal.toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" asChild disabled={cart.length === 0}>
                    <Link href="/checkout">
                      Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>
      <DynamicFooter />
    </div>
  );
}
