
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ListItemLoading() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <Skeleton className="h-8 w-1/2 mb-2" /> {/* CardTitle */}
          <Skeleton className="h-4 w-3/4" /> {/* CardDescription */}
        </CardHeader>
        <CardContent>
          {/* Form Skeleton - Can be more detailed if needed */}
          <div className="space-y-8">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" /> {/* Label */}
              <Skeleton className="h-10 w-full" /> {/* Input */}
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" /> {/* Label */}
              <Skeleton className="h-20 w-full" /> {/* Textarea */}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/3" /> {/* Label */}
                <Skeleton className="h-10 w-full" /> {/* Input */}
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/3" /> {/* Label */}
                <Skeleton className="h-10 w-full" /> {/* Select */}
              </div>
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" /> {/* Label */}
                <Skeleton className="h-10 w-full" /> {/* Input */}
            </div>
             <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" /> {/* Label */}
                <Skeleton className="h-10 w-full" /> {/* Input */}
            </div>
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
                <Skeleton className="h-6 w-11" />
            </div>
            <Skeleton className="h-11 w-full md:w-1/3" /> {/* Button */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
