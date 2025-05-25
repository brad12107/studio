
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

export default function AdminLoginLoading() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-18rem)] py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground" />
          <Skeleton className="h-8 w-3/4 mx-auto mt-2" /> {/* CardTitle */}
          <Skeleton className="h-4 w-full mx-auto mt-1" /> {/* CardDescription */}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
          </div>
          <Skeleton className="h-12 w-full" /> {/* Button */}
        </CardContent>
        <CardFooter>
          <Skeleton className="h-11 w-full" /> {/* Back Button */}
        </CardFooter>
      </Card>
    </div>
  );
}
