
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
import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const MAX_AVATAR_SIZE_MB = 5;
const MAX_AVATAR_SIZE_BYTES = MAX_AVATAR_SIZE_MB * 1024 * 1024;
const ACCEPTED_AVATAR_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Helper function to convert File to data URI
const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(50),
  location: z.string().max(100, { message: 'Location cannot exceed 100 characters.' }).optional(),
  bio: z.string().max(250, { message: 'Bio cannot exceed 250 characters.' }).optional(),
  isProfilePrivate: z.boolean().default(false),
  avatarUrl: z.custom<FileList | string | undefined>() 
    .optional()
    .refine((value) => {
      if (value instanceof FileList && value.length > 0) {
        const file = value[0];
        return file.size <= MAX_AVATAR_SIZE_BYTES;
      }
      return true;
    }, `Max avatar size is ${MAX_AVATAR_SIZE_MB}MB.`)
    .refine((value) => {
      if (value instanceof FileList && value.length > 0) {
        const file = value[0];
        return ACCEPTED_AVATAR_TYPES.includes(file.type);
      }
      return true;
    }, '.jpg, .jpeg, .png, and .webp files are accepted for avatar.'),
  agreedToCodeOfConduct: z.boolean().refine(value => value === true, {
    message: "You must agree to the Code of Conduct to save your profile."
  }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const [userData, setUserData] = useState<User>(mockUser);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(userData.avatarUrl || 'https://placehold.co/100x100.png');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: userData.name || '',
      location: userData.location || '',
      bio: userData.bio || '',
      isProfilePrivate: userData.isProfilePrivate || false,
      avatarUrl: userData.avatarUrl || undefined,
      agreedToCodeOfConduct: false, // Default to false
    },
  });
  
  useEffect(() => {
    form.reset({
      name: userData.name || '',
      location: userData.location || '',
      bio: userData.bio || '',
      isProfilePrivate: userData.isProfilePrivate || false,
      avatarUrl: userData.avatarUrl || undefined,
      agreedToCodeOfConduct: form.getValues('agreedToCodeOfConduct') || false, // Preserve if already set, or default false
    });
    setAvatarPreview(userData.avatarUrl || 'https://placehold.co/100x100.png');
  }, [userData, form]);

  const watchedAvatarUrl = form.watch('avatarUrl');

  useEffect(() => {
    if (watchedAvatarUrl instanceof FileList && watchedAvatarUrl.length > 0) {
      const file = watchedAvatarUrl[0];
      if (file && ACCEPTED_AVATAR_TYPES.includes(file.type) && file.size <= MAX_AVATAR_SIZE_BYTES) {
        fileToDataUri(file).then(setAvatarPreview).catch(err => {
          console.error("Error creating avatar preview:", err);
          setAvatarPreview(userData.avatarUrl || 'https://placehold.co/100x100.png'); 
        });
      } else {
        // If file is invalid (e.g. too large), reset to current user avatar or placeholder
        setAvatarPreview(userData.avatarUrl || 'https://placehold.co/100x100.png');
      }
    } else if (typeof watchedAvatarUrl === 'string') {
      setAvatarPreview(watchedAvatarUrl);
    } else if (!watchedAvatarUrl) {
        // If avatarUrl is cleared (e.g. no file selected and no existing string URL), show placeholder
        setAvatarPreview('https://placehold.co/100x100.png'); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [watchedAvatarUrl]);


  async function onSubmit(data: ProfileFormValues) {
    let finalAvatarUrl = userData.avatarUrl; 

    if (data.avatarUrl instanceof FileList && data.avatarUrl.length > 0) {
      const file = data.avatarUrl[0];
      // Double check size and type here before attempting conversion,
      // although Zod should have caught it already.
      if (file.size > MAX_AVATAR_SIZE_BYTES || !ACCEPTED_AVATAR_TYPES.includes(file.type)) {
        // This case should ideally be handled by Zod validation and not reach here,
        // but as a safeguard:
        toast({
          title: 'Invalid Avatar File',
          description: `Max size ${MAX_AVATAR_SIZE_MB}MB. Accepted types: JPG, PNG, WEBP.`,
          variant: 'destructive',
        });
        return;
      }
      try {
        finalAvatarUrl = await fileToDataUri(file);
      } catch (error) {
        console.error("Error converting avatar to data URI:", error);
        toast({
          title: 'Avatar Upload Error',
          description: 'Could not process the avatar image. Please try another one.',
          variant: 'destructive',
        });
        return;
      }
    } else if (typeof data.avatarUrl === 'string') {
      // This means an existing URL was likely kept, or manually entered if the input type was text
      finalAvatarUrl = data.avatarUrl; 
    } else if (data.avatarUrl === undefined || (data.avatarUrl instanceof FileList && data.avatarUrl.length === 0)) {
       // If avatarUrl is explicitly undefined (e.g. field cleared and no new file), use placeholder
       finalAvatarUrl = 'https://placehold.co/100x100.png'; 
    }

    mockUser.name = data.name;
    mockUser.location = data.location;
    mockUser.bio = data.bio;
    mockUser.isProfilePrivate = data.isProfilePrivate;
    mockUser.avatarUrl = finalAvatarUrl;
    // mockUser.agreedToCodeOfConduct isn't a property on the User type, so we don't save it directly to mockUser
    // The validation ensures it's checked.

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
                    <FormLabel 
                      htmlFor="avatar-upload-input" 
                      className="relative cursor-pointer group"
                      onClick={(e) => {
                        e.preventDefault(); // Prevent label from toggling checkbox if one existed
                        fileInputRef.current?.click();
                      }}
                    >
                      <Avatar className="h-24 w-24 border-2 border-primary group-hover:opacity-80 transition-opacity">
                        <AvatarImage src={avatarPreview} alt={form.getValues('name')} data-ai-hint="user avatar" />
                        <AvatarFallback>{form.getValues('name')?.substring(0, 2).toUpperCase() || 'AV'}</AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="h-8 w-8 text-white" />
                      </div>
                    </FormLabel>
                    <FormDescription className="text-center mt-2">Click avatar to change image (Max {MAX_AVATAR_SIZE_MB}MB).</FormDescription>
                    <FormControl>
                       <Input 
                        id="avatar-upload-input"
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={(e) => {
                           field.onChange(e.target.files) 
                        }}
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
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery/Pick Up Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Your City, Postcode, or specific address" {...field} />
                    </FormControl>
                    <FormDescription>Your preferred location for item exchange (optional).</FormDescription>
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
                        If enabled, your profile details (like location and bio) will not be publicly visible.
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

              <FormField
                control={form.control}
                name="agreedToCodeOfConduct"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="codeOfConductCheckbox"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel htmlFor="codeOfConductCheckbox">
                        I agree to the Barrow Market Place Code of Conduct.
                      </FormLabel>
                      <FormDescription>
                        Our platform is committed to providing a safe and trustworthy environment for all users. To ensure this, we strictly prohibit the sale, purchase, or auction of firearms, ammunition, and illegal drugs. Any attempt to engage in these activities will result in immediate account suspension and potential reporting to law enforcement. Furthermore, we have a zero-tolerance policy for scams and fraudulent activities. Users are strictly forbidden from using our platform to perpetuate scams, deceive others, or engage in any form of financial exploitation. We encourage users to report any suspicious behavior or potential scams to our moderation team immediately. We are dedicated to maintaining a platform free from illegal and harmful activities, and we appreciate your cooperation in upholding these standards.
                        <br/>
                        By checking this box, you confirm your agreement.
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              
              <Button type="submit" size="lg" className="w-full md:w-auto" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

