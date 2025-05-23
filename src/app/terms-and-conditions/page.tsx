
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Metadata } from 'next';
import { FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms and Conditions - Barrow Market Place',
  description: 'Read the terms and conditions for using Barrow Market Place.',
};

export default function TermsAndConditionsPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex items-center">
            <FileText className="h-7 w-7 mr-3 text-primary" />
            <CardTitle className="text-2xl font-bold">Terms and Conditions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
            <div className="space-y-6 text-sm text-card-foreground">
              <section>
                <h2 className="text-lg font-semibold mb-2">1. General</h2>
                <p>
                  By using Barrow Marketplace, you agree to these terms and conditions.
                  Barrow Marketplace provides a platform for users to buy and sell items at their own risk.
                </p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">2. User Responsibility</h2>
                <p>
                  All transactions conducted on Barrow Marketplace are solely at the user’s risk.
                  While the platform strives to implement security measures to prevent scams, users should exercise caution when making transactions.
                  Barrow Marketplace does not guarantee a scam-free experience.
                </p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">3. Liability</h2>
                <p>
                  Barrow Marketplace is not responsible for any financial losses incurred by users due to fraudulent activity, misrepresentation, or unsuccessful transactions.
                  Any loss of money due to a listing is entirely the user’s responsibility.
                  Users should conduct proper due diligence before engaging in transactions.
                </p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">4. Security Measures</h2>
                <p>
                  Barrow Marketplace implements security measures to reduce fraudulent activities.
                  However, the platform cannot guarantee complete protection against scammers.
                  Users are encouraged to report suspicious activity and use secure payment methods when possible.
                </p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">5. Amendments to Terms</h2>
                <p>
                  These terms may be updated periodically. Users will be informed of any changes that may affect their rights and responsibilities.
                </p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">6. Acceptance of Terms</h2>
                <p>
                  By using Barrow Marketplace, you acknowledge that you have read, understood, and agreed to these terms and conditions.
                </p>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
