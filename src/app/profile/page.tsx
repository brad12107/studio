
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
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { mockUser } from '@/lib/mock-data';
import type { User } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(50),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  bio: z.string().max(250, { message: 'Bio cannot exceed 250 characters.' }).optional(),
  isProfilePrivate: z.boolean().default(false),
  avatarUrl: z.string().url({ message: 'Please enter a valid avatar URL.' }).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  // Use state to manage user data so changes can be reflected if needed,
  // and to allow the form to re-initialize if this data were fetched asynchronously.
  const [userData, setUserData] = useState<User>(mockUser);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: userData.name || '',
      email: userData.email || '',
      bio: userData.bio || '',
      isProfilePrivate: userData.isProfilePrivate || false,
      avatarUrl: userData.avatarUrl || 'https://placehold.co/100x100.png',
    },
  });
  
  // Effect to reset form if userData changes (e.g., if fetched async or updated elsewhere)
  useEffect(() => {
    form.reset({
      name: userData.name || '',
      email: userData.email || '',
      bio: userData.bio || '',
      isProfilePrivate: userData.isProfilePrivate || false,
      avatarUrl: userData.avatarUrl || 'https://placehold.co/100x100.png',
    });
  }, [userData, form]);

  function onSubmit(data: ProfileFormValues) {
    // In a real app, this would be an API call.
    // Here, we're updating the mockUser object directly.
    mockUser.name = data.name;
    mockUser.email = data.email;
    mockUser.bio = data.bio;
    mockUser.isProfilePrivate = data.isProfilePrivate;
    mockUser.avatarUrl = data.avatarUrl;

    // Update local state to reflect changes, which also updates UserNav potentially
    setUserData({ ...mockUser }); 

    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been successfully saved.',
    });
    console.log('Updated mockUser:', mockUser);
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Profile</CardTitle>
          <CardDescription>Manage your personal information and privacy settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormLabel htmlFor="avatar-upload" className="relative cursor-pointer group">
                      <Avatar className="h-24 w-24 border-2 border-primary group-hover:opacity-80 transition-opacity">
                        <AvatarImage src={field.value} alt={form.getValues('name')} data-ai-hint="user avatar placeholder" />
                        <AvatarFallback>{form.getValues('name')?.substring(0, 2).toUpperCase() || 'AV'}</AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="h-8 w-8 text-white" />
                      </div>
                    </FormLabel>
                    <FormDescription className="text-center mt-2">Click avatar to change. Paste image URL below.</FormDescription>
                    <FormControl>
                       <Input 
                        id="avatar-upload" 
                        placeholder="https://example.com/avatar.png" 
                        {...field} 
                        className="mt-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us a little about yourself..."
                        className="resize-y min-h-[100px]"
                        {...field}
                        value={field.value || ''} 
                      />
                    </FormControl>
                    <FormDescription>A short description about you (max 250 characters).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isProfilePrivate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Keep Profile Private</FormLabel>
                      <FormDescription>
                        If enabled, your profile details (like bio and email) will not be publicly visible.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <Button type="submit" size="lg" className="w-full md:w-auto" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
