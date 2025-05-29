
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
import { mockUser, bannedEmails, allMockUsers } from '@/lib/mock-data';
import type { User } from '@/lib/types';
import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Star, StarHalf, ShieldCheck, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { storage } from '@/lib/firebase'; // Ensure storage is imported
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';


const MAX_AVATAR_SIZE_MB = 5;
const MAX_AVATAR_SIZE_BYTES = MAX_AVATAR_SIZE_MB * 1024 * 1024;
const ACCEPTED_AVATAR_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ADMIN_KEY = "135%32£fhj@345";

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
      if (typeof FileList !== 'undefined' && value instanceof FileList && value.length > 0) {
        const file = value[0];
        return file.size <= MAX_AVATAR_SIZE_BYTES;
      }
      return true;
    }, `Max avatar size is ${MAX_AVATAR_SIZE_MB}MB.`)
    .refine((value) => {
      if (typeof FileList !== 'undefined' && value instanceof FileList && value.length > 0) {
        const file = value[0];
        return ACCEPTED_AVATAR_TYPES.includes(file.type);
      }
      return true;
    }, '.jpg, .jpeg, .png, and .webp files are accepted for avatar.'),
  agreedToCodeOfConduct: z.boolean().refine(value => value === true, {
    message: "You must agree to the Code of Conduct."
  }),
});

const profileSchemaCreate = profileSchemaBase.extend({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Please confirm your password." }),
  agreedToTerms: z.boolean().refine(value => value === true, {
    message: "You must agree to the Terms and Conditions to create an account."
  }),
  isAdminAccount: z.boolean().default(false).optional(),
  adminKey: z.string().optional(),
})
.refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
})
.superRefine((data, ctx) => {
  if (data.isAdminAccount && (!data.adminKey || data.adminKey.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Admin Key is required if creating an admin account.",
      path: ['adminKey'],
    });
  }
});


const profileSchemaEdit = profileSchemaBase.extend({
  email: z.string().email({ message: "Please enter a valid email address." }).optional(),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }).optional(),
  confirmPassword: z.string().min(6, { message: "Please confirm your password." }).optional(),
}).refine(data => !data.password || data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});


type ProfileFormValues = z.infer<typeof profileSchemaCreate>;
const defaultAvatarPlaceholder = 'https://placehold.co/100x100.png';

