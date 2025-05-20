
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search as SearchIcon, Send } from 'lucide-react'; // Removed ArrowLeft, MessageSquareIcon as they are not directly used for skeleton structure

export default function MessagesLoading() {
  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col md:flex-row border rounded-lg shadow-lg overflow-hidden bg-card">
      {/* Left Pane Skeleton (Conversations List) */}
      {/* This pane is visible on md and larger screens by default during loading */}
      <div className="w-full md:w-1/3 lg:w-1/4 border-r flex-col hidden md:flex">
        <div className="p-4 border-b">
          <Skeleton className="h-6 w-1/2 mb-3" /> {/* "Chats" title skeleton */}
          <div className="relative mt-2">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search conversations..." className="pl-8 bg-background" disabled />
          </div>
        </div>
        <ScrollArea className="flex-grow">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-full text-left p-4 border-b">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-grow overflow-hidden space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20" /> {/* Participant name */}
                    <Skeleton className="h-3 w-12" /> {/* Timestamp */}
                  </div>
                  <Skeleton className="h-3 w-3/4" /> {/* Last message content */}
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Right Pane Skeleton (Chat View) */}
      {/* This pane is the primary view on mobile during loading */}
      <div className="flex-grow flex flex-col">
        <div className="p-4 border-b flex flex-row items-center space-x-3 sticky top-0 bg-card z-10">
          <Skeleton className="h-9 w-9 md:hidden mr-2" /> {/* Mobile back button placeholder */}
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-28" /> {/* Participant name */}
            <Skeleton className="h-3 w-40" /> {/* Regarding item link */}
          </div>
        </div>
        <ScrollArea className="flex-grow p-4 space-y-4 bg-background">
          {/* Sent messages skeletons */}
          {[...Array(2)].map((_, i) => (
            <div key={`sent-skeleton-${i}`} className="flex mb-3 justify-end">
              <Skeleton className="max-w-[70%] h-16 w-2/3 rounded-lg" />
            </div>
          ))}
          {/* Received messages skeletons */}
          {[...Array(2)].map((_, i) => (
            <div key={`received-skeleton-${i}`} className="flex mb-3 justify-start">
              <Skeleton className="max-w-[70%] h-12 w-1/2 rounded-lg" />
            </div>
          ))}
        </ScrollArea>
        <div className="p-4 border-t bg-card flex items-center space-x-2 sticky bottom-0">
          <Skeleton className="h-10 flex-grow" /> {/* Input skeleton */}
          <Skeleton className="h-9 w-9" /> {/* Send button skeleton */}
        </div>
      </div>
    </div>
  );
}
