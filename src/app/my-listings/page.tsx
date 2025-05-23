
'use client';

import { ItemList } from '@/components/market/item-list';
import { mockItems, mockUser } from '@/lib/mock-data';
import type { Item } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, ShoppingBag, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

export default function MyListingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [userListings, setUserListings] = useState<Item[]>([]);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedInStatus);
    setIsLoadingAuth(false);

    if (!loggedInStatus) {
      router.replace('/login');
    }
  }, [router]);
  
  const fetchUserListings = useCallback(() => {
    if (isLoggedIn && mockUser.name) {
      const currentUserName = mockUser.name.trim();
      const filtered = mockItems.filter(item => item.sellerName?.trim() === currentUserName)
        .sort((a, b) => {
            if (a.isEnhanced && !b.isEnhanced) return -1;
            if (!a.isEnhanced && b.isEnhanced) return 1;
            // You could add a date sort here if items had a creation date
            return 0;
        });
      setUserListings(filtered);
    } else if (isLoggedIn && !mockUser.name) {
      setUserListings([]);
    }
  }, [isLoggedIn, mockUser.name]); // Removed mockItems from dependency array

  useEffect(() => {
    fetchUserListings();
  }, [isLoggedIn, mockUser.name, pathname, fetchUserListings]);


  const handleEditItem = (itemId: string) => {
    // For now, this just navigates. Full edit functionality on ListItemForm is a future step.
    router.push(`/list-item?mode=edit&itemId=${itemId}`);
    // Optionally, a toast for now:
    // toast({ title: "Edit Item", description: `Redirecting to edit item ${itemId}. Full edit form not yet implemented.`});
  };

  const openDeleteDialog = (itemId: string) => {
    setItemToDeleteId(itemId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteItem = () => {
    if (!itemToDeleteId) return;

    const itemIndex = mockItems.findIndex(item => item.id === itemToDeleteId);
    if (itemIndex > -1) {
      const itemName = mockItems[itemIndex].name;
      mockItems.splice(itemIndex, 1); // Remove item from the global mock data
      fetchUserListings(); // Re-fetch/re-filter user listings
      toast({
        title: "Item Deleted",
        description: `"${itemName}" has been removed from your listings.`,
      });
    } else {
      toast({
        title: "Error",
        description: "Could not find item to delete.",
        variant: "destructive",
      });
    }
    setItemToDeleteId(null);
    setIsDeleteDialogOpen(false);
  };

  const getItemEditHandler = useCallback((itemId: string) => {
    return () => handleEditItem(itemId);
  }, [router]);

  const getItemDeleteHandler = useCallback((itemId: string) => {
    return () => openDeleteDialog(itemId);
  }, []);


  if (!isClient || isLoadingAuth) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center">
            <ShoppingBag className="mr-3 h-8 w-8 text-muted-foreground"/>
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-11 w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-full overflow-hidden shadow-lg rounded-lg border bg-card flex flex-col">
              <Skeleton className="aspect-[16/10] w-full" />
              <div className="p-4 flex-grow space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-1/3" />
              </div>
              <div className="p-4 border-t">
                <div className="flex justify-between items-center w-full">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <ShoppingBag className="mr-3 h-8 w-8 text-primary"/> My Listings
          </h1>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/list-item">
              <PlusCircle className="mr-2 h-5 w-5" />
              List New Item
            </Link>
          </Button>
        </div>

        {userListings.length > 0 ? (
          <ItemList 
            items={userListings} 
            getItemEditHandler={getItemEditHandler}
            getItemDeleteHandler={getItemDeleteHandler}
          />
        ) : (
          <Card className="shadow-lg text-center py-10">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">No Items Listed Yet</CardTitle>
              <CardDescription className="text-muted-foreground pt-1">
                It looks like you haven't listed any items for sale or auction.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/list-item">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Sell Your First Item
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this listing? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteItem} className={buttonVariants({ variant: "destructive" })}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
