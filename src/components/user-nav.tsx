
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mockUser } from '@/lib/mock-data'; 
import type { User } from '@/lib/types';
import { CreditCard, LogOut, Settings, User as UserIcon, MessageSquare, Star, LogIn, ShoppingBag } from 'lucide-react'; // Added ShoppingBag
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { useEffect, useState } from 'react';

export function UserNav() {
  const user = mockUser; 
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const status = localStorage.getItem('isLoggedIn') === 'true';
    setIsUserLoggedIn(status);

    // Listen for storage changes to update login status across tabs/windows
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'isLoggedIn') {
        const newStatus = event.newValue === 'true';
        setIsUserLoggedIn(newStatus);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsUserLoggedIn(false); // Update state immediately
    window.location.href = '/login'; 
  };

  const getSubscriptionLabel = () => {
    if (!user) return 'Standard User'; 
    switch (user.subscriptionStatus) {
      case 'subscribed':
        return 'Basic Plan'; 
      case 'premium_plus':
        return 'Premium Plan';
      case 'free_trial':
        return 'Free Trial';
      default:
        return 'Standard User';
    }
  };

  if (!isClient) {
    return null; 
  }

  if (!isUserLoggedIn) {
    return (
      <Button variant="outline" onClick={() => router.push('/login')}>
        <LogIn className="mr-2 h-4 w-4" />
        Login
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-primary">
            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar" />
            <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {getSubscriptionLabel()}
            </p>
            {user.subscriptionStatus === 'premium_plus' && (
              <p className="text-xs leading-none text-muted-foreground flex items-center">
                <Star className="mr-1 h-3 w-3 text-amber-500" /> 
                {user.enhancedListingsRemaining || 0} free enhancements left
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
            <Link href="/my-listings">
              <ShoppingBag className="mr-2 h-4 w-4" />
              <span>My Listings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/messages">
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Messages</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/subscription">
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing & Subscription</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem disabled> 
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}> 
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
