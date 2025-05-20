
'use client';

import { mockItems } from '@/lib/mock-data';
import type { Item } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { notFound, useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, Tag, Hammer, ShoppingCart, User, Star, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [item, setItem] = useState<Item | null | undefined>(undefined); // undefined for loading state
  const [isCurrentlyEnhanced, setIsCurrentlyEnhanced] = useState(false);

  const itemId = params.id as string;

  useEffect(() => {
    if (itemId) {
      // Simulate fetching item data
      setTimeout(() => {
        const foundItem = mockItems.find(i => i.id === itemId);
        setItem(foundItem || null); // null if not found, to trigger notFound
        if (foundItem) {
          setIsCurrentlyEnhanced(foundItem.isEnhanced || false);
        }
      }, 500); // Simulate network delay
    }
  }, [itemId]);

  const handleEnhanceItem = () => {
    if (!item) return;
    // In a real app, this would involve a payment process
    const itemIndex = mockItems.findIndex(i => i.id === item.id);
    if (itemIndex !== -1) {
      mockItems[itemIndex].isEnhanced = true;
      setItem({ ...mockItems[itemIndex] }); // Update local item state
      setIsCurrentlyEnhanced(true);
      toast({
        title: 'Item Enhanced!',
        description: `${item.name} will now appear higher in listings. £1.00 fee applied (mock).`,
      });
    }
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
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (item === null) {
    notFound();
  }

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
                  Price: <span className="font-semibold text-foreground ml-1">£{item.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Tag className="h-5 w-5 mr-2 text-primary" /> Category: <span className="font-semibold text-foreground ml-1">{item.category}</span>
                </div>
                <div className="flex items-center text-muted-foreground col-span-2">
                  {item.type === 'sale' ? <ShoppingCart className="h-5 w-5 mr-2 text-primary" /> : <Hammer className="h-5 w-5 mr-2 text-primary" />}
                  Type: <span className="font-semibold text-foreground ml-1">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
                </div>
              </div>

            </CardContent>
            <CardFooter className="border-t p-6 print:hidden flex-col items-start space-y-4">
              <Button 
                size="lg" 
                className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" 
                onClick={() => router.push(`/messages?itemId=${item.id}&sellerName=${encodeURIComponent(item.sellerName)}`)}
              >
                <MessageSquare className="mr-2 h-5 w-5" /> Contact Seller
              </Button>
              {!isCurrentlyEnhanced ? (
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full md:w-auto border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700" 
                  onClick={handleEnhanceItem}
                >
                  <Star className="mr-2 h-5 w-5" /> Enhance this Item for £1.00
                </Button>
              ) : (
                <div className="flex items-center text-green-600 font-semibold p-2 rounded-md bg-green-50 border border-green-200 w-full md:w-auto">
                  <CheckCircle className="mr-2 h-5 w-5" /> This item is enhanced!
                </div>
              )}
            </CardFooter>
          </div>
        </div>
      </Card>
    </div>
  );
}
