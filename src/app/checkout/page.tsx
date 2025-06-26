
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ShoppingBag, CreditCard, ArrowRight, AlertTriangle, User, Phone, MapPin, Building, Landmark, CalendarDays, LockKeyhole, Loader2, LocateFixed, TicketPercent } from 'lucide-react';
import type { OrderAddress, PaymentMethod, OrderItem, Order, DiscountCoupon } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { PageLoader } from "@/components/shared/PageLoader";

const Navbar = dynamic(() => import('@/components/shared/Navbar').then(mod => mod.Navbar), {
  ssr: false,
  loading: () => <div className="h-20 bg-card/80 border-b shadow-sm"></div>
});
const DynamicFooter = dynamic(() => import('@/components/shared/Footer').then(mod => mod.Footer), {
  ssr: false,
  loading: () => <div className="h-40 bg-muted border-t"></div>
});


const addressSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  state: z.string().min(2, "State/Province is required"),
  district: z.string().min(2, "District/City is required"),
  streetAddress: z.string().min(5, "Street address is required"),
});

const creditCardSchema = z.object({
  cardNumber: z.string().regex(/^\d{13,19}$/, "Invalid card number").optional().or(z.literal('')),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "MM/YY format required").optional().or(z.literal('')), // MM/YY
  cvv: z.string().regex(/^\d{3,4}$/, "Invalid CVV").optional().or(z.literal('')),
}).optional();


const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  paymentMethod: z.enum(['Credit Card', 'PayPal', 'Cash on Delivery', 'Loyalty Points', 'Gift Card'], {
    required_error: "Please select a payment method."
  }),
  creditCardDetails: creditCardSchema,
  discountCode: z.string().optional(),
}).refine(data => {
    if (data.paymentMethod === 'Credit Card') {
        return data.creditCardDetails?.cardNumber && data.creditCardDetails?.expiryDate && data.creditCardDetails?.cvv;
    }
    return true;
}, {
    message: "Credit card details are required for this payment method.",
    path: ["creditCardDetails"],
});


type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const PAYMENT_METHODS: PaymentMethod[] = ['Credit Card', 'PayPal', 'Cash on Delivery', 'Loyalty Points', 'Gift Card'];

