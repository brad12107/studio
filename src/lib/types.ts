
export interface Item {
  id: string;
  name: string;
  description: string;
  price: number; // For 'sale' type, this is the price. For 'auction', this is the starting price.
  type: 'sale' | 'auction';
  imageUrl: string[]; // Changed from string to string[]
  sellerName: string;
  category: string;
  condition?: 'new' | 'like_new' | 'good' | 'not_working'; // Added item condition
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
  totalRatings: number;
  sumOfRatings: number;
  isAdmin?: boolean; // Added for admin role
}

export interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  itemId: string;
  content: string;
  timestamp: string; // ISO string for simplicity
  isRead: boolean;
  isSystemMessage?: boolean; // Added for buy request system messages
}

export interface Conversation {
  id: string;
  itemId: string;
  itemName: string;
  itemImageUrl: string; // Will be the first image from Item.imageUrl
  participants: Pick<User, 'id' | 'name' | 'avatarUrl'>[];
  lastMessage: Pick<Message, 'content' | 'timestamp'>;
  unreadCount: number;
  buyRequestStatus: 'none' | 'pending_seller_response' | 'accepted' | 'declined';
  itemPriceAtRequest?: number;
  isItemSoldOrUnavailable?: boolean; // To track if item sold via this or other means
}
