
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import type { Product, CartItem, Order, Review, Question, Category, FilterOptions, MonthlyReportData, OrderStatus, HomepageSettings, DiscountCoupon, OrderStatusUpdate, ChatSession, ChatMessage } from '@/lib/types';
import { INITIAL_PRODUCTS, INITIAL_QUESTIONS, INITIAL_REVIEWS, INITIAL_HOMEPAGE_SETTINGS, INITIAL_DISCOUNT_COUPONS } from '@/data/seed';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
  addDoc,
  query,
  orderBy,
  runTransaction,
  increment,
  Timestamp,
} from 'firebase/firestore';
import useLocalStorage from '@/hooks/useLocalStorage';
import { sendNewOrderNotification } from '@/app/actions/telegramActions';

const GUEST_USER_ID = "guestUser123"; // A static ID for the guest user

// Defines the structure for user-specific data stored in Firestore
interface UserData {
  cart: CartItem[];
  wishlist: string[];
  likedProducts: string[];
  usedCoupons: string[];
}

interface AppContextType {
  cart: CartItem[];
  wishlist: string[];
  likedProducts: string[];
  theme: 'light' | 'dark';
  filterOptions: FilterOptions;
  isChatbotIconVisible: boolean;
  products: Product[];
  orders: Order[];
  questions: Question[];
  reviews: Review[];
  discountCoupons: DiscountCoupon[];
  chatSessions: ChatSession[];
  homepageSettings: HomepageSettings;
  isAdminAuthenticated: boolean;
  isAuthInitialized: boolean;
  appDataLoaded: boolean;
  setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptions>>;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleLikeProduct: (productId: string) => void;
  isProductLiked: (productId: string) => boolean;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory' | 'currentStatus' | 'userId'>) => Promise<string | null>;
  updateOrderStatus: (orderId: string, status: Order['currentStatus'], note?: string) => void;
  addQuestion: (question: Omit<Question, 'id' | 'createdAt'>) => Promise<void>;
  answerQuestion: (questionId: string, answerText: string) => void;
  deleteQuestion: (questionId: string) => void;
  editAnswer: (questionId: string, answerText: string) => void;
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => Promise<void>;
  deleteReview: (reviewId: string) => void;
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;
  toggleTheme: () => void;
  setIsChatbotIconVisible: (isVisible: boolean | ((prevState: boolean) => boolean)) => void;
  getProductById: (productId: string) => Product | undefined;
  getOrderById: (orderId: string) => Order | undefined;
  getReviewsForProduct: (productId: string) => Review[];
  getQuestionsForProduct: (productId: string) => Question[];
  getGeneralQuestions: () => Question[];
  categories: Category[];
  updateProduct: (updatedProduct: Product) => void;
  deleteProduct: (productId: string) => void;
  addProduct: (newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'numReviews' | 'likes'>) => void;
  generateMonthlyReport: (year: number, month: number) => MonthlyReportData | null;
  setHomepageSettings: (settings: HomepageSettings | ((prevState: HomepageSettings) => HomepageSettings)) => Promise<void>;
  addDiscountCoupon: (couponData: Omit<DiscountCoupon, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  updateDiscountCoupon: (coupon: DiscountCoupon) => void;
  deleteDiscountCoupon: (couponId: string) => void;
  getDiscountCouponByCode: (code: string) => DiscountCoupon | undefined;
  hasUserUsedCoupon: (couponCode: string) => boolean;
  saveChatSession: (sessionId: string, messages: ChatMessage[]) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  
  // Global, non-user-specific data
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [discountCoupons, setDiscountCoupons] = useState<DiscountCoupon[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [homepageSettings, setLocalHomepageSettings] = useState<HomepageSettings>(INITIAL_HOMEPAGE_SETTINGS);

  // User-specific data, fetched from Firestore
  const [userData, setUserData] = useState<UserData>({ cart: [], wishlist: [], likedProducts: [], usedCoupons: [] });

  // Browser-specific preferences, can remain in localStorage
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('mydukaan_theme', 'light');
  const [isAdminAuthenticated, setIsAdminAuthenticated, isAuthInitialized] = useLocalStorage<boolean>('mydukaan_admin_auth', false);
  const [isChatbotIconVisible, setIsChatbotIconVisible] = useLocalStorage<boolean>('mydukaan_chatbot_visible', true);
  
  // Loading state management
  const [globalDataLoaded, setGlobalDataLoaded] = useState(false);
  const [userDataLoaded, setUserDataLoaded] = useState(false);
  const appDataLoaded = globalDataLoaded && userDataLoaded && isAuthInitialized;

  // Local state for filters
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ category: 'all', searchTerm: '', sortOption: 'default', showWishlistOnly: false });