export default function CheckoutPage() {
  const { cart, addOrder, getDiscountCouponByCode, appDataLoaded, hasUserUsedCoupon } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();
  const [hasMounted, setHasMounted] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<DiscountCoupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: {
        fullName: '',
        phone: '',
        state: '',
        district: '',
        streetAddress: '',
      },
      paymentMethod: undefined,
      creditCardDetails: {
        cardNumber: '',
        expiryDate: '',
        cvv: '',
      },
      discountCode: '',
    },
  });

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const total = subtotal - discountAmount;
  const selectedPaymentMethod = form.watch("paymentMethod");

  const handleApplyDiscountCode = () => {
    const code = form.getValues("discountCode")?.trim().toUpperCase();
    if (!code) {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      toast({ title: "No Code Entered", description: "Please enter a discount code to apply.", variant: "destructive" });
      return;
    }
    
    // Reset previous coupon if a new one is entered
    setAppliedCoupon(null);
    setDiscountAmount(0);

    const coupon = getDiscountCouponByCode(code);

    if (!coupon) {
      toast({ title: "Invalid Coupon", description: `Coupon code "${code}" is not valid.`, variant: "destructive" });
      return;
    }
    if (!coupon.isActive) {
      toast({ title: "Coupon Inactive", description: `Coupon "${code}" is no longer active.`, variant: "destructive" });
      return;
    }
    if (coupon.expiresAt && coupon.expiresAt < Date.now()) {
        toast({ title: "Coupon Expired", description: `Coupon "${code}" has expired.`, variant: "destructive" });
        return;
    }
    if (coupon.usageLimit && (coupon.timesUsed ?? 0) >= coupon.usageLimit) {
        toast({ title: "Coupon Limit Reached", description: `Coupon "${code}" has been fully used.`, variant: "destructive" });
        return;
    }
    if (hasUserUsedCoupon(code)) {
        toast({ title: "Coupon Already Used", description: `You have already redeemed coupon "${code}".`, variant: "destructive" });
        return;
    }

    // All checks passed
    const calculatedDiscount = (subtotal * coupon.discountPercentage) / 100;
    setAppliedCoupon(coupon);
    setDiscountAmount(calculatedDiscount);
    toast({ title: "Coupon Applied!", description: `"${coupon.code}" gave you ${coupon.discountPercentage}% off!`, className: "bg-green-500 text-white" });
  };


  const onSubmit = async (data: CheckoutFormValues) => {
    setIsPlacingOrder(true);
    const orderItems: OrderItem[] = cart.map(item => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      originalPrice: item.originalPrice,
    }));

    const newOrderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory' | 'currentStatus' | 'userId'> = {
      customerName: data.shippingAddress.fullName,
      items: orderItems,
      totalPrice: total,
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod,
      discountCode: appliedCoupon ? appliedCoupon.code : undefined,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
    };
    
    try {
      const newOrderId = await addOrder(newOrderData);
      if (newOrderId) {
        toast({
            title: "Order Being Processed",
            description: `Your order ID: ${newOrderId}. You will be redirected shortly.`,
        });
        router.push(`/order-confirmation/${newOrderId}`);
      } else {
        // addOrder would have already shown a toast for stock issues
        setIsPlacingOrder(false);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Order Placement Failed",
        description: "There was an issue placing your order. Please try again.",
        variant: "destructive",
      });
      setIsPlacingOrder(false);
    }
  };

  const handleUseMyLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
      });
      return;
    }

    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
          if (!response.ok) {
            throw new Error(`Nominatim API request failed with status ${response.status}`);
          }
          const data = await response.json();

          const address = data.address || {};
          const state = address.state || '';
          const district = address.city || address.town || address.village || address.county || '';

          let street = '';
          if (address.road) {
            street = address.house_number ? `${address.house_number} ${address.road}` : address.road;
          } else if (address.neighbourhood || address.suburb) {
            const neighbourhoodPart = address.neighbourhood || '';
            const suburbPart = address.suburb || '';
            street = `${neighbourhoodPart} ${suburbPart}`.trim();
            street = street ? `${street} (Area/Neighborhood - Please verify & add specific street & number)` : 'Street details not found, please enter manually';
          } else {
            street = 'Street details not found, please enter manually';
          }
          if (street) street += " (Please verify)";


          form.setValue('shippingAddress.state', state);
          form.setValue('shippingAddress.district', district);
          form.setValue('shippingAddress.streetAddress', street);

          toast({
            title: "Location Data Fetched!",
            description: "Address fields updated with approximate location. Please review and complete all details for accuracy.",
            duration: 7000,
          });

        } catch (apiError: any) {
            console.error("Reverse geocoding error:", apiError);
            toast({
                title: "Address Fetch Error",
                description: `Could not fetch address details: ${apiError.message}. Please enter manually.`,
                variant: "destructive",
            });
            form.setValue('shippingAddress.state', `Lat: ${latitude.toFixed(3)} (API Error)`);
            form.setValue('shippingAddress.district', `Lon: ${longitude.toFixed(3)} (API Error)`);
            form.setValue('shippingAddress.streetAddress', 'Address API Error - Please enter manually');
        } finally {
            setIsFetchingLocation(false);
        }
      },
      (error) => {
        let message = "Could not retrieve location. Please try again or enter manually.";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Location access denied. Please enable it in your browser settings or enter manually.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Location information is unavailable. Please enter manually.";
        } else if (error.code === error.TIMEOUT) {
          message = "The request to get user location timed out. Please try again or enter manually.";
        }
        toast({
          title: "Location Error",
          description: message,
          variant: "destructive",
        });
        setIsFetchingLocation(false);
      }
    );
  };

  if (!appDataLoaded || !hasMounted) {
    return <PageLoader message="Loading checkout..." />;
  }

  if (isPlacingOrder) {
     return (
        <>
            <Navbar />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                 <PageLoader message="Processing your order... Please wait" />
            </main>
            <DynamicFooter />
        </>
     );
  }

  if (cart.length === 0 && !isPlacingOrder) {
    return (
      <>
        <Navbar />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center text-center min-h-[calc(100vh-15rem)]">
            <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
            <h1 className="text-3xl font-headline mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-6">You need items in your cart to proceed to checkout.</p>
            <Button asChild size="lg">
                <Link href="/products">
                    <ShoppingBag className="mr-2 h-5 w-5"/> Continue Shopping
                </Link>
            </Button>
        </main>
        <DynamicFooter />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-headline font-bold text-center mb-12">Checkout</h1>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl font-headline flex items-center">
                      <MapPin className="mr-3 h-6 w-6 text-primary"/> Shipping Address
                    </CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleUseMyLocation}
                      disabled={isFetchingLocation}
                      size="sm"
                    >
                      {isFetchingLocation ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <LocateFixed className="mr-2 h-4 w-4" />
                      )}
                      Use My Location
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="shippingAddress.fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground"/>Full Name *</FormLabel>
                        <FormControl><Input placeholder="John M. Doe" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shippingAddress.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><Phone className="mr-2 h-4 w-4 text-muted-foreground"/>Phone Number *</FormLabel>
                        <FormControl><Input placeholder="+1234567890" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="shippingAddress.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><Landmark className="mr-2 h-4 w-4 text-muted-foreground"/>State/Province *</FormLabel>
                          <FormControl><Input placeholder="California" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="shippingAddress.district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><Building className="mr-2 h-4 w-4 text-muted-foreground"/>District/City *</FormLabel>
                          <FormControl><Input placeholder="Los Angeles" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="shippingAddress.streetAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-muted-foreground"/>Street Address *</FormLabel>
                        <FormControl><Input placeholder="123 Main St, Apt 4B" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <p className="text-xs text-muted-foreground">
                     Note: "Use My Location" provides approximate address details from OpenStreetMap. Please verify and complete your address for accuracy.
                   </p>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-headline flex items-center">
                    <CreditCard className="mr-3 h-6 w-6 text-primary"/> Payment Method *
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a payment method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PAYMENT_METHODS.map(method => (
                              <SelectItem key={method} value={method}>{method}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {selectedPaymentMethod === 'Credit Card' && (
                    <div className="space-y-4 p-4 border rounded-md bg-muted/30">
                        <FormField
                            control={form.control}
                            name="creditCardDetails.cardNumber"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center"><CreditCard className="mr-2 h-4 w-4 text-muted-foreground"/>Card Number *</FormLabel>
                                <FormControl><Input placeholder="•••• •••• •••• ••••" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="creditCardDetails.expiryDate"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground"/>Expiry (MM/YY) *</FormLabel>
                                    <FormControl><Input placeholder="MM/YY" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="creditCardDetails.cvv"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center"><LockKeyhole className="mr-2 h-4 w-4 text-muted-foreground"/>CVV *</FormLabel>
                                    <FormControl><Input placeholder="•••" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <FormMessage>{form.formState.errors.creditCardDetails?.message}</FormMessage>
                    </div>
                  )}
                   { (selectedPaymentMethod === 'Loyalty Points' || selectedPaymentMethod === 'Gift Card') && (
                     <p className="text-sm text-muted-foreground p-4 border rounded-md bg-muted/30">
                        {selectedPaymentMethod} balance and usage would be handled here in a real application. For now, proceed to place order.
                     </p>
                   )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-headline">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ScrollArea className="max-h-60 pr-3">
                    {cart.map(item => (
                      <div key={item.productId} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center">
                          <Image src={item.image} alt={item.name} width={48} height={48} className="rounded mr-3" data-ai-hint="cart item thumbnail"/>
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-medium text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </ScrollArea>
                  <Separator />
                  <FormField
                    control={form.control}
                    name="discountCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><TicketPercent className="mr-2 h-4 w-4 text-muted-foreground"/>Discount Code</FormLabel>
                        <div className="flex space-x-2">
                            <FormControl>
                                <Input placeholder="Enter code" {...field} onBlur={handleApplyDiscountCode} />
                            </FormControl>
                            <Button type="button" variant="outline" onClick={handleApplyDiscountCode}>Apply</Button>
                        </div>
                         {appliedCoupon && discountAmount > 0 && (
                            <FormDescription className="text-green-600">"{appliedCoupon.code}" applied: -${discountAmount.toFixed(2)} ({appliedCoupon.discountPercentage}%)</FormDescription>
                         )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                     <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xl font-semibold">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    disabled={form.formState.isSubmitting || cart.length === 0 || isPlacingOrder}
                  >
                    {isPlacingOrder ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            Place Order
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </form>
        </FormProvider>
      </main>
      <DynamicFooter />
    </>
  );
}
