
'use client';

import { mockItems, mockUser } from '@/lib/mock-data';
import type { Item } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { notFound, useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, Tag, Hammer, ShoppingCart, User, Star, CheckCircle, Flag, Clock, Users, History, Gavel, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDistanceToNowStrict, format } from 'date-fns';


const ENHANCEMENT_FEE = 1.00;

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const calculateTimeLeft = (endTimeString?: string): TimeLeft => {
  if (!endTimeString) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }
  const difference = +new Date(endTimeString) - +new Date();
  let timeLeft: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      total: difference,
    };
  }
  return timeLeft;
};


export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [item, setItem] = useState<Item | null | undefined>(undefined); // undefined for loading state
  const [isCurrentlyEnhanced, setIsCurrentlyEnhanced] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
  const [bidAmount, setBidAmount] = useState<string>('');
  const [isBidDialogOpen, setIsBidDialogOpen] = useState(false);
  const [feedbackGivenForItem, setFeedbackGivenForItem] = useState<'up' | 'down' | null>(null);


  const itemId = params.id as string;

  const updateItemData = useCallback(() => {
    if (itemId) {
      // Simulate fetching item data
      setTimeout(() => {
        const foundItem = mockItems.find(i => i.id === itemId);
        setItem(foundItem || null); // null if not found, to trigger notFound
        if (foundItem) {
          setIsCurrentlyEnhanced(foundItem.isEnhanced || false);
          if (foundItem.type === 'auction' && foundItem.auctionEndTime) {
            setTimeLeft(calculateTimeLeft(foundItem.auctionEndTime));
          }
        }
         // Reset feedback state when item changes
        setFeedbackGivenForItem(null);
      }, 0); // Short delay to allow state updates from mock data if needed
    }
  }, [itemId]);


  useEffect(() => {
    updateItemData();
  }, [updateItemData]);


  useEffect(() => {
    if (item?.type === 'auction' && item.auctionEndTime && timeLeft.total > 0) {
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft(item.auctionEndTime));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [item?.type, item.auctionEndTime, timeLeft.total]);

  const handleEnhanceItem = () => {
    if (!item) return;
    
    const itemIndex = mockItems.findIndex(i => i.id === item.id);
    if (itemIndex === -1) return;

    let feeMessage = `£${ENHANCEMENT_FEE.toFixed(2)} fee applied (mock).`;
    let enhancementSuccessful = false;

    if (mockUser.subscriptionStatus === 'premium_plus' && (mockUser.enhancedListingsRemaining || 0) > 0) {
      mockUser.enhancedListingsRemaining = (mockUser.enhancedListingsRemaining || 0) - 1;
      mockItems[itemIndex].isEnhanced = true;
      enhancementSuccessful = true;
      feeMessage = `Used 1 free enhanced listing. ${mockUser.enhancedListingsRemaining} remaining.`;
    } else {
      mockItems[itemIndex].isEnhanced = true;
      enhancementSuccessful = true;
    }
    
    if (enhancementSuccessful) {
      setItem({ ...mockItems[itemIndex] }); 
      setIsCurrentlyEnhanced(true);
      toast({
        title: 'Item Enhanced!',
        description: `${item.name} will now appear higher in listings. ${feeMessage}`,
      });
    } else {
      toast({
        title: 'Enhancement Failed',
        description: 'Could not enhance item at this time.',
        variant: 'destructive',
      });
    }
  };

  const getEnhancementButtonText = () => {
    if (mockUser.subscriptionStatus === 'premium_plus' && (mockUser.enhancedListingsRemaining || 0) > 0) {
      return `Enhance this Item (FREE - ${mockUser.enhancedListingsRemaining} left)`;
    }
    return `Enhance this Item for £${ENHANCEMENT_FEE.toFixed(2)}`;
  };

  const handlePlaceBid = () => {
    if (!item || item.type !== 'auction' || !mockUser) return;
    const numericBidAmount = parseFloat(bidAmount);

    if (isNaN(numericBidAmount) || numericBidAmount <= 0) {
      toast({ title: 'Invalid Bid', description: 'Please enter a valid bid amount.', variant: 'destructive' });
      return;
    }

    const minBid = (item.currentBid || item.price) + 0.01; // Must be at least 1p more
    if (numericBidAmount < minBid) {
      toast({ title: 'Bid Too Low', description: `Your bid must be at least £${minBid.toFixed(2)}.`, variant: 'destructive' });
      return;
    }
    
    const itemIndex = mockItems.findIndex(i => i.id === item.id);
    if (itemIndex === -1) return;

    mockItems[itemIndex].currentBid = numericBidAmount;
    if (!mockItems[itemIndex].bidHistory) {
      mockItems[itemIndex].bidHistory = [];
    }
    mockItems[itemIndex].bidHistory!.unshift({ // Add to beginning for recent first
      userId: mockUser.id,
      userName: mockUser.name,
      amount: numericBidAmount,
      timestamp: new Date().toISOString(),
    });

    setItem({ ...mockItems[itemIndex] });
    setBidAmount('');
    setIsBidDialogOpen(false);

    toast({
      title: 'Bid Placed (Mock)!',
      description: `You successfully bid £${numericBidAmount.toFixed(2)} on ${item.name}.`,
    });
  };

  const handleFeedback = (type: 'up' | 'down') => {
    if (!item) return;
    if (type === 'up') {
      mockUser.thumbsUp += 1;
      toast({
        title: 'Positive Feedback Submitted!',
        description: `You gave ${item.sellerName} a thumbs up (mocked on your profile).`,
      });
    } else {
      mockUser.thumbsDown += 1;
      toast({
        title: 'Negative Feedback Submitted!',
        description: `You gave ${item.sellerName} a thumbs down (mocked on your profile).`,
        variant: 'default', // Use default for neutral information
      });
    }
    setFeedbackGivenForItem(type);
    // In a real app, you'd also save this feedback to the backend, associated with the seller and item.
  };


  if (item === undefined) { // Loading state
    return (
      <div className="container mx-auto py-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card className="overflow-hidden shadow-xl">
          <Skeleton className="aspect-[16/9] w-full" />
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="grid grid-cols-2 gap-4 pt-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-10 w-1/3" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (item === null) {
    notFound();
  }

  const auctionIsActive = item.type === 'auction' && timeLeft.total > 0;
  const auctionEnded = item.type === 'auction' && timeLeft.total <= 0;
  const showFeedbackOptions = (item.type === 'sale' || (item.type === 'auction' && auctionEnded));


  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6 print:hidden">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to results
      </Button>
      <Card className="overflow-hidden shadow-xl">
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-[4/3] md:aspect-auto">
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="md:rounded-l-lg object-cover"
              data-ai-hint={`${item.category} product`}
            />
             {isCurrentlyEnhanced && (
              <Badge variant="default" className="absolute top-2 right-2 bg-amber-400 text-amber-900 shadow-md">
                <Star className="mr-1.5 h-4 w-4" /> Enhanced Listing
              </Badge>
            )}
          </div>
          <div className="flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="text-3xl font-bold tracking-tight">{item.name}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground flex items-center pt-1">
                <User className="h-4 w-4 mr-1.5" /> Sold by: {item.sellerName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
              <p className="text-base leading-relaxed">{item.description}</p>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm pt-2">
                <div className="flex items-center text-muted-foreground">
                  {item.type === 'auction' ? 'Starting Price:' : 'Price:'} <span className="font-semibold text-foreground ml-1">£{item.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Tag className="h-5 w-5 mr-2 text-primary" /> Category: <span className="font-semibold text-foreground ml-1">{item.category}</span>
                </div>
                 <div className="flex items-center text-muted-foreground col-span-2">
                  {item.type === 'sale' ? <ShoppingCart className="h-5 w-5 mr-2 text-primary" /> : <Gavel className="h-5 w-5 mr-2 text-primary" />}
                  Type: <span className="font-semibold text-foreground ml-1">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
                </div>
              </div>

              {item.type === 'auction' && (
                <div className="mt-4 p-4 border rounded-lg bg-secondary/30">
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-primary" /> Auction Details
                  </h3>
                  {item.currentBid && (
                    <p className="text-base font-semibold text-primary">
                      Current Bid: £{item.currentBid.toFixed(2)}
                    </p>
                  )}
                  {auctionIsActive && (
                    <p className="text-sm text-green-600 font-medium">
                      Time Left: {timeLeft.days > 0 && `${timeLeft.days}d `}
                      {timeLeft.hours > 0 && `${timeLeft.hours}h `}
                      {timeLeft.minutes > 0 && `${timeLeft.minutes}m `}
                      {timeLeft.seconds}s
                    </p>
                  )}
                  {auctionEnded && (
                    <p className="text-sm text-destructive font-medium">Auction Ended</p>
                  )}
                  {item.bidHistory && item.bidHistory.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-xs font-semibold text-muted-foreground mb-1 flex items-center">
                        <History className="mr-1.5 h-3 w-3" /> Bid History (Recent First)
                      </h4>
                      <ul className="text-xs space-y-0.5 max-h-24 overflow-y-auto">
                        {item.bidHistory.slice(0, 5).map((bid, index) => ( // Show up to 5 recent bids
                          <li key={index} className="text-muted-foreground">
                            £{bid.amount.toFixed(2)} by {bid.userName === mockUser.name ? <b>You</b> : bid.userName} ({formatDistanceToNowStrict(new Date(bid.timestamp), { addSuffix: true })})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

            </CardContent>
            <CardFooter className="border-t p-6 print:hidden flex-col items-start space-y-4">
              <Button 
                size="lg" 
                className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" 
                onClick={() => router.push(`/messages?itemId=${item.id}&sellerName=${encodeURIComponent(item.sellerName)}`)}
              >
                <MessageSquare className="mr-2 h-5 w-5" /> Contact Seller
              </Button>

              {item.type === 'auction' && auctionIsActive && (
                 <Dialog open={isBidDialogOpen} onOpenChange={setIsBidDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="success" className="w-full md:w-auto">
                      <Gavel className="mr-2 h-5 w-5" /> Place Bid
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Place Your Bid on {item.name}</DialogTitle>
                      <DialogDescription>
                        Current bid is £{(item.currentBid || item.price).toFixed(2)}. 
                        Enter an amount greater than this.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="bidAmount" className="text-right">
                          Bid (£)
                        </Label>
                        <Input
                          id="bidAmount"
                          type="number"
                          step="0.01"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          className="col-span-3"
                          placeholder={`Minimum bid £${((item.currentBid || item.price) + 0.01).toFixed(2)}`}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsBidDialogOpen(false)}>Cancel</Button>
                      <Button type="button" onClick={handlePlaceBid}>Submit Bid</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {!isCurrentlyEnhanced && (
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full md:w-auto border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700" 
                  onClick={handleEnhanceItem}
                >
                  <Star className="mr-2 h-5 w-5" /> {getEnhancementButtonText()}
                </Button>
              ) }
              {isCurrentlyEnhanced && !(item.type === 'auction' && auctionEnded) &&( // Don't show if auction ended
                <div className="flex items-center text-green-600 font-semibold p-3 rounded-md bg-green-50 border border-green-200 w-full md:w-auto shadow-sm">
                  <CheckCircle className="mr-2 h-5 w-5" /> This item is enhanced!
                </div>
              )}
              <Button
                size="lg"
                variant="outline"
                className="w-full md:w-auto border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => router.push(`/report-item?itemId=${item.id}&itemName=${encodeURIComponent(item.name)}`)}
              >
                <Flag className="mr-2 h-5 w-5" /> Report this Item
              </Button>

              {/* Feedback Section */}
              {showFeedbackOptions && (
                <div className="w-full pt-4 mt-4 border-t">
                  <h3 className="text-lg font-semibold mb-3">Feedback for {item.sellerName}</h3>
                  {feedbackGivenForItem ? (
                    <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-700">
                      Thank you, your feedback has been submitted!
                    </div>
                  ) : (
                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        className="flex-1 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                        onClick={() => handleFeedback('up')}
                        size="lg"
                      >
                        <ThumbsUp className="mr-2 h-5 w-5" /> Positive
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleFeedback('down')}
                        size="lg"
                      >
                        <ThumbsDown className="mr-2 h-5 w-5" /> Negative
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardFooter>
          </div>
        </div>
      </Card>
    </div>
  );
}
