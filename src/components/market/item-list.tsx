import type { Item } from '@/lib/types';
import { ItemCard } from './item-card';

interface ItemListProps {
  items: Item[];
  getItemEditHandler?: (itemId: string) => (() => void) | undefined;
  getItemDeleteHandler?: (itemId: string) => (() => void) | undefined;
}

export function ItemList({ items, getItemEditHandler, getItemDeleteHandler }: ItemListProps) {
  if (items.length === 0) {
    return <p className="text-center text-muted-foreground py-10">No items found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((item) => (
        <ItemCard 
          key={item.id} 
          item={item} 
          onEdit={getItemEditHandler ? getItemEditHandler(item.id) : undefined}
          onDelete={getItemDeleteHandler ? getItemDeleteHandler(item.id) : undefined}
        />
      ))}
    </div>
  );
}
