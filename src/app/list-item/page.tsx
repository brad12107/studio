
import { ListItemForm } from '@/components/market/list-item-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ListItemPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">List a New Item</CardTitle>
          <CardDescription>
            Fill in the details below to put your item up for sale or auction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ListItemForm />
        </CardContent>
      </Card>
    </div>
  );
}
