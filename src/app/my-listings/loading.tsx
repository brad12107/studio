
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag } from 'lucide-react';

export default function MyListingsLoading() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center">
            <ShoppingBag className="mr-3 h-8 w-8 text-muted-foreground"/>
            <Skeleton className="h-8 w-48" /> {/* "My Listings" Title */}
        </div>
        <Skeleton className="h-11 w-44" /> {/* "List New Item" Button */}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => ( // Show 4 skeleton cards
          <div key={i} className="w-full overflow-hidden shadow-lg rounded-lg border bg-card flex flex-col">
            <Skeleton className="aspect-[16/10] w-full" />
            <div className="p-4 flex-grow space-y-2">
              <Skeleton className="h-6 w-3/4" /> {/* Name */}
              <Skeleton className="h-4 w-full" /> {/* Description line 1 */}
              <Skeleton className="h-4 w-5/6" /> {/* Description line 2 */}
              <Skeleton className="h-4 w-1/2 mb-1" /> {/* Category */}
              <Skeleton className="h-4 w-2/3 mb-1" /> {/* Seller Name */}
              <Skeleton className="h-6 w-1/3" /> {/* Price */}
            </div>
            <div className="p-4 border-t">
              <div className="flex justify-between items-center w-full">
                <Skeleton className="h-6 w-20" /> {/* Badge */}
                <Skeleton className="h-9 w-24" /> {/* Button */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
