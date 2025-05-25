
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { mockUser } from '@/lib/mock-data'; // Import mockUser to check credentials
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Separator } from '../ui/separator';

const ADMIN_KEY = "135%32£fhj@345";

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    // Check against mockUser's credentials
    if (mockUser.email && email === mockUser.email && mockUser.password && password === mockUser.password) {
      localStorage.setItem('isLoggedIn', 'true');
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
      router.push('/');
      router.refresh();
    } else {
      toast({
        title: 'Login Failed',
        description: 'Invalid email or password. If you don\'t have an account, please create one.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const handleAdminSetupLogin = async () => {
    const enteredKey = window.prompt("Please enter the Admin Key:");

    if (enteredKey === ADMIN_KEY) {
      setIsAdminLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate action

      mockUser.name = "Admin User";
      mockUser.email = "admin@example.com";
      mockUser.password = "adminpassword"; // In a real app, this would be handled securely
      mockUser.isAdmin = true;
      mockUser.avatarUrl = 'https://placehold.co/100x100.png?text=ADM'; // Admin avatar
      // Reset other fields for admin or set specific admin values
      mockUser.location = 'Barrow Market Admin Office';
      mockUser.bio = 'Site Administrator for Barrow Market Place.';
      mockUser.isProfilePrivate = false;
      mockUser.subscriptionStatus = 'premium_plus'; // Admins get all features
      mockUser.itemsListedCount = 0;
      mockUser.enhancedListingsRemaining = 999; // Effectively unlimited for admin
      mockUser.totalRatings = 5; // Example admin ratings
      mockUser.sumOfRatings = 25; // Example admin ratings (5x5 star)


      localStorage.setItem('isLoggedIn', 'true');
      toast({
        title: 'Admin Account Configured',
        description: 'You are now logged in as Admin.',
      });
      router.push('/');
      router.refresh();
      setIsAdminLoading(false);
    } else if (enteredKey !== null) { 
      // User entered something, but it was wrong
      toast({
        title: 'Admin Setup Failed',
        description: 'Incorrect Admin Key. Please ensure it is entered exactly.',
        variant: 'destructive',
      });
    }
    // If enteredKey is null (user pressed Cancel), do nothing.
  };


  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-18rem)] py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-foreground">Please Log In</CardTitle>
          <CardDescription>Enter your credentials to access Barrow Market Place</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || isAdminLoading}
                className="bg-white text-black"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || isAdminLoading}
                className="bg-white text-black"
              />
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading || isAdminLoading} size="default">
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <Separator className="my-6" />
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleAdminSetupLogin} 
            disabled={isLoading || isAdminLoading}
          >
            {isAdminLoading ? 'Setting up Admin...' : 'Set Up Admin & Login'}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 pt-4">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Button variant="link" asChild className="p-0 h-auto text-accent">
              <Link href="/profile?mode=create">
                Create Account
              </Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
