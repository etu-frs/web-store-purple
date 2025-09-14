# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at `src/app/page.tsx`.

---

# Running the Application (Locally or in other environments)

To set up and run this project on a cloud development environment like Replit or your local machine, please follow these steps in detail.

## Prerequisites

-   **Node.js**: Ensure the development environment supports a recent version of Node.js (version 18 or later). (Most cloud environments provide this automatically).
-   **Google Cloud Account**: You will need it to get Firebase and Google AI (Gemini) keys.

## Step 1: Install Dependencies

Open the terminal (Terminal/Shell) in the project folder and run the following command to install all required packages:

```bash
npm install
```

## Step 2: Set Up Environment Secrets

This is the most important step to connect the application with external services like Firebase and Google AI. In cloud development environments like Replit, **do not create a `.env` file**. Instead, use the built-in Secrets management tool.

1.  **Open the Secrets tool:** In the development environment's UI, look for a section called "Secrets" or "Environment Variables" (usually a key or lock icon).

2.  **Add the following variables:** Add each of the following variables with its correct value. Enter the variable name in the "Key" field and the value in the "Value" field.

    *   `NEXT_PUBLIC_FIREBASE_API_KEY`
    *   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
    *   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
    *   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
    *   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
    *   `NEXT_PUBLIC_FIREBASE_APP_ID`
    *   `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
    *   `GOOGLE_API_KEY`
    *   `TELEGRAM_BOT_TOKEN`
    *   `TELEGRAM_CHAT_ID`

3.  **Where to get the values:**
    *   **Firebase Data:**
        *   Go to the [Firebase Console](https://console.firebase.google.com/).
        *   Select your project (or create a new one).
        *   Go to "Project Settings" by clicking the gear icon.
        *   In the "General" tab, you will find the "Your apps" section.
        *   Click on the `</>` (Web app) icon to find the `firebaseConfig`. Copy the corresponding values and place them in the secrets tool.
    *   **Google AI Key (Gemini):**
        *   Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
        *   Create a new API key and copy it.
    *   **Telegram Data (Optional):**
        *   **To get the Token:** Search for `@BotFather` on Telegram, start a chat with him, and use the `/newbot` command to create a new bot. BotFather will give you a token for your bot.
        *   **To get the Chat ID:** Search for `@userinfobot` on Telegram and start a chat with him. He will send you your account information, including your `Id`. This is the `TELEGRAM_CHAT_ID`.

> **Important Note:** If you are working on your local machine, you can create a `.env` file and paste the list of variables into it.

## Step 3: Run the Development Servers

This application has two main parts that must run at the same time: the **Web App (Next.js)** and the **AI Server (Genkit)**. You will need to open two separate terminals/shells.

**First Terminal - Run the Web App:**

In the first terminal, run the following command:

```bash
npm run dev
```

This will run the store's user interface. The development environment (like Replit) will automatically open a preview window or provide you with a public link to access the application.

**Second Terminal - Run the Genkit Server:**

In the second terminal, run the following command:

```bash
npm run genkit:watch
```

This will run the Genkit server which handles all AI requests.

> **Important Note:** Both servers must run together for the application to function fully.

## Step 4: Building for Production

When you are ready to deploy the application, you can use the following commands:

1.  **To build an optimized version of the app:**

    ```bash
    npm run build
    ```

2.  **To run the production server:**

    ```bash
    npm start
    ```

With these steps, the application should run completely in your new environment. If you encounter any issues, first check that all environment variables are correct.

---

# System Architecture & Documentation

## Overview
This is a comprehensive e-commerce store application named "MyDukaan", built with Next.js and the modern React ecosystem. The project is designed to provide a full-featured online shopping experience, from browsing products to completing orders, along with a powerful admin dashboard for store management and AI-driven features for enhanced user interaction and operational efficiency.

## System Architecture

### Backend Architecture
- **Framework**: Next.js 15+ with App Router for server-side rendering (SSR) and static site generation (SSG).
- **Core Features**: React Server Components for performance, and Server Actions for data mutations without dedicated API endpoints.
- **Database**: Google Firebase (Firestore) for real-time, scalable, NoSQL data storage (products, orders, users, etc.).
- **AI Integration**: Google's Genkit framework to power AI features, including a store assistant chatbot and automated product description generation using the Gemini model.
- **Real-time Notifications**: Telegram Bot API for instant notifications to the store administrator for new orders and contact messages.

### Frontend Architecture
- **Library**: React 18+ for building interactive user interfaces.
- **UI Components**: ShadCN UI, a collection of beautifully designed, accessible, and customizable components.
- **Styling**: Tailwind CSS for a utility-first styling approach, with custom themes defined in `globals.css`.
- **Icons**: `lucide-react` for a clean and consistent icon set.
- **State Management**: React Context API for managing global application state (cart, wishlist, user session, etc.).

## Data Storage Solutions
- **Primary Database**: Firebase Firestore for all core application data (products, orders, reviews, Q&A, settings).
- **Client-side State**: Browser `localStorage` is used via the `useLocalStorage` hook to persist user preferences like theme, admin authentication status, and chatbot visibility.
- **Configuration**: Environment variables (`.env` for local, Replit Secrets for cloud) manage sensitive API keys and credentials.

## Key Components
- **Product Management**: Full CRUD (Create, Read, Update, Delete) functionality for products via the admin dashboard, including image uploads and keyword management.
- **E-commerce Core**:
  - Wishlist and product "like" functionality.
  - Shopping cart with real-time updates.
  - Multi-step checkout process with address validation and discount code support.
  - Order tracking for customers.
- **Admin Dashboard**: A secure, role-based area for store management, including:
  - Viewing and managing orders, products, reviews, Q&A, and discount coupons.
  - An analytics dashboard providing key store metrics and a monthly report generator.
- **AI-Powered Features (Genkit)**:
  - **Store Assistant Chatbot**: An interactive chatbot that can answer questions about products and the store, and guide users to product pages.
  - **Product Description Generation**: AI-powered tool to help admins write compelling product descriptions.
- **Notification System**:
  - Instant Telegram alerts for new orders and contact form submissions.

## Data Flow
- **Checkout Flow**:
  1. User adds items to the cart.
  2. Proceeds to checkout, fills in shipping address, and selects a payment method.
  3. A transaction is initiated in Firestore to check stock and create the order simultaneously.
  4. On success, the product stock is decremented, the cart is cleared, and the user is redirected to a confirmation page.
  5. A Telegram notification is triggered.
- **AI Chatbot Flow**:
  1. User sends a query to the chatbot.
  2. A context is prepared, including simplified product and Q&A data from the app's state.
  3. The context and user query are sent to a Genkit flow.
  4. The Genkit flow uses the Gemini model to generate a response, potentially including a product ID to suggest.
  5. The response is displayed in the chat UI, with a special button if a product link is suggested.
- **Admin Data Flow**:
  1. Admin logs in with a password.
  2. The dashboard components fetch real-time data from Firestore via the central `AppContext`.
  3. All admin actions (e.g., updating an order status) directly call functions that update the Firestore database.

## External Dependencies

### Required Services
- **Firebase**: Firestore is required as the primary database.
- **Google AI**: A `GOOGLE_API_KEY` for the Gemini model is necessary for all AI features.
- **Telegram Bot API**: A `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are needed for admin notifications.
- **OpenStreetMap**: Used for the "Use My Location" feature in the checkout form (no API key needed).

