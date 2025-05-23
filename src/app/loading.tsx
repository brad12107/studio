
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePageLoading() {
  return (
    <div className="space-y-8">
      {/* Welcome Card Skeleton */}
      <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
        <Skeleton className="h-8 w-3/4 mb-2" /> {/* CardTitle */}
        <Skeleton className="h-4 w-full md:w-2/3 mb-4" /> {/* CardDescription */}
        <Skeleton className="h-11 w-48" /> {/* Button */}
      </div>
      
      {/* Featured Items Section Title Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <Skeleton className="h-7 w-48" /> {/* "Featured Items" heading */}
        <div className="flex gap-2 w-full sm:w-auto">
          <Skeleton className="h-10 w-full sm:w-48" /> {/* Category Filter Skeleton */}
          <Skeleton className="h-10 w-full sm:w-36" /> {/* Type Filter Skeleton */}
        </div>
      </div>
      
      {/* ItemList Skeleton (Grid of ItemCards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => ( // Show 8 skeleton cards for example, to fill space
          <div key={i} className="w-full overflow-hidden shadow-lg rounded-lg border bg-card flex flex-col">
            {/* ItemCard Image Skeleton */}
            <Skeleton className="aspect-[16/10] w-full" />
            {/* ItemCard Content Skeleton */}
            <div className="p-4 flex-grow space-y-2">
              <Skeleton className="h-6 w-3/4" /> {/* Name */}
              <Skeleton className="h-4 w-full" /> {/* Description line 1 */}
              <Skeleton className="h-4 w-5/6" /> {/* Description line 2 */}
              <Skeleton className="h-4 w-1/2 mb-1" /> {/* Category */}
              <Skeleton className="h-4 w-2/3 mb-1" /> {/* Seller Name */}
              <Skeleton className="h-6 w-1/3" /> {/* Price */}
            </div>
            {/* ItemCard Footer Skeleton */}
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
