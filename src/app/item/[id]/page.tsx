'use client';

import { mockItems } from '@/lib/mock-data';
import type { Item } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { notFound, useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, DollarSign, Tag, Hammer, ShoppingCart, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<Item | null | undefined>(undefined); // undefined for loading state

  const itemId = params.id as string;

  useEffect(() => {
    if (itemId) {
      // Simulate fetching item data
      setTimeout(() => {
        const foundItem = mockItems.find(i => i.id === itemId);
        setItem(foundItem || null); // null if not found, to trigger notFound
      }, 500); // Simulate network delay
    }
  }, [itemId]);

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
          <CardFooter>
            <Skeleton className="h-10 w-1/3" />
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
              layout="fill"
              objectFit="cover"
              className="md:rounded-l-lg"
              data-ai-hint={`${item.category} product`}
            />
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
                  <DollarSign className="h-5 w-5 mr-2 text-primary" /> Price: <span className="font-semibold text-foreground ml-1">£{item.price.toFixed(2)}</span>
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
            <CardFooter className="border-t p-6 print:hidden">
              <Button size="lg" className="w-full md:w-auto" onClick={() => router.push(`/messages?itemId=${item.id}&sellerName=${encodeURIComponent(item.sellerName)}`)}>
                <MessageSquare className="mr-2 h-5 w-5" /> Contact Seller
              </Button>
            </CardFooter>
          </div>
        </div>
      </Card>
    </div>
  );
}
