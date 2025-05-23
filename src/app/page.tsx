
'use client';

import { ItemList } from '@/components/market/item-list';
import { mockItems } from '@/lib/mock-data';
import type { Item } from '@/lib/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Filter, ListFilter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

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

  const itemTypes = ["All Types", "Sale", "Auction"]; // Values for SelectItem components

  const currentSearchQuery = searchParams.get('search') || '';
  const currentCategoryQuery = searchParams.get('category') || "All Categories";
  
  // For filtering logic, use the direct lowercase param from the URL or null
  const typeFilterParam = searchParams.get('type'); // e.g., "sale", "auction", or null

  // For the Select component's 'value' prop, find the matching capitalized version from itemTypes
  // or default to "All Types".
  const currentTypeForSelect = 
    itemTypes.find(it => typeFilterParam && it.toLowerCase() === typeFilterParam && it !== "All Types") || 
    "All Types";


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
      let itemsToDisplay = [...mockItems]; 

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

      // Use the direct lowercase param (typeFilterParam) for filtering
      if (typeFilterParam) { 
        itemsToDisplay = itemsToDisplay.filter(item => item.type === typeFilterParam);
      }
      
      itemsToDisplay.sort((a, b) => {
        if (a.isEnhanced && !b.isEnhanced) return -1;
        if (!a.isEnhanced && b.isEnhanced) return 1;
        return 0; 
      });

      setFilteredItems(itemsToDisplay);
    }
  }, [currentSearchQuery, currentCategoryQuery, typeFilterParam, isLoggedIn]); // Use typeFilterParam here

  const handleFilterChange = (filterType: 'category' | 'type', value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (filterType === 'category') {
      if (value === "All Categories") {
        params.delete('category');
      } else {
        params.set('category', value);
      }
    } else if (filterType === 'type') {
      if (value === "All Types") {
        params.delete('type');
      } else {
        // 'value' here is "Sale" or "Auction" from SelectItem
        params.set('type', value.toLowerCase()); // Store as lowercase in URL
      }
    }
    router.push(`/?${params.toString()}`);
  };


  if (!isClient || isLoadingAuth) {
    return (
        <div className="space-y-8">
          <Card className="shadow-lg">
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
              <div className="flex gap-2 w-full sm:w-auto">
                <Skeleton className="h-10 w-full sm:w-48" /> {/* Category Filter Skeleton */}
                <Skeleton className="h-10 w-full sm:w-36" /> {/* Type Filter Skeleton */}
              </div>
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
        <CardHeader className="pb-4 text-center">
          <div className="mx-auto mb-4 w-32 h-32 relative">
            <Image 
              src="/barrow-market-logo.png" 
              alt="Barrow Market Place Logo" 
              fill
              sizes="128px"
              className="object-contain"
              priority
              data-ai-hint="app logo"
            />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Welcome to Barrow Market Place!</CardTitle>
          <CardDescription className="text-muted-foreground pt-1">
            Browse items or list your own for sale or auction. Your next great find is just a click away.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
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
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="w-full sm:w-48">
              <Label htmlFor="category-filter" className="sr-only">Filter by category</Label>
              <Select value={currentCategoryQuery} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger id="category-filter" className="w-full">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Category..." />
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
            <div className="w-full sm:w-36">
              <Label htmlFor="type-filter" className="sr-only">Filter by type</Label>
              {/* Use currentTypeForSelect for the Select's value */}
              <Select value={currentTypeForSelect} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger id="type-filter" className="w-full">
                  <ListFilter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Type..." />
                </SelectTrigger>
                <SelectContent>
                  {itemTypes.map(type => (
                    <SelectItem key={type} value={type}> {/* SelectItem values are "All Types", "Sale", "Auction" */}
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <ItemList items={filteredItems} />
      </section>
    </div>
  );
}
