
import type { Item } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Tag, ShoppingCart, Hammer, Star, User as UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  const primaryImageUrl = item.imageUrl && item.imageUrl.length > 0 ? item.imageUrl[0] : 'https://placehold.co/600x400.png';

  return (
    <Card className="w-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="p-0">
        <div className="aspect-[16/10] relative w-full">
          <Image
            src={primaryImageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            data-ai-hint={`${item.category} ${item.name}`}
          />
          {item.isEnhanced && (
            <Badge variant="default" className="absolute top-2 right-2 bg-amber-400 text-amber-900 shadow-md z-10">
              <Star className="mr-1.5 h-3 w-3" /> Enhanced
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-semibold mb-2 leading-tight truncate text-card-foreground" title={item.name}>
          {item.name}
        </CardTitle>
        <p className="text-sm text-card-foreground mb-2 line-clamp-2" title={item.description}>
          {item.description}
        </p>
        <div className="flex items-center text-sm text-card-foreground mb-1">
          <Tag className="h-4 w-4 mr-1.5 text-card-foreground" />
          <span>{item.category}</span>
        </div>
        <div className="flex items-center text-sm text-card-foreground mb-2">
          <UserIcon className="h-4 w-4 mr-1.5 text-card-foreground" />
          <span>Sold by: {item.sellerName}</span>
        </div>
        <div className="flex items-center text-lg font-bold text-card-foreground">
          <span>£{item.price.toFixed(2)}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <div className="flex justify-between items-center w-full">
          <Badge variant={item.type === 'sale' ? 'secondary' : 'default'} className="flex items-center">
            {item.type === 'sale' ? <ShoppingCart className="h-3 w-3 mr-1" /> : <Hammer className="h-3 w-3 mr-1" />}
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Badge>
          <Button asChild size="sm" variant="default">
            <Link href={`/item/${item.id}`}>View Details</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
