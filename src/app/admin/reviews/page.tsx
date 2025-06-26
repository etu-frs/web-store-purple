
"use client";

import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import type { Review } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Star, Trash2, MessageSquareHeart, Search, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import dynamic from 'next/dynamic';

const ConfirmationModal = dynamic(() => import('@/components/common/ConfirmationModal').then(mod => mod.ConfirmationModal), {
    ssr: false,
    loading: () => <Button variant="ghost" size="icon" className="text-destructive" disabled><Loader2 className="h-4 w-4 animate-spin"/></Button>
});

export default function AdminReviewsPage() {
  const { reviews, deleteReview, getProductById } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReviews = useMemo(() => {
    if (!searchTerm.trim()) {
      return reviews.sort((a,b) => b.createdAt - a.createdAt);
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return reviews.filter(review => {
      const product = getProductById(review.productId);
      return (
        review.userName.toLowerCase().includes(lowerSearchTerm) ||
        review.comment.toLowerCase().includes(lowerSearchTerm) ||
        (product && product.name.toLowerCase().includes(lowerSearchTerm)) ||
        review.productId.toLowerCase().includes(lowerSearchTerm)
      );
    }).sort((a,b) => b.createdAt - a.createdAt);
  }, [reviews, searchTerm, getProductById]);

  const renderStarsDisplay = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      );
    }
    return <div className="flex">{stars}</div>;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline text-primary">Manage Reviews</h1>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-body flex items-center">
            <MessageSquareHeart className="mr-3 h-6 w-6 text-primary"/> Customer Reviews
          </CardTitle>
          <CardDescription>View and manage all customer reviews for products.</CardDescription>
           <div className="mt-4">
            <div className="relative max-w-md">
              <Input
                type="text"
                placeholder="Search reviews by user, comment, product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                aria-label="Search reviews"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredReviews.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
                {reviews.length === 0 ? "No reviews submitted yet." : "No reviews match your search criteria."}
            </p>
          ) : (
            <ScrollArea className="h-[65vh]">
              <Table><TableHeader>
                  <TableRow>
                    <TableHead className="sticky top-0 bg-card">Product</TableHead>
                    <TableHead className="sticky top-0 bg-card hidden sm:table-cell">User</TableHead>
                    <TableHead className="sticky top-0 bg-card">Rating</TableHead>
                    <TableHead className="w-2/5 sticky top-0 bg-card">Comment</TableHead>
                    <TableHead className="sticky top-0 bg-card hidden md:table-cell">Date</TableHead>
                    <TableHead className="sticky top-0 bg-card">Actions</TableHead>
                  </TableRow>
                </TableHeader><TableBody>
                  {filteredReviews.map(review => {
                    const product = getProductById(review.productId);
                    return (
                      <TableRow key={review.id}>
                        <TableCell className="font-medium align-top">
                            {product ? (
                                <div className="flex items-center space-x-2">
                                    <Image src={product.images[0]} alt={product.name} width={32} height={32} className="rounded-sm object-cover flex-shrink-0" data-ai-hint={`${product.category} thumbnail`}/>
                                    <span className="text-sm truncate">{product.name}</span>
                                </div>
                            ) : (
                                `ID: ${review.productId.substring(0,10)}...`
                            )}
                        </TableCell>
                        <TableCell className="align-top hidden sm:table-cell">
                            <div className="flex items-center space-x-2">
                                {review.avatar && <Image src={review.avatar} alt={review.userName} width={24} height={24} className="rounded-full"/>}
                                <span className="text-sm truncate">{review.userName}</span>
                            </div>
                        </TableCell>
                        <TableCell className="align-top" aria-label={`Rated ${review.rating} out of 5 stars`}>{renderStarsDisplay(review.rating)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground align-top">
                           <p className="w-full whitespace-normal break-words line-clamp-3 hover:line-clamp-none transition-all duration-200">{review.comment}</p>
                        </TableCell>
                        <TableCell className="text-sm align-top hidden md:table-cell">{format(new Date(review.createdAt), 'MMM d, yyyy')}</TableCell>
                        <TableCell className="align-top">
                           <ConfirmationModal
                              triggerText={<Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label={`Delete review by ${review.userName}`}><Trash2 className="h-4 w-4" /></Button>}
                              title="Delete Review"
                              description={`Are you sure you want to delete this review by ${review.userName}? This action cannot be undone.`}
                              onConfirm={() => deleteReview(review.id)}
                           />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody></Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
    
