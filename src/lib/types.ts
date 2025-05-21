
export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'sale' | 'auction';
  imageUrl: string;
  sellerName: string;
  category: string;
  isEnhanced?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string; // Added email
  password: string; // Added password
  location?: string;
  bio?: string;
  isProfilePrivate?: boolean;
  subscriptionStatus: 'free_trial' | 'subscribed' | 'premium_plus' | 'none';
  itemsListedCount: number;
  avatarUrl?: string;
  enhancedListingsRemaining?: number;
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
