
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
import { Camera, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter, useSearchParams } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

const MAX_AVATAR_SIZE_MB = 5;
const MAX_AVATAR_SIZE_BYTES = MAX_AVATAR_SIZE_MB * 1024 * 1024;
const ACCEPTED_AVATAR_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const profileSchemaBase = z.object({
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

const profileSchemaCreate = profileSchemaBase.extend({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Please confirm your password." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

const profileSchemaEdit = profileSchemaBase.extend({
  email: z.string().email({ message: "Please enter a valid email address." }).optional(), // Email might not be editable or shown in edit mode for simplicity here
  password: z.string().min(6, { message: "Password must be at least 6 characters." }).optional(),
  confirmPassword: z.string().min(6, { message: "Please confirm your password." }).optional(),
}).refine(data => !data.password || data.password === data.confirmPassword, { // Only validate if password is being changed
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});


type ProfileFormValues = z.infer<typeof profileSchemaCreate>; // Use the create schema for form values type
const defaultAvatarPlaceholder = 'https://placehold.co/100x100.png';

export default function ProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCreateMode = searchParams.get('mode') === 'create';

  const [userData, setUserData] = useState<User>(mockUser);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    isCreateMode ? defaultAvatarPlaceholder : (userData.avatarUrl || defaultAvatarPlaceholder)
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(isCreateMode ? profileSchemaCreate : profileSchemaEdit),
    defaultValues: isCreateMode
    ? {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        location: '',
        bio: '',
        isProfilePrivate: false,
        avatarUrl: undefined,
        agreedToCodeOfConduct: false,
      }
    : {
        name: userData.name || '',
        email: userData.email || '', 
        password: '', 
        confirmPassword: '',
        location: userData.location || '',
        bio: userData.bio || '',
        isProfilePrivate: userData.isProfilePrivate || false,
        avatarUrl: userData.avatarUrl || undefined, 
        agreedToCodeOfConduct: true, 
      },
  });

  // Effect to update local userData state when mockUser changes (e.g., feedback update)
  useEffect(() => {
    setUserData({...mockUser});
  }, [mockUser.thumbsUp, mockUser.thumbsDown]);

  useEffect(() => {
    const currentProfileSchema = isCreateMode ? profileSchemaCreate : profileSchemaEdit;
    form.reset(
      isCreateMode
      ? {
          name: '', email: '', password: '', confirmPassword: '', location: '', bio: '',
          isProfilePrivate: false, avatarUrl: undefined, agreedToCodeOfConduct: false,
        }
      : {
          name: userData.name || '',
          email: userData.email || '', 
          password: '', 
          confirmPassword: '',
          location: userData.location || '', bio: userData.bio || '',
          isProfilePrivate: userData.isProfilePrivate || false,
          avatarUrl: userData.avatarUrl || undefined, 
          agreedToCodeOfConduct: true, 
        },
      { resolver: zodResolver(currentProfileSchema) } 
    );
    setAvatarPreview(isCreateMode ? defaultAvatarPlaceholder : (userData.avatarUrl || defaultAvatarPlaceholder));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData.name, userData.email, userData.location, userData.bio, userData.isProfilePrivate, userData.avatarUrl, isCreateMode]); 


  const watchedAvatarUrl = form.watch('avatarUrl');

  useEffect(() => {
    if (watchedAvatarUrl instanceof FileList && watchedAvatarUrl.length > 0) {
      const file = watchedAvatarUrl[0];
      if (file && ACCEPTED_AVATAR_TYPES.includes(file.type) && file.size <= MAX_AVATAR_SIZE_BYTES) {
        fileToDataUri(file).then(setAvatarPreview).catch(err => {
          console.error("Error creating avatar preview:", err);
          setAvatarPreview(isCreateMode ? defaultAvatarPlaceholder : (userData.avatarUrl || defaultAvatarPlaceholder));
        });
      } else {
        setAvatarPreview(isCreateMode ? defaultAvatarPlaceholder : (userData.avatarUrl || defaultAvatarPlaceholder));
      }
    } else if (typeof watchedAvatarUrl === 'string') {
      setAvatarPreview(watchedAvatarUrl);
    } else if (!watchedAvatarUrl && isCreateMode) {
      setAvatarPreview(defaultAvatarPlaceholder);
    } else if (!watchedAvatarUrl && !isCreateMode) {
      setAvatarPreview(userData.avatarUrl || defaultAvatarPlaceholder);
    }
  }, [watchedAvatarUrl, isCreateMode, userData.avatarUrl]);


  async function onSubmit(data: ProfileFormValues) {
    let finalAvatarUrl = isCreateMode ? defaultAvatarPlaceholder : (userData.avatarUrl || defaultAvatarPlaceholder);

    if (data.avatarUrl instanceof FileList && data.avatarUrl.length > 0) {
      const file = data.avatarUrl[0];
      if (file.size > MAX_AVATAR_SIZE_BYTES || !ACCEPTED_AVATAR_TYPES.includes(file.type)) {
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
      finalAvatarUrl = data.avatarUrl;
    }

    mockUser.name = data.name;
    if (isCreateMode && data.email) mockUser.email = data.email; 
    if (isCreateMode && data.password) mockUser.password = data.password; 
    mockUser.location = data.location;
    mockUser.bio = data.bio;
    mockUser.isProfilePrivate = data.isProfilePrivate;
    mockUser.avatarUrl = finalAvatarUrl;
    // Thumbs up/down are not edited here, they are updated by other interactions

    setUserData({ ...mockUser });

    if (isCreateMode) {
      localStorage.setItem('isLoggedIn', 'true');
      toast({
        title: 'Account Created!',
        description: 'Your account has been successfully created and you are now logged in.',
      });
      router.push('/');
      router.refresh();
    } else {
      toast({
        title: 'Profile Saved!',
        description: 'Your information has been updated.',
      });
      router.refresh(); 
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{isCreateMode ? 'Create Your Account' : 'Edit Profile'}</CardTitle>
          <CardDescription>{isCreateMode ? 'Fill in your details to get started.' : 'Manage your personal information and privacy settings.'}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Feedback Display Section - Only in Edit Mode */}
          {!isCreateMode && (
            <div className="mb-8 p-4 border rounded-lg bg-secondary/30">
              <h3 className="text-lg font-semibold mb-2">Your Feedback Score</h3>
              <div className="flex items-center space-x-6">
                <div className="flex items-center text-green-600">
                  <ThumbsUp className="mr-2 h-5 w-5" />
                  <span>{userData.thumbsUp} Positive</span>
                </div>
                <div className="flex items-center text-red-600">
                  <ThumbsDown className="mr-2 h-5 w-5" />
                  <span>{userData.thumbsDown} Negative</span>
                </div>
              </div>
            </div>
          )}
          
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
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }}
                    >
                      <Avatar className="h-24 w-24 border-2 border-primary group-hover:opacity-80 transition-opacity">
                        <AvatarImage src={avatarPreview} alt={form.getValues('name')} data-ai-hint="user profile" />
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
                      <Input placeholder="Your full name" {...field} className="bg-input-profile-background text-custom-input-text placeholder:text-custom-input-text/70" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isCreateMode && (
                <>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} className="bg-input-profile-background text-custom-input-text placeholder:text-custom-input-text/70"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} className="bg-input-profile-background text-custom-input-text placeholder:text-custom-input-text/70"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} className="bg-input-profile-background text-custom-input-text placeholder:text-custom-input-text/70"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              {!isCreateMode && ( 
                 <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" value={userData.email} readOnly disabled className="bg-muted/50"/>
                    </FormControl>
                    <FormDescription>Email cannot be changed after account creation (in this mock setup).</FormDescription>
                  </FormItem>
              )}


              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery/Pick Up Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Your City, Postcode, or specific address" {...field} className="bg-input-profile-background text-custom-input-text placeholder:text-custom-input-text/70" />
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
                        className="resize-y min-h-[100px] bg-input-profile-background text-custom-input-text placeholder:text-custom-input-text/70"
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
                        Our platform is committed to providing a safe and trustworthy environment for all users. To ensure this, we strictly prohibit the sale, purchase, or auction of firearms, ammunition, illegal drugs, and livestock. Any attempt to engage in these activities will result in immediate account suspension and potential reporting to law enforcement. Furthermore, we have a zero-tolerance policy for scams and fraudulent activities. Users are strictly forbidden from using our platform to perpetuate scams, deceive others, or engage in any form of financial exploitation. We encourage users to report any suspicious behavior or potential scams to our moderation team immediately. We are dedicated to maintaining a platform free from illegal and harmful activities, and we appreciate your cooperation in upholding these standards.
                        <br/>
                        By checking this box, you confirm your agreement.
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                size="lg"
                className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={form.formState.isSubmitting}
                >
                {form.formState.isSubmitting ? (isCreateMode ? 'Creating Account...' : 'Saving...') : (isCreateMode ? 'Create Account' : 'Save Profile')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
