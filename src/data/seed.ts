
import type { Product, Review, Question, CartItem, HomepageSettings, EditableValueProposition, DiscountCoupon, SocialLink } from '@/lib/types';

// Define a reference date for consistent timestamps
const REF_DATE_NOW = new Date(2024, 5, 20, 10, 0, 0).getTime(); // June 20, 2024, 10:00:00 AM

const daysAgo = (days: number) => REF_DATE_NOW - (1000 * 60 * 60 * 24 * days);
const hoursAgo = (hours: number) => REF_DATE_NOW - (1000 * 60 * 60 * hours);
const minutesAgo = (minutes: number) => REF_DATE_NOW - (1000 * 60 * minutes);


export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'SmartSphere X1',
    description: 'Experience the next generation of smart home assistants with the SmartSphere X1. Seamlessly integrated with all your devices, it offers unparalleled voice control, crystal-clear audio, and a vibrant touchscreen display. Manage your schedule, play music, control lights, and much more, all with simple voice commands or a tap.',
    price: 129.99,
    originalPrice: 149.99,
    category: 'Electronics',
    stock: 50,
    images: ['https://placehold.co/600x600.png?text=SmartSphere+X1', 'https://placehold.co/100x100.png?text=Sphere+Thumb+1', 'https://placehold.co/100x100.png?text=Sphere+Thumb+2'],
    keywords: ['smart home', 'assistant', 'voice control', 'iot'],
    rating: 4.5,
    numReviews: 25,
    likes: 150,
    createdAt: daysAgo(10),
    updatedAt: daysAgo(2),
  },
  {
    id: '2',
    name: 'NovaBlend Pro Blender',
    description: 'Unleash your culinary creativity with the NovaBlend Pro. Featuring a powerful 1200W motor, hardened stainless-steel blades, and multiple speed settings, this blender can handle everything from smoothies and soups to nut butters and crushed ice. Its sleek design and easy-to-clean components make it a perfect addition to any kitchen.',
    price: 89.99,
    category: 'Home Goods',
    stock: 30,
    images: ['https://placehold.co/600x600.png?text=NovaBlend+Pro', 'https://placehold.co/100x100.png?text=Blender+Thumb+1'],
    keywords: ['blender', 'kitchen', 'smoothie', 'appliance'],
    rating: 4.8,
    numReviews: 40,
    likes: 210,
    createdAt: daysAgo(15),
    updatedAt: daysAgo(1),
  },
  {
    id: '3',
    name: '"The Astral Weaver" - Sci-Fi Novel',
    description: 'Dive into an epic saga of interstellar empires, ancient mysteries, and a lone hero destined to change the fate of the galaxy. "The Astral Weaver" is a thrilling science fiction adventure that will keep you on the edge of your seat from the first page to the last. By acclaimed author Elara Vance.',
    price: 15.99,
    originalPrice: 19.99,
    category: 'Books',
    stock: 100,
    images: ['https://placehold.co/600x600.png?text=Astral+Weaver+Book', 'https://placehold.co/100x100.png?text=Book+Thumb+1'],
    keywords: ['science fiction', 'novel', 'space opera', 'adventure'],
    rating: 4.2,
    numReviews: 18,
    likes: 95,
    createdAt: daysAgo(5),
    updatedAt: daysAgo(3),
  },
  {
    id: '4',
    name: 'Urban Voyager Backpack',
    description: 'Navigate the city in style and comfort with the Urban Voyager Backpack. Crafted from durable, water-resistant materials, it features multiple compartments, a padded laptop sleeve (up to 15.6"), and ergonomic shoulder straps. Ideal for daily commutes, travel, or weekend adventures.',
    price: 59.99,
    category: 'Clothing',
    stock: 75,
    images: ['https://placehold.co/600x600.png?text=Voyager+Backpack', 'https://placehold.co/100x100.png?text=Backpack+Thumb+1', 'https://placehold.co/100x100.png?text=Backpack+Thumb+2'],
    keywords: ['backpack', 'travel', 'laptop bag', 'urban'],
    rating: 4.6,
    numReviews: 33,
    likes: 180,
    createdAt: daysAgo(20),
    updatedAt: daysAgo(5),
  },
   {
    id: '5',
    name: 'AuraGlow Facial Serum',
    description: 'Revitalize your skin with AuraGlow Facial Serum. This potent blend of hyaluronic acid, vitamin C, and botanical extracts deeply hydrates, brightens, and reduces the appearance of fine lines. Suitable for all skin types, it leaves your complexion looking radiant and youthful.',
    price: 29.99,
    originalPrice: 34.50,
    category: 'Beauty',
    stock: 60,
    images: ['https://placehold.co/600x600.png?text=AuraGlow+Serum', 'https://placehold.co/100x100.png?text=Serum+Thumb+1'],
    keywords: ['skincare', 'serum', 'anti-aging', 'vitamin c'],
    rating: 4.9,
    numReviews: 55,
    likes: 250,
    createdAt: daysAgo(8),
    updatedAt: daysAgo(1),
  },
  {
    id: '6',
    name: 'RoboSpark Building Kit',
    description: 'Ignite your child\'s imagination with the RoboSpark Building Kit. This educational toy allows kids to build and program their own robots, learning STEM concepts in a fun and interactive way. Includes over 200 pieces and a kid-friendly coding interface.',
    price: 79.99,
    category: 'Toys',
    stock: 40,
    images: ['https://placehold.co/600x600.png?text=RoboSpark+Kit', 'https://placehold.co/100x100.png?text=Robot+Thumb+1'],
    keywords: ['robotics', 'STEM', 'educational toy', 'building kit'],
    rating: 4.7,
    numReviews: 22,
    likes: 120,
    createdAt: daysAgo(12),
    updatedAt: daysAgo(4),
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'r1',
    productId: '1',
    userId: 'user123',
    userName: 'Alice Wonderland',
    avatar: 'https://placehold.co/40x40.png?text=AW',
    rating: 5,
    comment: 'Absolutely love the SmartSphere X1! It\'s made my life so much easier. Setup was a breeze and it works flawlessly.',
    createdAt: daysAgo(3),
  },
  {
    id: 'r2',
    productId: '1',
    userId: 'user456',
    userName: 'Bob The Builder',
    avatar: 'https://placehold.co/40x40.png?text=BB',
    rating: 4,
    comment: 'Great device, very responsive. The screen is a nice touch. Sometimes has trouble with complex commands.',
    createdAt: daysAgo(1),
  },
  {
    id: 'r3',
    productId: '2',
    userId: 'user789',
    userName: 'Charlie Brown',
    avatar: 'https://placehold.co/40x40.png?text=CB',
    rating: 5,
    comment: 'This NovaBlend Pro is a beast! Smoothies are perfect every time. Highly recommend.',
    createdAt: hoursAgo(20),
  },
   {
    id: 'r4',
    productId: '5',
    userId: 'userXYZ',
    userName: 'Eva Green',
    avatar: 'https://placehold.co/40x40.png?text=EG',
    rating: 5,
    comment: 'AuraGlow serum is amazing! My skin feels so soft and looks brighter after just a week.',
    createdAt: daysAgo(2),
  },
  {
    id: 'r5',
    productId: '5',
    userId: 'userQWE',
    userName: 'Frank Castle',
    avatar: 'https://placehold.co/40x40.png?text=FC',
    rating: 4,
    comment: 'Good serum, noticeable difference. The bottle is a bit small for the price though.',
    createdAt: minutesAgo(30),
  }
];

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q1',
    productId: '1',
    userId: 'userABC',
    userName: 'Curious George',
    questionText: 'Does the SmartSphere X1 support Spotify?',
    answerText: 'Yes, the SmartSphere X1 has full Spotify integration, allowing you to play your favorite music and podcasts directly.',
    answeredBy: 'Support Team',
    createdAt: daysAgo(2),
    answeredAt: hoursAgo(23), // REF_DATE_NOW - 23 hours
  },
  {
    id: 'q2',
    productId: '1',
    userId: 'userDEF',
    userName: 'Diana Prince',
    questionText: 'What is the warranty period for this device?',
    answerText: "The SmartSphere X1 comes with a standard 1-year manufacturer's warranty.",
    answeredBy: 'Support Team',
    createdAt: minutesAgo(50),
    answeredAt: minutesAgo(10),
  },
  {
    id: 'q3',
    userId: 'userGHI',
    userName: 'General Inquirer',
    questionText: 'What are your shipping times to California?',
    answerText: 'Standard shipping to California typically takes 3-5 business days. Expedited options are available at checkout.',
    answeredBy: 'Support Team',
    createdAt: daysAgo(5),
    answeredAt: daysAgo(4),
  },
  {
    id: 'q4',
    userId: 'userJKL',
    userName: 'Frequent Shopper',
    questionText: 'Do you offer gift wrapping?',
    answerText: "Yes, we offer gift wrapping for a small additional fee. You can select this option during checkout.",
    answeredBy: 'Support Team',
    createdAt: hoursAgo(2),
    answeredAt: minutesAgo(30),
  },
  {
    id: 'q5',
    productId: '3',
    userId: 'userMNO',
    userName: 'Book Worm',
    questionText: 'Is "The Astral Weaver" available in hardcover?',
    createdAt: daysAgo(1),
  }
];

