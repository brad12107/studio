
export interface Item {
  id: string;
  name: string;
  description: string;
  price: number; // For 'sale' type, this is the price. For 'auction', this is the starting price.
  type: 'sale' | 'auction';
  imageUrl: string;
  sellerName: string;
  category: string;
  isEnhanced?: boolean;
  auctionEndTime?: string; // ISO date string, only for auction type
  currentBid?: number; // Only for auction type
  bidHistory?: { userId: string; userName: string; amount: number; timestamp: string }[]; // Only for auction type
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  location?: string;
  bio?: string;
  isProfilePrivate?: boolean;
  subscriptionStatus: 'free_trial' | 'subscribed' | 'premium_plus' | 'none';
  itemsListedCount: number;
  avatarUrl?: string;
  enhancedListingsRemaining?: number;
  thumbsUp: number;
  thumbsDown: number;
}

export interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  itemId: string;
  content: string;
  timestamp: string; // ISO string for simplicity
  isRead: boolean;
}

export interface Conversation {
  id: string;
  itemId: string;
  itemName: string;
  itemImageUrl: string;
  participants: Pick<User, 'id' | 'name' | 'avatarUrl'>[];
  lastMessage: Pick<Message, 'content' | 'timestamp'>;
  unreadCount: number;
}
