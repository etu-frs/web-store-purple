
export type Category = string; // Now a generic string since it's dynamic

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number; // Added for discount calculation
  category: Category;
  stock: number;
  images: string[]; // First image is main, others are thumbnails
  keywords: string[];
  rating: number; // Average rating
  numReviews: number;
  likes: number;
  createdAt: number; // Timestamp
  updatedAt: number; // Timestamp
}

export interface Review {
  id: string;
  productId: string;
  userId: string; // Or userName if not using full user objects
  userName: string;
  avatar?: string; // URL to avatar image
  rating: number; // 1-5 stars
  comment: string;
  createdAt: number; // Timestamp
}

export interface Question {
  id: string;
  productId?: string; // Null or undefined for general questions
  userId: string; // Or userName
  userName: string;
  questionText: string;
  answerText?: string;
  answeredBy?: string; // e.g., "Support Team"
  createdAt: number; // Timestamp for question
  answeredAt?: number; // Timestamp for answer
}

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number; // Current selling price
  originalPrice?: number; // Original price, if discounted
  quantity: number;
  stock: number;
}

export interface OrderAddress {
  fullName: string;
  phone: string;
  state: string;
  district: string;
  streetAddress: string;
}

export type PaymentMethod = 'Credit Card' | 'PayPal' | 'Cash on Delivery' | 'Loyalty Points' | 'Gift Card';

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number; // Price at the time of order
  originalPrice?: number; // Original price at the time of order
}

export type OrderStatus =
  | 'Pending Approval'
  | 'Processing'
  | 'Ready for Shipment'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded';

export interface OrderStatusUpdate {
  status: OrderStatus;
  timestamp: number;
  notes?: string;
}

export interface Order {
  id: string; // Unique order ID
  userId: string; // If users can register, otherwise guest checkout
  customerName: string; // From OrderAddress.fullName
  items: OrderItem[];
  totalPrice: number;
  shippingAddress: OrderAddress;
  paymentMethod: PaymentMethod; // Or more detailed payment info
  paymentResult?: { // Placeholder for payment details
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  };
  statusHistory: OrderStatusUpdate[];
  currentStatus: OrderStatus;
  createdAt: number; // Timestamp
  updatedAt: number; // Timestamp
  discountCode?: string;
  discountAmount?: number;
}

export interface WishlistItem {
  productId: string;
  addedAt: number; // Timestamp
}

// For Admin authentication & management
export interface AdminUser {
  id: string;
  username: string;
  // passwordHash: string; // In a real app
}

// Homepage Settings
export interface EditableValueProposition {
  id: 'quality' | 'love' | 'easy'; // Fixed IDs to map icons
  title: string;
  description: string;
}

export type SocialLinkPlatform = 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube';

export interface SocialLink {
  platform: SocialLinkPlatform;
  url: string;
  isEnabled: boolean;
}

export interface ChatbotSettings {
  isEnabled: boolean;
  basePrompt: string;
  enhancedPrompt: string;
  temperature: number; // 0.0 to 1.0
}

export interface HomepageSettings {
  storeName: string;
  heroImageUrl: string;
  featuredProductIds: string[];
  featuredQuestionIds: string[];
  valuePropositions: EditableValueProposition[];
  socialLinks: SocialLink[];
  categories: Category[];
  chatbotSettings: ChatbotSettings;
  copyrightText: string;
  madeByText: string;
}

// Discount Coupons
export interface DiscountCoupon {
  id: string;
  code: string; // Stored as entered, but compared case-insensitively
  discountPercentage: number; // e.g., 10 for 10%
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  expiresAt?: number; // Optional expiry timestamp
  usageLimit?: number; // Optional max number of uses
  timesUsed?: number; // Counter for how many times it has been used
}

// Chatbot related types
export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  suggestedLink?: string;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}


// For AI generated product descriptions
export interface GeneratedProductDescription {
  productName: string;
  keywords: string[];
  description: string;
}

// For AI news search
export interface NewsSearchResult {
  summary: string;
  sources: string[];
}

// For AI feedback analysis
export interface AnalyzeFeedbackInput {
  reviews: Review[];
  questions: Question[];
}
export interface AnalyzeFeedbackOutput {
  overallSentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
  sentimentReasoning: string;
  keyThemes: string[];
  praisePoints: string[];
  painPoints: string[];
  topUnansweredQuestionTopics: string[];
}

// For AI conversation analysis
export interface AnalyzeConversationsInput {
  conversations: ChatMessage[][];
}
export interface AnalyzeConversationsOutput {
  commonTopics: string[];
  productInterests: string[];
  userPainPoints: string[];
  unansweredQuestions: string[];
  salesOpportunities: string[];
  overallSatisfaction: 'High' | 'Medium' | 'Low';
  satisfactionReasoning: string;
}


// For reports
export interface MonthlySalesSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
}
export interface ProductPerformance {
  productId: string;
  name: string;
  unitsSold: number;
  revenueGenerated: number;
  currentStock: number;
}
export interface QnASummary {
  newQuestions: number;
  answeredQuestions: number;
}
export interface ReviewSummary {
  newReviews: number;
  averageNewRating: number;
}
export interface MonthlyReportData {
  salesSummary: MonthlySalesSummary;
  topSellingProducts: ProductPerformance[]; // Sorted by unitsSold desc
  detailedProductPerformance: ProductPerformance[];
  qnaSummary: QnASummary;
  reviewSummary: ReviewSummary;
}


export type SortOption =
  | 'default'
  | 'price-asc'
  | 'price-desc'
  | 'name-asc'
  | 'name-desc'
  | 'likes-desc'
  | 'rating-desc';

export interface FilterOptions {
  category?: Category | 'all';
  searchTerm?: string;
  sortOption?: SortOption;
  showWishlistOnly?: boolean;
}
