'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockConversations, mockMessages, mockUser } from '@/lib/mock-data';
import type { Conversation, Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { Send, Search as SearchIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Pre-select conversation if itemId and sellerName are in query params (e.g., from "Contact Seller")
    const itemId = searchParams.get('itemId');
    const sellerName = searchParams.get('sellerName');
    if (itemId && sellerName) {
      const existingConv = conversations.find(c => c.itemId === itemId && c.participants.some(p => p.name === sellerName));
      if (existingConv) {
        setSelectedConversation(existingConv);
      } else {
        // Create a new mock conversation
        const newConv: Conversation = {
          id: `conv-${Date.now()}`,
          itemId: itemId,
          itemName: `Item ${itemId}`, // In a real app, fetch item name
          itemImageUrl: 'https://placehold.co/100x100.png',
          participants: [
            { id: mockUser.id, name: mockUser.name, avatarUrl: mockUser.avatarUrl },
            { id: `seller-${itemId}`, name: sellerName, avatarUrl: 'https://placehold.co/50x50.png' }
          ],
          lastMessage: { content: 'Started conversation...', timestamp: new Date().toISOString() },
          unreadCount: 0,
        };
        setConversations(prev => [newConv, ...prev]);
        setSelectedConversation(newConv);
      }
    } else if (conversations.length > 0) {
      // Default to selecting the first conversation
       if (!selectedConversation && conversations.length > 0) {
        setSelectedConversation(conversations[0]);
      }
    }
  }, [searchParams, conversations, selectedConversation]);
  
  useEffect(() => {
    if (selectedConversation) {
      setMessages(mockMessages.filter(msg => msg.itemId === selectedConversation.itemId && 
        (msg.fromUserId === selectedConversation.participants[0].id || msg.toUserId === selectedConversation.participants[0].id) &&
        (msg.fromUserId === selectedConversation.participants[1].id || msg.toUserId === selectedConversation.participants[1].id)
      ).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
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
    const msg: Message = {
      id: `msg-${Date.now()}`,
      fromUserId: mockUser.id,
      toUserId: selectedConversation.participants.find(p => p.id !== mockUser.id)?.id || '',
      itemId: selectedConversation.itemId,
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setMessages(prev => [...prev, msg]);
    
    // Update last message in conversation list
    setConversations(prevConvs => prevConvs.map(conv => 
      conv.id === selectedConversation.id 
      ? {...conv, lastMessage: {content: newMessage, timestamp: msg.timestamp}}
      : conv
    ));

    setNewMessage('');
  };

  const getOtherParticipant = (conv: Conversation) => {
    return conv.participants.find(p => p.id !== mockUser.id) || conv.participants[0];
  }

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col md:flex-row border rounded-lg shadow-lg overflow-hidden">
      {/* Conversation List Sidebar (hidden on mobile when a conversation is selected) */}
      <div className={cn(
        "w-full md:w-1/3 lg:w-1/4 border-r flex flex-col",
        selectedConversation && "hidden md:flex" 
      )}>
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Chats</h2>
          <div className="relative mt-2">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search conversations..." className="pl-8" />
          </div>
        </div>
        <ScrollArea className="flex-grow">
          {conversations.map((conv) => {
            const otherParticipant = getOtherParticipant(conv);
            return (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={cn(
                "w-full text-left p-4 hover:bg-muted/50 border-b cursor-pointer focus:outline-none focus:bg-accent focus:text-accent-foreground",
                selectedConversation?.id === conv.id && "bg-accent text-accent-foreground"
              )}
            >
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={otherParticipant.avatarUrl} alt={otherParticipant.name} data-ai-hint="user avatar"/>
                  <AvatarFallback>{otherParticipant.name.substring(0,1)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow overflow-hidden">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold truncate">{otherParticipant.name}</h3>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNowStrict(new Date(conv.lastMessage.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{conv.lastMessage.content}</p>
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

      {/* Message View Area */}
      <div className={cn(
        "flex-grow flex flex-col bg-card",
        !selectedConversation && "hidden md:flex md:items-center md:justify-center" // Hide on mobile if no conv selected, show placeholder on desktop
      )}>
        {selectedConversation ? (
          <>
            <CardHeader className="p-4 border-b flex flex-row items-center space-x-3 sticky top-0 bg-card z-10">
              <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setSelectedConversation(null)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10">
                 <AvatarImage src={getOtherParticipant(selectedConversation).avatarUrl} alt={getOtherParticipant(selectedConversation).name} data-ai-hint="user avatar"/>
                 <AvatarFallback>{getOtherParticipant(selectedConversation).name.substring(0,1)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{getOtherParticipant(selectedConversation).name}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Regarding: <Link href={`/item/${selectedConversation.itemId}`} className="hover:underline">{selectedConversation.itemName}</Link>
                </p>
              </div>
            </CardHeader>
            <ScrollArea className="flex-grow p-4 space-y-4 bg-background">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex mb-3",
                    msg.fromUserId === mockUser.id ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[70%] p-3 rounded-lg shadow",
                      msg.fromUserId === mockUser.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={cn(
                      "text-xs mt-1",
                      msg.fromUserId === mockUser.id ? "text-primary-foreground/70 text-right" : "text-muted-foreground text-left"
                    )}>
                      {format(new Date(msg.timestamp), "p")}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </ScrollArea>
            <form onSubmit={handleSendMessage} className="p-4 border-t bg-card flex items-center space-x-2 sticky bottom-0">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-grow"
                autoComplete="off"
              />
              <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                <Send className="h-5 w-5" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center text-muted-foreground p-10">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Select a conversation to start chatting, or contact a seller from an item page.</p>
          </div>
        )}
      </div>
    </div>
  );
}