const renderStars = (average: number, total: number) => {
  if (total === 0) {
    return <span className="text-xs text-muted-foreground">No ratings yet.</span>;
  }

  const fullStars = Math.floor(average);
  const halfStar = average % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  return (
    <div className="flex items-center space-x-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="h-4 w-4 text-amber-400 fill-amber-400" />
      ))}
      {halfStar === 1 && <StarHalf key="half" className="h-4 w-4 text-amber-400 fill-amber-400" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="h-4 w-4 text-amber-400" />
      ))}
      <span className="ml-1.5 text-xs text-muted-foreground">
        ({average.toFixed(1)} from {total} ratings)
      </span>
    </div>
  );
};


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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdminKeyInput, setShowAdminKeyInput] = useState(false);


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
        agreedToTerms: false,
        isAdminAccount: false,
        adminKey: '',
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
        agreedToCodeOfConduct: true, // Default to true for edit mode, user already agreed
        agreedToTerms: true, // Default to true for edit mode
      },
  });

  useEffect(() => {
    setUserData({
      ...mockUser,
      totalRatings: mockUser.totalRatings || 0,
      sumOfRatings: mockUser.sumOfRatings || 0,
    });
  }, [mockUser.totalRatings, mockUser.sumOfRatings, mockUser.name, mockUser.email, mockUser.location, mockUser.bio, mockUser.isProfilePrivate, mockUser.avatarUrl, mockUser.isAdmin]);

  useEffect(() => {
    const currentProfileSchema = isCreateMode ? profileSchemaCreate : profileSchemaEdit;
    form.reset(
      isCreateMode
      ? {
          name: '', email: '', password: '', confirmPassword: '', location: '', bio: '',
          isProfilePrivate: false, avatarUrl: undefined, agreedToCodeOfConduct: false, agreedToTerms: false,
          isAdminAccount: false, adminKey: '',
        }
      : {
          name: userData.name || '',
          email: userData.email || '',
          password: '', // Always clear password fields on reset for edit mode
          confirmPassword: '',
          location: userData.location || '', bio: userData.bio || '',
          isProfilePrivate: userData.isProfilePrivate || false,
          avatarUrl: userData.avatarUrl || undefined,
          agreedToCodeOfConduct: true, // Assume already agreed if editing
          agreedToTerms: true, // Assume already agreed if editing
        },
      { resolver: zodResolver(currentProfileSchema) } // Re-apply resolver with current schema
    );
    setAvatarPreview(isCreateMode ? defaultAvatarPlaceholder : (userData.avatarUrl || defaultAvatarPlaceholder));
    setShowAdminKeyInput(isCreateMode ? form.getValues('isAdminAccount') || false : false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData.name, userData.email, userData.location, userData.bio, userData.isProfilePrivate, userData.avatarUrl, isCreateMode]);


  const watchedAvatarUrl = form.watch('avatarUrl');
  const watchedIsAdminAccount = form.watch('isAdminAccount');
  const watchedIsProfilePrivate = form.watch('isProfilePrivate');

  useEffect(() => {
    if (isCreateMode) {
        setShowAdminKeyInput(watchedIsAdminAccount || false);
    }
  }, [watchedIsAdminAccount, isCreateMode]);


  useEffect(() => {
    if (watchedAvatarUrl instanceof FileList && watchedAvatarUrl.length > 0) {
      const file = watchedAvatarUrl[0];
      if (file && ACCEPTED_AVATAR_TYPES.includes(file.type) && file.size <= MAX_AVATAR_SIZE_BYTES) {
        fileToDataUri(file).then(setAvatarPreview).catch(err => {
          console.error("Error creating avatar preview:", err);
          setAvatarPreview(isCreateMode ? defaultAvatarPlaceholder : (userData.avatarUrl || defaultAvatarPlaceholder));
        });
      } else {
        // If file is invalid, reset to previous or default
        setAvatarPreview(isCreateMode ? defaultAvatarPlaceholder : (userData.avatarUrl || defaultAvatarPlaceholder));
      }
    } else if (typeof watchedAvatarUrl === 'string') {
      setAvatarPreview(watchedAvatarUrl); // This handles existing Firebase URLs
    } else if (!watchedAvatarUrl && isCreateMode) { // No file selected in create mode
      setAvatarPreview(defaultAvatarPlaceholder);
    } else if (!watchedAvatarUrl && !isCreateMode) { // No new file selected in edit mode
      setAvatarPreview(userData.avatarUrl || defaultAvatarPlaceholder);
    }
  }, [watchedAvatarUrl, isCreateMode, userData.avatarUrl]);


  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);
    console.log("[ProfilePage] onSubmit triggered. Data:", JSON.stringify(data, null, 2));

    if (isCreateMode && data.email && bannedEmails.includes(data.email)) {
      toast({
        title: 'Account Creation Failed',
        description: 'This email address has been banned and cannot be used to create an account.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    if (isCreateMode && data.isAdminAccount) {
      if (data.adminKey !== ADMIN_KEY) {
        toast({
          title: 'Admin Account Creation Failed',
          description: 'The Admin Key provided is incorrect.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      mockUser.isAdmin = true;
    } else if (isCreateMode) {
      mockUser.isAdmin = false;
    }


    let finalAvatarUrl = isCreateMode ? defaultAvatarPlaceholder : userData.avatarUrl;

    if (data.avatarUrl instanceof FileList && data.avatarUrl.length > 0) {
      const file = data.avatarUrl[0];
      if (file.size > MAX_AVATAR_SIZE_BYTES || !ACCEPTED_AVATAR_TYPES.includes(file.type)) {
        toast({
          title: 'Invalid Avatar File',
          description: `Max size ${MAX_AVATAR_SIZE_MB}MB. Accepted types: JPG, PNG, WEBP.`,
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      if (!storage) {
        console.error("Firebase Storage is not configured. Cannot upload avatar.");
        toast({
          title: 'Avatar Upload Error',
          description: 'Image storage service is not configured. Please ensure Firebase is set up and check console for details.',
          variant: 'destructive',
          duration: 7000
        });
        setIsSubmitting(false);
        return;
      }
      try {
        const userIdForPath = mockUser.id || (isCreateMode ? `temp-${Date.now()}` : 'guest');
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\s+/g, '_');
        const avatarFileName = `avatar-${userIdForPath}-${sanitizedFileName}`;
        const avatarRef = storageRef(storage, `avatars/${userIdForPath}/${avatarFileName}`);
        
        console.log(`[ProfilePage] Uploading avatar: ${file.name} to path: avatars/${userIdForPath}/${avatarFileName}`);
        const snapshot = await uploadBytes(avatarRef, file);
        console.log(`[ProfilePage] Avatar ${file.name} uploaded. Snapshot path: ${snapshot.ref.fullPath}`);
        finalAvatarUrl = await getDownloadURL(snapshot.ref);
        console.log(`[ProfilePage] Got download URL for avatar ${file.name}: ${finalAvatarUrl}`);
        setAvatarPreview(finalAvatarUrl); // Update preview with Firebase URL
      } catch (error) {
        console.error("[ProfilePage] Critical error during avatar upload:", error);
        let errorMessage = 'Could not upload the avatar image. Please try another one.';
        if (error && typeof error === 'object' && 'code' in error) {
            const firebaseError = error as { code: string; message: string };
            if (firebaseError.code === 'storage/unauthorized') {
                errorMessage = 'Avatar upload failed: Unauthorized. Please check your Firebase Storage security rules.';
            } else if (firebaseError.code === 'storage/object-not-found' || firebaseError.code === 'storage/bucket-not-found') {
                errorMessage = 'Avatar upload failed: Storage path or bucket not found. Ensure Firebase Storage is set up correctly.';
            } else {
                errorMessage = `Avatar upload error: ${firebaseError.message} (Code: ${firebaseError.code})`;
            }
        }
        toast({
          title: 'Avatar Upload Error',
          description: `${errorMessage} Check console for more details.`,
          variant: 'destructive',
          duration: 10000
        });
        setIsSubmitting(false);
        return;
      }
    } else if (typeof data.avatarUrl === 'string' && data.avatarUrl.startsWith('https://placehold.co')) {
      // If it's a placeholder and no new file, keep it as placeholder in create mode, or existing in edit
      finalAvatarUrl = isCreateMode ? defaultAvatarPlaceholder : data.avatarUrl;
    } else if (typeof data.avatarUrl === 'string') {
      finalAvatarUrl = data.avatarUrl; // Existing URL (could be Firebase URL)
    }


    mockUser.name = data.name.trim();
    if (isCreateMode && data.email) {
      mockUser.email = data.email.trim();
      mockUser.id = `user-${Date.now()}`; // Assign new ID for new user
       // Initialize rating fields for new user
      mockUser.totalRatings = 0;
      mockUser.sumOfRatings = 0;
    } else if (!isCreateMode && userData.email) {
      mockUser.email = userData.email; // Email is not changed in edit mode
    }


    if (data.password) mockUser.password = data.password; // Only update if password fields are filled
    mockUser.location = data.location?.trim();
    mockUser.bio = data.bio?.trim();
    mockUser.isProfilePrivate = data.isProfilePrivate;
    mockUser.avatarUrl = finalAvatarUrl || defaultAvatarPlaceholder;


    if (isCreateMode) {
      const userExists = allMockUsers.find(u => u.id === mockUser.id);
      if (!userExists) {
        allMockUsers.push({ ...mockUser });
      } else {
        // This case should ideally not happen if ID generation is robust
        console.warn("[ProfilePage] New user ID conflict, attempting to update existing record for ID:", mockUser.id);
        const userIndex = allMockUsers.findIndex(u => u.id === mockUser.id);
        allMockUsers[userIndex] = { ...mockUser };
      }
    } else { // Edit mode
      const userIndex = allMockUsers.findIndex(u => u.id === mockUser.id);
      if (userIndex > -1) {
        allMockUsers[userIndex] = { ...mockUser };
      } else {
        // If user not in allMockUsers (e.g. if mockUser was manually edited outside of app flow)
        // Add them. This can happen if mockUser is the only source of truth initially.
        allMockUsers.push({ ...mockUser });
        console.warn("[ProfilePage] Edited user not found in allMockUsers, adding now. ID:", mockUser.id);
      }
    }

    setUserData({ ...mockUser }); // Update local state for the current page if needed

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
      router.refresh(); // To update UserNav potentially
    }
    setIsSubmitting(false);
  }

  const averageRating = userData.totalRatings > 0 ? userData.sumOfRatings / userData.totalRatings : 0;
  const showBlurredFields = watchedIsProfilePrivate && !(userData.isAdmin || false);

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{isCreateMode ? 'Create Your Account' : 'Edit Profile'}</CardTitle>
          <CardDescription>{isCreateMode ? 'Fill in your details to get started.' : 'Manage your personal information and privacy settings.'}</CardDescription>
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
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }}
                    >
                      <Avatar className="h-28 w-28 border-2 border-primary group-hover:opacity-80 transition-opacity">
                        <AvatarImage src={avatarPreview} alt={form.getValues('name')} data-ai-hint="user profile" />
                        <AvatarFallback>{form.getValues('name')?.substring(0, 2).toUpperCase() || 'AV'}</AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="h-8 w-8 text-white" />
                      </div>
                    </FormLabel>
                    <div className="mt-2 flex flex-col items-center space-y-1 text-sm text-muted-foreground">
                       {renderStars(averageRating, userData.totalRatings)}
                    </div>
                    <FormDescription className="text-center mt-1">Click avatar to change image (Max {MAX_AVATAR_SIZE_MB}MB).</FormDescription>
                    <FormControl>
                       <Input
                        id="avatar-upload-input"
                        type="file"
                        accept={ACCEPTED_AVATAR_TYPES.join(',')}
                        className="hidden"
                        ref={fileInputRef}
                        onChange={(e) => {
                           field.onChange(e.target.files)
                        }}
                        disabled={isSubmitting}
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
                    <FormLabel className="text-foreground">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your full name"
                        {...field}
                        className="bg-input-profile-background text-custom-input-text placeholder:text-custom-input-text/70"
                        disabled={isSubmitting}
                      />
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
                    <FormLabel className="text-foreground">Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                        className={cn(
                          "bg-input-profile-background text-custom-input-text placeholder:text-custom-input-text/70",
                          showBlurredFields && "filter blur-sm pointer-events-none select-none"
                        )}
                        readOnly={(!isCreateMode && !!userData.email) || (showBlurredFields)}
                        disabled={(!isCreateMode && !!userData.email) || isSubmitting}
                      />
                    </FormControl>
                     {!isCreateMode && !!userData.email && <FormDescription>Email cannot be changed after account creation.</FormDescription>}
                     {showBlurredFields && <FormDescription className="text-primary">Email is private. Toggle "Keep Profile Private" to view/edit.</FormDescription>}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isCreateMode && (
                <>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} value={field.value || ''} className="bg-input-profile-background text-custom-input-text placeholder:text-custom-input-text/70" disabled={isSubmitting}/>
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
                        <FormLabel className="text-foreground">Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} value={field.value || ''} className="bg-input-profile-background text-custom-input-text placeholder:text-custom-input-text/70" disabled={isSubmitting}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {!isCreateMode && (
                <>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">New Password (optional)</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} value={field.value || ''} className="bg-input-profile-background text-custom-input-text placeholder:text-custom-input-text/70" disabled={isSubmitting}/>
                        </FormControl>
                        <FormDescription>Leave blank to keep current password.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} value={field.value || ''} className="bg-input-profile-background text-custom-input-text placeholder:text-custom-input-text/70" disabled={isSubmitting}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}


              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Delivery/Pick Up Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Your City, Postcode, or specific address"
                        {...field}
                        value={field.value || ''}
                        className={cn(
                          "bg-input-profile-background text-custom-input-text placeholder:text-custom-input-text/70",
                          showBlurredFields && "filter blur-sm pointer-events-none select-none"
                        )}
                        readOnly={showBlurredFields}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>Your preferred location for item exchange (optional).</FormDescription>
                    {showBlurredFields && <FormDescription className="text-primary">Location is private. Toggle "Keep Profile Private" to view/edit.</FormDescription>}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us a little about yourself..."
                        className="resize-y min-h-[100px] bg-input-profile-background text-custom-input-text placeholder:text-custom-input-text/70"
                        {...field}
                        value={field.value || ''}
                        disabled={isSubmitting}
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
                      <FormLabel className="text-base text-foreground">Keep Profile Private</FormLabel>
                      <FormDescription>
                       When enabled, your email address and delivery/pick-up location will be hidden from other regular users on your public profile. Administrators may still see this information. Your name, avatar, and bio will remain visible. On this page, if private and you are not an admin, these fields will appear blurred and be read-only.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {isCreateMode && (
                <>
                  <FormField
                    control={form.control}
                    name="isAdminAccount"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base flex items-center text-foreground">
                            <ShieldCheck className="mr-2 h-5 w-5 text-primary" /> Create as Admin Account?
                          </FormLabel>
                          <FormDescription>
                            Select this to create an administrator account. You will need the Admin Key.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {showAdminKeyInput && (
                    <FormField
                      control={form.control}
                      name="adminKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Admin Key</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter Admin Key"
                              {...field}
                              value={field.value || ''}
                              className="bg-input-profile-background text-custom-input-text placeholder:text-custom-input-text/70"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="agreedToTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="termsAndConditionsCheckbox"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel htmlFor="termsAndConditionsCheckbox" className="text-foreground">
                            I have read and agree to the{' '}
                            <Link href="/terms-and-conditions" className="underline hover:text-primary" target="_blank">
                              Terms and Conditions
                            </Link>.
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </>
              )}

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
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel htmlFor="codeOfConductCheckbox" className="text-foreground">
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
                disabled={isSubmitting}
                >
                {isSubmitting ? (isCreateMode ? 'Creating Account...' : 'Saving...') : (isCreateMode ? 'Create Account' : 'Save Profile')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

    