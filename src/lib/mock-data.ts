
import type { Item, User, Message, Conversation } from './types';

export const mockUser: User = {
  id: 'user123',
  name: '', // Will be set during profile creation
  email: '', // Will be set during profile creation
  password: '', // Will be set during profile creation
  location: 'Barrow Market Hall, Duke Street',
  bio: 'Lover of vintage items and good deals. Avid collector of rare books and quirky antiques. Always on the lookout for the next great find!',
  isProfilePrivate: false,
  subscriptionStatus: 'none',
  itemsListedCount: 0,
  avatarUrl: 'https://placehold.co/100x100.png',
  enhancedListingsRemaining: 0,
  thumbsUp: 0,
  thumbsDown: 0,
};

const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000).toISOString();
const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

export let mockItems: Item[] = [
  {
    id: '1',
    name: 'Vintage Leather Jacket',
    description: 'A stylish vintage leather jacket, in excellent condition. Size M.',
    price: 120,
    type: 'sale',
    imageUrl: 'https://placehold.co/600x400.png',
    sellerName: 'John Seller',
    category: 'Apparel',
    isEnhanced: true,
  },
  {
    id: '2',
    name: 'Antique Wooden Chair',
    description: 'Beautifully carved antique wooden chair. A true collector\'s item. Auction ends soon!',
    price: 85, // Starting price
    type: 'auction',
    imageUrl: 'https://placehold.co/600x400.png',
    sellerName: 'Alice Collector',
    category: 'Furniture',
    isEnhanced: false,
    auctionEndTime: oneHourFromNow,
    currentBid: 95,
    bidHistory: [
      { userId: 'user456', userName: 'Bidder Bob', amount: 90, timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
      { userId: 'user789', userName: 'Auction Alex', amount: 95, timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
    ]
  },
  {
    id: '3',
    name: 'Handmade Ceramic Vase',
    description: 'Unique handmade ceramic vase, perfect for home decor.',
    price: 50,
    type: 'sale',
    imageUrl: 'https://placehold.co/600x400.png',
    sellerName: 'Crafty Carol',
    category: 'Home Decor',
    isEnhanced: false,
  },
  {
    id: '4',
    name: 'Retro Gaming Console',
    description: 'Classic retro gaming console with 2 controllers and 10 games.',
    price: 150,
    type: 'sale',
    imageUrl: 'https://placehold.co/600x400.png',
    sellerName: 'Gamer Tom',
    category: 'Electronics',
    isEnhanced: false,
  },
  {
    id: '5',
    name: 'Mountain Bike - Auction',
    description: 'Used mountain bike, good condition, recently serviced. Size L. Auction running for a few days.',
    price: 200, // Starting price
    type: 'auction',
    imageUrl: 'https://placehold.co/600x400.png',
    sellerName: 'Outdoor Dave',
    category: 'Sports',
    isEnhanced: true,
    auctionEndTime: threeDaysFromNow,
    currentBid: 220,
    bidHistory: [
       { userId: 'user101', userName: 'Cyclist Chris', amount: 220, timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
    ]
  },
  {
    id: '6',
    name: 'Signed First Edition Book',
    description: 'A rare signed first edition of a popular novel. Includes certificate of authenticity.',
    price: 300,
    type: 'sale',
    imageUrl: 'https://placehold.co/600x400.png',
    sellerName: 'Bookworm Beth',
    category: 'Books',
    isEnhanced: false,
  },
  {
    id: '7',
    name: 'Reliable Town Car',
    description: 'A well-maintained 2015 hatchback, perfect for city driving. Low mileage.',
    price: 4500,
    type: 'sale',
    imageUrl: 'https://placehold.co/600x400.png',
    sellerName: 'Driver Dan',
    category: 'Vehicles',
    isEnhanced: false,
  },
  {
    id: '8',
    name: 'Classic Motorbike Project - Ended Auction',
    description: 'Vintage motorbike, needs some TLC. Great project for an enthusiast. Sold as seen.',
    price: 1200, // Starting price
    type: 'auction',
    imageUrl: 'https://placehold.co/600x400.png',
    sellerName: 'Mechanic Mike',
    category: 'Vehicles',
    isEnhanced: false,
    auctionEndTime: oneDayAgo, // Auction ended
    currentBid: 1350,
    bidHistory: [
      { userId: 'user202', userName: 'BikeLover', amount: 1300, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { userId: 'user303', userName: 'FixItFelix', amount: 1350, timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString() },
    ]
  },
  {
    id: '9',
    name: 'Electric Scooter - Nearly New',
    description: 'Foldable electric scooter, used only a few times. Comes with charger and helmet.',
    price: 350,
    type: 'sale',
    imageUrl: 'https://placehold.co/600x400.png',
    sellerName: 'Eco Eva',
    category: 'Vehicles',
    isEnhanced: false,
  },
  {
    id: '10',
    name: 'Gardening Tool Set',
    description: 'Complete set of essential gardening tools. Barely used.',
    price: 45,
    type: 'sale',
    imageUrl: 'https://placehold.co/600x400.png',
    sellerName: 'Green Thumb George',
    category: 'Garden & Outdoors',
    isEnhanced: false,
  },
  {
    id: '11',
    name: 'Acoustic Guitar',
    description: 'Full-size acoustic guitar, great for beginners. Includes soft case.',
    price: 75,
    type: 'auction',
    imageUrl: 'https://placehold.co/600x400.png',
    sellerName: 'Musician Mia',
    category: 'Music & Instruments',
    isEnhanced: false,
    auctionEndTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
  },
  {
    id: '12',
    name: 'Silver Pendant Necklace',
    description: 'Elegant silver pendant necklace with a unique design. Gift box included.',
    price: 60,
    type: 'sale',
    imageUrl: 'https://placehold.co/600x400.png',
    sellerName: 'Jeweler Jess',
    category: 'Jewellery & Accessories',
    isEnhanced: false,
  },
  {
    id: '13',
    name: 'Board Game Collection',
    description: 'Collection of 5 popular board games. Excellent condition.',
    price: 50,
    type: 'sale',
    imageUrl: 'https://placehold.co/600x400.png',
    sellerName: 'Gamer Tom',
    category: 'Toys & Games',
    isEnhanced: false,
  },
  {
    id: '14',
    name: 'Oil Painting Set',
    description: 'Beginner oil painting set with various colors, brushes, and canvases.',
    price: 35,
    type: 'sale',
    imageUrl: 'https://placehold.co/600x400.png',
    sellerName: 'Artist Andy',
    category: 'Art & Crafts',
    isEnhanced: false,
  },
   {
    id: '15',
    name: 'Organic Skincare Set',
    description: 'Set of organic skincare products, including cleanser, toner, and moisturizer. Unopened.',
    price: 40,
    type: 'sale',
    imageUrl: 'https://placehold.co/600x400.png',
    sellerName: 'Healthy Hannah',
    category: 'Health & Beauty',
    isEnhanced: true,
  },
  {
    id: '16',
    name: 'Dog Bed - Large',
    description: 'Comfortable and durable large dog bed. Washable cover.',
    price: 30,
    type: 'sale',
    imageUrl: 'https://placehold.co/600x400.png',
    sellerName: 'Pet Lover Pete',
    category: 'Pet Supplies',
    isEnhanced: false,
  },
  {
    id: '17',
    name: 'Modern 2-Bed Apartment for Rent',
    description: 'Spacious 2-bedroom apartment in the city center. Fully furnished, available immediately. £1200/month.',
    price: 1200, // Price per month for rent
    type: 'sale', // 'sale' type can represent rentals too for simplicity in this mock
    imageUrl: 'https://placehold.co/600x400.png',
    sellerName: 'Landlord Larry',
    category: 'Property for Rent',
    isEnhanced: true,
  },
  {
    id: '18',
    name: 'Charming 3-Bed House for Sale',
    description: 'Beautiful 3-bedroom detached house with a large garden. Quiet neighborhood. Offers over £250,000.',
    price: 250000,
    type: 'sale',
    imageUrl: 'https://placehold.co/600x400.png',
    sellerName: 'Realty Rosie',
    category: 'Property for Sale',
    isEnhanced: false,
  },
  {
    id: '19',
    name: 'Studio Flat to Let',
    description: 'Compact studio flat, ideal for a single professional. Close to transport links. £800/month.',
    price: 800,
    type: 'sale',
    imageUrl: 'https://placehold.co/600x400.png',
    sellerName: 'Landlord Larry',
    category: 'Property for Rent',
    isEnhanced: false,
  }
];

export const mockMessages: Message[] = [
  { id: 'msg1', fromUserId: mockUser.id, toUserId: 'sellerA', itemId: '1', content: 'Hi, is this jacket still available?', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), isRead: false },
  { id: 'msg2', fromUserId: 'sellerA', toUserId: mockUser.id, itemId: '1', content: 'Yes, it is!', timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(), isRead: false },
  { id: 'msg3', fromUserId: 'user456', toUserId: mockUser.id, itemId: '3', content: 'I love your vase! Can you do $40?', timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), isRead: true },
  { id: 'msg4', fromUserId: mockUser.id, toUserId: 'user456', itemId: '3', content: 'Sorry, price is firm.', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), isRead: true },
];

// Update participant names in mockConversations based on mockUser
mockUser.name = ''; // Or whatever name is set during profile creation simulation
mockUser.avatarUrl = mockUser.avatarUrl || 'https://placehold.co/50x50.png';

export const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    itemId: '1',
    itemName: 'Vintage Leather Jacket',
    itemImageUrl: (mockItems.find(item => item.id === '1')?.imageUrl || 'https://placehold.co/100x100.png'),
    participants: [
      { id: mockUser.id, name: mockUser.name, avatarUrl: mockUser.avatarUrl },
      { id: 'sellerA', name: 'John Seller', avatarUrl: 'https://placehold.co/50x50.png?text=JS' },
    ],
    lastMessage: { content: 'Yes, it is!', timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString() },
    unreadCount: 1,
    buyRequestStatus: 'none',
    isItemSoldOrUnavailable: false,
  },
  {
    id: 'conv2',
    itemId: '3',
    itemName: 'Handmade Ceramic Vase',
    itemImageUrl: (mockItems.find(item => item.id === '3')?.imageUrl || 'https://placehold.co/100x100.png'),
    participants: [
      { id: mockUser.id, name: mockUser.name, avatarUrl: mockUser.avatarUrl },
      { id: 'user456', name: 'Crafty Carol', avatarUrl: 'https://placehold.co/50x50.png?text=CC' },
    ],
    lastMessage: { content: 'Sorry, price is firm.', timestamp: new Date(Date.now() - 3600000 * 4).toISOString() },
    unreadCount: 0,
    buyRequestStatus: 'none',
    isItemSoldOrUnavailable: false,
  },
  {
    id: 'conv-item4-seller-GamerTom',
    itemId: '4',
    itemName: 'Retro Gaming Console',
    itemImageUrl: (mockItems.find(item => item.id === '4')?.imageUrl || 'https://placehold.co/100x100.png'),
    participants: [
      { id: mockUser.id, name: mockUser.name, avatarUrl: mockUser.avatarUrl }, // Assuming mockUser is the buyer
      { id: 'seller-GamerTom', name: 'Gamer Tom', avatarUrl: 'https://placehold.co/50x50.png?text=GT' }
    ],
    lastMessage: { content: 'Interested in the console.', timestamp: new Date().toISOString() },
    unreadCount: 0,
    buyRequestStatus: 'none',
    isItemSoldOrUnavailable: false,
  }
];

// Function to remove an item from mockItems array by ID
export const removeItemFromMockItems = (itemId: string) => {
  mockItems = mockItems.filter(item => item.id !== itemId);
};

