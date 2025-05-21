
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Flag } from 'lucide-react';

export default function ReportItemLoading() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Flag className="h-6 w-6 text-destructive" />
            <Skeleton className="h-7 w-32" /> {/* CardTitle "Report Item" */}
          </div>
          <Skeleton className="h-4 w-3/4 mt-1" /> {/* CardDescription (item name) */}
          <Skeleton className="h-4 w-full mt-1" /> {/* CardDescription (instruction) */}
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Reason Field Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" /> {/* Label */}
            <Skeleton className="h-28 w-full" /> {/* Textarea */}
            <Skeleton className="h-4 w-1/2 mt-1" /> {/* Description */}
          </div>
          
          {/* Buttons Skeleton */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Skeleton className="h-11 w-full sm:w-24" /> {/* Cancel Button */}
            <Skeleton className="h-11 w-full sm:w-36" /> {/* Submit Button */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
