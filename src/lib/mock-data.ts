
import type { Item, User, Message, Conversation } from './types';

export let mockUser: User = {
  id: 'user123',
  name: 'Current User',
  email: 'user@example.com',
  password: 'password123',
  location: 'Barrow-in-Furness, UK',
  bio: 'Loves finding great deals and selling unique items. Avid collector of vintage electronics.',
  isProfilePrivate: false,
  subscriptionStatus: 'premium_plus',
  itemsListedCount: 2,
  avatarUrl: 'https://placehold.co/100x100.png?text=CU',
  enhancedListingsRemaining: 3,
  totalRatings: 15,
  sumOfRatings: 65, // (e.g., 5x5 stars, 5x4 stars, 5x3 stars = 25+20+15 = 60. Let's make it average 4.33)
  isAdmin: false,
};

export let mockItems: Item[] = [
  {
    id: 'item1',
    name: 'Vintage Leather Jacket',
    description: 'A cool vintage leather jacket, size L. Worn but in good condition. Perfect for a retro look. Has a few scuffs but adds to the character.',
    price: 45.00,
    type: 'sale',
    imageUrl: ['https://placehold.co/600x400.png?text=Jacket1', 'https://placehold.co/600x400.png?text=Jacket2'],
    sellerName: 'Seller One',
    sellerEmail: 'seller1@example.com',
    category: 'Apparel',
    condition: 'good',
    isEnhanced: true,
    canDeliver: true,
  },
  {
    id: 'item2',
    name: 'Acoustic Guitar - Yamaha F310',
    description: 'Yamaha F310 acoustic guitar. Great for beginners. Includes a soft case and a few picks. Minor scratch on the back.',
    price: 80.00,
    type: 'sale',
    imageUrl: ['https://placehold.co/600x400.png?text=Guitar1'],
    sellerName: 'Music Lover',
    sellerEmail: 'musiclover@example.com',
    category: 'Music & Instruments',
    condition: 'like_new',
    canDeliver: false,
  },
  {
    id: 'item3',
    name: 'Antique Pocket Watch (Auction)',
    description: 'A beautiful antique silver pocket watch. Mechanism needs repair. Sold as seen. Auction starts at £20.',
    price: 20.00, // Starting price for auction
    type: 'auction',
    imageUrl: ['https://placehold.co/600x400.png?text=Watch1', 'https://placehold.co/600x400.png?text=Watch2', 'https://placehold.co/600x400.png?text=Watch3'],
    sellerName: 'Collector X',
    sellerEmail: 'collectorx@example.com',
    category: 'Jewellery & Accessories',
    condition: 'not_working',
    auctionEndTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    currentBid: 25.50,
    bidHistory: [
      { userId: 'bidder123', userName: 'Enthusiast Bidder', amount: 25.50, timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
      { userId: 'user123', userName: 'Current User', amount: 22.00, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    ],
    canDeliver: true,
  },
  {
    id: 'item4',
    name: 'Set of Classic Novels',
    description: 'Includes titles like Moby Dick, Pride and Prejudice, and War and Peace. Hardcover editions. Excellent condition.',
    price: 15.00,
    type: 'sale',
    imageUrl: ['https://placehold.co/600x400.png?text=Books1'],
    sellerName: 'Current User',
    sellerEmail: 'user@example.com',
    category: 'Books',
    condition: 'like_new',
    isEnhanced: false,
    canDeliver: false,
  },
  {
    id: 'item5',
    name: 'Modern Art Print - Framed',
    description: 'Large framed modern art print. Abstract design. Measures 80cm x 60cm. Perfect for a statement wall.',
    price: 30.00,
    type: 'sale',
    imageUrl: ['https://placehold.co/600x400.png?text=Art1'],
    sellerName: 'ArtFan',
    sellerEmail: 'artfan@example.com',
    category: 'Home Decor',
    condition: 'new',
    canDeliver: true,
  },
  {
    id: 'item6',
    name: 'Nintendo Switch Console (Auction)',
    description: 'Used Nintendo Switch console with dock, joy-cons, and charger. Works perfectly. Some light scratches on screen protector (not screen itself).',
    price: 120.00, // Starting price
    type: 'auction',
    imageUrl: ['https://placehold.co/600x400.png?text=Switch1', 'https://placehold.co/600x400.png?text=Switch2'],
    sellerName: 'Gamer Pro',
    sellerEmail: 'gamerpro@example.com',
    category: 'Electronics',
    condition: 'good',
    auctionEndTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    currentBid: 135.00,
    bidHistory: [
        { userId: 'bidderX', userName: 'PlayerOne', amount: 135.00, timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
        { userId: 'bidderY', userName: 'JoyConFan', amount: 130.00, timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() }
    ],
    canDeliver: true,
  },
  {
    id: 'item7',
    name: 'Garden Furniture Set',
    description: 'Rattan effect garden sofa, two chairs and a coffee table. Weather resistant. Cushions included. Good condition, stored in shed over winter.',
    price: 150.00,
    type: 'sale',
    imageUrl: ['https://placehold.co/600x400.png?text=GardenSet1'],
    sellerName: 'Current User',
    sellerEmail: 'user@example.com',
    category: 'Garden & Outdoors',
    condition: 'good',
    isEnhanced: true,
    canDeliver: false,
  },
];

export let mockConversations: Conversation[] = [
  {
    id: 'conv1',
    itemId: 'item1',
    itemName: 'Vintage Leather Jacket',
    itemImageUrl: 'https://placehold.co/100x100.png?text=Jacket',
    participants: [
      { id: 'user123', name: 'Current User', avatarUrl: mockUser.avatarUrl },
      { id: 'sellerUser1', name: 'Seller One', avatarUrl: 'https://placehold.co/100x100.png?text=S1' },
    ],
    lastMessage: { content: 'Is this still available?', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
    unreadCount: 1,
    buyRequestStatus: 'none',
  },
  {
    id: 'conv2',
    itemId: 'item2',
    itemName: 'Acoustic Guitar - Yamaha F310',
    itemImageUrl: 'https://placehold.co/100x100.png?text=Guitar',
    participants: [
      { id: 'user123', name: 'Current User', avatarUrl: mockUser.avatarUrl },
      { id: 'sellerUser2', name: 'Music Lover', avatarUrl: 'https://placehold.co/100x100.png?text=ML' },
    ],
    lastMessage: { content: 'Great, I will take it!', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    unreadCount: 0,
    buyRequestStatus: 'accepted',
    itemPriceAtRequest: 80.00,
    isItemSoldOrUnavailable: true,
  },
  {
    id: 'conv-reports-user123', // For admin reports
    itemId: 'system-reports',
    itemName: 'Item Reports',
    itemImageUrl: 'https://placehold.co/100x100.png?text=RPT',
    participants: [
        { id: 'user123', name: 'Current User', avatarUrl: mockUser.avatarUrl }, // Assuming current user can be admin
        { id: 'system-reporter', name: 'System Reporter', avatarUrl: 'https://placehold.co/100x100.png?text=SYS' }
    ],
    lastMessage: { content: 'New report for "Suspicious Item".', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
    unreadCount: 1,
    buyRequestStatus: 'none'
  }
];

export let mockMessages: Message[] = [
  {
    id: 'msg1',
    fromUserId: 'user123',
    toUserId: 'sellerUser1',
    itemId: 'item1',
    content: 'Is this still available?',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'msg2',
    fromUserId: 'sellerUser1',
    toUserId: 'user123',
    itemId: 'item1',
    content: 'Yes, it is!',
    timestamp: new Date(Date.now() - 58 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: 'msg3',
    fromUserId: 'user123',
    toUserId: 'sellerUser2',
    itemId: 'item2',
    content: 'I would like to buy the guitar.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 10*60*1000).toISOString(),
    isRead: true,
  },
  {
    id: 'msg4',
    fromUserId: 'sellerUser2',
    toUserId: 'user123',
    itemId: 'item2',
    content: 'Sure, let\'s arrange collection.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 5*60*1000).toISOString(),
    isRead: true,
  },
  {
    id: 'msg5',
    fromUserId: 'user123',
    toUserId: 'sellerUser2',
    itemId: 'item2',
    content: 'Great, I will take it!',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: 'msg-system-report-1',
    fromUserId: 'system-reporter',
    toUserId: 'user123', // Assuming user123 is an admin for this context
    itemId: 'itemX', // A reported item ID (can be a dummy one or a real one from mockItems)
    content: 'Item Reported: "Suspicious Item" (ID: itemX). Sold by: NaughtySeller. Reason: This item seems too good to be true, price is very low.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    isRead: false,
    isSystemMessage: true,
  }
];

export let bannedEmails: string[] = ['scammer@example.com'];

// Ensure allMockUsers contains mockUser and any other distinct users from mockItems/mockConversations
const otherUser1: User = {
    id: 'sellerUser1', name: 'Seller One', email: 'seller1@example.com', password: 'password',
    subscriptionStatus: 'none', itemsListedCount: 1, totalRatings: 5, sumOfRatings: 22,
    avatarUrl: 'https://placehold.co/100x100.png?text=S1'
};
const otherUser2: User = {
    id: 'sellerUser2', name: 'Music Lover', email: 'musiclover@example.com', password: 'password',
    subscriptionStatus: 'subscribed', itemsListedCount: 1, totalRatings: 10, sumOfRatings: 48,
    avatarUrl: 'https://placehold.co/100x100.png?text=ML'
};
const otherUser3: User = {
    id: 'collectorX', name: 'Collector X', email: 'collectorx@example.com', password: 'password',
    subscriptionStatus: 'none', itemsListedCount: 1, totalRatings: 2, sumOfRatings: 7,
    avatarUrl: 'https://placehold.co/100x100.png?text=CX'
};
const otherUser4: User = {
    id: 'artfan', name: 'ArtFan', email: 'artfan@example.com', password: 'password',
    subscriptionStatus: 'none', itemsListedCount: 1, totalRatings: 0, sumOfRatings: 0,
    avatarUrl: 'https://placehold.co/100x100.png?text=AF'
};
const otherUser5: User = {
    id: 'gamerpro', name: 'Gamer Pro', email: 'gamerpro@example.com', password: 'password',
    subscriptionStatus: 'free_trial', itemsListedCount: 1, totalRatings: 3, sumOfRatings: 15,
    avatarUrl: 'https://placehold.co/100x100.png?text=GP'
};


export let allMockUsers: User[] = [
    {...mockUser}, // Add a copy of the main mockUser
    otherUser1,
    otherUser2,
    otherUser3,
    otherUser4,
    otherUser5
];


export function removeItemFromMockItems(itemId: string): void {
  const index = mockItems.findIndex(item => item.id === itemId);
  if (index > -1) {
    mockItems.splice(index, 1);
    console.log(`Item ${itemId} removed from mockItems.`);
  }
}

// Function to find a user by name, case-insensitive, and update mockUser
// This is a helper for realistic login simulation if needed, but primary login uses mockUser.email
export function setCurrentUserByName(name: string): boolean {
  const foundUser = allMockUsers.find(u => u.name.toLowerCase() === name.toLowerCase());
  if (foundUser) {
    mockUser = {...foundUser}; // Update the global mockUser
    return true;
  }
  return false;
}

    