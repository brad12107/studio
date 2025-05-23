
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function TermsAndConditionsLoading() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex items-center">
            <FileText className="h-7 w-7 mr-3 text-muted-foreground" />
            <Skeleton className="h-7 w-48" /> {/* CardTitle */}
          </div>
        </CardHeader>
        <CardContent className="h-[calc(100vh-20rem)] pr-4">
          <div className="space-y-6">
            {[...Array(6)].map((_, i) => (
              <section key={i}>
                <Skeleton className="h-6 w-1/3 mb-2" /> {/* Section Title */}
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </section>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
