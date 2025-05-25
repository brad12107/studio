
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';

export default function UserProfileViewLoading() {
  return (
    <div className="container mx-auto py-12">
      <Card className="max-w-lg mx-auto shadow-xl">
        <CardHeader className="text-center">
          <User className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <Skeleton className="h-7 w-3/4 mx-auto mb-2" /> {/* CardTitle */}
          <Skeleton className="h-4 w-full mx-auto mt-1" /> {/* CardDescription line 1 */}
          <Skeleton className="h-4 w-5/6 mx-auto mt-1" /> {/* CardDescription line 2 */}
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <Skeleton className="h-4 w-2/3" /> {/* Placeholder text */}
          <Skeleton className="h-10 w-28" /> {/* Button */}
        </CardContent>
      </Card>
    </div>
  );
}

    