  // Apply theme to document
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
    }
  }, [theme]);

  // Firebase listeners setup
  useEffect(() => {
    if (!db) {
      console.warn("Firebase not configured. Using initial seed data for local mode.");
      setProducts(INITIAL_PRODUCTS);
      setQuestions(INITIAL_QUESTIONS);
      setReviews(INITIAL_REVIEWS);
      setLocalHomepageSettings(INITIAL_HOMEPAGE_SETTINGS);
      setDiscountCoupons(INITIAL_DISCOUNT_COUPONS);
      setGlobalDataLoaded(true);
      setUserDataLoaded(true); // No user data to load in local mode
      return;
    }
    
    console.log("Firebase is configured. Setting up real-time data listeners...");
    const unsubscribers: (() => void)[] = [
      onSnapshot(query(collection(db, 'products'), orderBy('createdAt', 'desc')), s => setProducts(s.docs.map(d => ({ id: d.id, ...d.data() } as Product)))),
      onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), s => setOrders(s.docs.map(d => ({ id: d.id, ...d.data() } as Order)))),
      onSnapshot(query(collection(db, 'questions'), orderBy('createdAt', 'desc')), s => setQuestions(s.docs.map(d => ({ id: d.id, ...d.data() } as Question)))),
      onSnapshot(query(collection(db, 'reviews'), orderBy('createdAt', 'desc')), s => setReviews(s.docs.map(d => ({ id: d.id, ...d.data() } as Review)))),
      onSnapshot(query(collection(db, 'coupons'), orderBy('createdAt', 'desc')), s => setDiscountCoupons(s.docs.map(d => ({ id: d.id, ...d.data() } as DiscountCoupon)))),
      onSnapshot(query(collection(db, 'chat_sessions'), orderBy('updatedAt', 'desc')), s => setChatSessions(s.docs.map(d => ({ id: d.id, ...d.data() } as ChatSession)))),
      onSnapshot(doc(db, 'settings', 'homepage'), (s) => {
        if (s.exists()) setLocalHomepageSettings(s.data() as HomepageSettings);
        else setDoc(doc(db, 'settings', 'homepage'), INITIAL_HOMEPAGE_SETTINGS);
      }),
      // User-specific data listener
      onSnapshot(doc(db, 'users', GUEST_USER_ID), (s) => {
        if (s.exists()) {
          setUserData(s.data() as UserData);
        } else {
          // Create the user document if it doesn't exist
          const initialUserData: UserData = { cart: [], wishlist: [], likedProducts: [], usedCoupons: [] };
          setDoc(doc(db, 'users', GUEST_USER_ID), initialUserData);
          setUserData(initialUserData);
        }
        setUserDataLoaded(true);
      })
    ];
    
    setGlobalDataLoaded(true);
    return () => unsubscribers.forEach(unsub => unsub());
  }, []);

  // Memoized getters
  const getProductById = useCallback((id: string) => products.find(p => p.id === id), [products]);
  const getOrderById = useCallback((id: string) => orders.find(o => o.id === id), [orders]);
  const isInWishlist = useCallback((id: string) => userData.wishlist.includes(id), [userData.wishlist]);
  const isProductLiked = useCallback((id: string) => userData.likedProducts.includes(id), [userData.likedProducts]);
  const getReviewsForProduct = useCallback((id: string) => reviews.filter(r => r.productId === id).sort((a,b) => b.createdAt - a.createdAt), [reviews]);
  const getQuestionsForProduct = useCallback((id: string) => questions.filter(q => q.productId === id).sort((a,b) => b.createdAt - a.createdAt), [questions]);
  const getGeneralQuestions = useCallback(() => questions.filter(q => !q.productId).sort((a,b) => b.createdAt - a.createdAt), [questions]);
  const getDiscountCouponByCode = useCallback((code: string) => discountCoupons.find(c => c.code.toUpperCase() === code.toUpperCase()), [discountCoupons]);
  const hasUserUsedCoupon = useCallback((code: string) => userData.usedCoupons.includes(code.toUpperCase()), [userData.usedCoupons]);

  // Firestore-backed actions
  const updateUserDoc = useCallback(async (data: Partial<UserData>) => {
    if (!db) {
      console.warn("DB not connected, cannot update user doc.");
      setUserData(prev => ({...prev, ...data}));
      return;
    };
    await updateDoc(doc(db, 'users', GUEST_USER_ID), data);
  }, []);
  
  const removeFromCart = useCallback(async (productId: string) => {
    const newCart = userData.cart.filter(i => i.productId !== productId);
    await updateUserDoc({ cart: newCart });
    toast({ title: "Item removed from cart" });
  }, [userData.cart, updateUserDoc, toast]);
  
  const addToCart = useCallback(async (product: Product, quantity: number) => {
    const existingItem = userData.cart.find(i => i.productId === product.id);
    if ((existingItem?.quantity ?? 0) + quantity > product.stock) {
      toast({ title: "Not enough stock", variant: "destructive" });
      return;
    }
    const newCart = existingItem
      ? userData.cart.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i)
      : [...userData.cart, { ...product, productId: product.id, quantity, image: product.images[0] }];
    
    await updateUserDoc({ cart: newCart });
    toast({ title: `${quantity} x ${product.name} added to cart` });
  }, [userData.cart, updateUserDoc, toast]);

  const updateCartQuantity = useCallback(async (productId: string, quantity: number) => {
    const itemInCart = userData.cart.find(i => i.productId === productId);
    if (!itemInCart) return;

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const newQuantity = Math.min(quantity, itemInCart.stock);
    const newCart = userData.cart.map(i => i.productId === productId ? { ...i, quantity: newQuantity } : i);
    await updateUserDoc({ cart: newCart });
  }, [userData.cart, updateUserDoc, removeFromCart]);

  const clearCart = useCallback(async () => {
    await updateUserDoc({ cart: [] });
    toast({ title: "Cart cleared" });
  }, [updateUserDoc, toast]);

  const toggleWishlist = useCallback(async (productId: string) => {
    const inWishlist = userData.wishlist.includes(productId);
    const newWishlist = inWishlist
      ? userData.wishlist.filter(id => id !== productId)
      : [...userData.wishlist, productId];
    await updateUserDoc({ wishlist: newWishlist });
    toast({ title: `Item ${inWishlist ? 'removed from' : 'added to'} wishlist.` });
  }, [userData.wishlist, updateUserDoc, toast]);

  const toggleLikeProduct = useCallback(async (productId: string) => {
    if (!db) return;
    const isLiked = userData.likedProducts.includes(productId);
    const newLikedProducts = isLiked
      ? userData.likedProducts.filter(id => id !== productId)
      : [...userData.likedProducts, productId];
      
    const productRef = doc(db, 'products', productId);
    await runTransaction(db, async (transaction) => {
      transaction.update(doc(db, 'users', GUEST_USER_ID), { likedProducts: newLikedProducts });
      transaction.update(productRef, { likes: increment(isLiked ? -1 : 1) });
    });
  }, [userData.likedProducts, db]);

  const addOrder = useCallback(async (orderData: Omit<Order, 'id'|'createdAt'|'updatedAt'|'statusHistory'|'currentStatus'|'userId'>): Promise<string|null> => {
    if (!db) { toast({ title: "Database not connected", variant: "destructive" }); return null; }
    const now = Date.now();
    const newOrderBase = { ...orderData, userId: GUEST_USER_ID, createdAt: now, updatedAt: now, currentStatus: 'Pending Approval' as OrderStatus, statusHistory: [{ status: 'Pending Approval', timestamp: now, notes: "Order placed."} as OrderStatusUpdate] };
    const newOrderId = doc(collection(db, 'orders')).id;
    const newOrder = { ...newOrderBase, id: newOrderId };

    try {
      await runTransaction(db, async (t) => {
        for (const item of orderData.items) {
          const pRef = doc(db, 'products', item.productId);
          const pDoc = await t.get(pRef);
          if (!pDoc.exists() || pDoc.data().stock < item.quantity) throw new Error(`Not enough stock for ${item.name}.`);
          t.update(pRef, { stock: increment(-item.quantity) });
        }
        
        let newUsedCoupons = [...userData.usedCoupons];
        if (orderData.discountCode) {
          const coupon = getDiscountCouponByCode(orderData.discountCode);
          if (coupon) {
              t.update(doc(db, 'coupons', coupon.id), { timesUsed: increment(1) });
              newUsedCoupons.push(orderData.discountCode);
          }
        }
        
        t.update(doc(db, 'users', GUEST_USER_ID), { cart: [], usedCoupons: newUsedCoupons });
        t.set(doc(db, 'orders', newOrderId), newOrder);
      });

      await sendNewOrderNotification(newOrder);
      return newOrderId;
    } catch (e: any) {
      toast({ title: "Order Failed", description: e.message, variant: "destructive" });
      return null;
    }
  }, [db, toast, userData.usedCoupons, getDiscountCouponByCode]);
  
  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus, note?: string) => {
    if (!db) return;
    const now = Date.now();
    const statusUpdate: OrderStatusUpdate = { status, timestamp: now };
    if (note) statusUpdate.notes = note;
    
    const orderRef = doc(db, 'orders', orderId);
    const currentOrder = orders.find(o => o.id === orderId);
    if (currentOrder) {
        const newHistory = [statusUpdate, ...currentOrder.statusHistory];
        await updateDoc(orderRef, { currentStatus: status, updatedAt: now, statusHistory: newHistory });
        toast({ title: "Order Updated" });
    }
  }, [toast, db, orders]);

  const addReview = useCallback(async (data: Omit<Review, 'id'|'createdAt'>) => {
    if (!db) return;
    await addDoc(collection(db, "reviews"), { ...data, createdAt: Date.now() });
    toast({ title: "Review Submitted" });
  }, [db, toast]);

  const deleteReview = useCallback(async (id: string) => {
    if (!db) return;
    await deleteDoc(doc(db, 'reviews', id));
    toast({ title: "Review Deleted" });
  }, [db, toast]);
  
  const addQuestion = useCallback(async (data: Omit<Question, 'id'|'createdAt'>) => {
    if (!db) return;
    await addDoc(collection(db, "questions"), { ...data, createdAt: Date.now() });
    toast({ title: "Question Submitted" });
  }, [db, toast]);

  const answerQuestion = useCallback(async (id: string, text: string) => {
    if (!db) return;
    await updateDoc(doc(db, 'questions', id), { answerText: text, answeredBy: 'Support Team', answeredAt: Date.now() });
    toast({ title: "Question Answered" });
  }, [db, toast]);

  const deleteQuestion = useCallback(async (id: string) => {
    if (!db) return;
    await deleteDoc(doc(db, 'questions', id));
    toast({ title: "Question Deleted" });
  }, [db, toast]);

  const editAnswer = useCallback(async (id: string, text: string) => {
    if (!db) return;
    await updateDoc(doc(db, 'questions', id), { answerText: text.trim() ? text.trim() : null, answeredAt: text.trim() ? Date.now() : null, answeredBy: text.trim() ? 'Support Team' : null });
    toast({ title: "Answer Updated" });
  }, [db, toast]);

  const addProduct = useCallback(async (data: Omit<Product, 'id'|'createdAt'|'updatedAt'|'rating'|'numReviews'|'likes'>) => {
    if (!db) return;
    const now = Date.now();
    await addDoc(collection(db, "products"), { ...data, createdAt: now, updatedAt: now, rating: 0, numReviews: 0, likes: 0 });
    toast({ title: "Product Added" });
  }, [toast, db]);

  const updateProduct = useCallback(async (data: Product) => {
    if (!db) return;
    const { id, ...productData } = data;
    await updateDoc(doc(db, 'products', id), { ...productData, updatedAt: Date.now() });
    toast({ title: "Product Updated" });
  }, [toast, db]);

  const deleteProduct = useCallback(async (id: string) => {
    if (!db) return;
    await deleteDoc(doc(db, 'products', id));
    toast({ title: "Product Deleted" });
  }, [toast, db]);

  const setHomepageSettings = useCallback(async (s: HomepageSettings|((p: HomepageSettings) => HomepageSettings)) => {
    if (!db) { 
        setLocalHomepageSettings(s); 
        return; 
    }
    const newSettings = typeof s === 'function' ? s(homepageSettings) : s;
    await setDoc(doc(db, 'settings', 'homepage'), newSettings, { merge: true });
  }, [homepageSettings, db]);

  const addDiscountCoupon = useCallback((data: Omit<DiscountCoupon, 'id'|'createdAt'|'updatedAt'>) => {
    if (!db) { toast({title: "DB not connected", variant: "destructive"}); return false; }
    const code = data.code.trim().toUpperCase();
    if (discountCoupons.some(c => c.code.toUpperCase() === code)) { toast({title: "Code exists", variant: "destructive"}); return false; }
    setDoc(doc(db, "coupons", code), { ...data, id: code, code, createdAt: Date.now(), updatedAt: Date.now(), timesUsed: 0 });
    toast({ title: "Coupon Added" });
    return true;
  }, [discountCoupons, toast, db]);
  
  const updateDiscountCoupon = useCallback(async (coupon: DiscountCoupon) => {
    if (!db) return;
    const { id, ...couponData } = coupon;
    await updateDoc(doc(db, "coupons", id), { ...couponData, updatedAt: Date.now() });
    toast({ title: "Coupon Updated" });
  }, [toast, db]);

  const deleteDiscountCoupon = useCallback(async (id: string) => {
    if (!db) return;
    await deleteDoc(doc(db, "coupons", id));
    toast({ title: "Coupon Deleted" });
  }, [toast, db]);
  
  const saveChatSession = useCallback(async (id: string, messages: ChatMessage[]) => {
    if (!db) return;
    const now = Date.now();
    await setDoc(doc(db, 'chat_sessions', id), { messages, updatedAt: now, createdAt: Timestamp.fromMillis(now), id }, { merge: true });
  }, [db]);
  
  const generateMonthlyReport = useCallback((year: number, month: number): MonthlyReportData | null => {
      if (!appDataLoaded) return null;
      const start = new Date(year, month - 1, 1).getTime();
      const end = new Date(year, month, 0, 23, 59, 59, 999).getTime();
      const relevantOrders = orders.filter(o => o.createdAt >= start && o.createdAt <= end && !['Cancelled', 'Refunded'].includes(o.currentStatus));
      const totalRevenue = relevantOrders.reduce((s, o) => s + o.totalPrice, 0);
      const performance = products.map(p => {
          const sales = relevantOrders.reduce((a, o) => {
              const item = o.items.find(i => i.productId === p.id);
              if (item) { a.unitsSold += item.quantity; a.revenueGenerated += item.price * item.quantity; }
              return a;
          }, { unitsSold: 0, revenueGenerated: 0 });
          return { productId: p.id, name: p.name, currentStock: p.stock, ...sales };
      });
      return {
          salesSummary: { totalRevenue, totalOrders: relevantOrders.length, averageOrderValue: relevantOrders.length > 0 ? totalRevenue / relevantOrders.length : 0 },
          topSellingProducts: [...performance].sort((a,b) => b.unitsSold - a.unitsSold).slice(0,10),
          detailedProductPerformance: performance,
          qnaSummary: { newQuestions: questions.filter(q => q.createdAt >= start && q.createdAt <= end).length, answeredQuestions: questions.filter(q => q.answeredAt && q.answeredAt >= start && q.answeredAt <= end).length },
          reviewSummary: { newReviews: reviews.filter(r => r.createdAt >= start && r.createdAt <= end).length, averageNewRating: reviews.filter(r => r.createdAt >= start && r.createdAt <= end).reduce((a, r, _, arr) => a + r.rating / arr.length, 0) || 0 },
      };
  }, [appDataLoaded, orders, questions, reviews, products]);
  
  const adminLogin = useCallback((p: string) => { if (p === 'admin123') { setIsAdminAuthenticated(true); toast({ title: "Login Successful" }); return true; } return false; }, [setIsAdminAuthenticated, toast]);
  const adminLogout = useCallback(() => setIsAdminAuthenticated(false), [setIsAdminAuthenticated]);
  const toggleTheme = useCallback(() => setTheme(p => p === 'light' ? 'dark' : 'light'), [setTheme]);

  const value: AppContextType = useMemo(() => ({
    cart: userData.cart, 
    wishlist: userData.wishlist, 
    likedProducts: userData.likedProducts,
    theme, filterOptions, isChatbotIconVisible, products, orders, questions, reviews, discountCoupons, chatSessions, homepageSettings, isAdminAuthenticated, isAuthInitialized, appDataLoaded, setFilterOptions, addToCart, removeFromCart, updateCartQuantity, clearCart, toggleWishlist, isInWishlist, toggleLikeProduct, isProductLiked, addOrder, updateOrderStatus, addQuestion, answerQuestion, deleteQuestion, editAnswer, addReview, deleteReview, adminLogin, adminLogout, toggleTheme, setIsChatbotIconVisible, getProductById, getOrderById, getReviewsForProduct, getQuestionsForProduct, getGeneralQuestions, categories: homepageSettings?.categories || [], updateProduct, deleteProduct, addProduct, generateMonthlyReport, setHomepageSettings, addDiscountCoupon, updateDiscountCoupon, deleteDiscountCoupon, getDiscountCouponByCode, hasUserUsedCoupon, saveChatSession,
  }), [
    userData, theme, filterOptions, isChatbotIconVisible, products, orders, questions, reviews, discountCoupons, chatSessions, homepageSettings, isAdminAuthenticated, isAuthInitialized, appDataLoaded, setFilterOptions, addToCart, removeFromCart, updateCartQuantity, clearCart, toggleWishlist, isInWishlist, toggleLikeProduct, isProductLiked, addOrder, updateOrderStatus, addQuestion, answerQuestion, deleteQuestion, editAnswer, addReview, deleteReview, adminLogin, adminLogout, toggleTheme, setIsChatbotIconVisible, getProductById, getOrderById, getReviewsForProduct, getQuestionsForProduct, getGeneralQuestions, updateProduct, deleteProduct, addProduct, generateMonthlyReport, setHomepageSettings, addDiscountCoupon, updateDiscountCoupon, deleteDiscountCoupon, getDiscountCouponByCode, hasUserUsedCoupon, saveChatSession,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
