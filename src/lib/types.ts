
export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'sale' | 'auction';
  imageUrl: string;
  sellerName: string; 
  category: string;
}

export interface User {
  id: string;
  name: string;
  location?: string; // Changed from email
  bio?: string;
  isProfilePrivate?: boolean;
  subscriptionStatus: 'free_trial' | 'subscribed' | 'none';
  itemsListedCount: number;
  avatarUrl?: string;
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
