
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
import type { Item } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, UploadCloud, Star, Clock, Image as ImageIcon, Trash2, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import NextImage from 'next/image';
import { addDays } from 'date-fns';
import { useRouter } from 'next/navigation'; 

const MAX_FREE_ITEMS = 3;
const LISTING_FEE = 0.50;
const ENHANCEMENT_FEE = 1.00;
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGES = 15;

const CATEGORIES = [
  "Apparel",
  "Furniture",
  "Home Decor",
  "Electronics",
  "Sports",
  "Books",
  "Vehicles",
  "Garden & Outdoors",
  "Music & Instruments",
  "Jewellery & Accessories",
  "Toys & Games",
  "Art & Crafts",
  "Health & Beauty",
  "Pet Supplies",
  "Property for Rent",
  "Property for Sale",
  "Other"
].sort();

const ITEM_CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'not_working', label: 'Not Working' },
] as const;
type ItemConditionValue = typeof ITEM_CONDITIONS[number]['value'];


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
  category: z.string().nonempty({ message: 'Please select a category.' }),
  itemCondition: z.enum(['new', 'like_new', 'good', 'not_working']).optional(),
  imageFiles: z
    .custom<FileList>()
    .refine(
      (files) => {
        if (typeof FileList === 'undefined') return true; // SSR check
        return files instanceof FileList;
      },
      { message: "Invalid file input. Please upload a list of files." }
    )
    .refine(
      (files) => files && files.length >= 1,
      'Please select at least one image.'
    )
    .refine(
      (files) => files && files.length <= MAX_IMAGES,
      `You can upload a maximum of ${MAX_IMAGES} images.`
    )
    .refine(
      (files) => files && Array.from(files).every((file) => file.size <= MAX_FILE_SIZE_BYTES),
      `Each file size must be ${MAX_FILE_SIZE_MB}MB or less.`
    )
    .refine(
      (files) => files && Array.from(files).every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type)),
      'Only .jpg, .jpeg, .png, and .webp files are accepted.'
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
  const propertyCategories = ["Property for Sale", "Property for Rent"];
  if (!propertyCategories.includes(data.category) && !data.itemCondition) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please select an item condition.",
      path: ['itemCondition'],
    });
  }
});

type ListItemFormValues = z.infer<typeof listItemSchema>;

const initialFormValues: ListItemFormValues = {
  name: '',
  description: '',
  price: 0,
  type: 'sale',
  auctionDurationDays: 7,
  category: '',
  itemCondition: undefined,
  imageFiles: undefined as unknown as FileList, 
  isEnhanced: false,
};


