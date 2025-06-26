
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, HelpCircle, ShoppingBag } from "lucide-react";
import Image from "next/image";
import type { EditableValueProposition, Product, Question } from "@/lib/types";
import { ProductGridSkeleton } from "@/components/products/ProductGridSkeleton";
import { useAppContext } from "@/contexts/AppContext";
import { HeroActions } from "@/components/home/HeroActions";
import { PageLoader } from "@/components/shared/PageLoader";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { ProductGrid } from "@/components/products/ProductGrid";


const ValuePropIcon = ({ iconId }: { iconId: EditableValueProposition['id'] }) => {
  if (iconId === 'quality') return <ShoppingBag className="h-12 w-12 text-primary mx-auto mb-4" />;
  if (iconId === 'love') return <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mx-auto mb-4"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>;
  if (iconId === 'easy') return <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />;
  return null;
};

// This is now a Client Component again to ensure data is visible from the context
export default function Home() {
  const { products, questions, homepageSettings, appDataLoaded } = useAppContext();

  // Client-side filtering
  const featuredProducts = appDataLoaded 
    ? (homepageSettings.featuredProductIds && homepageSettings.featuredProductIds.length > 0
      ? homepageSettings.featuredProductIds.map(id => products.find(p => p.id === id)).filter((p): p is Product => p !== null && p !== undefined)
      : products.slice(0, 4))
    : [];
  
  const featuredQuestions = appDataLoaded
    ? (homepageSettings.featuredQuestionIds && homepageSettings.featuredQuestionIds.length > 0
      ? homepageSettings.featuredQuestionIds.map(id => questions.find(q => q.id === id)).filter((q): q is Question => q !== null && q !== undefined)
      : questions.filter(q => !q.productId).slice(0, 3))
    : [];

  if (!appDataLoaded) {
    return <PageLoader message="Loading store..."/>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32">
          <Image
            src={homepageSettings.heroImageUrl}
            alt="Store Background"
            fill
            style={{ objectFit: 'cover' }}
            className="hero-background-image -z-10" 
            data-ai-hint="abstract texture store"
            priority
          />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h1 className="text-5xl md:text-7xl font-headline font-bold mb-6 animated-text-shine">
              Welcome to {homepageSettings.storeName}
            </h1>
            <p className="text-xl md:text-2xl text-foreground/80 mb-10 max-w-3xl mx-auto font-body">
              Discover amazing products, unbeatable deals, and a seamless shopping experience.
            </p>
            <HeroActions />
          </div>
        </section>

        {/* Values/Promo Section */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                {homepageSettings.valuePropositions.map((vp) => (
                  <div key={vp.id} className="p-6 bg-card rounded-lg shadow-md">
                    <ValuePropIcon iconId={vp.id} />
                    <h3 className="text-2xl font-headline mb-2">{vp.title}</h3>
                    <p className="text-foreground/80 font-body">{vp.description}</p>
                  </div>
                ))}
              </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section id="products-section" className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-headline font-semibold text-center mb-12">
              Featured Products
            </h2>
            {appDataLoaded ? (
              featuredProducts.length > 0 ? (
                  <ProductGrid products={featuredProducts} />
              ) : (
                  <p className="text-center text-muted-foreground">No featured products selected or available.</p>
              )
            ) : <ProductGridSkeleton />}
            <div className="text-center mt-12">
              <Button asChild variant="link" className="text-lg text-accent hover:text-accent/80">
                <Link href="/products">
                  View All Products <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* General Q&A Teaser Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-headline font-semibold text-center mb-12">
              Have Questions?
            </h2>
             {featuredQuestions.length > 0 ? (
                <div className="max-w-2xl mx-auto space-y-6">
                  {featuredQuestions.map((q) => (
                    <div key={q.id} className="bg-card p-6 rounded-lg shadow-md">
                      <h3 className="text-xl font-headline font-semibold mb-2">{q.questionText}</h3>
                      <p className="text-foreground/80 font-body">
                        {q.answerText ? q.answerText : <span className="italic text-muted-foreground">This question is under review. We'll answer it soon!</span>}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No featured questions available.</p>
              )}
            <div className="text-center mt-12">
              <Button asChild variant="outline" className="text-lg">
                <Link href="/qna">
                  Ask a Question or See More <HelpCircle className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
