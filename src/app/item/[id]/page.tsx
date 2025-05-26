
'use client';

import { mockItems, mockUser, mockConversations, mockMessages } from '@/lib/mock-data';
import type { Item, Message, Conversation, User as UserType } from '@/lib/types'; // Renamed User to UserType
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { notFound, useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, Tag, Hammer, ShoppingCart, User as UserIcon, Star, CheckCircle, Flag, Clock, History, Gavel, HelpCircle, ChevronLeft, ChevronRight, Truck, ShieldAlert } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDistanceToNowStrict, format } from 'date-fns';
import { cn } from '@/lib/utils';


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

const formatCondition = (conditionValue?: Item['condition']): string => {
  if (!conditionValue) return 'N/A';
  switch (conditionValue) {
    case 'new': return 'New';
    case 'like_new': return 'Like New';
    case 'good': return 'Good';
    case 'not_working': return 'Not Working';
    default: return 'N/A';
  }
};

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [item, setItem] = useState<Item | null | undefined>(undefined);
  const [isCurrentlyEnhanced, setIsCurrentlyEnhanced] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
  const [bidAmount, setBidAmount] = useState<string>('');
  const [isBidDialogOpen, setIsBidDialogOpen] = useState(false);
  const [hasRatedItem, setHasRatedItem] = useState(false);
  const [winningNotificationSent, setWinningNotificationSent] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEligibleForFeedback, setIsEligibleForFeedback] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);


  const itemId = params.id as string;

  const updateItemData = useCallback(() => {
    if (itemId) {
      setTimeout(() => {
        const foundItem = mockItems.find(i => i.id === itemId);
        setItem(foundItem || null);
        if (foundItem) {
          setIsCurrentlyEnhanced(foundItem.isEnhanced || false);
          if (foundItem.type === 'auction' && foundItem.auctionEndTime) {
            setTimeLeft(calculateTimeLeft(foundItem.auctionEndTime));
          }
        }
        setHasRatedItem(false);
        setWinningNotificationSent(false);
        setCurrentImageIndex(0);
      }, 0);
    }
  }, [itemId]);


  useEffect(() => {
    updateItemData();
  }, [updateItemData]);

  useEffect(() => {
    if (!item || !mockUser?.id) {
        setIsEligibleForFeedback(false);
        return;
    }

    let eligible = false;

    if (item.type === 'auction' && timeLeft.total <= 0) {
        const winningBid = item.bidHistory?.[0];
        if (winningBid?.userId === mockUser.id) {
            eligible = true;
        }
    }

    const relevantAcceptedConversation = mockConversations.find(conv =>
        conv.itemId === item.id &&
        conv.buyRequestStatus === 'accepted' &&
        conv.participants.some(p => p.id === mockUser.id) &&
        item.sellerName !== mockUser.name
    );

    if (relevantAcceptedConversation) {
        eligible = true;
    }
    setIsEligibleForFeedback(eligible);
  }, [item, timeLeft.total, mockUser?.id, mockUser?.name]);


  useEffect(() => {
    if (item?.type === 'auction' && item?.auctionEndTime && timeLeft.total > 0) {
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft(item.auctionEndTime));
      }, 1000);
      return () => clearInterval(timer);
    } else if (item?.type === 'auction' && item?.auctionEndTime && timeLeft.total <= 0 && !winningNotificationSent) {
      if (item.bidHistory && item.bidHistory.length > 0 && item.bidHistory[0].userId === mockUser.id) {
        const winningMsgContent = `Congratulations! You won the auction for "${item.name}". Please go to your messages to finalize the purchase with ${item.sellerName}. You can send a buy request there.`;
        const systemMessage: Message = {
          id: `msg-win-${item.id}-${Date.now()}`,
          fromUserId: 'system',
          toUserId: mockUser.id,
          itemId: item.id,
          content: winningMsgContent,
          timestamp: new Date().toISOString(),
          isRead: false,
          isSystemMessage: true,
        };
        mockMessages.push(systemMessage);

        let conversation = mockConversations.find(
          (c) => c.itemId === item.id && c.participants.some(p => p.id === mockUser.id) && c.participants.some(p => p.name === item.sellerName)
        );

        const itemPrimaryImageUrl = item.imageUrl && item.imageUrl.length > 0 ? item.imageUrl[0] : 'https://placehold.co/100x100.png';

        if (conversation) {
          conversation.lastMessage = { content: systemMessage.content, timestamp: systemMessage.timestamp };
          conversation.unreadCount = (conversation.unreadCount || 0) + 1;
          mockConversations.sort((a,b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime());
        } else {
          const newConvId = `conv-win-${item.id}-${Date.now()}`;
          let sellerParticipantDetails: Pick<UserType, 'id' | 'name' | 'avatarUrl'>;
          if (item.sellerName === mockUser.name) {
            sellerParticipantDetails = { id: mockUser.id, name: mockUser.name, avatarUrl: mockUser.avatarUrl || 'https://placehold.co/50x50.png' };
          } else {
            sellerParticipantDetails = {
              id: `seller-${item.id}-${item.sellerName.replace(/\s+/g, '-')}`,
              name: item.sellerName,
              avatarUrl: `https://placehold.co/50x50.png?text=${item.sellerName.substring(0,2).toUpperCase()}`
            };
          }
          
          conversation = {
            id: newConvId,
            itemId: item.id,
            itemName: item.name,
            itemImageUrl: itemPrimaryImageUrl,
            participants: [
              { id: mockUser.id, name: mockUser.name, avatarUrl: mockUser.avatarUrl || 'https://placehold.co/50x50.png' },
              sellerParticipantDetails
            ],
            lastMessage: { content: systemMessage.content, timestamp: systemMessage.timestamp },
            unreadCount: 1,
            buyRequestStatus: 'none',
            isItemSoldOrUnavailable: false,
          };
          mockConversations.unshift(conversation);
        }
        
        setWinningNotificationSent(true);
        toast({
            title: "Auction Won!",
            description: `You won the auction for ${item.name}. Check your messages to complete the purchase.`,
            duration: 7000
        });
      }
    }
  }, [item?.type, item?.auctionEndTime, item?.id, item?.name, item?.sellerName, item?.imageUrl, item?.bidHistory, timeLeft.total, winningNotificationSent, toast, mockUser.id, mockUser.name, mockUser.avatarUrl]);

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

    const minBid = (item.currentBid || item.price) + 0.01;
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
    mockItems[itemIndex].bidHistory!.unshift({
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

  const handleRatingSubmit = (rating: number) => {
    if (!item) return;
    mockUser.sumOfRatings += rating;
    mockUser.totalRatings += 1;
    
    toast({
      title: 'Rating Submitted!',
      description: `You gave ${item.sellerName} a ${rating}-star rating (mocked on your profile).`,
    });
    setHasRatedItem(true);
  };

  const handlePreviousImage = () => {
    if (!item || !item.imageUrl || item.imageUrl.length <= 1) return;
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? item.imageUrl.length - 1 : prevIndex - 1));
  };

  const handleNextImage = () => {
    if (!item || !item.imageUrl || item.imageUrl.length <= 1) return;
    setCurrentImageIndex((prevIndex) => (prevIndex === item.imageUrl.length - 1 ? 0 : prevIndex + 1));
  };

  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index);
  };


  if (item === undefined) {
    return (
      <div className="container mx-auto py-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card className="overflow-hidden shadow-xl">
          <Skeleton className="aspect-[4/3] w-full md:aspect-auto md:h-[400px] lg:h-[500px]" />
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
  const showFeedbackSection = isEligibleForFeedback && !hasRatedItem;
  
  const displayImageUrl = item.imageUrl && item.imageUrl.length > 0
    ? item.imageUrl[currentImageIndex]
    : 'https://placehold.co/800x600.png';
  
  const showImageNavigation = item.imageUrl && item.imageUrl.length > 1;
  const showCondition = !['Property for Sale', 'Property for Rent'].includes(item.category) && item.condition;


  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6 print:hidden">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to results
      </Button>
      <Card className="overflow-hidden shadow-xl">
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-[4/3] md:aspect-auto md:h-[400px] lg:h-[500px]">
            <Image
              src={displayImageUrl}
              alt={`${item.name} - image ${currentImageIndex + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="md:rounded-l-lg object-cover"
              priority
              data-ai-hint={`${item.category} product`}
            />
             {item.isEnhanced && (
              <Badge variant="default" className="absolute top-2 right-2 bg-amber-400 text-amber-900 shadow-md z-10">
                <Star className="mr-1.5 h-4 w-4" /> Enhanced Listing
              </Badge>
            )}
            {showImageNavigation && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white h-10 w-10 rounded-full"
                  onClick={handlePreviousImage}
                  disabled={item.imageUrl.length <= 1}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white h-10 w-10 rounded-full"
                  onClick={handleNextImage}
                  disabled={item.imageUrl.length <= 1}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
                  {item.imageUrl.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleDotClick(index)}
                      aria-label={`Go to image ${index + 1}`}
                      className={cn(
                        "h-2.5 w-2.5 rounded-full transition-colors",
                        currentImageIndex === index ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="text-3xl font-bold tracking-tight text-card-foreground">{item.name}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground flex items-center pt-1">
                <UserIcon className="h-4 w-4 mr-1.5" /> Sold by: {item.sellerName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
              <p className="text-base leading-relaxed text-card-foreground">{item.description}</p>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm pt-2">
                <div className="flex items-center text-card-foreground">
                  {item.type === 'auction' ? (item.currentBid ? 'Current Bid:' : 'Starting Price:') : 'Price:'}
                  <span className="font-semibold text-card-foreground ml-1">£{(item.currentBid || item.price).toFixed(2)}</span>
                </div>
                <div className="flex items-center text-card-foreground">
                  <Tag className="h-5 w-5 mr-2 text-primary" /> Category: <span className="font-semibold text-card-foreground ml-1">{item.category}</span>
                </div>
                 <div className="flex items-center text-card-foreground col-span-2">
                  {item.type === 'sale' ? <ShoppingCart className="h-5 w-5 mr-2 text-primary" /> : <Gavel className="h-5 w-5 mr-2 text-primary" />}
                  Type: <span className="font-semibold text-card-foreground ml-1">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
                </div>
                {showCondition && (
                  <div className="flex items-center text-card-foreground">
                    <HelpCircle className="h-5 w-5 mr-2 text-primary" /> Condition: <span className="font-semibold text-card-foreground ml-1">{formatCondition(item.condition)}</span>
                  </div>
                )}
                <div className="flex items-center text-card-foreground">
                  <Truck className="h-5 w-5 mr-2 text-primary" />
                  {item.canDeliver ? 'Delivery Available' : 'Collection Only'}
                </div>
              </div>

              {item.type === 'auction' && (
                <div className="mt-4 p-4 border rounded-lg bg-secondary/30">
                  <h3 className="text-lg font-semibold mb-2 flex items-center text-card-foreground">
                    <Clock className="mr-2 h-5 w-5 text-primary" /> Auction Details
                  </h3>
                  {auctionIsActive && (
                    <p className="text-sm text-green-600 font-medium">
                      Time Left: {timeLeft.days > 0 && `${timeLeft.days}d `}
                      {timeLeft.hours > 0 && `${timeLeft.hours}h `}
                      {timeLeft.minutes > 0 && `${timeLeft.minutes}m `}
                      {timeLeft.seconds}s
                    </p>
                  )}
                  { timeLeft.total <= 0 && (
                    <p className="text-sm text-destructive font-medium">Auction Ended</p>
                  )}
                  {item.bidHistory && item.bidHistory.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-xs font-semibold text-muted-foreground mb-1 flex items-center">
                        <History className="mr-1.5 h-3 w-3" /> Bid History (Recent First)
                      </h4>
                      <ul className="text-xs space-y-0.5 max-h-24 overflow-y-auto">
                        {item.bidHistory.slice(0, 5).map((bid, index) => (
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

              {!isCurrentlyEnhanced && item.sellerName === mockUser.name && (
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full md:w-auto border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                  onClick={handleEnhanceItem}
                  disabled={(item.type === 'auction' && timeLeft.total <= 0)}
                >
                  <Star className="mr-2 h-5 w-5" /> {getEnhancementButtonText()}
                </Button>
              ) }
              {isCurrentlyEnhanced && item.sellerName === mockUser.name && (
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

              {showFeedbackSection && (
                <div className="w-full pt-4 mt-4 border-t">
                  <h3 className="text-lg font-semibold mb-3 text-card-foreground">Rate your transaction with {item.sellerName}</h3>
                  <div className="flex items-center justify-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => handleRatingSubmit(star)}
                        className="p-1 focus:outline-none"
                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      >
                        <Star
                          className={cn(
                            "h-8 w-8 transition-colors",
                            (hoveredRating || 0) >= star ? "text-amber-400 fill-amber-400" : "text-gray-300"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {hasRatedItem && isEligibleForFeedback && (
                 <div className="w-full pt-4 mt-4 border-t">
                    <h3 className="text-lg font-semibold mb-3 text-card-foreground">Feedback for {item.sellerName}</h3>
                    <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-700">
                      Thank you, your rating has been submitted!
                    </div>
                  </div>
              )}
            </CardFooter>
          </div>
        </div>
      </Card>
    </div>
  );
}
