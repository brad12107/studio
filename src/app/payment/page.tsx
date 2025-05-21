
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { mockUser } from '@/lib/mock-data';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from '@/lib/types';

const MAX_FREE_ITEMS = 3;

type PlanId = 'free_trial' | 'basic' | 'premium_plus' | 'none';

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [planId, setPlanId] = useState<PlanId | null>(null);
  const [planName, setPlanName] = useState('');
  const [planPrice, setPlanPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock form fields
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');

  useEffect(() => {
    const pId = searchParams.get('plan') as PlanId;
    if (pId) {
      setPlanId(pId);
      switch (pId) {
        case 'free_trial':
          setPlanName('Free Trial');
          setPlanPrice('£0.00');
          break;
        case 'basic':
          setPlanName('Basic Plan');
          setPlanPrice('£1.99/month');
          break;
        case 'premium_plus':
          setPlanName('Premium Plan');
          setPlanPrice('£2.99/month');
          break;
        default:
          router.push('/subscription'); // Redirect if plan is invalid
      }
    } else {
      router.push('/subscription'); // Redirect if no plan is specified
    }
  }, [searchParams, router]);

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      if (!planId) {
        toast({ title: 'Error', description: 'No plan selected.', variant: 'destructive' });
        setIsLoading(false);
        router.push('/subscription');
        return;
      }

      let toastTitle = 'Subscription Activated!';
      let toastDescription = '';

      if (planId === 'free_trial') {
        mockUser.subscriptionStatus = 'free_trial';
        mockUser.itemsListedCount = 0; // Reset count for trial
        toastDescription = `You are now on the Free Trial. You can list up to ${MAX_FREE_ITEMS} items.`;
      } else if (planId === 'basic') {
        mockUser.subscriptionStatus = 'subscribed';
        mockUser.enhancedListingsRemaining = 0;
        toastDescription = 'You are now subscribed to the Basic Plan.';
      } else if (planId === 'premium_plus') {
        mockUser.subscriptionStatus = 'premium_plus';
        mockUser.enhancedListingsRemaining = 5;
        toastDescription = 'You are now subscribed to the Premium Plan. You have 5 free enhanced listings this month.';
      }
      
      toast({
        title: toastTitle,
        description: toastDescription,
      });

      setIsLoading(false);
      router.push('/subscription'); // Redirect to subscription page to see updated status
      router.refresh(); // To update user-nav if needed
    }, 1500); // Simulate network delay
  };

  if (!planId) {
    // Could show a loading spinner here
    return <div className="container mx-auto py-8 text-center">Loading plan details...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Complete Your Subscription</CardTitle>
          <CardDescription>
            You are subscribing to the <span className="font-semibold text-primary">{planName}</span> for <span className="font-semibold text-primary">{planPrice}</span>.
            Please enter your payment details below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitPayment} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input 
                id="cardNumber" 
                type="text" 
                placeholder="**** **** **** ****" 
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                required 
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input 
                  id="expiryDate" 
                  type="text" 
                  placeholder="MM/YY" 
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required 
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input 
                  id="cvc" 
                  type="text" 
                  placeholder="123" 
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  required 
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading} size="lg">
              {isLoading ? 'Processing...' : `Confirm Payment & Subscribe to ${planName}`}
            </Button>
          </form>
          <p className="text-xs text-center text-muted-foreground mt-4">
            This is a mock payment form. No real payment will be processed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
