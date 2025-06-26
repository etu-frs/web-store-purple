
"use client";

import Link from 'next/link';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeartCrack, ShoppingBag } from 'lucide-react';
import dynamic from 'next/dynamic';
import { ProductGridSkeleton } from '@/components/products/ProductGridSkeleton';
import { PageLoader } from '@/components/shared/PageLoader';

const Navbar = dynamic(() => import('@/components/shared/Navbar').then(mod => mod.Navbar), { 
  ssr: false,
});
const Footer = dynamic(() => import('@/components/shared/Footer').then(mod => mod.Footer), { 
  ssr: false,
});
const ProductGrid = dynamic(() => import('@/components/products/ProductGrid').then(mod => mod.ProductGrid), {
  ssr: false,
  loading: () => <ProductGridSkeleton count={4} />,
});


export default function WishlistPage() {
  const { products, wishlist, setFilterOptions, appDataLoaded } = useAppContext();

  function handleViewAllProducts() {
    setFilterOptions(prev => ({...prev, showWishlistOnly: false}));
  }

  if (!appDataLoaded) {
      return <PageLoader message="Loading your wishlist..."/>
  }

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-headline font-bold text-center mb-12">Your Wishlist</h1>

        {wishlist.length === 0 ? (
          <Card className="text-center py-12 shadow-lg">
             <CardHeader>
                <HeartCrack className="mx-auto h-16 w-16 text-primary mb-4" />
              <CardTitle className="text-3xl font-headline">Your Wishlist is Empty</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6 font-body">
                You haven't added any products to your wishlist yet. Explore our collection and find something you love!
              </p>
              <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/products" onClick={handleViewAllProducts}>
                  <ShoppingBag className="mr-2 h-5 w-5" /> Explore Products
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ProductGrid products={wishlistProducts} />
        )}
      </main>
      <Footer />
    </div>
  );
}
