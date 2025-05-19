'use client'; // For handling search query from URL and client-side filtering

import { ItemList } from '@/components/market/item-list';
import { mockItems } from '@/lib/mock-data';
import type { Item } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

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
      <section>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome to Community Market!</h1>
        <p className="text-muted-foreground">Browse items or list your own for sale or auction.</p>
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-6">Featured Items</h2>
        <ItemList items={filteredItems} />
      </section>
    </div>
  );
}
