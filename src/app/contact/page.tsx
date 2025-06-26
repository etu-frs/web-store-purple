
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageSquare, User, Send, Instagram as InstagramIcon, MessageCircle as WhatsAppIcon, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';
import { sendContactMessageNotification } from '@/app/actions/telegramActions'; // Re-added import

const Navbar = dynamic(() => import('@/components/shared/Navbar').then(mod => mod.Navbar), { ssr: false });
const DynamicFooter = dynamic(() => import('@/components/shared/Footer').then(mod => mod.Footer), { ssr: false });


export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [instagram, setInstagram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [otherContact, setOtherContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!name.trim() || !email.trim() || !message.trim()) {
        toast({
            title: "Missing Required Fields",
            description: "Please fill in your name, email, and message.",
            variant: "destructive",
        });
        setIsSubmitting(false);
        return;
    }
    
    // Use the professional Telegram notification function
    try {
        await sendContactMessageNotification({ name, email, message, instagram, whatsapp, otherContact });
        toast({
          title: "Message Sent!",
          description: "Thank you for contacting us. We'll get back to you soon.",
        });

        // Clear fields after successful submission
        setName('');
        setEmail('');
        setMessage('');
        setInstagram('');
        setWhatsapp('');
        setOtherContact('');
    } catch (error) {
        console.error("Failed to send contact message:", error);
        toast({
            title: "Submission Error",
            description: "There was a problem sending your message. Please try again later.",
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <Mail className="mx-auto h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-4xl font-headline">Get in Touch</CardTitle>
              <CardDescription className="text-lg text-muted-foreground font-body">
                We'd love to hear from you! Send us a message with any questions or feedback.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" /> Your Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="text-base"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" /> Your Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="text-base"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" /> Your Message *
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="How can we help you today?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={6}
                    className="text-base"
                    disabled={isSubmitting}
                  />
                </div>

                <p className="text-sm text-muted-foreground">Optionally, provide other ways we can reach you:</p>
                
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="flex items-center">
                    <InstagramIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Instagram Username
                  </Label>
                  <Input
                    id="instagram"
                    type="text"
                    placeholder="@yourprofile"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="text-base"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="flex items-center">
                    <WhatsAppIcon className="mr-2 h-4 w-4 text-muted-foreground" /> WhatsApp Number
                  </Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="+12345678900"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="text-base"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otherContact" className="flex items-center">
                    <LinkIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Other Contact Method
                  </Label>
                  <Input
                    id="otherContact"
                    type="text"
                    placeholder="e.g., Telegram @username, Skype ID"
                    value={otherContact}
                    onChange={(e) => setOtherContact(e.target.value)}
                    className="text-base"
                    disabled={isSubmitting}
                  />
                </div>
                
                <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" /> Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <DynamicFooter />
    </div>
  );
}
