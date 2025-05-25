
'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User as UserIcon, ShieldAlert } from 'lucide-react'; // Changed User to UserIcon to avoid conflict
import { useEffect, useState } from 'react';
import { mockUser, mockItems, bannedEmails, allMockUsers } from '@/lib/mock-data';
import type { User, Item } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function UserProfileViewPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [decodedSellerName, setDecodedSellerName] = useState<string | null>(null);
  const [sellerEmailForBan, setSellerEmailForBan] = useState<string | null>(null);
  const [isBanned, setIsBanned] = useState(false);

  useEffect(() => {
    if (params.sellerName && typeof params.sellerName === 'string') {
      try {
        const name = decodeURIComponent(params.sellerName);
        setDecodedSellerName(name);

        // Attempt to find the seller's email
        // First try from allMockUsers if the user has an account
        const userObject = allMockUsers.find(u => u.name === name);
        let emailToSet: string | null = null;

        if (userObject && userObject.email) {
          emailToSet = userObject.email;
        } else {
          // Fallback: try finding in mockItems if no direct user account email is found
          const itemFromSeller = mockItems.find(item => item.sellerName === name);
          if (itemFromSeller && itemFromSeller.sellerEmail) {
            emailToSet = itemFromSeller.sellerEmail;
          }
        }
        
        if (emailToSet) {
            setSellerEmailForBan(emailToSet);
            if (bannedEmails.includes(emailToSet)) {
              setIsBanned(true);
            }
        }

      } catch (error) {
        console.error("Error decoding seller name:", error);
        setDecodedSellerName("Invalid Seller Name");
      }
    }
  }, [params.sellerName]);

  const handleBanUser = () => {
    if (!sellerEmailForBan) {
      toast({
        title: 'Cannot Ban User',
        description: `Could not determine the email address for ${decodedSellerName} to issue a ban.`,
        variant: 'destructive',
      });
      return;
    }

    if (bannedEmails.includes(sellerEmailForBan)) {
      toast({
        title: 'Already Banned',
        description: `The email ${sellerEmailForBan} associated with ${decodedSellerName} is already banned.`,
        variant: 'default',
      });
      return;
    }

    bannedEmails.push(sellerEmailForBan);
    setIsBanned(true);

    // Remove user's listings
    let itemsRemovedCount = 0;
    const originalLength = mockItems.length;
    const updatedMockItems = mockItems.filter(item => {
      if (item.sellerEmail === sellerEmailForBan) {
        itemsRemovedCount++;
        return false; // Exclude item
      }
      return true; // Keep item
    });
    // Directly modify the exported mockItems array for global effect in this mock setup
    mockItems.length = 0; // Clear original array
    updatedMockItems.forEach(item => mockItems.push(item)); // Push back filtered items


    toast({
      title: 'User Banned',
      description: `The email ${sellerEmailForBan} associated with ${decodedSellerName} has been banned. Their ${itemsRemovedCount} listing(s) have also been removed.`,
    });
    // In a real app, you might also want to take further actions like deactivating listings, etc.
    // Force a refresh to reflect changes if any listings were on a page the admin might navigate back to.
    router.refresh();
  };

  const canAdminBanThisUser = mockUser.isAdmin && decodedSellerName !== mockUser.name;

  if (!decodedSellerName) {
    return (
        <div className="container mx-auto py-8 text-center">
            <p>Loading seller profile...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <Card className="max-w-lg mx-auto shadow-xl">
        <CardHeader className="text-center">
          <UserIcon className="mx-auto h-16 w-16 text-primary mb-4" />
          <CardTitle className="text-2xl font-bold">
            Profile for: {decodedSellerName}
          </CardTitle>
          <CardDescription className="pt-2">
            This is a placeholder page for viewing a seller's public profile.
            In a full application, this page would display more details about the seller,
            their ratings, and other items they have listed.
            {sellerEmailForBan && <span className="block mt-1 text-xs">Associated Email (for admin reference): {sellerEmailForBan}</span>}
            {isBanned && <span className="block mt-1 text-sm font-semibold text-destructive">This user's email is banned.</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <p className="text-muted-foreground text-sm">
            Detailed public profiles are not fully implemented in this mock version.
          </p>
          {canAdminBanThisUser && (
            <Button
              variant="destructive"
              onClick={handleBanUser}
              disabled={!sellerEmailForBan || isBanned}
            >
              <ShieldAlert className="mr-2 h-4 w-4" />
              {isBanned ? "Email Already Banned" : (sellerEmailForBan ? `Ban User (${sellerEmailForBan})` : "Ban User (Email not found)")}
            </Button>
          )}
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

