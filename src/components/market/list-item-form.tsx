
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
import { useState, useEffect } from 'react';
import { mockUser, mockItems } from '@/lib/mock-data'; // Assuming mockItems is needed to add new item
import type { Item } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const MAX_FREE_ITEMS = 3;
const LISTING_FEE = 0.50;
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Helper function to convert File to data URI
const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const listItemSchema = z.object({
  name: z.string().min(3, { message: 'Item name must be at least 3 characters.' }).max(100),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }).max(1000),
  price: z.coerce.number().positive({ message: 'Price must be a positive number.' }),
  type: z.enum(['sale', 'auction'], { required_error: 'Please select item type.' }),
  category: z.string().min(2, {message: 'Category must be at least 2 characters.'}).max(50),
  imageUrl: z.custom<FileList>((val) => val instanceof FileList && val.length > 0, 'Please select an image.')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE_BYTES, `Max file size is ${MAX_FILE_SIZE_MB}MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      '.jpg, .jpeg, .png, and .webp files are accepted.'
    ),
});

type ListItemFormValues = z.infer<typeof listItemSchema>;

const initialFormValues: ListItemFormValues = {
  name: '',
  description: '',
  price: 0,
  type: 'sale',
  category: '',
  imageUrl: undefined as unknown as FileList, // For reset
};


export function ListItemForm() {
  const { toast } = useToast();
  const [userListedItemsCount, setUserListedItemsCount] = useState(mockUser.itemsListedCount);
  const [userSubscriptionStatus, setUserSubscriptionStatus] = useState(mockUser.subscriptionStatus);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<ListItemFormValues>({
    resolver: zodResolver(listItemSchema),
    defaultValues: initialFormValues,
  });

  const watchedImageUrl = form.watch('imageUrl');

  useEffect(() => {
    if (watchedImageUrl && watchedImageUrl.length > 0) {
      const file = watchedImageUrl[0];
      if (file && ACCEPTED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE_BYTES) {
        fileToDataUri(file).then(setImagePreview).catch(console.error);
      } else {
        setImagePreview(null); // Clear preview if file is invalid or removed
      }
    } else {
      setImagePreview(null); // Clear preview if no file
    }
  }, [watchedImageUrl]);

  const isFreeTrialLimitReached =
    userSubscriptionStatus === 'free_trial' && userListedItemsCount >= MAX_FREE_ITEMS;

  const isFeeApplicable = userSubscriptionStatus === 'none';

  const disableFormFields = isFreeTrialLimitReached;

  async function onSubmit(data: ListItemFormValues) {
    if (isFreeTrialLimitReached) {
      toast({
        title: 'Listing Limit Reached',
        description: `You have listed ${userListedItemsCount} out of ${MAX_FREE_ITEMS} items allowed in your free trial. Please subscribe to list more items.`,
        variant: 'destructive',
      });
      return;
    }

    let imageUrlForStorage = 'https://placehold.co/600x400.png'; // Default placeholder
    if (data.imageUrl && data.imageUrl.length > 0) {
      try {
        imageUrlForStorage = await fileToDataUri(data.imageUrl[0]);
      } catch (error) {
        console.error("Error converting image to data URI:", error);
        toast({
          title: 'Image Upload Error',
          description: 'Could not process the image. Please try another one.',
          variant: 'destructive',
        });
        return;
      }
    }
    
    // In a real app, you'd send this to a backend. Here, we'll add to mockItems.
    const newItem: Item = {
      id: `item-${Date.now()}`,
      name: data.name,
      description: data.description,
      price: data.price,
      type: data.type,
      imageUrl: imageUrlForStorage,
      sellerName: mockUser.name, // Assuming the current user is the seller
      category: data.category,
    };
    mockItems.unshift(newItem); // Add to the beginning of the array

    let toastDescription = `${data.name} has been successfully listed.`;
    if (isFeeApplicable) {
      toastDescription += ` A fee of £${LISTING_FEE.toFixed(2)} was applied.`;
    }

    toast({
      title: 'Item Listed!',
      description: toastDescription,
    });

    if (userSubscriptionStatus === 'free_trial') {
      setUserListedItemsCount(prev => prev + 1);
      mockUser.itemsListedCount = mockUser.itemsListedCount + 1; // Persist change to mockUser for session
    }
    form.reset(initialFormValues);
    setImagePreview(null); 
  }

  return (
    <div className="max-w-2xl mx-auto">
      {isFreeTrialLimitReached && (
        <Alert variant="destructive" className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Free Trial Limit Reached</AlertTitle>
          <AlertDescription>
            You have listed {userListedItemsCount} out of {MAX_FREE_ITEMS} items allowed in your free trial.
            Please <Link href="/subscription" className="underline hover:text-destructive-foreground/80">subscribe</Link> to list more items.
          </AlertDescription>
        </Alert>
      )}
      {isFeeApplicable && !isFreeTrialLimitReached && (
        <Alert variant="default" className="mb-6 bg-secondary/50">
          <Info className="h-4 w-4" />
          <AlertTitle>Listing Fee Applicable</AlertTitle>
          <AlertDescription>
            A fee of £{LISTING_FEE.toFixed(2)} applies per item listed.
            <Link href="/subscription" className="underline hover:text-foreground/80 ml-1">Subscribe</Link> to list for free, or check your current
            <Link href="/subscription" className="underline hover:text-foreground/80 ml-1">subscription status</Link>.
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
                  <Input placeholder="e.g., Vintage Wooden Chair" {...field} disabled={disableFormFields} />
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
                    disabled={disableFormFields}
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
                    <Input type="number" step="0.01" placeholder="e.g., 25.99" {...field} disabled={disableFormFields} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disableFormFields}>
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
                  <Input placeholder="e.g., Furniture, Electronics, Apparel" {...field} disabled={disableFormFields} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field: { onChange, value, ...rest } }) => ( 
              <FormItem>
                <FormLabel className="flex items-center">
                  <UploadCloud className="h-5 w-5 mr-2 text-primary" /> Item Image
                </FormLabel>
                <FormControl>
                  <Input 
                    type="file" 
                    accept="image/png, image/jpeg, image/webp"
                    onChange={(e) => onChange(e.target.files)} 
                    {...rest} 
                    disabled={disableFormFields}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                </FormControl>
                <FormDescription>Upload an image of your item (Max {MAX_FILE_SIZE_MB}MB, .png, .jpg, .webp).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {imagePreview && (
            <div className="mt-4">
              <FormLabel>Image Preview</FormLabel>
              <div className="mt-2 relative aspect-video w-full max-w-md rounded-md border border-dashed border-muted-foreground/50 flex items-center justify-center overflow-hidden bg-slate-50">
                <Image src={imagePreview} alt="Item preview" fill sizes="100vw" className="object-contain" />
              </div>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" 
            size="lg" 
            disabled={disableFormFields || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Listing...' : 'List Item'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
