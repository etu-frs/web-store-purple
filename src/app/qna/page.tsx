
"use client";

import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, MessageCircle, Send, User } from 'lucide-react';
import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/shared/PageLoader';

const Navbar = dynamic(() => import('@/components/shared/Navbar').then(mod => mod.Navbar), { 
  ssr: false,
});
const Footer = dynamic(() => import('@/components/shared/Footer').then(mod => mod.Footer), { 
  ssr: false,
});


export default function QnAPage() {
  const { addQuestion, getGeneralQuestions, appDataLoaded } = useAppContext();
  const [userName, setUserName] = useState('');
  const [questionText, setQuestionText] = useState('');

  const generalQuestions = getGeneralQuestions();

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName && questionText) {
      addQuestion({
        userName,
        questionText,
        userId: 'guestUser', 
      });
      setUserName('');
      setQuestionText('');
    }
  };

  if (!appDataLoaded) {
      return <PageLoader message="Loading Q&A..." />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-xl mb-12">
            <CardHeader className="text-center">
              <HelpCircle className="mx-auto h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-4xl font-headline">Questions & Answers</CardTitle>
              <CardDescription className="text-lg text-muted-foreground font-body">
                Find answers to common questions or ask your own!
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generalQuestions.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {generalQuestions.map((q) => (
                    <AccordionItem value={q.id} key={q.id}>
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex flex-col">
                          <span className="font-semibold text-lg font-body">{q.questionText}</span>
                          <span className="text-xs text-muted-foreground mt-1">
                            Asked by {q.userName} on {new Date(q.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="font-body">
                        {q.answerText ? (
                          <div>
                            <p className="text-foreground/90">{q.answerText}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Answered by {q.answeredBy} on {new Date(q.answeredAt!).toLocaleDateString()}
                            </p>
                          </div>
                        ) : (
                          <p className="italic text-muted-foreground">
                            This question is currently under review. We'll post an answer soon!
                          </p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-center text-muted-foreground font-body py-8">
                  No general questions have been asked yet. Be the first to ask!
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardHeader>
              <MessageCircle className="mx-auto h-10 w-10 text-primary mb-3" />
              <CardTitle className="text-3xl font-headline text-center">Ask a New Question</CardTitle>
              <CardDescription className="text-center text-muted-foreground font-body">
                Can't find your answer? Submit your question to our team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleQuestionSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="userName" className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" /> Your Name
                  </Label>
                  <Input
                    id="userName"
                    type="text"
                    placeholder="Your Name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                    className="text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="questionText" className="flex items-center">
                    <HelpCircle className="mr-2 h-4 w-4 text-muted-foreground" /> Your Question
                  </Label>
                  <Textarea
                    id="questionText"
                    placeholder="Type your question here..."
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    required
                    rows={5}
                    className="text-base"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Send className="mr-2 h-5 w-5" /> Submit Question
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
