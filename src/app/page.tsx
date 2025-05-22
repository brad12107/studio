
'use client';

import { ItemList } from '@/components/market/item-list';
import { mockItems } from '@/lib/mock-data';
import type { Item } from '@/lib/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  
  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    mockItems.forEach(item => categories.add(item.category));
    return ["All Categories", ...Array.from(categories).sort()];
  }, []);

  const currentSearchQuery = searchParams.get('search') || '';
  const currentCategoryQuery = searchParams.get('category') || "All Categories";

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
      let itemsToDisplay = [...mockItems]; // Create a mutable copy

      if (currentSearchQuery) {
        const lowerCaseQuery = currentSearchQuery.toLowerCase();
        itemsToDisplay = itemsToDisplay.filter(item =>
          item.name.toLowerCase().includes(lowerCaseQuery) ||
          item.description.toLowerCase().includes(lowerCaseQuery) ||
          item.category.toLowerCase().includes(lowerCaseQuery)
        );
      }

      if (currentCategoryQuery && currentCategoryQuery !== "All Categories") {
        itemsToDisplay = itemsToDisplay.filter(item => item.category === currentCategoryQuery);
      }
      
      // Sort items: enhanced items first
      itemsToDisplay.sort((a, b) => {
        if (a.isEnhanced && !b.isEnhanced) return -1;
        if (!a.isEnhanced && b.isEnhanced) return 1;
        // Optional: Add secondary sort, e.g., by name or date, if desired
        return 0; 
      });

      setFilteredItems(itemsToDisplay);
    }
  }, [currentSearchQuery, currentCategoryQuery, isLoggedIn]);

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "All Categories") {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    router.push(`/?${params.toString()}`);
  };


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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <Skeleton className="h-7 w-48" /> {/* Featured Items Title */}
              <Skeleton className="h-10 w-full sm:w-52" /> {/* Category Filter Skeleton */}
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
          </section>
        </div>
    );
  }

  if (!isLoggedIn) {
    return null; 
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold">Featured Items</h2>
          <div className="w-full sm:w-auto sm:min-w-[200px]">
            <Label htmlFor="category-filter" className="sr-only">Filter by category</Label>
            <Select value={currentCategoryQuery} onValueChange={handleCategoryChange}>
              <SelectTrigger id="category-filter" className="w-full sm:w-auto">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter by category..." />
              </SelectTrigger>
              <SelectContent>
                {allCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <ItemList items={filteredItems} />
      </section>
    </div>
  );
}
