
"use client";

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Star, StarHalf, Plus, Minus, Percent, Bookmark } from 'lucide-react';
import { ProductInfoTabs } from '@/components/products/ProductInfoTabs';
import { PageLoader } from '@/components/shared/PageLoader';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductGridSkeleton } from '@/components/products/ProductGridSkeleton';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.productId as string;
  const {
    products,
    getProductById,
    getReviewsForProduct,
    getQuestionsForProduct,
    appDataLoaded,
    addToCart,
    toggleWishlist,
    isInWishlist,
    toggleLikeProduct,
    isProductLiked,
  } = useAppContext();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // This effect checks if the product exists once data is loaded.
  useEffect(() => {
    if (appDataLoaded && !getProductById(productId)) {
      notFound();
    }
  }, [appDataLoaded, getProductById, productId]);

  if (!appDataLoaded) {
    return <PageLoader message="Loading product details..."/>
  }

  const product = getProductById(productId);
  
  if (!product) {
    return <PageLoader message="Loading product details..."/>;
  }

  const reviews = getReviewsForProduct(productId);
  const questions = getQuestionsForProduct(productId);
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const inWishlist = isInWishlist(product.id);
  const liked = isProductLiked(product.id);
  
  const discountPercentage = product.originalPrice && product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;
    
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(product.rating);
    const halfStar = product.rating % 1 >= 0.5;
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-5 w-5 fill-yellow-400 text-yellow-400" />);
    }
    if (halfStar) {
      stars.push(<StarHalf key="half" className="h-5 w-5 fill-yellow-400 text-yellow-400" />);
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-5 w-5 text-yellow-200" />);
    }
    return stars;
  };
  
  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => {
      const newQuantity = prev + amount;
      if (newQuantity < 1) return 1;
      if (newQuantity > product.stock) return product.stock;
      return newQuantity;
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
                <div className="relative aspect-square border rounded-lg overflow-hidden shadow-lg">
                    <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    priority
                    data-ai-hint={`${product.category} product`}
                    />
                     {discountPercentage !== null && (
                        <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground z-10 flex items-center text-sm py-1 px-2">
                          <Percent className="h-4 w-4 mr-1"/> {discountPercentage}% OFF
                        </Badge>
                     )}
                     {product.stock === 0 && (
                        <Badge variant="destructive" className="absolute top-3 right-3 z-10 text-sm py-1 px-2">Out of Stock</Badge>
                     )}
                </div>
                <div className="flex space-x-2">
                    {product.images.map((img, index) => (
                    <button key={index} onClick={() => setSelectedImage(index)} className={`block border-2 rounded-lg overflow-hidden w-20 h-20 relative ${selectedImage === index ? 'border-primary' : 'border-transparent'}`}>
                        <Image src={img} alt={`${product.name} thumbnail ${index + 1}`} fill className="object-cover" data-ai-hint="product thumbnail"/>
                    </button>
                    ))}
                </div>
            </div>

            {/* Product Info */}
            <div className="space-y-4">
                <h1 className="text-4xl font-bold font-headline text-primary">{product.name}</h1>
                <p className="text-sm text-muted-foreground">{product.category}</p>
                <div className="flex items-center space-x-2">
                    {renderStars()}
                    <a href="#reviews" className="text-sm text-muted-foreground hover:underline">({product.numReviews} reviews)</a>
                </div>
                <div className="flex items-baseline space-x-2">
                    <p className="text-3xl font-bold">${product.price.toFixed(2)}</p>
                    {product.originalPrice && product.originalPrice > product.price && (
                    <p className="text-lg text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</p>
                    )}
                </div>
                <Separator />
                <p className="text-foreground/80 leading-relaxed font-body">{product.description}</p>
                 <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLikeProduct(product.id)}
                        className="flex items-center text-sm text-muted-foreground hover:text-red-500 px-1 py-0.5 h-auto -ml-1"
                    >
                        <Heart className={`h-5 w-5 mr-1 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                        <span>{product.likes}</span>
                        <span className="ml-1">likes</span>
                    </Button>
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}><Minus className="h-4 w-4" /></Button>
                        <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                        <Button variant="outline" size="icon" onClick={() => handleQuantityChange(1)} disabled={quantity >= product.stock}><Plus className="h-4 w-4" /></Button>
                    </div>
                    <Button 
                        size="lg" 
                        onClick={() => addToCart(product, quantity)}
                        disabled={product.stock === 0}
                        className="flex-grow bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => toggleWishlist(product.id)}
                        aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                        className={cn("hover:bg-transparent", inWishlist ? 'text-primary' : 'text-muted-foreground hover:text-primary')}
                     >
                        <Bookmark className={cn("h-7 w-7", inWishlist ? 'fill-primary' : '')} />
                    </Button>
                </div>
                {quantity >= product.stock && product.stock > 0 && (
                    <p className="text-sm text-orange-500 font-medium">Max available stock reached.</p>
                )}
            </div>
        </div>

        <div id="reviews" className="mt-12">
            <ProductInfoTabs product={product} initialReviews={reviews} initialQuestions={questions} />
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-3xl font-headline font-semibold mb-8">You May Also Like</h2>
            {appDataLoaded ? <ProductGrid products={relatedProducts} /> : <ProductGridSkeleton />}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
