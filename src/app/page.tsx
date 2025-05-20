
'use client';

import { ItemList } from '@/components/market/item-list';
import { mockItems } from '@/lib/mock-data';
import type { Item } from '@/lib/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);

  useEffect(() => {
    setIsClient(true); 
    const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedInStatus);
    setIsLoadingAuth(false);

    if (!loggedInStatus) {
      router.replace('/login');
    }
  }, [router]);

  useEffect(() => {
    if (isLoggedIn) { 
      const searchQuery = searchParams.get('search');
      let itemsToDisplay = [...mockItems]; // Create a mutable copy

      if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        itemsToDisplay = itemsToDisplay.filter(item =>
          item.name.toLowerCase().includes(lowerCaseQuery) ||
          item.description.toLowerCase().includes(lowerCaseQuery) ||
          item.category.toLowerCase().includes(lowerCaseQuery)
        );
      }
      
      // Sort items: enhanced items first
      itemsToDisplay.sort((a, b) => {
        if (a.isEnhanced && !b.isEnhanced) return -1;
        if (!a.isEnhanced && b.isEnhanced) return 1;
        return 0; 
      });

      setFilteredItems(itemsToDisplay);
    }
  }, [searchParams, isLoggedIn]);

  if (!isClient || isLoadingAuth) {
    return (
        <div className="space-y-8">
          <Card className="shadow-md">
            <CardHeader className="pb-4">
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full md:w-2/3 mb-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-11 w-48" />
            </CardContent>
          </Card>
          <section>
            <Skeleton className="h-7 w-48 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-full overflow-hidden shadow-lg rounded-lg border bg-card flex flex-col">
                  <Skeleton className="aspect-[16/10] w-full" />
                  <div className="p-4 flex-grow space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-1/3" />
                  </div>
                  <div className="p-4 border-t">
                    <div className="flex justify-between items-center w-full">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
    );
  }

  if (!isLoggedIn) {
    return null; 
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl font-bold tracking-tight">Welcome to Barrow Market Place!</CardTitle>
          <CardDescription className="text-muted-foreground pt-1">
            Browse items or list your own for sale or auction. Your next great find is just a click away.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/list-item">
              <PlusCircle className="mr-2 h-5 w-5" />
              Sell Your Item
            </Link>
          </Button>
        </CardContent>
      </Card>
      
      <section>
        <h2 className="text-2xl font-bold mb-6">Featured Items</h2>
        <ItemList items={filteredItems} />
      </section>
    </div>
  );
}
