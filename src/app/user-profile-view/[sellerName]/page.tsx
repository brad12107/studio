
'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function UserProfileViewPage() {
  const params = useParams();
  const router = useRouter();
  const [decodedSellerName, setDecodedSellerName] = useState<string | null>(null);

  useEffect(() => {
    if (params.sellerName && typeof params.sellerName === 'string') {
      try {
        setDecodedSellerName(decodeURIComponent(params.sellerName));
      } catch (error) {
        console.error("Error decoding seller name:", error);
        setDecodedSellerName("Invalid Seller Name");
      }
    }
  }, [params.sellerName]);

  if (!decodedSellerName) {
    // Can show a more specific loading state if params.sellerName is not yet available
    return (
        <div className="container mx-auto py-8 text-center">
            <p>Loading seller profile...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <Card className="max-w-lg mx-auto shadow-xl">
        <CardHeader className="text-center">
          <User className="mx-auto h-16 w-16 text-primary mb-4" />
          <CardTitle className="text-2xl font-bold">
            Profile for: {decodedSellerName}
          </CardTitle>
          <CardDescription className="pt-2">
            This is a placeholder page for viewing a seller's public profile.
            In a full application, this page would display more details about the seller,
            their ratings, and other items they have listed.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <p className="text-muted-foreground text-sm">
            Detailed public profiles are not fully implemented in this mock version.
          </p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

    