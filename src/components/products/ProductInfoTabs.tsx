
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import type { Product, Review, Question } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, StarHalf } from 'lucide-react'; 
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/AppContext';

const MAX_REVIEW_LENGTH = 300;

interface ProductInfoTabsProps {
  product: Product;
  initialReviews: Review[];
  initialQuestions: Question[];
}

export const ProductInfoTabs: React.FC<ProductInfoTabsProps> = ({ product, initialReviews, initialQuestions }) => {
  const { toast } = useToast();
  const { addReview, addQuestion, getReviewsForProduct, getQuestionsForProduct } = useAppContext();

  // Use the context data, which is now the single source of truth.
  const reviews = getReviewsForProduct(product.id);
  const questions = getQuestionsForProduct(product.id);
  
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const [questionName, setQuestionName] = useState('');
  const [questionText, setQuestionText] = useState('');
  
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!reviewName.trim() || reviewRating === 0 || !reviewComment.trim()){
        toast({ variant: "destructive", title: "Missing Fields", description: "Please provide name, rating, and comment."});
        return;
    }
    if (reviewComment.length > MAX_REVIEW_LENGTH) {
      toast({
        variant: "destructive",
        title: "Comment Too Long",
        description: `Your review comment cannot exceed ${MAX_REVIEW_LENGTH} characters. You have ${reviewComment.length} characters.`,
      });
      return;
    }
    await addReview({
        productId: product.id,
        userName: reviewName,
        rating: reviewRating,
        comment: reviewComment,
        userId: 'guestUser', 
    });
    setReviewName('');
    setReviewRating(0);
    setReviewComment('');
    setHoverRating(0);
    toast({ title: "Review Submitted", description: "Thank you for your feedback!" });
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!questionName.trim() || !questionText.trim()){
        toast({ variant: "destructive", title: "Missing Fields", description: "Please provide name and question."});
        return;
    }
    await addQuestion({
        productId: product.id,
        userName: questionName,
        questionText: questionText,
        userId: 'guestUser', 
    });
    setQuestionName('');
    setQuestionText('');
    toast({ title: "Question Submitted", description: "We will answer your question shortly." });
  };

  const renderStarsInput = (currentRating: number, setRating: (r: number) => void, currentHover: number, setHover: (h: number) => void) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-6 w-6 cursor-pointer transition-colors
              ${(currentHover || currentRating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(star)}
            aria-label={`Rate ${star} out of 5 stars`}
          />
        ))}
      </div>
    );
  };
  
  const renderStarsDisplay = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) stars.push(<Star key={`fs-${i}`} className="h-5 w-5 fill-yellow-400 text-yellow-400" />);
    if (halfStar) stars.push(<StarHalf key="hs" className="h-5 w-5 fill-yellow-400 text-yellow-400" />);
    for (let i = 0; i < emptyStars; i++) stars.push(<Star key={`es-${i}`} className="h-5 w-5 text-yellow-200" />);
    return <div className="flex">{stars}</div>;
  };

  return (
    <Tabs defaultValue="reviews" className="mb-12">
      <TabsList className="grid w-full grid-cols-2 md:w-1/2">
        <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
        <TabsTrigger value="qna">Q&A ({questions.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="reviews" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map(review => (
                <div key={review.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-center mb-2">
                    {review.avatar && <Image src={review.avatar} alt={`${review.userName}'s avatar`} width={40} height={40} className="rounded-full mr-3" />}
                    <div>
                      <p className="font-semibold">{review.userName}</p>
                      <div className="flex items-center" aria-label={`Rated ${review.rating} out of 5 stars by ${review.userName}`}>{renderStarsDisplay(review.rating)}</div>
                    </div>
                    <p className="text-xs text-muted-foreground ml-auto">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                  <p className="font-body text-foreground/90 whitespace-normal break-words">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
            )}
            <Separator className="my-6"/>
            <h3 className="text-xl font-headline font-semibold mb-4">Submit Your Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <Label htmlFor="reviewName">Name</Label>
                <Input id="reviewName" value={reviewName} onChange={(e) => setReviewName(e.target.value)} required />
              </div>
              <div>
                <Label>Rating (Click to set)</Label>
                {renderStarsInput(reviewRating, setReviewRating, hoverRating, setHoverRating)}
              </div>
              <div>
                <Label htmlFor="reviewComment">Comment</Label>
                <Textarea 
                  id="reviewComment" 
                  value={reviewComment} 
                  onChange={(e) => setReviewComment(e.target.value)} 
                  required 
                  maxLength={MAX_REVIEW_LENGTH}
                  rows={4}
                  aria-describedby="reviewCommentHelp"
                />
                <div id="reviewCommentHelp" className="text-xs text-muted-foreground text-right mt-1">
                  {reviewComment.length}/{MAX_REVIEW_LENGTH}
                </div>
              </div>
              <Button type="submit">Submit Review</Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="qna" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Questions & Answers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.length > 0 ? (
              questions.map(q => (
                <div key={q.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <p className="font-semibold mb-1">Q: {q.questionText}</p>
                  <p className="text-xs text-muted-foreground mb-1">Asked by {q.userName} on {new Date(q.createdAt).toLocaleDateString()}</p>
                  {q.answerText ? (
                    <div className="pl-4 border-l-2 border-primary ml-2 mt-2 py-1">
                      <p className="font-semibold text-primary">A: {q.answerText}</p>
                      <p className="text-xs text-muted-foreground mt-2">Answered by {q.answeredBy} on {new Date(q.answeredAt!).toLocaleDateString()}</p>
                    </div>
                  ) : (
                    <p className="text-sm italic text-muted-foreground ml-2 mt-2">No answer yet.</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No questions asked for this product yet.</p>
            )}
            <Separator className="my-6"/>
            <h3 className="text-xl font-headline font-semibold mb-4">Ask a Question</h3>
            <form onSubmit={handleQuestionSubmit} className="space-y-4">
              <div>
                <Label htmlFor="questionName">Name</Label>
                <Input id="questionName" value={questionName} onChange={(e) => setQuestionName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="questionText">Your Question</Label>
                <Textarea id="questionText" value={questionText} onChange={(e) => setQuestionText(e.target.value)} required />
              </div>
              <Button type="submit">Submit Question</Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