export function ListItemForm() {
  const { toast } = useToast();
  const router = useRouter(); 
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const form = useForm<ListItemFormValues>({
    resolver: zodResolver(listItemSchema),
    defaultValues: initialFormValues,
  });

  const watchedImageFiles = form.watch('imageFiles');
  const watchedItemType = form.watch('type');
  const watchedCategory = form.watch('category');

  const showConditionField = !['Property for Sale', 'Property for Rent'].includes(watchedCategory);


  useEffect(() => {
    if (watchedImageFiles && watchedImageFiles.length > 0 && typeof FileList !== 'undefined' && watchedImageFiles instanceof FileList) {
      const filePromises = Array.from(watchedImageFiles)
        .filter(file => ACCEPTED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE_BYTES)
        .slice(0, MAX_IMAGES) 
        .map(fileToDataUri);
      
      Promise.all(filePromises).then(setImagePreviews).catch(console.error);
    } else {
      setImagePreviews([]); 
    }
  }, [watchedImageFiles]);

  const handleRemoveImage = (index: number) => {
    const currentFiles = form.getValues('imageFiles');
    if (currentFiles && typeof FileList !== 'undefined' && currentFiles instanceof FileList) {
      const newFilesArray = Array.from(currentFiles);
      newFilesArray.splice(index, 1);
      
      const dataTransfer = new DataTransfer();
      newFilesArray.forEach(file => dataTransfer.items.add(file));
      form.setValue('imageFiles', dataTransfer.files, { shouldValidate: true });
    }
  };

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

    let imageUrlsForStorage: string[] = [];
    if (data.imageFiles && data.imageFiles.length > 0 && typeof FileList !== 'undefined' && data.imageFiles instanceof FileList) {
      try {
        const filePromises = Array.from(data.imageFiles).map(fileToDataUri);
        imageUrlsForStorage = await Promise.all(filePromises);
      } catch (error) {
        console.error("Error converting images to data URI:", error);
        toast({
          title: 'Image Upload Error',
          description: 'Could not process one or more images. Please try again.',
          variant: 'destructive',
        });
        return;
      }
    } else { 
        imageUrlsForStorage = ['https://placehold.co/600x400.png'];
    }
    
    let auctionEndTimeISO: string | undefined = undefined;
    if (data.type === 'auction' && data.auctionDurationDays && data.auctionDurationDays > 0) {
        auctionEndTimeISO = addDays(new Date(), data.auctionDurationDays).toISOString();
    }

    const newItem: Item = {
      id: `item-${Date.now()}`,
      name: data.name,
      description: data.description,
      price: data.price,
      type: data.type,
      imageUrl: imageUrlsForStorage,
      sellerName: mockUser.name,
      category: data.category,
      condition: showConditionField ? data.itemCondition : undefined,
      isEnhanced: data.isEnhanced,
      auctionEndTime: auctionEndTimeISO,
      currentBid: data.type === 'auction' ? undefined : undefined,
      bidHistory: data.type === 'auction' ? [] : undefined,
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
    setImagePreviews([]); 
    router.push('/my-listings'); 
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
                  <Input 
                    placeholder="e.g., Vintage Wooden Chair" 
                    {...field} 
                    disabled={disableFormFields} 
                    className="bg-input text-card-foreground placeholder:text-muted-foreground"
                  />
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
                    className="resize-y min-h-[100px] bg-input text-card-foreground placeholder:text-muted-foreground"
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
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="e.g., 25.99" 
                      {...field} 
                      disabled={disableFormFields} 
                      className="bg-input text-card-foreground placeholder:text-muted-foreground"
                    />
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
                      <SelectTrigger className="bg-input text-card-foreground">
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
                      value={field.value ?? ''} 
                      onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)}
                      className="bg-input text-card-foreground placeholder:text-muted-foreground"
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
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disableFormFields}>
                    <FormControl>
                      <SelectTrigger className="bg-input text-card-foreground">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {showConditionField && (
             <FormField
              control={form.control}
              name="itemCondition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <HelpCircle className="h-5 w-5 mr-2 text-primary" /> Item Condition
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disableFormFields}>
                      <FormControl>
                        <SelectTrigger className="bg-input text-card-foreground">
                          <SelectValue placeholder="Select item condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ITEM_CONDITIONS.map(condition => (
                          <SelectItem key={condition.value} value={condition.value}>
                            {condition.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}


          <FormField
            control={form.control}
            name="imageFiles"
            render={({ field: { onChange, value, ...rest } }) => ( 
              <FormItem>
                <FormLabel className="flex items-center">
                  <UploadCloud className="h-5 w-5 mr-2 text-primary" /> Item Images (1-{MAX_IMAGES})
                </FormLabel>
                <FormControl>
                  <Input 
                    type="file" 
                    accept="image/png, image/jpeg, image/webp"
                    multiple 
                    onChange={(e) => onChange(e.target.files)} 
                    {...rest} 
                    disabled={disableFormFields}
                    className="block w-full text-sm text-card-foreground bg-input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 placeholder:text-muted-foreground"
                  />
                </FormControl>
                <FormDescription>Upload images of your item (Max {MAX_IMAGES} files, {MAX_FILE_SIZE_MB}MB each, .png, .jpg, .webp).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {imagePreviews.length > 0 && (
            <div className="mt-4 space-y-2">
              <FormLabel className="flex items-center"><ImageIcon className="h-5 w-5 mr-2 text-primary" /> Image Previews</FormLabel>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {imagePreviews.map((previewUrl, index) => (
                  <div key={index} className="relative aspect-square rounded-md border border-muted overflow-hidden group">
                    <NextImage src={previewUrl} alt={`Preview ${index + 1}`} fill sizes="10vw" className="object-cover" data-ai-hint="item image preview"/>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
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

