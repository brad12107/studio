
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

    if (adminKey === ADMIN_KEY) {
      mockUser.name = "Admin User";
      mockUser.email = "admin@example.com";
      mockUser.password = "adminpassword";
      mockUser.isAdmin = true;
      mockUser.avatarUrl = 'https://placehold.co/100x100.png?text=ADM';
      mockUser.location = 'Barrow Market Admin Office';
      mockUser.bio = 'Site Administrator for Barrow Market Place.';
      mockUser.isProfilePrivate = false;
      mockUser.subscriptionStatus = 'premium_plus';
      mockUser.itemsListedCount = 0;
      mockUser.enhancedListingsRemaining = 999;
      mockUser.totalRatings = 5;
      mockUser.sumOfRatings = 25;

      localStorage.setItem('isLoggedIn', 'true');
      toast({
        title: 'Admin Login Successful',
        description: 'Welcome, Administrator!',
      });
      router.push('/');
      router.refresh();
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
