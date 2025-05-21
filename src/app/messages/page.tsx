
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockConversations, mockMessages, mockUser, mockItems } from '@/lib/mock-data';
import type { Conversation, Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { Send, Search as SearchIcon, ArrowLeft, MessageSquare as MessageSquareIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
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

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations.sort((a,b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()));
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [messageToDeleteId, setMessageToDeleteId] = useState<string | null>(null);

  const getOtherParticipant = (conv: Conversation | null) => {
    if (!conv) return null;
    return conv.participants.find(p => p.id !== mockUser.id);
  }

  useEffect(() => {
    const itemIdParam = searchParams.get('itemId');
    const sellerNameParam = searchParams.get('sellerName');

    if (itemIdParam && sellerNameParam) {
      const existingConv = conversations.find(
        (c) =>
          c.itemId === itemIdParam &&
          c.participants.some((p) => p.name === sellerNameParam && p.id !== mockUser.id)
      );

      if (existingConv) {
        if (selectedConversation?.id !== existingConv.id) {
          setSelectedConversation(existingConv);
        }
      } else {
        const itemForConv = mockItems.find(item => item.id === itemIdParam);
        const newConvId = `conv-${itemIdParam}-${sellerNameParam.replace(/\s+/g, '-')}-${Date.now()}`;
        
        const newConv: Conversation = {
          id: newConvId,
          itemId: itemIdParam,
          itemName: itemForConv?.name || `Item ${itemIdParam}`,
          itemImageUrl: itemForConv?.imageUrl || 'https://placehold.co/100x100.png',
          participants: [
            { id: mockUser.id, name: mockUser.name, avatarUrl: mockUser.avatarUrl },
            { id: `seller-${itemIdParam}-${sellerNameParam.replace(/\s+/g, '-')}`, name: sellerNameParam, avatarUrl: 'https://placehold.co/50x50.png' }
          ],
          lastMessage: { content: `Started conversation about ${itemForConv?.name || `item ID: ${itemIdParam}`}.`, timestamp: new Date().toISOString() },
          unreadCount: 0,
        };

        setConversations(prevConvs => {
          if (prevConvs.some(c => c.id === newConvId)) { // Check if this specific newConv was already added
            return prevConvs; 
          }
          return [newConv, ...prevConvs].sort((a,b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime());
        });
        
        setSelectedConversation(newConv);
      }
    } else if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, mockUser.id, mockUser.name, mockUser.avatarUrl]); // conversations and selectedConversation removed to prevent re-runs when they are set inside

  useEffect(() => {
    if (selectedConversation) {
      const currentParticipantsIds = selectedConversation.participants.map(p => p.id);
      setMessages(
        mockMessages
          .filter(
            (msg) =>
              msg.itemId === selectedConversation.itemId &&
              currentParticipantsIds.includes(msg.fromUserId) &&
              currentParticipantsIds.includes(msg.toUserId)
          )
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      );
    } else {
      setMessages([]);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;
    
    const otherParticipant = getOtherParticipant(selectedConversation);
    if (!otherParticipant) return; 

    const msg: Message = {
      id: `msg-${Date.now()}`,
      fromUserId: mockUser.id,
      toUserId: otherParticipant.id,
      itemId: selectedConversation.itemId,
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: false, 
    };
    
    mockMessages.push(msg); 
    setMessages(prev => [...prev, msg]);
    
    setConversations(prevConvs => prevConvs.map(conv => 
      conv.id === selectedConversation.id 
      ? {...conv, lastMessage: {content: newMessage, timestamp: msg.timestamp}}
      : conv
    ).sort((a,b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime())
    );

    setNewMessage('');
  };

  const openDeleteDialog = (messageId: string) => {
    setMessageToDeleteId(messageId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!messageToDeleteId || !selectedConversation) return;

    const originalMessageIndex = mockMessages.findIndex(m => m.id === messageToDeleteId);
    if (originalMessageIndex > -1) {
      mockMessages.splice(originalMessageIndex, 1); // Mutate mockMessages
    } else {
      // Message not found in mock data, perhaps already deleted or an error
      setMessageToDeleteId(null);
      setIsDeleteDialogOpen(false);
      return;
    }

    setMessages(prev => prev.filter(msg => msg.id !== messageToDeleteId));

    setConversations(prevConvs =>
      prevConvs.map(conv => {
        if (conv.id === selectedConversation.id) {
          const remainingConvMessages = mockMessages
            .filter(m => {
                const convParticipantIds = conv.participants.map(p => p.id);
                return m.itemId === conv.itemId &&
                       convParticipantIds.includes(m.fromUserId) &&
                       convParticipantIds.includes(m.toUserId);
            })
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

          if (remainingConvMessages.length > 0) {
            const newLastMsg = remainingConvMessages[remainingConvMessages.length - 1];
            return {
              ...conv,
              lastMessage: { content: newLastMsg.content, timestamp: newLastMsg.timestamp },
            };
          } else {
            return {
              ...conv,
              lastMessage: { 
                content: `Chat about '${conv.itemName}'`, 
                timestamp: new Date(0).toISOString() // Pushes to bottom of sorted list
              },
            };
          }
        }
        return conv;
      })
      .sort((a,b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime())
    );

    toast({
      title: 'Message Deleted',
      description: 'The message has been removed.',
    });

    setMessageToDeleteId(null);
    setIsDeleteDialogOpen(false);
  };


  return (
    <>
      <div className="h-[calc(100vh-10rem)] flex flex-col md:flex-row border rounded-lg shadow-lg overflow-hidden bg-card">
        <div className={cn(
          "w-full md:w-1/3 lg:w-1/4 border-r flex flex-col",
          selectedConversation && "hidden md:flex" 
        )}>
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Chats</h2>
            <div className="relative mt-2">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-8 bg-background" />
            </div>
          </div>
          <ScrollArea className="flex-grow">
            {conversations.map((conv) => {
              const otherParticipant = getOtherParticipant(conv);
              if (!otherParticipant) return null; 
              return (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={cn(
                  "w-full text-left p-4 hover:bg-muted/50 border-b cursor-pointer focus:outline-none",
                  selectedConversation?.id === conv.id ? "bg-accent text-accent-foreground" : "bg-card hover:bg-muted"
                )}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={otherParticipant.avatarUrl} alt={otherParticipant.name} data-ai-hint="user avatar"/>
                    <AvatarFallback>{otherParticipant.name.substring(0,1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow overflow-hidden">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold truncate text-card-foreground">{otherParticipant.name}</h3>
                      <span className={cn("text-xs", selectedConversation?.id === conv.id ? "text-accent-foreground/80" : "text-muted-foreground")}>
                        {formatDistanceToNowStrict(new Date(conv.lastMessage.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <p className={cn("text-sm truncate", selectedConversation?.id === conv.id ? "text-accent-foreground/90" : "text-muted-foreground")}>
                      {conv.lastMessage.content}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            )})}
          </ScrollArea>
        </div>

        <div className={cn(
          "flex-grow flex flex-col",
          !selectedConversation && "hidden md:flex md:items-center md:justify-center" 
        )}>
          {selectedConversation ? (
            <>
              <CardHeader className="p-4 border-b flex flex-row items-center space-x-3 sticky top-0 bg-card z-10">
                <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setSelectedConversation(null)}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                {(() => { 
                  const otherParticipant = getOtherParticipant(selectedConversation);
                  if (!otherParticipant) return null;
                  return (
                    <>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={otherParticipant.avatarUrl} alt={otherParticipant.name} data-ai-hint="user avatar"/>
                        <AvatarFallback>{otherParticipant.name.substring(0,1).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg text-card-foreground">{otherParticipant.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          Regarding: <Link href={`/item/${selectedConversation.itemId}`} className="hover:underline text-primary">{selectedConversation.itemName}</Link>
                        </p>
                      </div>
                    </>
                  );
                })()}
              </CardHeader>
              <ScrollArea className="flex-grow p-4 space-y-1 bg-background"> {/* Reduced space-y-4 to space-y-1 for tighter message packing */}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-end mb-2 group", // items-end for bubble alignment, mb-2 for tighter packing
                      msg.fromUserId === mockUser.id ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.fromUserId !== mockUser.id && (
                      <div
                        className={cn(
                          "max-w-[70%] p-3 rounded-lg shadow-md",
                          "bg-muted text-muted-foreground" 
                        )}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs mt-1 text-muted-foreground/80 text-left">
                          {format(new Date(msg.timestamp), "p")}
                        </p>
                      </div>
                    )}
                    {msg.fromUserId === mockUser.id && (
                      <>
                        <div
                          className={cn(
                            "max-w-[70%] p-3 rounded-lg shadow-md",
                            "bg-primary text-primary-foreground"
                          )}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-xs mt-1 text-primary-foreground/70 text-right">
                            {format(new Date(msg.timestamp), "p")}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-1 h-7 w-7 p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
                          onClick={() => openDeleteDialog(msg.id)}
                          aria-label="Delete message"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </ScrollArea>
              <form onSubmit={handleSendMessage} className="p-4 border-t bg-card flex items-center space-x-2 sticky bottom-0">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-grow bg-input text-foreground placeholder:text-muted-foreground"
                  autoComplete="off"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  disabled={!newMessage.trim() || !getOtherParticipant(selectedConversation)}
                >
                  <Send className="h-5 w-5" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center text-muted-foreground p-10">
              <MessageSquareIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Select a conversation to start chatting, or contact a seller from an item page.</p>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMessageToDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className={buttonVariants({ variant: "destructive" })}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
