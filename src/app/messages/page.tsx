
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockConversations, mockMessages, mockUser, mockItems, removeItemFromMockItems } from '@/lib/mock-data';
import type { Conversation, Message, Item } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { Send, Search as SearchIcon, ArrowLeft, MessageSquare as MessageSquareIcon, Trash2, ShoppingBag, CheckCircle, XCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
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
import { Separator } from '@/components/ui/separator';

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>(
    mockConversations.sort((a,b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime())
  );
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [messageToDeleteId, setMessageToDeleteId] = useState<string | null>(null);

  const currentItemForSelectedConv = useMemo(() => {
    if (!selectedConversation) return null;
    return mockItems.find(item => item.id === selectedConversation.itemId) || null;
  }, [selectedConversation]);

  const isCurrentUserTheSeller = useMemo(() => {
    if (!selectedConversation || !currentItemForSelectedConv || !mockUser.name) return false;
    return currentItemForSelectedConv.sellerName === mockUser.name;
  }, [selectedConversation, currentItemForSelectedConv, mockUser.name]);


  const getOtherParticipant = useCallback((conv: Conversation | null) => {
    if (!conv) return null;
    return conv.participants.find(p => p.id !== mockUser.id);
  }, []);

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
        if (itemForConv && itemForConv.sellerName === mockUser.name) {
            // User is trying to message themselves about their own item
            // Do not create a conversation. Optionally show a toast.
            toast({ title: "Cannot message yourself", description: "You cannot start a conversation with yourself about your own item.", variant: 'default' });
            router.replace('/messages'); // Redirect to avoid invalid state
            return;
        }

        const newConvId = `conv-${itemIdParam}-${sellerNameParam.replace(/\s+/g, '-')}-${Date.now()}`;
        
        const newConv: Conversation = {
          id: newConvId,
          itemId: itemIdParam,
          itemName: itemForConv?.name || `Item ${itemIdParam}`,
          itemImageUrl: itemForConv?.imageUrl || 'https://placehold.co/100x100.png',
          participants: [
            { id: mockUser.id, name: mockUser.name, avatarUrl: mockUser.avatarUrl },
            { id: `seller-${itemIdParam}-${sellerNameParam.replace(/\s+/g, '-')}`, name: sellerNameParam, avatarUrl: `https://placehold.co/50x50.png?text=${sellerNameParam.substring(0,2).toUpperCase()}` }
          ],
          lastMessage: { content: `Started conversation about ${itemForConv?.name || `Item ID: ${itemIdParam}`}.`, timestamp: new Date().toISOString() },
          unreadCount: 0,
          buyRequestStatus: 'none',
          isItemSoldOrUnavailable: false,
        };
  
        setConversations(prevConvs => {
          if (prevConvs.some(c => c.id === newConvId)) { 
            return prevConvs; 
          }
          return [newConv, ...prevConvs].sort((a,b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime());
        });
        
        setSelectedConversation(newConv);
      }
    } else if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  // Explicitly list dependencies. selectedConversation is read, so it should be a dependency.
  // The internal logic should prevent infinite loops if an existingConv is found and set.
  }, [searchParams, mockUser.id, mockUser.name, mockUser.avatarUrl, conversations, selectedConversation, router, toast]); 

  useEffect(() => {
    if (selectedConversation) {
      const currentParticipantsIds = selectedConversation.participants.map(p => p.id);
      setMessages(
        mockMessages
          .filter(
            (msg) =>
              (msg.itemId === selectedConversation.itemId && // Ensure message is for the correct item
              currentParticipantsIds.includes(msg.fromUserId) && // fromUser is part of this conversation
              currentParticipantsIds.includes(msg.toUserId)) || // toUser is part of this conversation
              (msg.itemId === selectedConversation.itemId && msg.isSystemMessage && currentParticipantsIds.includes(msg.toUserId === mockUser.id ? msg.fromUserId : msg.toUserId )) // system messages related to this item/conversation
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


  const handleSendMessage = (e: React.FormEvent, content: string, isSystem = false) => {
    e.preventDefault();
    if (!content.trim() || !selectedConversation) return;
    
    const otherParticipant = getOtherParticipant(selectedConversation);
    if (!otherParticipant) return; 

    const msg: Message = {
      id: `msg-${Date.now()}`,
      fromUserId: isSystem ? 'system' : mockUser.id,
      toUserId: otherParticipant.id, // System messages are for both, but contextually from one to other
      itemId: selectedConversation.itemId,
      content: content,
      timestamp: new Date().toISOString(),
      isRead: false, 
      isSystemMessage: isSystem,
    };
    
    mockMessages.push(msg); 
    setMessages(prev => [...prev, msg]);
    
    setConversations(prevConvs => prevConvs.map(conv => 
      conv.id === selectedConversation.id 
      ? {...conv, lastMessage: {content: content, timestamp: msg.timestamp}}
      : conv
    ).sort((a,b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime())
    );

    if (!isSystem) {
      setNewMessage('');
    }
  };

  const openDeleteDialog = (messageId: string) => {
    setMessageToDeleteId(messageId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!messageToDeleteId || !selectedConversation) return;

    const originalMessageIndex = mockMessages.findIndex(m => m.id === messageToDeleteId);
    if (originalMessageIndex > -1) {
      mockMessages.splice(originalMessageIndex, 1); 
    } else {
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
            // If no user messages remain, but there might be system messages,
            // or if conversation should appear "empty" in preview
            return {
              ...conv,
              lastMessage: { 
                content: `Chat about '${conv.itemName}'`, 
                timestamp: new Date(0).toISOString() // Puts it at the bottom if sorted by time
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

  const handleSendBuyRequest = (e: React.FormEvent) => {
    if (!selectedConversation || !currentItemForSelectedConv || isCurrentUserTheSeller || selectedConversation.isItemSoldOrUnavailable) return;

    const price = currentItemForSelectedConv.type === 'auction' ? currentItemForSelectedConv.currentBid || currentItemForSelectedConv.price : currentItemForSelectedConv.price;

    const updatedConv = {
      ...selectedConversation,
      buyRequestStatus: 'pending_seller_response' as const,
      itemPriceAtRequest: price,
    };
    setSelectedConversation(updatedConv);
    setConversations(prev => prev.map(c => c.id === updatedConv.id ? updatedConv : c));

    const systemMessageContent = `${mockUser.name} sent a buy request for ${selectedConversation.itemName} at £${price.toFixed(2)}.`;
    handleSendMessage(e, systemMessageContent, true);

    toast({ title: 'Buy Request Sent!', description: `Your request to buy ${selectedConversation.itemName} has been sent to the seller.` });
  };

  const handleSellerResponseToBuyRequest = (e: React.FormEvent, action: 'accept' | 'decline') => {
    if (!selectedConversation || !currentItemForSelectedConv || !isCurrentUserTheSeller || selectedConversation.buyRequestStatus !== 'pending_seller_response') return;

    let systemMessageContent = '';
    let updatedConv: Conversation;

    if (action === 'accept') {
      updatedConv = {
        ...selectedConversation,
        buyRequestStatus: 'accepted' as const,
        isItemSoldOrUnavailable: true,
      };
      removeItemFromMockItems(selectedConversation.itemId);
      systemMessageContent = `${mockUser.name} accepted the buy request for ${selectedConversation.itemName}. Item sold.`;
      toast({ title: 'Buy Request Accepted!', description: `${selectedConversation.itemName} has been marked as sold and removed from listings.` });
    } else { // decline
      updatedConv = {
        ...selectedConversation,
        buyRequestStatus: 'declined' as const,
      };
      systemMessageContent = `${mockUser.name} declined the buy request for ${selectedConversation.itemName}.`;
      toast({ title: 'Buy Request Declined', description: `You have declined the buy request.` });
    }
    
    setSelectedConversation(updatedConv);
    setConversations(prev => prev.map(c => c.id === updatedConv.id ? updatedConv : c));
    handleSendMessage(e, systemMessageContent, true);
  };

  const otherParticipant = getOtherParticipant(selectedConversation);

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
              const otherP = getOtherParticipant(conv);
              if (!otherP) return null; 
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
                    <AvatarImage src={otherP.avatarUrl} alt={otherP.name} data-ai-hint="user avatar"/>
                    <AvatarFallback>{otherP.name.substring(0,1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow overflow-hidden">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold truncate text-card-foreground">{otherP.name}</h3>
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
              <CardHeader className="p-4 border-b flex flex-col sticky top-0 bg-card z-10 space-y-2">
                <div className="flex flex-row items-center space-x-3">
                  <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setSelectedConversation(null)}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  {otherParticipant && (
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
                  )}
                </div>
                {/* Buy Request Status/Actions for Seller */}
                {isCurrentUserTheSeller && selectedConversation.buyRequestStatus === 'pending_seller_response' && !selectedConversation.isItemSoldOrUnavailable && (
                  <div className="pt-2 flex gap-2 justify-end">
                     <p className="text-sm text-muted-foreground mr-auto flex items-center"><Info className="h-4 w-4 mr-1"/> A buyer has sent a request for this item.</p>
                    <Button size="sm" variant="success" onClick={(e) => handleSellerResponseToBuyRequest(e, 'accept')}>
                      <CheckCircle className="mr-1.5 h-4 w-4" /> Accept Request
                    </Button>
                    <Button size="sm" variant="destructive" onClick={(e) => handleSellerResponseToBuyRequest(e, 'decline')}>
                      <XCircle className="mr-1.5 h-4 w-4" /> Decline Request
                    </Button>
                  </div>
                )}
              </CardHeader>
              <ScrollArea className="flex-grow p-4 space-y-1 bg-background"> 
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-end mb-2 group", 
                      msg.fromUserId === mockUser.id ? "justify-end" : "justify-start",
                      msg.isSystemMessage && "justify-center"
                    )}
                  >
                    {msg.isSystemMessage ? (
                       <div className="my-2 text-center w-full">
                          <span className="text-xs text-muted-foreground bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full shadow-sm">
                            {msg.content} ({format(new Date(msg.timestamp), "p")})
                          </span>
                        </div>
                    ) : msg.fromUserId !== mockUser.id && otherParticipant ? (
                      <div className="flex items-end max-w-[75%]">
                         <Avatar className="h-7 w-7 mr-2 mb-1 hidden group-hover:flex">
                            <AvatarImage src={otherParticipant.avatarUrl} alt={otherParticipant.name} />
                            <AvatarFallback>{otherParticipant.name.substring(0,1).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div
                          className={cn(
                            "p-3 rounded-lg shadow-md",
                            "bg-muted text-muted-foreground" 
                          )}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-xs mt-1 text-muted-foreground/80 text-left">
                            {format(new Date(msg.timestamp), "p")}
                          </p>
                        </div>
                      </div>
                    ) : ( // Message from mockUser
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
                        {!msg.isSystemMessage && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-1 h-7 w-7 p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
                            onClick={() => openDeleteDialog(msg.id)}
                            aria-label="Delete message"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Buy Request Status Display for Buyer */}
              {!isCurrentUserTheSeller && selectedConversation.buyRequestStatus !== 'none' && (
                <div className={cn("p-3 border-t text-sm font-medium", 
                  selectedConversation.buyRequestStatus === 'accepted' ? 'bg-green-50 text-green-700' :
                  selectedConversation.buyRequestStatus === 'declined' ? 'bg-red-50 text-red-700' :
                  'bg-blue-50 text-blue-700'
                )}>
                  {selectedConversation.buyRequestStatus === 'pending_seller_response' && "Buy request sent. Waiting for seller's response."}
                  {selectedConversation.buyRequestStatus === 'accepted' && `Request accepted! ${selectedConversation.itemName} is yours (mock).`}
                  {selectedConversation.buyRequestStatus === 'declined' && "Your buy request was declined by the seller."}
                </div>
              )}
              
              {/* Message Input and Buy Request Button for Buyer */}
              <form onSubmit={(e) => handleSendMessage(e, newMessage)} className="p-4 border-t bg-card flex items-center space-x-2 sticky bottom-0">
                {!isCurrentUserTheSeller && 
                 (selectedConversation.buyRequestStatus === 'none' || selectedConversation.buyRequestStatus === 'declined') && 
                 !selectedConversation.isItemSoldOrUnavailable && currentItemForSelectedConv && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                    onClick={handleSendBuyRequest}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4"/> Request to Buy
                  </Button>
                )}
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-grow bg-input text-foreground placeholder:text-muted-foreground"
                  autoComplete="off"
                  disabled={selectedConversation.isItemSoldOrUnavailable || selectedConversation.buyRequestStatus === 'accepted'}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  disabled={!newMessage.trim() || !getOtherParticipant(selectedConversation) || selectedConversation.isItemSoldOrUnavailable || selectedConversation.buyRequestStatus === 'accepted'}
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

