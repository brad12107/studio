'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { mockUser } from '@/lib/mock-data'; // Using mock user for subscription status
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import Link from 'next/link';

const MAX_FREE_ITEMS = 3;

const listItemSchema = z.object({
  name: z.string().min(3, { message: 'Item name must be at least 3 characters.' }).max(100),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }).max(1000),
  price: z.coerce.number().positive({ message: 'Price must be a positive number.' }),
  type: z.enum(['sale', 'auction'], { required_error: 'Please select item type.' }),
  category: z.string().min(2, {message: 'Category must be at least 2 characters.'}).max(50),
  imageUrl: z.string().url({ message: 'Please enter a valid image URL.' }),
});

type ListItemFormValues = z.infer<typeof listItemSchema>;

export function ListItemForm() {
  const { toast } = useToast();
  // Mocking user's listed items count and subscription status
  const [userListedItemsCount, setUserListedItemsCount] = useState(mockUser.itemsListedCount);
  const [userSubscriptionStatus, setUserSubscriptionStatus] = useState(mockUser.subscriptionStatus);

  const form = useForm<ListItemFormValues>({
    resolver: zodResolver(listItemSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      type: 'sale',
      category: '',
      imageUrl: '',
    },
  });

  const canListMoreItems = 
    userSubscriptionStatus === 'subscribed' || 
    (userSubscriptionStatus === 'free_trial' && userListedItemsCount < MAX_FREE_ITEMS);

  function onSubmit(data: ListItemFormValues) {
    if (!canListMoreItems) {
      toast({
        title: 'Listing Limit Reached',
        description: 'Please subscribe to list more items.',
        variant: 'destructive',
      });
      return;
    }

    // Simulate API call
    console.log(data);
    toast({
      title: 'Item Listed!',
      description: `${data.name} has been successfully listed.`,
    });
    setUserListedItemsCount(prev => prev + 1); // Increment listed items count
    form.reset(); // Reset form after successful submission
  }

  return (
    <div className="max-w-2xl mx-auto">
      {!canListMoreItems && (
        <Alert variant="destructive" className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Free Trial Limit Reached</AlertTitle>
          <AlertDescription>
            You have listed {userListedItemsCount} out of {MAX_FREE_ITEMS} items allowed in your free trial. 
            Please <Link href="/subscription" className="underline hover:text-destructive-foreground/80">subscribe</Link> to list more items.
          </AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Vintage Wooden Chair" {...field} disabled={!canListMoreItems} />
                </FormControl>
                <FormDescription>A short, descriptive name for your item.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Detailed description of your item, its condition, etc."
                    className="resize-y min-h-[100px]"
                    {...field}
                    disabled={!canListMoreItems}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (£)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="e.g., 25.99" {...field} disabled={!canListMoreItems} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!canListMoreItems}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sale">For Sale</SelectItem>
                      <SelectItem value="auction">Auction</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Furniture, Electronics, Apparel" {...field} disabled={!canListMoreItems} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input type="url" placeholder="https://example.com/image.png" {...field} disabled={!canListMoreItems}/>
                </FormControl>
                <FormDescription>Link to an image of your item.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full md:w-auto" size="lg" disabled={!canListMoreItems || form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Listing...' : 'List Item'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
