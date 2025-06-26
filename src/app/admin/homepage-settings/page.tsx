
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAppContext } from '@/contexts/AppContext';
import type { HomepageSettings, Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Image as ImageIcon, Save, ListChecks, HelpCircleIcon, Settings, UploadCloud, Trash2, Share2, Facebook, Twitter, Instagram, Linkedin, Youtube, Loader2 as LoaderIcon, Store, Copyright, PencilRuler } from 'lucide-react';
import { INITIAL_HOMEPAGE_SETTINGS } from '@/data/seed';

const SocialPlatformIcon: React.FC<{ platform: HomepageSettings['socialLinks'][0]['platform'] }> = ({ platform }) => {
  const commonProps = { className: "mr-2 h-5 w-5" };
  switch (platform) {
    case 'facebook': return <Facebook {...commonProps} className="text-blue-600" />;
    case 'twitter': return <Twitter {...commonProps} className="text-sky-500" />;
    case 'instagram': return <Instagram {...commonProps} className="text-pink-500" />;
    case 'linkedin': return <Linkedin {...commonProps} className="text-blue-700" />;
    case 'youtube': return <Youtube {...commonProps} className="text-red-600" />;
    default: return <Share2 {...commonProps} className="text-muted-foreground" />;
  }
};


export default function HomepageSettingsPage() {
  const { homepageSettings, setHomepageSettings, products, questions, getGeneralQuestions, appDataLoaded } = useAppContext();
  const { toast } = useToast();

  const [localSettings, setLocalSettings] = useState<HomepageSettings>(INITIAL_HOMEPAGE_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [questionSearchTerm, setQuestionSearchTerm] = useState('');
  const heroImageFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (appDataLoaded) {
      setLocalSettings({ ...INITIAL_HOMEPAGE_SETTINGS, ...homepageSettings });
    }
  }, [homepageSettings, appDataLoaded]);
  
  const handleSettingInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLocalSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleHeroImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const MAX_FILE_SIZE_KB = 700;
      if (file.size > MAX_FILE_SIZE_KB * 1024) {
        toast({
          title: 'Image File Too Large',
          description: `Please select an image smaller than ${MAX_FILE_SIZE_KB}KB.`,
          variant: 'destructive',
          duration: 8000,
        });
        if (heroImageFileInputRef.current) heroImageFileInputRef.current.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        if (loadEvent.target?.result) {
          setLocalSettings(prev => ({ ...prev, heroImageUrl: loadEvent.target.result as string }));
          toast({ title: "Image Selected", description: "Preview updated. Remember to save changes." });
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleClearHeroImage = () => {
    setLocalSettings(prev => ({ ...prev, heroImageUrl: INITIAL_HOMEPAGE_SETTINGS.heroImageUrl }));
    toast({ title: "Hero Image Cleared", description: "Image reset to default. Save to apply." });
  }

  const handleValuePropositionChange = (id: string, field: 'title' | 'description', value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      valuePropositions: prev.valuePropositions.map(vp =>
        vp.id === id ? { ...vp, [field]: value } : vp
      ),
    }));
  };

  const handleFeaturedProductToggle = (productId: string) => {
    setLocalSettings(prev => ({
      ...prev,
      featuredProductIds: (prev.featuredProductIds || []).includes(productId)
        ? (prev.featuredProductIds || []).filter(id => id !== productId)
        : [...(prev.featuredProductIds || []), productId],
    }));
  };
  
  const handleFeaturedQuestionToggle = (questionId: string) => {
    setLocalSettings(prev => ({
      ...prev,
      featuredQuestionIds: (prev.featuredQuestionIds || []).includes(questionId)
        ? (prev.featuredQuestionIds || []).filter(id => id !== questionId)
        : [...(prev.featuredQuestionIds || []), questionId],
    }));
  };

  const handleSocialLinkChange = (platform: string, field: 'url' | 'isEnabled', value: string | boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map(link =>
        link.platform === platform ? { ...link, [field]: value } : link
      ),
    }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await setHomepageSettings(localSettings);
      toast({ title: "Settings Saved", description: "Homepage settings updated successfully." });
    } catch (error: any) {
      toast({
        title: "Error Saving Settings",
        description: error.message?.includes('exceeds the maximum size') || error.message?.includes('size is too large')
          ? "Save failed: Uploaded image is too large. Use an optimized image under 700KB."
          : (error.message || "Could not save settings."),
        variant: "destructive",
        duration: 8000,
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearchTerm.toLowerCase()));
  const generalQuestions = getGeneralQuestions();
  const filteredQuestions = generalQuestions.filter(q => q.questionText.toLowerCase().includes(questionSearchTerm.toLowerCase()));

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline text-primary flex items-center"><Settings className="mr-3 h-8 w-8"/>Homepage & Store Settings</h1>

      <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
             <Card className="shadow-lg">
                <CardHeader>
                <CardTitle className="flex items-center"><Store className="mr-2 h-5 w-5 text-primary"/>Store Identity</CardTitle>
                <CardDescription>Manage your store's public name and footer text.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="storeName">Store Name</Label>
                    <Input id="storeName" name="storeName" value={localSettings.storeName} onChange={handleSettingInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="copyrightText" className="flex items-center"><Copyright className="mr-2 h-4 w-4"/>Footer Copyright Text</Label>
                    <Textarea id="copyrightText" name="copyrightText" value={localSettings.copyrightText} onChange={handleSettingInputChange} rows={2} />
                    <p className="text-xs text-muted-foreground">Use {'{year}'} and {'{storeName}'} as placeholders.</p>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="madeByText" className="flex items-center"><PencilRuler className="mr-2 h-4 w-4"/>Footer "Made By" Text</Label>
                    <Input id="madeByText" name="madeByText" value={localSettings.madeByText} onChange={handleSettingInputChange} />
                </div>
                </CardContent>
            </Card>

             <Card className="shadow-lg">
                <CardHeader>
                <CardTitle className="flex items-center"><ImageIcon className="mr-2 h-5 w-5 text-primary"/>Hero Section</CardTitle>
                <CardDescription>Manage the main hero image. Upload an image or provide a URL.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {localSettings.heroImageUrl && (
                    <div className="mb-4 p-2 border rounded-md bg-muted/30">
                        <Label className="block mb-2 text-sm font-medium">Preview:</Label>
                        <div className="relative w-full aspect-[16/9] max-h-[200px] rounded overflow-hidden">
                        <Image src={localSettings.heroImageUrl} alt="Hero image preview" layout="fill" objectFit="contain" data-ai-hint="hero image preview" />
                        </div>
                    </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="heroImageUrl">Hero Image URL</Label>
                        <Input id="heroImageUrl" value={localSettings.heroImageUrl.startsWith('data:image/') ? '(Uploaded Image Data)' : localSettings.heroImageUrl} onChange={e => setLocalSettings(p => ({...p, heroImageUrl: e.target.value}))} disabled={localSettings.heroImageUrl.startsWith('data:image/')} />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 items-center">
                        <Button type="button" variant="outline" onClick={() => heroImageFileInputRef.current?.click()}><UploadCloud className="mr-2 h-4 w-4"/> Upload Image</Button>
                        <Input type="file" ref={heroImageFileInputRef} onChange={handleHeroImageFileChange} accept="image/*" className="hidden"/>
                        <Button type="button" variant="ghost" onClick={handleClearHeroImage} className="text-destructive hover:text-destructive"><Trash2 className="mr-2 h-4 w-4"/> Clear/Use Default</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Max size: 700KB. Uploading overrides the URL.</p>
                </CardContent>
            </Card>
          </div>
          
          {/* Right Column */}
          <div className="space-y-8">
             <Card className="shadow-lg">
                <CardHeader>
                <CardTitle className="flex items-center"><Share2 className="mr-2 h-5 w-5 text-primary"/>Social Media Links</CardTitle>
                <CardDescription>Configure URLs for social media icons in the footer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                {localSettings.socialLinks.map(link => (
                    <div key={link.platform} className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor={`socialUrl-${link.platform}`} className="flex items-center font-semibold capitalize">
                        <SocialPlatformIcon platform={link.platform} /> {link.platform} URL
                        </Label>
                        <div className="flex items-center space-x-2">
                        <Label htmlFor={`socialEnable-${link.platform}`} className="text-sm font-normal">Enable</Label>
                        <Checkbox id={`socialEnable-${link.platform}`} checked={link.isEnabled} onCheckedChange={(checked) => handleSocialLinkChange(link.platform, 'isEnabled', !!checked)} />
                        </div>
                    </div>
                    <Input id={`socialUrl-${link.platform}`} value={link.url} onChange={(e) => handleSocialLinkChange(link.platform, 'url', e.target.value)} placeholder={`https://www.${link.platform}.com/yourpage`} disabled={!link.isEnabled} />
                    </div>
                ))}
                </CardContent>
            </Card>
          </div>
      </div>
      
      {/* Full-width cards */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Value Propositions</CardTitle>
          <CardDescription>Edit the titles and descriptions for the value proposition items displayed on the homepage.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6">
          {localSettings.valuePropositions.map(vp => (
            <div key={vp.id} className="p-4 border rounded-md bg-muted/30 space-y-3">
              <h3 className="font-semibold capitalize text-lg text-primary">{vp.id} Section</h3>
              <div>
                <Label htmlFor={`vpTitle-${vp.id}`}>Title</Label>
                <Input id={`vpTitle-${vp.id}`} value={vp.title} onChange={(e) => handleValuePropositionChange(vp.id, 'title', e.target.value)} />
              </div>
              <div>
                <Label htmlFor={`vpDesc-${vp.id}`}>Description</Label>
                <Textarea id={`vpDesc-${vp.id}`} value={vp.description} onChange={(e) => handleValuePropositionChange(vp.id, 'description', e.target.value)} rows={3} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="shadow-lg">
            <CardHeader>
            <CardTitle className="flex items-center"><ListChecks className="mr-2 h-5 w-5 text-primary"/>Featured Products</CardTitle>
            <CardDescription>Select which products to feature on the homepage. Up to 4 will be displayed.</CardDescription>
                <Input placeholder="Search products to feature..." value={productSearchTerm} onChange={(e) => setProductSearchTerm(e.target.value)} className="mt-2" />
            </CardHeader>
            <CardContent>
            <ScrollArea className="h-60 border rounded-md p-4">
                <div className="space-y-2">
                {filteredProducts.length > 0 ? filteredProducts.map(product => (
                    <div key={product.id} className="flex items-center space-x-2">
                    <Checkbox id={`product-${product.id}`} checked={(localSettings.featuredProductIds || []).includes(product.id)} onCheckedChange={() => handleFeaturedProductToggle(product.id)} />
                    <Label htmlFor={`product-${product.id}`} className="font-normal cursor-pointer">{product.name}</Label>
                    </div>
                )) : <p className="text-muted-foreground text-sm">No products match your search.</p>}
                </div>
            </ScrollArea>
            </CardContent>
        </Card>

        <Card className="shadow-lg">
            <CardHeader>
            <CardTitle className="flex items-center"><HelpCircleIcon className="mr-2 h-5 w-5 text-primary"/>Featured Q&amp;A</CardTitle>
            <CardDescription>Select general questions to feature on the homepage. Up to 3 will be displayed.</CardDescription>
            <Input placeholder="Search questions to feature..." value={questionSearchTerm} onChange={(e) => setQuestionSearchTerm(e.target.value)} className="mt-2" />
            </CardHeader>
            <CardContent>
            <ScrollArea className="h-60 border rounded-md p-4">
                <div className="space-y-2">
                {filteredQuestions.length > 0 ? filteredQuestions.map(question => (
                    <div key={question.id} className="flex items-center space-x-2">
                    <Checkbox id={`question-${question.id}`} checked={(localSettings.featuredQuestionIds || []).includes(question.id)} onCheckedChange={() => handleFeaturedQuestionToggle(question.id)} />
                    <Label htmlFor={`question-${question.id}`} className="font-normal cursor-pointer truncate max-w-full">{question.questionText}</Label>
                    </div>
                )) : <p className="text-muted-foreground text-sm">No questions match your search.</p>}
                </div>
            </ScrollArea>
            </CardContent>
        </Card>
      </div>


      <div className="mt-8 flex justify-end">
        <Button size="lg" onClick={handleSaveChanges} disabled={isSaving} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          {isSaving ? <LoaderIcon className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
          {isSaving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  );
}