export const INITIAL_ORDERS: Product[] = [];

export const INITIAL_CART_ITEMS: CartItem[] = [];

export const INITIAL_WISHLIST_ITEMS: string[] = ['1', '5'];

export const INITIAL_LIKED_PRODUCTS: string[] = ['1', '2', '5'];

const DEFAULT_ENHANCED_PROMPT = `You are "Dukaan Assistant", a proactive, enthusiastic, and persuasive expert sales assistant for the online store "{{storeName}}".
Your primary goal is not just to answer questions, but to guide users towards making a purchase and becoming loyal customers. You are charming, helpful, and knowledgeable about the store's layout, products, and policies.

**Your Capabilities and Limitations:**
- You have a deep understanding of the store's pages (Home, Products, Q&A, Contact, etc.) and can guide users to them.
- You can answer questions based on the provided Product Catalog, Q&A, and general Store Information.
- You have a special ability to suggest links. However, you must use this power wisely to avoid annoying the user. **Only populate the 'suggestedLink' field if one of the following is true:**
    1.  The user **explicitly asks** for a link or to be shown a page (e.g., "show me the contact page", "can I see that product?").
    2.  The user is clearly lost and your **primary goal** is to guide them to a specific page (e.g., if they ask "how do I ask a general question?", linking to '/qna' is appropriate).
    3.  You are recommending a **single, specific product** that is a perfect match for their detailed query.
- **Do NOT provide a link in every message.** Avoid sending links for general suggestions or in casual conversation. For example, if you mention social media to find coupons, do not use the link field; instead, just mention the channels by name. When in doubt, do not send a link.
- You do NOT have access to user accounts, order history, or sensitive admin data like revenue or passwords. You know *about* the admin panel (it's for managing the store) but you cannot access it.
- You must politely decline any questions that are not related to {{storeName}} or its offerings, or that ask for information you don't have.
- Try to answer in the language the user is asking in, if possible.

**Sales & Persuasion Tactics:**
- **Be Proactive:** If a user asks a general question, try to connect the answer to a product category or the value of shopping with us. Use the store's value propositions (e.g., 'Quality Products', 'Customer Love') from the Store Information to build trust and explain why {{storeName}} is the best choice.
- **Build Trust & Create Interest with Coupons:** You have access to a list of active coupon codes in your 'storeContext'. **IMPORTANT: DO NOT reveal these codes directly to the user.** Instead, use this knowledge to create excitement. Tell users that we frequently release special discount codes on our social media channels. Encourage them to follow us there to find exclusive deals, sometimes hidden in our videos or posts. When you mention this, provide the direct social media links from the context.
- **Use Social Proof:** If a user is hesitant about a product, you can highlight its high rating, number of reviews, or how many other customers have "liked" it to build confidence.

**Special Instructions:**
- **About Your Creator:** If a user asks who created you or how you were made, proudly tell them you were developed by a skilled creator named 'frs7bk'. You can say something like, "I was created by the talented developer frs7bk! You can check out more of their work and follow them on Instagram." Then, provide this link using the 'suggestedLink' field: https://www.instagram.com/frs7bk/. After this, gently guide the conversation back to helping the user with the store.`;


