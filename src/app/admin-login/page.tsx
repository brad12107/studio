
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { mockUser } from '@/lib/mock-data';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

const ADMIN_KEY = "135%32£fhj@345";

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [adminKey, setAdminKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call or verification delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (adminKey === ADMIN_KEY) {
      // Update mockUser to be an admin
      mockUser.name = "Admin User";
      mockUser.email = "admin@example.com"; // Ensure this is unique or handled if needed
      mockUser.password = "adminpassword"; // For mock purposes
      mockUser.isAdmin = true;
      mockUser.avatarUrl = 'https://placehold.co/100x100.png?text=ADM';
      mockUser.location = 'Barrow Market Admin Office';
      mockUser.bio = 'Site Administrator for Barrow Market Place.';
      mockUser.isProfilePrivate = false; // Admins likely have public-facing roles or settings
      mockUser.subscriptionStatus = 'premium_plus'; // Admins typically have all features
      mockUser.itemsListedCount = 0; // Or some relevant admin count
      mockUser.enhancedListingsRemaining = 999; // Effectively unlimited
      mockUser.totalRatings = 5; // Example
      mockUser.sumOfRatings = 25; // Example

      localStorage.setItem('isLoggedIn', 'true');
      toast({
        title: 'Admin Login Successful',
        description: 'Welcome, Administrator!',
      });
      router.push('/');
      router.refresh(); // Ensure layout re-renders with new auth state
    } else {
      toast({
        title: 'Admin Login Failed',
        description: 'Incorrect Admin Key.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-18rem)] py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-3xl font-bold text-foreground">Admin Login</CardTitle>
          <CardDescription>Enter the Admin Key to access administrator privileges.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="adminKey">Admin Key</Label>
              <Input
                id="adminKey"
                type="password" // Use password type to obscure key
                placeholder="Enter Admin Key"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                required
                disabled={isLoading}
                className="bg-white text-black"
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading} size="lg">
              {isLoading ? 'Logging in...' : 'Login as Admin'}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => router.push('/login')} disabled={isLoading}>
             <ArrowLeft className="mr-2 h-4 w-4" /> Back to Main Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
