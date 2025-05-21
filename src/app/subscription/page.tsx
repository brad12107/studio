
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Gift, Star, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { mockUser } from '@/lib/mock-data'; 
import type { User } from '@/lib/types';
import { useRouter } from 'next/navigation';

const MAX_FREE_ITEMS = 3;

export default function SubscriptionPage() {
  const { toast } = useToast(); // Keep toast for potential future use or non-payment related messages
  const router = useRouter();
  const [subscriptionStatus, setSubscriptionStatus] = useState<User["subscriptionStatus"]>(mockUser.subscriptionStatus);
  const [itemsListedCount, setItemsListedCount] = useState(mockUser.itemsListedCount);
  const [enhancedListingsRemaining, setEnhancedListingsRemaining] = useState(mockUser.enhancedListingsRemaining || 0);

  // Effect to update local state when mockUser changes (e.g., after payment)
  useEffect(() => {
    setSubscriptionStatus(mockUser.subscriptionStatus);
    setItemsListedCount(mockUser.itemsListedCount);
    setEnhancedListingsRemaining(mockUser.enhancedListingsRemaining || 0);
  }, [mockUser.subscriptionStatus, mockUser.itemsListedCount, mockUser.enhancedListingsRemaining]);


  const navigateToPayment = (plan: 'free_trial' | 'basic' | 'premium_plus') => {
    router.push(`/payment?plan=${plan}`);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-5xl mx-auto">
        <Card className="shadow-xl overflow-hidden mb-8">
          <CardHeader className="bg-gradient-to-r from-primary to-accent p-8 text-primary-foreground">
            <CardTitle className="text-3xl font-bold">Join Barrow Market Place Subscriptions</CardTitle>
            <CardDescription className="text-lg text-primary-foreground/90 pt-1">
              Unlock more listings, enhanced visibility, and enjoy our full marketplace experience.
            </CardDescription>
          </CardHeader>
        </Card>

        {subscriptionStatus === 'subscribed' && (
          <div className="text-center py-8 mb-8 bg-card text-card-foreground rounded-lg shadow-md">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold">You are on the Basic Plan!</h2>
            <p className="text-muted-foreground">Enjoy unlimited listings and all standard features.</p>
          </div>
        )}
        {subscriptionStatus === 'premium_plus' && (
          <div className="text-center py-8 mb-8 bg-card text-card-foreground rounded-lg shadow-md">
            <ShieldCheck className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold">You are on the Premium Plan!</h2>
            <p className="text-muted-foreground">Enjoy unlimited listings, {enhancedListingsRemaining} free enhanced listings remaining, and all premium features.</p>
          </div>
        )}
         {subscriptionStatus === 'free_trial' && (
          <div className="text-center py-8 mb-8 bg-card text-card-foreground rounded-lg shadow-md">
            <Gift className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-semibold">You are on the Free Trial!</h2>
            <p className="text-muted-foreground">You can list up to {MAX_FREE_ITEMS - itemsListedCount} more items.</p>
          </div>
        )}


        <div className="grid md:grid-cols-3 gap-6">
          {/* Free Trial Card */}
          <Card className="flex flex-col bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Gift className="h-6 w-6 mr-2 text-primary" />
                Free Trial
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm flex-grow">
              <p className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> List up to {MAX_FREE_ITEMS} items</p>
              <p className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Basic messaging features</p>
              <p className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Browse all listings</p>
              {subscriptionStatus === 'free_trial' && (
                <p className="font-semibold pt-2">Items listed: {itemsListedCount}/{MAX_FREE_ITEMS}</p>
              )}
            </CardContent>
            <CardFooter>
                <Button 
                    size="lg" 
                    className="w-full" 
                    variant={subscriptionStatus === 'free_trial' ? "outline" : "success"}
                    disabled={subscriptionStatus !== 'none'} // Disable if already on any plan including free_trial after activation
                    onClick={() => {
                        if (subscriptionStatus === 'none') {
                           navigateToPayment('free_trial');
                        }
                    }}
                >
                    {subscriptionStatus === 'free_trial' ? 'Currently on Free Trial' : 
                     subscriptionStatus === 'none' ? 'Start Free Trial' : 'Free Trial Used'}
                </Button>
            </CardFooter>
          </Card>

          {/* Basic Plan Card */}
          <Card className={`${subscriptionStatus === 'subscribed' ? 'border-green-500 border-2' : 'border-primary border-2'} shadow-lg flex flex-col`}>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Star className="h-6 w-6 mr-2 text-accent" />
                Basic Plan
              </CardTitle>
              <p className="text-2xl font-bold text-primary pt-1">£1.99 <span className="text-sm font-normal text-muted-foreground">/ month</span></p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm flex-grow">
              <p className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Unlimited item listings</p>
              <p className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> No standard listing fees</p>
              <p className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Advanced messaging features</p>
              <p className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Priority support</p>
            </CardContent>
            <CardFooter>
              <Button 
                size="lg" 
                className="w-full bg-accent hover:bg-accent/90" 
                onClick={() => navigateToPayment('basic')}
                disabled={subscriptionStatus === 'subscribed' || subscriptionStatus === 'premium_plus'}
              >
                {subscriptionStatus === 'subscribed' ? 'Currently Subscribed' : 'Subscribe Now'}
              </Button>
            </CardFooter>
          </Card>

          {/* Premium Plan Card */}
          <Card className={`${subscriptionStatus === 'premium_plus' ? 'border-green-500 border-2' : 'border-purple-500 border-2'} shadow-lg flex flex-col`}>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <ShieldCheck className="h-6 w-6 mr-2 text-purple-500" />
                Premium Plan
              </CardTitle>
              <p className="text-2xl font-bold text-purple-600 pt-1">£2.99 <span className="text-sm font-normal text-muted-foreground">/ month</span></p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm flex-grow">
              <p className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Unlimited item listings</p>
              <p className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> 5 FREE Enhanced Listings / month</p>
              <p className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> No standard listing fees</p>
              <p className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Advanced messaging features</p>
              <p className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Priority support</p>
              <p className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Early access to new features</p>
            </CardContent>
            <CardFooter>
              <Button 
                size="lg" 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white" 
                onClick={() => navigateToPayment('premium_plus')}
                disabled={subscriptionStatus === 'premium_plus'}
              >
                {subscriptionStatus === 'premium_plus' ? 'Currently Subscribed' : 'Go Premium'}
              </Button>
            </CardFooter>
          </Card>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-6">
          Select a plan to proceed to our mock payment page. No real charges will apply.
          Enhanced listings reset notionally each month for Premium Plan.
        </p>
      </div>
    </div>
  );
}

