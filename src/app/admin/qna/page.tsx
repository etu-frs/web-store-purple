
"use client";

import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import type { Question } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Trash2, Edit3, MessageSquare, Search, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import dynamic from 'next/dynamic';

const ConfirmationModal = dynamic(() => import('@/components/common/ConfirmationModal').then(mod => mod.ConfirmationModal), {
  ssr: false,
  loading: () => <Button variant="ghost" size="sm" className="text-destructive" disabled><Loader2 className="h-4 w-4 animate-spin"/></Button>
});

export default function AdminQnAPage() {
  const { questions, answerQuestion, editAnswer, deleteQuestion, getProductById } = useAppContext();
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredQuestions = useMemo(() => {
    if (!searchTerm.trim()) {
      return questions.sort((a,b) => (a.answeredAt ? 1 : -1) - (b.answeredAt ? 1: -1) || b.createdAt - a.createdAt);
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return questions.filter(q => {
      const product = q.productId ? getProductById(q.productId) : null;
      return (
        q.questionText.toLowerCase().includes(lowerSearchTerm) ||
        q.userName.toLowerCase().includes(lowerSearchTerm) ||
        (q.productId && product && product.name.toLowerCase().includes(lowerSearchTerm)) ||
        (!q.productId && "general question".includes(lowerSearchTerm))
      );
    }).sort((a,b) => (a.answeredAt ? 1 : -1) - (b.answeredAt ? 1: -1) || b.createdAt - a.createdAt);
  }, [questions, searchTerm, getProductById]);

  const handleStartEdit = (question: Question) => {
    setEditingQuestionId(question.id);
    setAnswerText(question.answerText || '');
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setAnswerText('');
  };

  const handleSubmitAnswer = (questionId: string) => {
    const originalQuestionState = questions.find(origQ => origQ.id === questionId);
    if (!originalQuestionState) return;

    if (originalQuestionState.answerText) { // If it originally had an answer, we are editing it.
      editAnswer(questionId, answerText.trim()); // editAnswer should handle empty string as clearing.
    } else { // If it originally did not have an answer, this is a new answer.
      if (!answerText.trim()) return; // Don't submit empty new answer.
      answerQuestion(questionId, answerText.trim());
    }
    handleCancelEdit();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline text-primary">Manage Q&amp;A</h1>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-body flex items-center">
            <MessageSquare className="mr-3 h-6 w-6 text-primary" /> Customer Questions
          </CardTitle>
          <CardDescription>Review, answer, and manage customer questions about products or general inquiries.</CardDescription>
           <div className="mt-4">
            <div className="relative max-w-md">
              <Input
                type="text"
                placeholder="Search questions, users, product names..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                aria-label="Search questions"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredQuestions.length === 0 ? (
             <p className="text-center text-muted-foreground py-8">
                {questions.length === 0 ? "No questions submitted yet." : "No questions match your search criteria."}
            </p>
          ) : (
            <ScrollArea className="h-[60vh]">
              <Accordion type="multiple" className="w-full space-y-4 pr-4">
                {filteredQuestions.map(q => {
                  const originalQuestion = questions.find(origQ => origQ.id === q.id);
                  return (
                  <AccordionItem value={q.id} key={q.id} className="border rounded-lg bg-card">
                    <AccordionTrigger className="p-4 hover:no-underline">
                      <div className="flex flex-col text-left w-full">
                        <p className="font-semibold text-base font-body">
                          {q.questionText}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Asked by: {q.userName} on {format(new Date(q.createdAt), 'MMM d, yyyy')}
                          {q.productId && (
                            <span className="ml-2 text-primary">
                              (Product: {getProductById(q.productId)?.name || 'Unknown Product'})
                            </span>
                          )}
                           {!q.productId && <span className="ml-2 text-accent">(General Question)</span>}
                        </p>
                         {q.answerText && <Badge variant="secondary" className="mt-2 w-fit text-xs">{q.answeredAt ? 'Answered' : 'Pending'}</Badge>}
                         {!q.answerText && <Badge variant="outline" className="mt-2 w-fit text-xs text-yellow-600 border-yellow-600">Pending Answer</Badge>}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 pt-0">
                      {q.answerText && editingQuestionId !== q.id && (
                        <div className="mb-4 p-3 bg-muted/50 rounded-md">
                          <p className="font-semibold text-primary">Answer:</p>
                          <p className="text-sm whitespace-pre-wrap">{q.answerText}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            By: {q.answeredBy} on {format(new Date(q.answeredAt!), 'MMM d, yyyy')}
                          </p>
                        </div>
                      )}
                      {(editingQuestionId === q.id || !q.answerText) && (
                        <div className="space-y-2 mb-4">
                          <Label htmlFor={`answer-${q.id}`}>
                            {editingQuestionId === q.id && originalQuestion?.answerText ? 'Edit Answer:' : 'Your Answer:'}
                          </Label>
                          <Textarea
                            id={`answer-${q.id}`}
                            value={answerText}
                            onFocus={() => {
                              if (editingQuestionId !== q.id) {
                                if (q.answerText) {
                                  handleStartEdit(q);
                                } else {
                                  setEditingQuestionId(q.id);
                                  setAnswerText('');
                                }
                              }
                            }}
                            onChange={(e) => {
                                if (editingQuestionId === q.id) {
                                   setAnswerText(e.target.value);
                                } else {
                                   setEditingQuestionId(q.id);
                                   setAnswerText(e.target.value);
                                }
                            }}
                            placeholder="Type your answer here..."
                            rows={3}
                          />
                        </div>
                      )}
                      <div className="flex space-x-2 items-center">
                        {(editingQuestionId === q.id || !q.answerText) && (
                           <Button 
                            onClick={() => handleSubmitAnswer(q.id)} 
                            size="sm" 
                            disabled={!originalQuestion?.answerText && !answerText.trim()}
                            >
                            {editingQuestionId === q.id && originalQuestion?.answerText ? 'Save Changes' : 'Submit Answer'}
                           </Button>
                        )}
                        {editingQuestionId === q.id && (
                          <Button variant="outline" size="sm" onClick={handleCancelEdit}>Cancel</Button>
                        )}
                        {q.answerText && editingQuestionId !== q.id && (
                          <Button variant="outline" size="sm" onClick={() => handleStartEdit(q)} aria-label={`Edit answer for question: ${q.questionText}`}>
                            <Edit3 className="mr-2 h-4 w-4" /> Edit Answer
                          </Button>
                        )}
                        <ConfirmationModal
                            triggerText={<Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" aria-label={`Delete question: ${q.questionText}`}><Trash2 className="mr-2 h-4 w-4" />Delete Question</Button>}
                            title="Delete Question"
                            description={`Are you sure you want to delete this question: "${q.questionText}"? This action cannot be undone and will delete any associated answer.`}
                            onConfirm={() => deleteQuestion(q.id)}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  );
                })}
              </Accordion>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
