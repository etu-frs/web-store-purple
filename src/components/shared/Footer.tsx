
"use client";

import React from 'react';
import Link from 'next/link';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Share2, ListOrdered, FileText } from 'lucide-react';
import type { SocialLinkPlatform } from '@/lib/types';

const SocialIcon: React.FC<{ platform: SocialLinkPlatform }> = ({ platform }) => {
  const iconProps = { className: "h-6 w-6" };
  switch (platform) {
    case 'facebook': return <Facebook {...iconProps} />;
    case 'twitter': return <Twitter {...iconProps} />;
    case 'instagram': return <Instagram {...iconProps} />;
    case 'linkedin': return <Linkedin {...iconProps} />;
    case 'youtube': return <Youtube {...iconProps} />;
    default: return <Share2 {...iconProps} />; // Fallback icon
  }
};

const FooterComponent = () => {
  const currentYear = new Date().getFullYear();
  const { homepageSettings, appDataLoaded } = useAppContext();
  const { socialLinks = [], storeName = 'MyDukaan', copyrightText = '', madeByText = '' } = appDataLoaded ? homepageSettings : {};

  const processedCopyright = copyrightText
    .replace('{year}', currentYear.toString())
    .replace('{storeName}', storeName);

  return (
    <footer className="glass-effect border-t border-primary/20 py-12 mt-16 relative overflow-hidden">
      <div className="absolute inset-0 luxury-gradient opacity-5"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="mb-6">
          <Link href="/" className="text-3xl font-headline font-bold luxury-text-gradient hover:scale-105 transition-transform duration-300">
            {storeName}
          </Link>
        </div>
        <div className="flex justify-center flex-wrap gap-8 mb-8">
          <Link href="/products" className="text-foreground hover:text-primary transition-all duration-300 hover:scale-105 font-medium">Products</Link>
          <Link href="/qna" className="text-foreground hover:text-primary transition-all duration-300 hover:scale-105 font-medium">Q&A</Link>
          <Link href="/contact" className="text-foreground hover:text-primary transition-all duration-300 hover:scale-105 font-medium">Contact Us</Link>
          <Link href="/track-order" className="text-foreground hover:text-primary transition-all duration-300 hover:scale-105 font-medium">Track Order</Link>
          <Link href="/privacy-policy" className="text-foreground hover:text-primary transition-all duration-300 hover:scale-105 font-medium">Privacy Policy</Link>
          <Link href="/terms-of-service" className="text-foreground hover:text-primary transition-all duration-300 hover:scale-105 font-medium">Terms of Service</Link>
        </div>

        {appDataLoaded && socialLinks.some(link => link.isEnabled && link.url) && (
          <div className="flex justify-center space-x-4 mb-8">
            {socialLinks.filter(link => link.isEnabled && link.url).map(link => (
              <Button 
                key={link.platform} 
                variant="ghost" 
                size="icon" 
                asChild 
                className="glass-effect border border-primary/20 text-muted-foreground hover:text-primary luxury-hover group"
              >
                <a href={link.url} target="_blank" rel="noopener noreferrer" aria-label={`Visit our ${link.platform} page`}>
                  <div className="group-hover:scale-110 transition-transform duration-300">
                    <SocialIcon platform={link.platform} />
                  </div>
                </a>
              </Button>
            ))}
          </div>
        )}

        <p className="text-sm">
          {processedCopyright}
        </p>
        <p className="text-xs mt-2">
          {madeByText}
        </p>
      </div>
    </footer>
  );
}

FooterComponent.displayName = 'Footer';
export const Footer = React.memo(FooterComponent);
