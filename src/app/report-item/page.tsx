
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
import { mockMessages, mockConversations, mockUser } from '@/lib/mock-data'; // Import mock data
import type { Message, Conversation } from '@/lib/types';

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
        <Card className="max-w-xl mx-auto shadow-lg">
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
    const decodedItemName = decodeURIComponent(itemName as string);
    // In a real app, you would send this data to your backend
    console.log('Report submitted:', {
      itemId,
      itemName: decodedItemName,
      reason: data.reason,
    });

    // Create a message for the admin
    const adminUserId = 'user123'; // ID of the admin user (mockUser.id when admin is logged in)
    const adminUserName = 'Admin User'; // Name of the admin user
    const systemReporterId = 'system-reporter';
    const systemReporterName = 'System Reporter';
    const reportConversationId = `conv-reports-${adminUserId}`;
    const reportConversationItemId = 'system-reports'; // Special itemId for all reports

    const reportContent = `Item Reported: "${decodedItemName}" (ID: ${itemId}). Reason: ${data.reason}`;
    const newReportMessage: Message = {
      id: `msg-report-${Date.now()}`,
      fromUserId: systemReporterId,
      toUserId: adminUserId, // Message is to the admin
      itemId: itemId, // Associate with the actual reported item
      content: reportContent,
      timestamp: new Date().toISOString(),
      isRead: false,
      isSystemMessage: true, // Treat as a system message for styling or filtering if needed
    };

    mockMessages.push(newReportMessage);

    let reportConv = mockConversations.find(conv => conv.id === reportConversationId);

    if (reportConv) {
      reportConv.lastMessage = { content: `New report for: ${decodedItemName}`, timestamp: newReportMessage.timestamp };
      reportConv.unreadCount = (reportConv.unreadCount || 0) + 1;
    } else {
      reportConv = {
        id: reportConversationId,
        itemId: reportConversationItemId, // Generic ID for the reports conversation
        itemName: 'Item Reports',
        itemImageUrl: 'https://placehold.co/100x100.png?text=RPT', // Placeholder icon for reports
        participants: [
          { id: adminUserId, name: adminUserName, avatarUrl: 'https://placehold.co/100x100.png?text=ADM' },
          { id: systemReporterId, name: systemReporterName, avatarUrl: 'https://placehold.co/100x100.png?text=SYS' }
        ],
        lastMessage: { content: `New report for: ${decodedItemName}`, timestamp: newReportMessage.timestamp },
        unreadCount: 1,
        buyRequestStatus: 'none',
        isItemSoldOrUnavailable: false,
      };
      mockConversations.push(reportConv);
    }

    // Sort conversations to bring the most recent to the top
    mockConversations.sort((a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime());

    toast({
      title: 'Report Submitted',
      description: `Thank you for reporting "${decodedItemName}". Our team will review it shortly. A message has also been sent to the admin.`,
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
                  size="lg"
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
