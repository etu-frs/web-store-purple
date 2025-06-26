// This is now a Server Component, so it does not need "use client".
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TermsOfServicePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-4xl font-headline text-center">Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none space-y-4 font-body">
            <p>Last updated: {new Date().toLocaleDateString('en-CA')}</p>
            
            <h2 className="font-headline">1. Agreement to Terms</h2>
            <p>By using our website, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>

            <h2 className="font-headline">2. Purchases and Payment</h2>
            <p>We accept various forms of payment, as listed at checkout. You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Site. Sales tax will be added to the price of purchases as deemed required by us.</p>
            
            <h2 className="font-headline">3. Return Policy</h2>
            <p>Please review our Return Policy posted on the Site prior to making any purchases. All sales are considered final unless otherwise specified in the Return Policy.</p>

            <h2 className="font-headline">4. Prohibited Activities</h2>
            <p>You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.</p>
            
            <h2 className="font-headline">5. Intellectual Property Rights</h2>
            <p>Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the “Content”) and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.</p>
            
            <h2 className="font-headline">6. Governing Law</h2>
            <p>These Terms of Service and your use of the Site are governed by and construed in accordance with the laws of the applicable jurisdiction without regard to its conflict of law principles.</p>

            <h2 className="font-headline">7. Contact Us</h2>
            <p>In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us through our contact page.</p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfServicePage;