export const INITIAL_HOMEPAGE_SETTINGS: HomepageSettings = {
  storeName: 'MyDukaan',
  heroImageUrl: 'https://placehold.co/1920x1080.png',
  featuredProductIds: [], // Empty by default, page.tsx will fallback
  featuredQuestionIds: [], // Empty by default, page.tsx will fallback
  valuePropositions: [
    { id: 'quality', title: 'Quality Products', description: 'Handpicked items that meet our highest standards.' },
    { id: 'love', title: 'Customer Love', description: 'Dedicated support and a community of happy shoppers.' },
    { id: 'easy', title: 'Easy Shopping', description: 'Intuitive design for a hassle-free experience.' },
  ],
  socialLinks: [
    { platform: 'facebook', url: '', isEnabled: false },
    { platform: 'twitter', url: '', isEnabled: false },
    { platform: 'instagram', url: '', isEnabled: false },
    { platform: 'linkedin', url: '', isEnabled: false },
    { platform: 'youtube', url: '', isEnabled: false },
  ],
  categories: ['Electronics', 'Books', 'Clothing', 'Home Goods', 'Beauty', 'Toys', 'Groceries'],
  chatbotSettings: {
    isEnabled: true,
    basePrompt: 'You are a helpful and friendly sales assistant for this store. You should be persuasive and guide users to make a purchase.',
    enhancedPrompt: DEFAULT_ENHANCED_PROMPT,
    temperature: 0.7,
  },
  copyrightText: '© {year} {storeName}. All rights reserved.',
  madeByText: 'Crafted with care by Firebase Studio.',
};

