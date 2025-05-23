
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

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-18rem)] py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Welcome Back!</CardTitle>
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
                disabled={isLoading}
                className="bg-white text-card-foreground"
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
                disabled={isLoading}
                className="bg-white text-card-foreground"
              />
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading} size="default">
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
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
