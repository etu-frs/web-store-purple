
"use client";

import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, X, MessageSquare, Loader2, Instagram, Trash2, MessageSquarePlus, Link as LinkIcon } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { storeAssistant } from '@/ai/flows/store-assistant-flow';
import type { StoreAssistantInput } from '@/ai/flows/store-assistant-flow';
import { useAppContext } from '@/contexts/AppContext';
import type { Product, Question, ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { INITIAL_HOMEPAGE_SETTINGS } from '@/data/seed';

interface SimplifiedProduct {
  id:string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  rating: number;
  likes: number; // Added
  numReviews: number; // Added
  keywords: string[];
}

interface SimplifiedQA {
  questionText: string;
  answerText?: string;
}

const EDGE_PADDING = 20;
const CHAT_WINDOW_GAP = 8;
const DRAG_THRESHOLD = 5; 
const REMOVE_TARGET_DIAMETER = 96; 
const VISIBLE_REMOVE_TARGET_HEIGHT = 40;


const StoreChatbot: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false);
  const { 
    products, 
    getGeneralQuestions, 
    appDataLoaded,
    homepageSettings,
    discountCoupons,
    isChatbotIconVisible, 
    setIsChatbotIconVisible,
    saveChatSession
  } = useAppContext();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [sessionId, setSessionId] = useState('');

  const [showRemoveTarget, setShowRemoveTarget] = useState(false);
  const [isIconOverRemoveTarget, setIsIconOverRemoveTarget] = useState(false);

  const [iconPosition, setIconPosition] = useState({ x: -100, y: -100 }); // Position off-screen initially
  const [isDragging, setIsDragging] = useState(false);
  const [isHiding, setIsHiding] = useState(false); // For graceful hide animation
  
  const chatbotIconRef = useRef<HTMLButtonElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const removeTargetRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const wasDragging = useRef(false); 
  const dragStartInfo = useRef<{ x: number, y: number, iconX: number, iconY: number } | null>(null);


  const simplifiedProducts = useRef<SimplifiedProduct[]>([]);
  const simplifiedQAs = useRef<SimplifiedQA[]>([]);
  const storeInfoContext = useRef<object>({});

  const chatbotSettings = homepageSettings?.chatbotSettings || INITIAL_HOMEPAGE_SETTINGS.chatbotSettings;


  const [dynamicWindowStyle, setDynamicWindowStyle] = useState<React.CSSProperties>({
    opacity: 0,
    transform: 'scale(0.95) translateZ(0)',
    pointerEvents: 'none',
    position: 'fixed',
    zIndex: 1000,
  });
  
  useEffect(() => {
    setHasMounted(true);
    // Generate a unique session ID when the component mounts
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).substring(2)}`);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);


  useEffect(() => {
    if (appDataLoaded && homepageSettings) {
      simplifiedProducts.current = products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description.substring(0, 200) + (p.description.length > 200 ? '...' : ''),
        price: p.price,
        category: p.category,
        stock: p.stock,
        rating: p.rating,
        likes: p.likes,
        numReviews: p.numReviews,
        keywords: p.keywords.slice(0, 5),
      }));

      simplifiedQAs.current = getGeneralQuestions()
        .filter(q => q.answerText)
        .map(q => ({
          questionText: q.questionText,
          answerText: q.answerText,
        }));
      
      storeInfoContext.current = {
          valuePropositions: homepageSettings.valuePropositions,
          socialLinks: homepageSettings.socialLinks?.filter(link => link.isEnabled && link.url) || [],
          activeCoupons: discountCoupons.filter(c => c.isActive).map(c => c.code)
      };

      if (!isReady && messages.length === 0) {
        setMessages([{
          id: 'welcome-msg',
          role: 'system',
          content: `Hello! I'm ${homepageSettings.storeName || 'MyDukaan'} Assistant, your expert shopping guide. How can I help you find the perfect product today?`
        }]);
      }
      setIsReady(true);
    }
  }, [
      appDataLoaded, 
      products, getGeneralQuestions, homepageSettings, discountCoupons,
      isReady, messages.length
  ]);
  
  useEffect(() => {
    // Set position on mount or when restored
    if (isChatbotIconVisible && chatbotIconRef.current && hasMounted) { 
        const iconWidth = chatbotIconRef.current.offsetWidth || 56; // Default to 14*4
        const iconHeight = chatbotIconRef.current.offsetHeight || 56;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        setIconPosition({ 
            x: viewportWidth - iconWidth - EDGE_PADDING, 
            y: viewportHeight - iconHeight - EDGE_PADDING 
        });
    }
  }, [isChatbotIconVisible, hasMounted]);


  useLayoutEffect(() => {
    if (isOpen && isChatbotIconVisible) {
      requestAnimationFrame(() => {
        if (chatbotIconRef.current && chatWindowRef.current) {
          const iconRect = chatbotIconRef.current.getBoundingClientRect();
          const windowHeight = chatWindowRef.current.offsetHeight;
          const windowWidth = chatWindowRef.current.offsetWidth;

          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;

          const newStyle: React.CSSProperties = {
            position: 'fixed',
            zIndex: 1000,
            transition: 'opacity 0.2s ease-out, transform 0.2s ease-out, top 0.2s ease-out, bottom 0.2s ease-out, left 0.2s ease-out, right 0.2s ease-out',
            opacity: 1,
            transform: 'scale(1) translateZ(0)',
            pointerEvents: 'auto',
          };

          const iconCenterXinViewport = iconRect.left + iconRect.width / 2;
          const iconIsOnLeftHalf = iconCenterXinViewport < viewportWidth / 2;

          if (iconIsOnLeftHalf) {
            newStyle.left = `${Math.max(EDGE_PADDING, iconRect.left)}px`;
            if (iconRect.left + windowWidth + EDGE_PADDING > viewportWidth) {
                newStyle.left = `${viewportWidth - EDGE_PADDING - windowWidth}px`;
            }
          } else {
            newStyle.right = `${Math.max(EDGE_PADDING, viewportWidth - iconRect.right)}px`;
             if (iconRect.right - windowWidth - EDGE_PADDING < 0) {
                newStyle.right = `${EDGE_PADDING}px`; 
            }
          }

          const spaceAvailableAbove = iconRect.top - EDGE_PADDING - CHAT_WINDOW_GAP;
          const spaceAvailableBelow = viewportHeight - iconRect.bottom - EDGE_PADDING - CHAT_WINDOW_GAP;

          if (windowHeight <= spaceAvailableAbove) {
            newStyle.bottom = `${viewportHeight - iconRect.top + CHAT_WINDOW_GAP}px`;
            newStyle.transformOrigin = iconIsOnLeftHalf ? 'bottom left' : 'bottom right';
          } else if (windowHeight <= spaceAvailableBelow) {
            newStyle.top = `${iconRect.bottom + CHAT_WINDOW_GAP}px`;
            newStyle.transformOrigin = iconIsOnLeftHalf ? 'top left' : 'top right';
          } else {
            if (spaceAvailableAbove >= spaceAvailableBelow && iconRect.top - windowHeight >= EDGE_PADDING / 2 ) {
              newStyle.bottom = `${viewportHeight - iconRect.top + CHAT_WINDOW_GAP}px`;
              newStyle.transformOrigin = iconIsOnLeftHalf ? 'bottom left' : 'bottom right';
            } else if (iconRect.bottom + windowHeight <= viewportHeight - EDGE_PADDING / 2) {
              newStyle.top = `${iconRect.bottom + CHAT_WINDOW_GAP}px`;
              newStyle.transformOrigin = iconIsOnLeftHalf ? 'top left' : 'top right';
            } else {
                newStyle.top = `${EDGE_PADDING}px`;
                newStyle.bottom = 'auto';
                newStyle.transformOrigin = iconIsOnLeftHalf ? 'top left' : 'top right';
            }
          }
          setDynamicWindowStyle(newStyle);
        }
      });
    } else {
      setDynamicWindowStyle(prevStyle => ({
        ...prevStyle,
        opacity: 0,
        transform: 'scale(0.95) translateZ(0)',
        pointerEvents: 'none',
      }));
    }
  }, [isOpen, iconPosition.x, iconPosition.y, isChatbotIconVisible]);


  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isLoading || !isReady) return;

    const newUserMessage: ChatMessage = {
      id: Date.now().toString() + 'user',
      role: 'user',
      content: inputValue.trim(),
    };
    
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    const aiChatHistory = updatedMessages.filter(msg => msg.role === 'user' || msg.role === 'model').slice(-10).map(msg => ({
      role: msg.role as 'user' | 'model',
      content: msg.content,
    }));

    try {
      if (!homepageSettings) throw new Error("Homepage settings not loaded.");

      const inputForAI: StoreAssistantInput = {
        storeName: homepageSettings.storeName,
        userQuery: newUserMessage.content,
        chatHistory: aiChatHistory,
        productContext: JSON.stringify(simplifiedProducts.current.slice(0, 50)),
        qaContext: JSON.stringify(simplifiedQAs.current.slice(0, 50)),
        storeContext: JSON.stringify(storeInfoContext.current),
        enhancedPrompt: chatbotSettings.enhancedPrompt,
        temperature: chatbotSettings.temperature,
      };

      const { botResponse, suggestedLink } = await storeAssistant(inputForAI);

      const newBotMessage: ChatMessage = {
        id: Date.now().toString() + 'model',
        role: 'model',
        content: botResponse,
        suggestedLink: suggestedLink,
      };
      
      const finalMessages = [...updatedMessages, newBotMessage];
      setMessages(finalMessages);
      await saveChatSession(sessionId, finalMessages);

    } catch (error) {
      console.error("Error calling store assistant flow:", error);
      const errorBotMessage: ChatMessage = {
        id: Date.now().toString() + 'error',
        role: 'system',
        content: "Sorry, I'm having trouble connecting right now. Please try again later.",
      };
      setMessages(prev => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startDrag = (clientX: number, clientY: number) => {
    if (!chatbotIconRef.current || isOpen) return;
    
    wasDragging.current = false;
    setIsDragging(true);
    setShowRemoveTarget(true); 

    const iconElement = chatbotIconRef.current;
    
    dragStartInfo.current = {
        x: clientX,
        y: clientY,
        iconX: iconElement.getBoundingClientRect().left,
        iconY: iconElement.getBoundingClientRect().top,
    };
  };

  const onDrag = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !chatbotIconRef.current || isOpen || !dragStartInfo.current) return;
    
    if (!wasDragging.current) {
      const dx = clientX - dragStartInfo.current.x;
      const dy = clientY - dragStartInfo.current.y;
      if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
        wasDragging.current = true;
      }
    }
    
    if (wasDragging.current) { 
      const iconElement = chatbotIconRef.current;
      const iconWidth = iconElement.offsetWidth;
      const iconHeight = iconElement.offsetHeight;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const deltaX = clientX - dragStartInfo.current.x;
      const deltaY = clientY - dragStartInfo.current.y;

      let targetVisualLeft = dragStartInfo.current.iconX + deltaX;
      let targetVisualTop = dragStartInfo.current.iconY + deltaY;
      
      const constrainedLeft = Math.max(
        EDGE_PADDING,
        Math.min(targetVisualLeft, viewportWidth - iconWidth - EDGE_PADDING)
      );
      const constrainedTop = Math.max(
        EDGE_PADDING,
        Math.min(targetVisualTop, viewportHeight - iconHeight - EDGE_PADDING)
      );

      setIconPosition({x: constrainedLeft, y: constrainedTop})

      if (removeTargetRef.current) {
        const iconRect = iconElement.getBoundingClientRect();
        const targetRect = removeTargetRef.current.getBoundingClientRect();
        const isOver = !(
          iconRect.right < targetRect.left ||
          iconRect.left > targetRect.right ||
          iconRect.bottom < targetRect.top ||
          iconRect.top > targetRect.bottom 
        );
        setIsIconOverRemoveTarget(isOver);
      }
    }
  }, [isDragging, isOpen]);

  const endDrag = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    setShowRemoveTarget(false); 
    
    const iconElement = chatbotIconRef.current;
    if (iconElement) {
        if (wasDragging.current && isIconOverRemoveTarget) {
          setIsHiding(true);
          setTimeout(() => {
            setIsChatbotIconVisible(false);
            setIsOpen(false);
            setIsHiding(false);
             toast({
                title: "Chatbot Hidden",
                description: "Chatbot icon removed. Restore it from the navbar if needed.",
                duration: 5000,
             });
          }, 300)

        } else if (wasDragging.current) {
            const iconRect = iconElement.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const iconWidth = iconRect.width;
            const iconCenterX = iconRect.left + iconWidth / 2;

            let finalX = (iconCenterX < viewportWidth / 2) 
                ? EDGE_PADDING 
                : viewportWidth - iconWidth - EDGE_PADDING;
            let finalY = iconRect.top;
            setIconPosition({ x: finalX, y: finalY });
        }
    }
    
    setIsIconOverRemoveTarget(false);
    dragStartInfo.current = null;
  }, [isDragging, isIconOverRemoveTarget, setIsChatbotIconVisible, toast]);

  // Mouse Handlers
  const onMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  };
  const onMouseMove = useCallback((e: MouseEvent) => {
    onDrag(e.clientX, e.clientY);
  }, [onDrag]);
  const onMouseUp = useCallback((e: MouseEvent) => {
    endDrag();
  }, [endDrag]);

  // Touch Handlers
  const onTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY);
  };
  const onTouchMove = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    onDrag(touch.clientX, touch.clientY);
  }, [onDrag]);
  const onTouchEnd = useCallback((e: TouchEvent) => {
    endDrag();
  }, [endDrag]);

  // Registering/Unregistering event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      document.addEventListener('touchmove', onTouchMove, { passive: true });
      document.addEventListener('touchend', onTouchEnd);
      document.body.style.userSelect = 'none'; 
    } else {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      document.body.style.userSelect = '';
    }
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      document.body.style.userSelect = '';
    };
  }, [isDragging, onMouseMove, onMouseUp, onTouchMove, onTouchEnd]);

  const handleIconClick = () => {
    if (wasDragging.current) {
      wasDragging.current = false; 
      return;
    }
    setIsOpen(true);
  };

  const getLinkButtonText = (link: string): string => {
      if (link.includes('/products/')) return 'Go to Product';
      if (link.includes('/qna')) return 'See All Q&A';
      if (link.includes('/contact')) return 'Contact Us';
      return 'Open Link';
  }

  if (!hasMounted || !chatbotSettings?.isEnabled) {
    return null;
  }

  return (
    <>
      {isChatbotIconVisible && (
        <Button
          ref={chatbotIconRef}
          variant="default"
          size="icon"
          className={cn(
              "fixed rounded-full shadow-xl w-14 h-14 z-[1000] flex items-center justify-center touch-none",
              "transition-all", // Let transition be controlled by duration class
              isDragging ? "cursor-grabbing duration-0" : "cursor-grab duration-300 ease-out",
              isIconOverRemoveTarget && "scale-75 opacity-80",
              (isOpen || isHiding) && "opacity-0 scale-0 pointer-events-none",
          )}
          style={{
            top: `${iconPosition.y}px`,
            left: `${iconPosition.x}px`,
          }}
          onClick={handleIconClick}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          aria-label="Open Chatbot"
        >
          <MessageSquare className="h-7 w-7" />
        </Button>
      )}

      <div
          ref={removeTargetRef}
          className={cn(
              "fixed left-1/2 -translate-x-1/2 rounded-full flex flex-col items-center justify-start pt-3 z-[999]",
              "bg-destructive shadow-[0_0_0_8px_hsl(var(--destructive)/.3)]",
              "transition-all duration-300 ease-out",
              showRemoveTarget ? "opacity-100 transform-none" : "opacity-0 translate-y-20 pointer-events-none",
              isIconOverRemoveTarget && "scale-125 shadow-[0_0_0_16px_hsl(var(--destructive)/.5)]"
          )}
          style={{
              width: `${REMOVE_TARGET_DIAMETER}px`,
              height: `${REMOVE_TARGET_DIAMETER}px`,
              bottom: `calc(-1 * (${REMOVE_TARGET_DIAMETER}px - ${VISIBLE_REMOVE_TARGET_HEIGHT}px))`,
          }}
      >
          <Trash2 className={cn("h-8 w-8 text-destructive-foreground transition-transform duration-300", isIconOverRemoveTarget && "scale-125 rotate-[-15deg]")} />
          <p className="text-xs text-destructive-foreground mt-1">Remove</p>
      </div>

      <Card
            ref={chatWindowRef}
            style={dynamicWindowStyle}
            className={cn(
                "shadow-2xl rounded-lg w-[90vw] max-w-md h-[70vh] max-h-[500px] flex flex-col",
            )}
        >
          <CardHeader className="flex flex-row items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
            <CardTitle className="text-lg font-headline flex items-center">
              <Bot className="mr-2 h-5 w-5" /> {homepageSettings?.storeName || 'MyDukaan'} Assistant
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground">
              <X className="h-5 w-5" />
              <span className="sr-only">Close chat</span>
            </Button>
          </CardHeader>
          <CardContent className="flex-grow p-0 overflow-hidden">
            <ScrollArea className="h-full p-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "mb-3 p-2.5 rounded-lg max-w-[85%] clear-both text-sm shadow-sm",
                    msg.role === 'user' && "bg-accent text-accent-foreground ml-auto rounded-br-none",
                    msg.role === 'model' && "bg-muted text-muted-foreground mr-auto rounded-bl-none",
                    msg.role === 'system' && "bg-primary/10 dark:bg-primary/20 text-primary/80 dark:text-primary/90 text-xs text-center italic w-full max-w-full mx-auto clear-both"
                  )}
                >
                  {msg.content}
                  {msg.role === 'model' && msg.suggestedLink && (
                    <div className="mt-2">
                       <Button asChild size="sm" variant="outline" onClick={() => setIsOpen(false)}>
                         {msg.suggestedLink.startsWith('http') ? (
                            <a href={msg.suggestedLink} target="_blank" rel="noopener noreferrer">
                                <LinkIcon className="mr-2 h-4 w-4" />
                                {getLinkButtonText(msg.suggestedLink)}
                            </a>
                         ) : (
                            <Link href={msg.suggestedLink}>
                                <LinkIcon className="mr-2 h-4 w-4" />
                                {getLinkButtonText(msg.suggestedLink)}
                            </Link>
                         )}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
               <div ref={messagesEndRef} />
            </ScrollArea>
          </CardContent>
           <CardFooter className="p-3 border-t flex flex-col items-stretch gap-2">
            {isLoading && (
                <div className="flex items-center justify-start p-1 text-xs text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Assistant is typing...
                </div>
            )}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="flex w-full items-center space-x-2"
            >
              <Input
                ref={inputRef}
                type="text"
                placeholder="Ask about products or our store..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-grow"
                disabled={isLoading || !isReady}
                aria-label="Chat message input"
                onKeyDown={(e) => { if (e.key === 'Enter' && !isLoading && inputValue.trim() !== '') { handleSendMessage(); e.preventDefault(); } }}
              />
              <Button type="submit" size="icon" disabled={isLoading || inputValue.trim() === '' || !isReady} aria-label="Send message">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
            <div className="text-center text-xs text-muted-foreground">
              Made by frs7bk
              <a
                href="https://www.instagram.com/frs7bk/"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 inline-flex items-center text-primary hover:underline"
                aria-label="frs7bk Instagram"
              >
                <Instagram className="h-3 w-3" />
              </a>
            </div>
          </CardFooter>
        </Card>
    </>
  );
};
StoreChatbot.displayName = "StoreChatbot";
export default StoreChatbot;
