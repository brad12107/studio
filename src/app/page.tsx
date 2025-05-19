
'use client'; // For handling search query from URL and client-side filtering

import { ItemList } from '@/components/market/item-list';
import { mockItems } from '@/lib/mock-data';
import type { Item } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

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
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome to Barrow Market Place!</h1>
          <p className="text-muted-foreground">Browse items or list your own for sale or auction.</p>
        </div>
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/list-item">
            <PlusCircle className="mr-2 h-5 w-5" />
            Sell Your Item
          </Link>
        </Button>
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-6">Featured Items</h2>
        <ItemList items={filteredItems} />
      </section>
    </div>
  );
}
