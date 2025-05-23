
'use client';

import { ListItemForm } from '@/components/market/list-item-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSearchParams } from 'next/navigation';

export default function ListItemPage() {
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('mode') === 'edit';

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {isEditMode ? 'Edit Your Listing' : 'List a New Item'}
          </CardTitle>
          <CardDescription>
            {isEditMode
              ? 'Update the details of your item below.'
              : 'Fill in the details below to put your item up for sale or auction.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ListItemForm />
        </CardContent>
      </Card>
    </div>
  );
}
