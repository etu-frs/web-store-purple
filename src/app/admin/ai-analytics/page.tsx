
"use client";

import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, BrainCircuit, Sparkles, AlertTriangle, ThumbsUp, ThumbsDown, MessageCircle, Tag, ShoppingBag, Lightbulb, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeConversations } from '@/ai/flows/analyze-conversations'; // Updated import
import type { AnalyzeConversationsOutput } from '@/ai/flows/analyze-conversations'; // Updated import
import { Badge } from '@/components/ui/badge';

export default function AiAnalyticsPage() {
  const { chatSessions, appDataLoaded } = useAppContext(); // Use the unified loading flag
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeConversationsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    if (!appDataLoaded) {
      toast({ title: "Data not ready", description: "Please wait for chat session data to load.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    
    if (chatSessions.length === 0) {
      toast({ title: "No Data", description: "There are no chat conversations to analyze.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    try {
      // Pass only the messages from each session for analysis
      const conversationContents = chatSessions.map(session => session.messages);
      const result = await analyzeConversations({ conversations: conversationContents });
      setAnalysisResult(result);
    } catch (err: any) {
      console.error("AI analysis failed:", err);
      const errorMessage = err.message?.includes('API key') 
        ? "AI analysis failed. Please ensure your Gemini API key is configured."
        : "An error occurred during AI analysis. The service may be unavailable.";
      setError(errorMessage);
      toast({ title: "Analysis Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const sentimentMeta = {
    High: { icon: ThumbsUp, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    Medium: { icon: MessageCircle, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
    Low: { icon: ThumbsDown, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold font-headline text-primary flex items-center"><BrainCircuit className="mr-3 h-8 w-8"/>Chatbot Conversation AI Analysis</h1>
        <Button onClick={handleRunAnalysis} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...
            </>
          ) : (
             <>
              <Sparkles className="mr-2 h-5 w-5" /> Generate Analysis
            </>
          )}
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Conversation Analysis Dashboard</CardTitle>
          <CardDescription>Click "Generate Analysis" to process all saved chatbot conversations with customers to extract key business insights. This may take a moment.</CardDescription>
        </CardHeader>
        <CardContent>
          {!analysisResult && !isLoading && !error && (
            <div className="text-center py-16 text-muted-foreground">
              <p>Your conversation analysis report will appear here.</p>
            </div>
          )}
          {isLoading && (
            <div className="text-center py-16">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">AI is processing {chatSessions.length} conversations...</p>
            </div>
          )}
          {error && (
             <div className="text-center py-16 text-destructive">
                <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
                <p className="font-semibold">Analysis Failed</p>
                <p>{error}</p>
             </div>
          )}
          {analysisResult && (
            <div className="space-y-6">
              <Card className={sentimentMeta[analysisResult.overallSatisfaction]?.bgColor}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        {React.createElement(sentimentMeta[analysisResult.overallSatisfaction]?.icon || AlertTriangle, { className: `h-8 w-8 ${sentimentMeta[analysisResult.overallSatisfaction]?.color}`})}
                        Overall Satisfaction: {analysisResult.overallSatisfaction}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="italic text-muted-foreground">{analysisResult.satisfactionReasoning}</p>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle className="flex items-center text-lg"><Tag className="mr-2 h-5 w-5 text-primary"/>Common Topics</CardTitle></CardHeader>
                    <CardContent><div className="flex flex-wrap gap-2">{analysisResult.commonTopics.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="flex items-center text-lg"><ShoppingBag className="mr-2 h-5 w-5 text-blue-500"/>Product Interests</CardTitle></CardHeader>
                    <CardContent><ul className="list-disc pl-5 space-y-1 text-sm">{analysisResult.productInterests.map((p,i) => <li key={i}>{p}</li>)}</ul></CardContent>
                </Card>
                 <Card className="bg-red-500/5">
                    <CardHeader><CardTitle className="flex items-center text-lg"><ThumbsDown className="mr-2 h-5 w-5 text-red-600"/>User Pain Points</CardTitle></CardHeader>
                    <CardContent><ul className="list-disc pl-5 space-y-1 text-sm">{analysisResult.userPainPoints.map((p,i) => <li key={i}>{p}</li>)}</ul></CardContent>
                </Card>
                 <Card className="bg-green-500/5">
                    <CardHeader><CardTitle className="flex items-center text-lg"><TrendingUp className="mr-2 h-5 w-5 text-green-600"/>Sales Opportunities</CardTitle></CardHeader>
                    <CardContent><ul className="list-disc pl-5 space-y-1 text-sm">{analysisResult.salesOpportunities.map((p,i) => <li key={i}>{p}</li>)}</ul></CardContent>
                </Card>
              </div>

               <Card>
                    <CardHeader><CardTitle className="flex items-center text-lg"><Lightbulb className="mr-2 h-5 w-5 text-yellow-600"/>Unanswered Questions & Ideas</CardTitle></CardHeader>
                    <CardContent>
                        {analysisResult.unansweredQuestions.length > 0 ? (
                           <ul className="list-disc pl-5 space-y-1 text-sm">{analysisResult.unansweredQuestions.map((p,i) => <li key={i}>{p}</li>)}</ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">Great job! The bot seems to be handling all questions well.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    