
'use client'; // For handling search query from URL and client-side filtering

import { ItemList } from '@/components/market/item-list';
import { mockItems } from '@/lib/mock-data';
import type { Item } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function HomePage() {
  const searchParams = useSearchParams();
  const [filteredItems, setFilteredItems] = useState<Item[]>(mockItems);

  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      setFilteredItems(
        mockItems.filter(item =>
          item.name.toLowerCase().includes(lowerCaseQuery) ||
          item.description.toLowerCase().includes(lowerCaseQuery) ||
          item.category.toLowerCase().includes(lowerCaseQuery)
        )
      );
    } else {
      setFilteredItems(mockItems);
    }
  }, [searchParams]);

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