### Key NPM Packages
- **Framework**: `next`, `react`, `react-dom`
- **AI**: `genkit`, `@genkit-ai/googleai`, `@genkit-ai/next`
- **Database**: `firebase`
- **UI & Styling**: `tailwindcss`, `shadcn-ui` (various `@radix-ui` packages), `lucide-react`, `clsx`, `tailwind-merge`
- **Forms**: `react-hook-form`, `zod`

## Deployment Strategy

### ⚠️ Webflow Deployment Note | ملاحظة مهمة حول Webflow

**English**: This Next.js application **cannot be directly deployed to Webflow** due to fundamental incompatibilities. Webflow only supports static HTML/CSS/JS, while this app requires server-side features, databases, and dynamic processing. See `DEPLOYMENT.md` for detailed alternatives.

**العربية**: هذا التطبيق المبني بـ Next.js **لا يمكن نشره مباشرة على Webflow** بسبب عدم التوافق الأساسي. Webflow يدعم فقط الملفات الثابتة، بينما هذا التطبيق يحتاج لميزات الخادم وقواعد البيانات. راجع `DEPLOYMENT.md` للبدائل المفصلة.

**Recommended Platforms | المنصات الموصى بها:**
- ✅ **Vercel** (Best for Next.js | الأفضل للـ Next.js)
- ✅ **Netlify** (Good alternative | بديل جيد)  
- ✅ **Firebase App Hosting** (Google integration | تكامل مع Google)

### Local Development
- **Prerequisites**: Node.js (v18+) and npm.
- **Setup**: Run `npm install` to install dependencies.
- **Environment**: Create a `.env` file with all required API keys.
- **Running the App**: Requires two separate terminal sessions:
  1. `npm run dev` to start the Next.js development server (port 9002).
  2. `npm run genkit:watch` to start the Genkit development server.

### Production Deployment Options

#### 1. Vercel (Recommended | موصى به)
```bash
npm install -g vercel
vercel login
npm run deploy:vercel
```

#### 2. Netlify
```bash
npm run build
# Upload .next folder to Netlify
```

#### 3. Firebase App Hosting
```bash
npm run deploy:firebase
```

#### 4. Static Export (Limited Features | ميزات محدودة)
For static hosting platforms (not recommended for full functionality):
```bash
# Enable static export in next.config.ts first
npm run build
# Upload 'out' folder to any static host
```

**Note**: Static export loses database, AI, and real-time features.

### Quick Start Deployment

1. **Read the comprehensive guide**: `DEPLOYMENT.md`
2. **Configure environment variables** on your chosen platform
3. **Deploy using platform-specific commands** above

For detailed deployment instructions in Arabic and English, see [`DEPLOYMENT.md`](./DEPLOYMENT.md) and [`DEPLOYMENT_CONFIG.md`](./DEPLOYMENT_CONFIG.md).

## Configuration Management
All sensitive information is managed through environment variables. The required variables are:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `GOOGLE_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
