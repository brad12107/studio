
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Flag } from 'lucide-react';

const reportItemSchema = z.object({
  reason: z.string().min(10, { message: 'Please provide a reason of at least 10 characters.' }).max(500, {message: 'Reason cannot exceed 500 characters.'}),
});

type ReportItemFormValues = z.infer<typeof reportItemSchema>;

export default function ReportItemPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const itemId = searchParams.get('itemId');
  const itemName = searchParams.get('itemName');

  const form = useForm<ReportItemFormValues>({
    resolver: zodResolver(reportItemSchema),
    defaultValues: {
      reason: '',
    },
  });

  if (!itemId || !itemName) {
    // Basic handling if params are missing, ideally redirect or show specific error
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Item ID or name missing. Cannot report this item.</p>
            <Button onClick={() => router.back()} variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  async function onSubmit(data: ReportItemFormValues) {
    // In a real app, you would send this data to your backend
    console.log('Report submitted:', {
      itemId,
      itemName,
      reason: data.reason,
    });

    toast({
      title: 'Report Submitted',
      description: `Thank you for reporting "${itemName}". Our team will review it shortly.`,
    });

    // Redirect back to the item detail page
    router.push(`/item/${itemId}`);
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Flag className="h-6 w-6 text-destructive" />
            <CardTitle className="text-2xl font-bold">Report Item</CardTitle>
          </div>
          <CardDescription>
            You are reporting the item: <span className="font-semibold text-primary">{decodeURIComponent(itemName)}</span>.
            Please explain why this item violates our Code of Conduct.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Reporting</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Explain why this item is being reported..."
                        className="resize-y min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Your report will be reviewed by our moderation team.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="w-full sm:w-auto"
                  disabled={form.formState.isSubmitting}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  disabled={form.formState.isSubmitting}
                  size="lg"
                >
                  {form.formState.isSubmitting ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
