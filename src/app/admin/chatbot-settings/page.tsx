"use client";

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import type { ChatbotSettings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Bot, Save, Sparkles, Loader2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { enhanceChatbotPrompt } from '@/ai/flows/enhance-chatbot-prompt';

export default function ChatbotSettingsPage() {
  const { homepageSettings, setHomepageSettings, appDataLoaded } = useAppContext();
  const { toast } = useToast();

  const [settings, setSettings] = useState<ChatbotSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  useEffect(() => {
    if (appDataLoaded) {
      setSettings(homepageSettings.chatbotSettings);
    }
  }, [appDataLoaded, homepageSettings.chatbotSettings]);

  const handleInputChange = (field: keyof ChatbotSettings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  };

  const handleEnhancePrompt = async () => {
    if (!settings?.basePrompt) {
      toast({ title: "Error", description: "Please enter a base prompt first.", variant: "destructive" });
      return;
    }
    setIsEnhancing(true);
    try {
      const result = await enhanceChatbotPrompt({ 
        userPrompt: settings.basePrompt,
        storeName: homepageSettings.storeName 
      });
      if (result.enhancedPrompt) {
        handleInputChange('enhancedPrompt', result.enhancedPrompt);
        toast({ title: "Prompt Enhanced!", description: "The AI has generated a new, detailed prompt for your chatbot." });
      } else {
        throw new Error("The AI returned an empty response.");
      }
    } catch (error: any) {
      console.error("Failed to enhance prompt:", error);
      toast({ title: "Enhancement Failed", description: error.message || "Could not connect to the AI service.", variant: "destructive" });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await setHomepageSettings(prev => ({
        ...prev,
        chatbotSettings: settings,
      }));
      toast({ title: "Settings Saved", description: "Chatbot settings have been updated successfully." });
    } catch (error: any) {
      toast({ title: "Error Saving", description: error.message || "Could not save settings.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!appDataLoaded || !settings) {
      return (
          <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" /> Loading chatbot settings...
          </div>
      );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center"><Bot className="mr-3 h-8 w-8"/>Chatbot Settings</h1>
          <p className="text-muted-foreground mt-1">Configure your AI sales assistant's personality, behavior, and availability.</p>
        </div>
        <div className="flex items-center space-x-2">
            <Label htmlFor="chatbot-enabled" className="text-sm font-medium">Enable Chatbot</Label>
            <Switch
                id="chatbot-enabled"
                checked={settings.isEnabled}
                onCheckedChange={(checked) => handleInputChange('isEnabled', checked)}
                aria-label="Enable or disable the store chatbot"
            />
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Chatbot Personality</CardTitle>
          <CardDescription>Define how your chatbot interacts with customers. Start with a simple prompt, then use AI to enhance it.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <Label htmlFor="basePrompt" className="text-lg font-semibold">1. Your Base Prompt</Label>
                <p className="text-sm text-muted-foreground mb-2">Describe your bot in your own words. (e.g., "A very formal and professional assistant," or "A funny bot that uses pirate slang.")</p>
                <Textarea
                    id="basePrompt"
                    value={settings.basePrompt}
                    onChange={(e) => handleInputChange('basePrompt', e.target.value)}
                    rows={4}
                    placeholder="e.g., A friendly and enthusiastic assistant who loves helping customers find the best deals."
                />
            </div>

            <div className="text-center">
                <Button onClick={handleEnhancePrompt} disabled={isEnhancing}>
                    {isEnhancing ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Enhancing...</>
                    ) : (
                        <><Sparkles className="mr-2 h-5 w-5" />Use AI to Enhance Prompt</>
                    )}
                </Button>
            </div>

            <div>
                <Label htmlFor="enhancedPrompt" className="text-lg font-semibold">2. AI-Enhanced Prompt (Used by the Chatbot)</Label>
                <p className="text-sm text-muted-foreground mb-2">This is the detailed prompt the AI will use. You can manually edit it after enhancement.</p>
                <Textarea
                    id="enhancedPrompt"
                    value={settings.enhancedPrompt}
                    onChange={(e) => handleInputChange('enhancedPrompt', e.target.value)}
                    rows={12}
                    className="font-mono text-xs bg-muted/30"
                />
            </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Response Behavior</CardTitle>
          <CardDescription>Control the creativity and randomness of the chatbot's responses.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <Label htmlFor="temperature" className="font-semibold">Creativity (Temperature)</Label>
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>More Factual & Deterministic</span>
                    <span>More Creative & Random</span>
                </div>
                <Slider
                    id="temperature"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[settings.temperature]}
                    onValueChange={([value]) => handleInputChange('temperature', value)}
                    className="mt-2"
                />
                 <div className="text-center font-bold text-primary mt-1">{settings.temperature.toFixed(1)}</div>
            </div>
             <div className="flex items-start gap-3 rounded-lg border p-4 text-sm bg-muted/20">
                <Info className="h-5 w-5 text-primary mt-1 flex-shrink-0"/>
                <p className="text-muted-foreground">
                  A lower value (e.g., 0.2) makes the bot's answers more consistent and direct. A higher value (e.g., 0.9) allows for more varied and imaginative responses. The default of 0.7 is a good balance.
                </p>
            </div>
        </CardContent>
         <CardFooter>
            <Button size="lg" onClick={handleSaveChanges} disabled={isSaving} className="ml-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                Save All Settings
            </Button>
         </CardFooter>
      </Card>
    </div>
  );
}
