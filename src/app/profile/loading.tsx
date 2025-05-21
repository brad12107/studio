
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfileLoading() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <Skeleton className="h-8 w-1/2 mb-2" /> {/* CardTitle "Edit Profile" */}
          <Skeleton className="h-4 w-3/4" /> {/* CardDescription */}
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Avatar Skeleton */}
          <div className="flex flex-col items-center">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-4 w-1/3 mt-2" /> {/* Description for avatar */}
          </div>

          {/* Form Field Skeletons */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" /> {/* Label */}
            <Skeleton className="h-20 w-full" /> {/* Textarea */}
          </div>

          {/* Switch Skeleton */}
          <div className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
            <div className="space-y-0.5">
              <Skeleton className="h-5 w-1/3" /> {/* Label */}
              <Skeleton className="h-4 w-2/3" /> {/* Description */}
            </div>
            <Skeleton className="h-6 w-11" /> {/* Switch */}
          </div>
          
          {/* Checkbox Skeleton */}
           <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
            <Skeleton className="h-4 w-4 mt-1" /> {/* Checkbox */}
            <div className="space-y-1 leading-none flex-grow">
              <Skeleton className="h-4 w-2/5" /> {/* Label */}
              <Skeleton className="h-3 w-full mt-1" /> {/* Description line 1 */}
              <Skeleton className="h-3 w-full mt-1" /> {/* Description line 2 */}
              <Skeleton className="h-3 w-3/4 mt-1" /> {/* Description line 3 */}
            </div>
          </div>

          {/* Button Skeleton */}
          <Skeleton className="h-11 w-full md:w-1/3" />
        </CardContent>
      </Card>
    </div>
  );
}
