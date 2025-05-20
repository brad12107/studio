
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Gift, Star, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { mockUser } from '@/lib/mock-data'; 
import type { User } from '@/lib/types';

const MAX_FREE_ITEMS = 3;

export default function SubscriptionPage() {
  const { toast } = useToast();
  const [subscriptionStatus, setSubscriptionStatus] = useState<User["subscriptionStatus"]>(mockUser.subscriptionStatus);
  const [itemsListedCount, setItemsListedCount] = useState(mockUser.itemsListedCount);
  const [enhancedListingsRemaining, setEnhancedListingsRemaining] = useState(mockUser.enhancedListingsRemaining || 0);

  const handleSubscribe = (plan: 'premium' | 'premium_plus') => {
    if (plan === 'premium') {
      mockUser.subscriptionStatus = 'subscribed';
      mockUser.enhancedListingsRemaining = 0;
      setSubscriptionStatus('subscribed');
      setEnhancedListingsRemaining(0);
      toast({
        title: 'Subscription Successful!',
        description: 'You are now subscribed to Barrow Market Place Premium.',
      });
    } else if (plan === 'premium_plus') {
      mockUser.subscriptionStatus = 'premium_plus';
      mockUser.enhancedListingsRemaining = 5; // Reset to 5 free enhanced listings
      setSubscriptionStatus('premium_plus');
      setEnhancedListingsRemaining(5);
      toast({
        title: 'Subscription Successful!',
        description: 'You are now subscribed to Barrow Market Place Premium Plus. You have 5 free enhanced listings this month.',
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-5xl mx-auto"> {/* Increased max-width for 3 cards */}
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
            <h2 className="text-2xl font-semibold">You are on the Premium Plan!</h2>
            <p className="text-muted-foreground">Enjoy unlimited listings and all standard premium features.</p>
          </div>
        )}
        {subscriptionStatus === 'premium_plus' && (
          <div className="text-center py-8 mb-8 bg-card text-card-foreground rounded-lg shadow-md">
            <ShieldCheck className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold">You are on the Premium Plus Plan!</h2>
            <p className="text-muted-foreground">Enjoy unlimited listings, {enhancedListingsRemaining} free enhanced listings remaining, and all premium features.</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6"> {/* Adjusted to 3 columns */}
          {/* Free Trial Card */}
          <Card className="bg-secondary/30 flex flex-col">
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
                    variant="outline"
                    disabled={subscriptionStatus !== 'none' && subscriptionStatus !== 'free_trial'}
                    onClick={() => {
                        if (subscriptionStatus === 'none') {
                            mockUser.subscriptionStatus = 'free_trial';
                            mockUser.itemsListedCount = 0; // Reset count for trial
                            setSubscriptionStatus('free_trial');
                            setItemsListedCount(0);
                             toast({
                                title: 'Free Trial Activated!',
                                description: `You can now list up to ${MAX_FREE_ITEMS} items.`,
                            });
                        }
                    }}
                >
                    {subscriptionStatus === 'free_trial' ? 'Currently on Free Trial' : 'Start Free Trial'}
                </Button>
            </CardFooter>
          </Card>

          {/* Premium Plan Card */}
          <Card className={`${subscriptionStatus === 'subscribed' ? 'border-green-500 border-2' : 'border-primary border-2'} shadow-lg flex flex-col`}>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Star className="h-6 w-6 mr-2 text-accent" />
                Premium Plan
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
                onClick={() => handleSubscribe('premium')}
                disabled={subscriptionStatus === 'subscribed' || subscriptionStatus === 'premium_plus'}
              >
                {subscriptionStatus === 'subscribed' ? 'Currently Subscribed' : 'Subscribe Now'}
              </Button>
            </CardFooter>
          </Card>

          {/* Premium Plus Plan Card */}
          <Card className={`${subscriptionStatus === 'premium_plus' ? 'border-green-500 border-2' : 'border-purple-500 border-2'} shadow-lg flex flex-col`}>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <ShieldCheck className="h-6 w-6 mr-2 text-purple-500" />
                Premium Plus Plan
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
                onClick={() => handleSubscribe('premium_plus')}
                disabled={subscriptionStatus === 'premium_plus'}
              >
                {subscriptionStatus === 'premium_plus' ? 'Currently Subscribed' : 'Go Premium Plus'}
              </Button>
            </CardFooter>
          </Card>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-6">
          Subscriptions are managed mockly and do not involve real payments. 
          Free trial automatically applies if no other plan is active. Enhanced listings reset notionally each month for Premium Plus.
        </p>
      </div>
    </div>
  );
}
