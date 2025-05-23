
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // Import usePathname
import { Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { mockUser, mockConversations } from '@/lib/mock-data';
import type { Conversation, User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict } from 'date-fns';

export function MessageNotifications() {
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname
  const [isClient, setIsClient] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [unreadConversations, setUnreadConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    setIsClient(true);
    const status = localStorage.getItem('isLoggedIn') === 'true';
    setIsUserLoggedIn(status);

    if (status && mockUser?.id) {
      const filteredUnread = mockConversations.filter(
        (conv) => conv.participants.some(p => p.id === mockUser.id) && conv.unreadCount > 0
      ).sort((a,b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime());
      setUnreadConversations(filteredUnread);
    } else {
      setUnreadConversations([]);
    }
  }, [isUserLoggedIn, pathname, mockUser?.id]); // Added pathname and mockUser.id to dependencies

  const handleConversationClick = (conv: Conversation) => {
    const otherParticipant = conv.participants.find(p => p.id !== mockUser.id);
    if (otherParticipant) {
      // This is a simplified way to mark as read for the demo.
      // In a real app, this would be an API call.
      // const convIndex = mockConversations.findIndex(c => c.id === conv.id);
      // if (convIndex > -1) {
      //   // mockConversations[convIndex].unreadCount = 0; // For now, clicking doesn't mark as read to keep notifications visible for demo
      // }
      router.push(`/messages?itemId=${conv.itemId}&sellerName=${encodeURIComponent(otherParticipant.name)}`);
    }
  };
  
  const getOtherParticipant = (conv: Conversation): User | null => {
    if (!mockUser) return null;
    const other = conv.participants.find(p => p.id !== mockUser.id);
    // Cast to User type for avatarUrl; this is a mock so we assume structure
    return other ? (other as User) : null; 
  };


  if (!isClient || !isUserLoggedIn) {
    return null; // Don't show anything if not logged in or not client-side yet
  }

  const totalUnreadCount = unreadConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full">
          <Mail className="h-5 w-5 text-foreground" />
          {totalUnreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs"
            >
              {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel>New Messages</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {unreadConversations.length > 0 ? (
          <div className="max-h-80 overflow-y-auto">
            {unreadConversations.map((conv) => {
              const otherP = getOtherParticipant(conv);
              if (!otherP) return null;
              return (
                <DropdownMenuItem
                  key={conv.id}
                  className="cursor-pointer p-2 hover:bg-muted"
                  onClick={() => handleConversationClick(conv)}
                >
                  <div className="flex items-start space-x-3 w-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={otherP.avatarUrl} alt={otherP.name} data-ai-hint="user avatar" />
                      <AvatarFallback>{otherP.name.substring(0, 1).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow overflow-hidden">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium truncate">{otherP.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNowStrict(new Date(conv.lastMessage.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.itemName}
                      </p>
                      <p className="text-xs text-foreground truncate">
                        {conv.lastMessage.content}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                       <Badge variant="default" className="ml-auto h-5 min-w-[1.25rem] flex items-center justify-center p-1 text-xs">
                        {conv.unreadCount}
                       </Badge>
                    )}
                  </div>
                </DropdownMenuItem>
              );
            })}
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No new messages.
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/messages" className="flex items-center justify-center">
            <MessageSquare className="mr-2 h-4 w-4" />
            View All Messages
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
