'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Gift, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { mockUser } from '@/lib/mock-data'; // Using mock user for subscription status

const MAX_FREE_ITEMS = 3;

export default function SubscriptionPage() {
  const { toast } = useToast();
  // Mocking user's current subscription status
  const [subscriptionStatus, setSubscriptionStatus] = useState(mockUser.subscriptionStatus);
  const [itemsListedCount, setItemsListedCount] = useState(mockUser.itemsListedCount);

  const handleSubscribe = () => {
    // Mock subscription logic
    setSubscriptionStatus('subscribed');
    toast({
      title: 'Subscription Successful!',
      description: 'You are now subscribed to Community Market Premium.',
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary to-accent p-8 text-primary-foreground">
            <CardTitle className="text-3xl font-bold">Join Community Market Premium</CardTitle>
            <CardDescription className="text-lg text-primary-foreground/90 pt-1">
              Unlock unlimited listings and enjoy our full marketplace experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {subscriptionStatus === 'subscribed' ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold">You are Subscribed!</h2>
                <p className="text-muted-foreground">Enjoy unlimited listings and all premium features.</p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-secondary/30">
                    <CardHeader>
                      <CardTitle className="flex items-center text-xl">
                        <Gift className="h-6 w-6 mr-2 text-primary" />
                        Free Trial
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> List up to {MAX_FREE_ITEMS} items</p>
                      <p className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Basic messaging features</p>
                      <p className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Browse all listings</p>
                      {subscriptionStatus === 'free_trial' && (
                        <p className="font-semibold pt-2">Items listed: {itemsListedCount}/{MAX_FREE_ITEMS}</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-primary border-2 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center text-xl">
                        <Star className="h-6 w-6 mr-2 text-accent" />
                        Premium Plan
                      </CardTitle>
                      <p className="text-2xl font-bold text-primary pt-1">£1.99 <span className="text-sm font-normal text-muted-foreground">/ month</span></p>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Unlimited item listings</p>
                      <p className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Advanced messaging features</p>
                      <p className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Priority support</p>
                      <p className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Early access to new features</p>
                    </CardContent>
                    <CardFooter>
                      <Button size="lg" className="w-full bg-accent hover:bg-accent/90" onClick={handleSubscribe}>
                        Subscribe Now
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Subscriptions are managedmockly and do not involve real payments. 
                  Free trial automatically applies to new users.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
