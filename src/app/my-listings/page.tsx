
'use client';

import { ItemList } from '@/components/market/item-list';
import { mockItems, mockUser } from '@/lib/mock-data';
import type { Item } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation'; // Import usePathname
import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyListingsPage() {
  const router = useRouter();
  const pathname = usePathname(); // Get pathname
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [userListings, setUserListings] = useState<Item[]>([]);

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
    if (isLoggedIn && mockUser.name) {
      const currentUserName = mockUser.name.trim();
      const filtered = mockItems.filter(item => item.sellerName?.trim() === currentUserName)
        .sort((a, b) => { // Optional: sort by enhanced or date
            if (a.isEnhanced && !b.isEnhanced) return -1;
            if (!a.isEnhanced && b.isEnhanced) return 1;
            return 0;
        });
      setUserListings(filtered);
    } else if (isLoggedIn && !mockUser.name) {
      // Handle case where user is logged in but profile might not be fully set up
      // For now, this will result in no items, which is acceptable for mock
      setUserListings([]);
    }
  }, [isLoggedIn, mockUser.name, pathname]); // Add pathname to dependency array

  if (!isClient || isLoadingAuth) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center">
            <ShoppingBag className="mr-3 h-8 w-8 text-muted-foreground"/>
            <Skeleton className="h-8 w-48" /> {/* "My Listings" Title */}
          </div>
          <Skeleton className="h-11 w-40" /> {/* "List New Item" Button */}
        </div>
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
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // Or a redirect message, but router.replace handles it
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <ShoppingBag className="mr-3 h-8 w-8 text-primary"/> My Listings
        </h1>
        <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/list-item">
            <PlusCircle className="mr-2 h-5 w-5" />
            List New Item
          </Link>
        </Button>
      </div>

      {userListings.length > 0 ? (
        <ItemList items={userListings} />
      ) : (
        <Card className="shadow-lg text-center py-10">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">No Items Listed Yet</CardTitle>
            <CardDescription className="text-muted-foreground pt-1">
              It looks like you haven't listed any items for sale or auction.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/list-item">
                <PlusCircle className="mr-2 h-5 w-5" />
                Sell Your First Item
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
