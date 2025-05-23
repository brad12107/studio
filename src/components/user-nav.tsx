
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
import { CreditCard, LogOut, Settings, User as UserIcon, MessageSquare, Star, LogIn, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function UserNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [currentUserDetails, setCurrentUserDetails] = useState<User | null>(null);

  useEffect(() => {
    setIsClient(true);
    const status = localStorage.getItem('isLoggedIn') === 'true';
    setIsUserLoggedIn(status);

    if (status) {
      setCurrentUserDetails({ ...mockUser }); // Create a new object to ensure state update
    } else {
      setCurrentUserDetails(null);
    }

    // This listener handles changes from other tabs/windows
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'isLoggedIn') {
        const newStatus = event.newValue === 'true';
        setIsUserLoggedIn(newStatus);
        if (newStatus) {
          setCurrentUserDetails({ ...mockUser }); // Refresh on storage change
        } else {
          setCurrentUserDetails(null);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [pathname]); // Re-run when pathname changes, refreshing currentUserDetails from mockUser

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    // State will be updated by useEffect on redirection due to pathname change
    window.location.href = '/login'; // Force full reload to ensure state is cleared
  };

  const getSubscriptionLabel = () => {
    if (!currentUserDetails) return 'Standard User';
    switch (currentUserDetails.subscriptionStatus) {
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
    // Render nothing or a placeholder on the server/initial client render
    return null;
  }

  if (!isUserLoggedIn || !currentUserDetails) {
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
            <AvatarImage src={currentUserDetails.avatarUrl} alt={currentUserDetails.name || "User Avatar"} data-ai-hint="user avatar" />
            <AvatarFallback>{currentUserDetails.name ? currentUserDetails.name.substring(0, 2).toUpperCase() : "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{currentUserDetails.name || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {getSubscriptionLabel()}
            </p>
            {currentUserDetails.subscriptionStatus === 'premium_plus' && (
              <p className="text-xs leading-none text-muted-foreground flex items-center">
                <Star className="mr-1 h-3 w-3 text-amber-500" />
                {currentUserDetails.enhancedListingsRemaining || 0} free enhancements left
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
