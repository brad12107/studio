
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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { mockUser, mockItems } from '@/lib/mock-data';
import type { Item, User } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, UploadCloud, Star, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { addDays } from 'date-fns';

const MAX_FREE_ITEMS = 3;
const LISTING_FEE = 0.50;
const ENHANCEMENT_FEE = 1.00;
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
  price: z.coerce.number().positive({ message: 'Price (or starting bid) must be a positive number.' }),
  type: z.enum(['sale', 'auction'], { required_error: 'Please select item type.' }),
  auctionDurationDays: z.coerce.number().positive("Duration must be a positive number.").optional(),
  category: z.string().min(2, {message: 'Category must be at least 2 characters.'}).max(50),
  imageUrl: z.custom<FileList>((val) => val instanceof FileList && val.length > 0, 'Please select an image.')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE_BYTES, `Max file size is ${MAX_FILE_SIZE_MB}MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      '.jpg, .jpeg, .png, and .webp files are accepted.'
    ),
  isEnhanced: z.boolean().default(false).optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'auction' && (data.auctionDurationDays === undefined || data.auctionDurationDays === null || data.auctionDurationDays <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Auction duration (in days) is required for auction items and must be greater than 0.",
      path: ['auctionDurationDays'],
    });
  }
});

type ListItemFormValues = z.infer<typeof listItemSchema>;

const initialFormValues: ListItemFormValues = {
  name: '',
  description: '',
  price: 0,
  type: 'sale',
  auctionDurationDays: 7, // Default to 7 days
  category: '',
  imageUrl: undefined as unknown as FileList, 
  isEnhanced: false,
};


export function ListItemForm() {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<ListItemFormValues>({
    resolver: zodResolver(listItemSchema),
    defaultValues: initialFormValues,
  });

  const watchedImageUrl = form.watch('imageUrl');
  const watchedItemType = form.watch('type');
  const watchedIsEnhanced = form.watch('isEnhanced');

  useEffect(() => {
    if (watchedImageUrl && watchedImageUrl.length > 0) {
      const file = watchedImageUrl[0];
      if (file && ACCEPTED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE_BYTES) {
        fileToDataUri(file).then(setImagePreview).catch(console.error);
      } else {
        setImagePreview(null); 
      }
    } else {
      setImagePreview(null); 
    }
  }, [watchedImageUrl]);

  const isFreeTrialLimitReached =
    mockUser.subscriptionStatus === 'free_trial' && mockUser.itemsListedCount >= MAX_FREE_ITEMS;

  const isListingFeeApplicable = mockUser.subscriptionStatus === 'none';

  const disableFormFields = isFreeTrialLimitReached;

  const getEnhancementFeeText = () => {
    if (mockUser.subscriptionStatus === 'premium_plus' && (mockUser.enhancedListingsRemaining || 0) > 0) {
      return `FREE (1 of ${mockUser.enhancedListingsRemaining} remaining this month)`;
    }
    return `£${ENHANCEMENT_FEE.toFixed(2)}`;
  };

  async function onSubmit(data: ListItemFormValues) {
    if (isFreeTrialLimitReached) {
      toast({
        title: 'Listing Limit Reached',
        description: `You have listed ${mockUser.itemsListedCount} of ${MAX_FREE_ITEMS} items allowed in your free trial. Please subscribe to list more items.`,
        variant: 'destructive',
      });
      return;
    }

    let imageUrlForStorage = 'https://placehold.co/600x400.png'; 
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
    
    let auctionEndTimeISO: string | undefined = undefined;
    if (data.type === 'auction' && data.auctionDurationDays && data.auctionDurationDays > 0) {
        auctionEndTimeISO = addDays(new Date(), data.auctionDurationDays).toISOString();
    }

    const newItem: Item = {
      id: `item-${Date.now()}`,
      name: data.name,
      description: data.description,
      price: data.price, // This is starting price for auctions
      type: data.type,
      imageUrl: imageUrlForStorage,
      sellerName: mockUser.name,
      category: data.category,
      isEnhanced: data.isEnhanced,
      auctionEndTime: auctionEndTimeISO, // Set if auction
      currentBid: data.type === 'auction' ? undefined : undefined, // Initially no bids
      bidHistory: data.type === 'auction' ? [] : undefined, // Initially empty history
    };
    mockItems.unshift(newItem); 

    let toastDescription = `${data.name} has been successfully listed.`;
    const feeMessages: string[] = [];

    if (data.isEnhanced) {
      if (mockUser.subscriptionStatus === 'premium_plus' && (mockUser.enhancedListingsRemaining || 0) > 0) {
        mockUser.enhancedListingsRemaining = (mockUser.enhancedListingsRemaining || 0) - 1;
        feeMessages.push(`Free enhanced listing used (${mockUser.enhancedListingsRemaining} remaining).`);
      } else {
        feeMessages.push(`Enhancement fee: £${ENHANCEMENT_FEE.toFixed(2)}`);
      }
    }

    if (isListingFeeApplicable) {
      feeMessages.push(`Listing fee: £${LISTING_FEE.toFixed(2)}`);
    }
    

    if (feeMessages.length > 0) {
      toastDescription += ` ${feeMessages.join(' ')} (mock fees applied).`;
    }

    toast({
      title: 'Item Listed!',
      description: toastDescription,
    });

    if (mockUser.subscriptionStatus === 'free_trial') {
      mockUser.itemsListedCount += 1; 
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
            You have listed {mockUser.itemsListedCount} of {MAX_FREE_ITEMS} items allowed in your free trial.
            Please <Link href="/subscription" className="underline hover:text-destructive-foreground/80">subscribe</Link> to list more items.
          </AlertDescription>
        </Alert>
      )}
      {isListingFeeApplicable && !isFreeTrialLimitReached && (
        <Alert variant="default" className="mb-6 bg-secondary/50">
          <Info className="h-4 w-4" />
          <AlertTitle>Listing Fee Applicable</AlertTitle>
          <AlertDescription>
            A standard listing fee of £{LISTING_FEE.toFixed(2)} applies per item.
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
                  <FormLabel>{watchedItemType === 'auction' ? 'Starting Price (£)' : 'Price (£)'}</FormLabel>
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

          {watchedItemType === 'auction' && (
            <FormField
              control={form.control}
              name="auctionDurationDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                     <Clock className="h-5 w-5 mr-2 text-primary" /> Auction Duration (days)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="1" 
                      min="1"
                      placeholder="e.g., 7 for one week" 
                      {...field} 
                      disabled={disableFormFields} 
                      value={field.value ?? ''} // Handle potential undefined from optional field
                      onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)}
                    />
                  </FormControl>
                  <FormDescription>How many days the auction will run for.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

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
                <Image src={imagePreview} alt="Item preview" fill sizes="100vw" className="object-contain" data-ai-hint="item image"/>
              </div>
            </div>
          )}

          <FormField
            control={form.control}
            name="isEnhanced"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-amber-50/50 border-amber-200">
                <div className="space-y-0.5">
                  <FormLabel className="text-base flex items-center text-amber-700">
                    <Star className="h-5 w-5 mr-2 text-amber-500" />
                    Enhance Listing ({getEnhancementFeeText()})
                  </FormLabel>
                  <FormDescription className="text-amber-600">
                    Make your item stand out! Enhanced items appear higher in search results and listings.
                    {mockUser.subscriptionStatus !== 'premium_plus' || (mockUser.enhancedListingsRemaining || 0) === 0 ? 
                     ` This is an optional £${ENHANCEMENT_FEE.toFixed(2)} fee.` : ' Use one of your free monthly enhancements.'}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={disableFormFields || form.formState.isSubmitting}
                    className="data-[state=checked]:bg-amber-500"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
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

