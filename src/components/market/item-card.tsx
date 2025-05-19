import type { Item } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Tag, DollarSign, ShoppingCart, Hammer } from 'lucide-react';

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Card className="w-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="p-0">
        <div className="aspect-[16/10] relative w-full">
          <Image
            src={item.imageUrl}
            alt={item.name}
            layout="fill"
            objectFit="cover"
            data-ai-hint={`${item.category} ${item.name}`}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-semibold mb-2 leading-tight truncate" title={item.name}>
          {item.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2" title={item.description}>
          {item.description}
        </p>
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Tag className="h-4 w-4 mr-1.5" />
          <span>{item.category}</span>
        </div>
        <div className="flex items-center text-lg font-bold text-primary">
          <DollarSign className="h-5 w-5 mr-1" />
          <span>{item.price.toFixed(2)}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <div className="flex justify-between items-center w-full">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${item.type === 'sale' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
            {item.type === 'sale' ? <ShoppingCart className="inline h-3 w-3 mr-1" /> : <Hammer className="inline h-3 w-3 mr-1" />}
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </span>
          <Button asChild size="sm" variant="outline">
            <Link href={`/item/${item.id}`}>View Details</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