export const INITIAL_DISCOUNT_COUPONS: DiscountCoupon[] = [
  {
    id: 'coupon_001',
    code: 'SAVE10',
    discountPercentage: 10,
    isActive: true,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
    timesUsed: 5, // Example usage
  },
  {
    id: 'coupon_002',
    code: 'EXPIRED20',
    discountPercentage: 20,
    isActive: true,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(60),
    expiresAt: daysAgo(1), // Expired yesterday
    timesUsed: 15,
  },
  {
    id: 'coupon_003',
    code: 'LIMITED5',
    discountPercentage: 5,
    isActive: true,
    createdAt: daysAgo(10),
    updatedAt: daysAgo(2),
    usageLimit: 10, // Has a limit
    timesUsed: 9, // Almost used up
  },
    {
    id: 'coupon_004',
    code: 'USEDUP',
    discountPercentage: 15,
    isActive: true,
    createdAt: daysAgo(20),
    updatedAt: daysAgo(10),
    usageLimit: 25,
    timesUsed: 25, // Fully used up
  },
];

export const INITIAL_APP_STATE = { // Used for AppContext defaults
  products: INITIAL_PRODUCTS,
  cart: INITIAL_CART_ITEMS,
  wishlist: INITIAL_WISHLIST_ITEMS,
  orders: [],
  questions: INITIAL_QUESTIONS,
  reviews: INITIAL_REVIEWS,
  theme: 'light' as 'light' | 'dark',
  isAdminAuthenticated: false,
  likedProducts: INITIAL_LIKED_PRODUCTS,
  homepageSettings: INITIAL_HOMEPAGE_SETTINGS,
  discountCoupons: INITIAL_DISCOUNT_COUPONS,
  isChatbotIconVisible: true, // Default visibility for chatbot icon
  chatSessions: [],
};
