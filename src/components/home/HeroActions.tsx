
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";

export function HeroActions() {
  const scrollToProducts = () => {
    const productsSection = document.getElementById("products-section");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <Button
        size="lg"
        onClick={scrollToProducts}
        className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg transform hover:scale-105 transition-transform"
        aria-label="Shop featured tools"
      >
        <ShoppingBag className="mr-2 h-5 w-5" /> Shop Tools
      </Button>
      <Button
        size="lg"
        variant="outline"
        asChild
        className="shadow-lg transform hover:scale-105 transition-transform"
      >
        <Link href="/products">
          Explore All Products <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </Button>
    </div>
  );
}
