
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ShoppingCart, Star, StarHalf, Percent, Bookmark } from 'lucide-react'; // Added Bookmark
import { useAppContext } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

// Wrapped with React.memo
const ProductCardComponent = ({ product }: ProductCardProps) => {
  const { addToCart, toggleWishlist, isInWishlist, toggleLikeProduct, isProductLiked } = useAppContext();
  const inWishlist = isInWishlist(product.id);
  const liked = isProductLiked(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    addToCart(product, 1);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(product.id);
  };
  
  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleLikeProduct(product.id);
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(product.rating);
    const halfStar = product.rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-5 w-5 fill-yellow-400 text-yellow-400" />);
    }
    if (halfStar) {
      stars.push(<StarHalf key="half" className="h-5 w-5 fill-yellow-400 text-yellow-400" />);
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-5 w-5 text-yellow-200" />);
    }
    return stars;
  };

  const discountPercentage = product.originalPrice && product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full group">
      <Link href={`/products/${product.id}`} className="block">
        <CardHeader className="p-0 relative">
          <div className="aspect-square w-full overflow-hidden">
            <Image
              src={product.images[0]}
              alt={product.name}
              width={400}
              height={400}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              data-ai-hint={`${product.category} product`}
            />
          </div>
          {product.stock === 0 && (
             <Badge variant="destructive" className="absolute top-2 right-2 z-10">Out of Stock</Badge>
          )}
           {discountPercentage !== null && (
            <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground z-10 flex items-center">
              <Percent className="h-3 w-3 mr-1"/> {discountPercentage}% OFF
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-xl font-headline mb-2 truncate group-hover:text-primary transition-colors">
            {product.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
          <div className="flex items-baseline mb-2">
            <p className="text-lg font-semibold text-primary mr-2">${product.price.toFixed(2)}</p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-sm text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</p>
            )}
          </div>
          <div className="flex items-center mb-1">
            {renderStars()}
            <span className="ml-2 text-sm text-muted-foreground">({product.numReviews} reviews)</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleLike}
            aria-label={liked ? `Unlike ${product.name}` : `Like ${product.name}`}
            className="flex items-center text-sm text-muted-foreground hover:text-red-500 px-1 py-0.5 h-auto -ml-1" // Adjusted padding/margin for alignment
          >
            <Heart className={`h-4 w-4 mr-1 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            <span>{product.likes}</span>
            <span className="ml-1">likes</span>
          </Button>
          <p className="text-sm text-foreground/80 mt-2 line-clamp-2 font-body">
            {product.description}
          </p>
        </CardContent>
      </Link>
      <CardFooter className="p-4 border-t mt-auto">
        <div className="flex w-full justify-between items-center">
          <Button 
            variant={product.stock > 0 ? "default" : "secondary"}
            size="sm" 
            onClick={handleAddToCart} 
            disabled={product.stock === 0}
            className="flex-grow mr-2 bg-accent hover:bg-accent/90 text-accent-foreground"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleToggleWishlist}
            aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            className={cn("hover:bg-transparent", inWishlist ? 'text-primary' : 'text-muted-foreground hover:text-primary')}
          >
            <Bookmark className={cn("h-6 w-6", inWishlist ? 'fill-primary' : '')} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
ProductCardComponent.displayName = 'ProductCardComponent';
export const ProductCard = React.memo(ProductCardComponent);
