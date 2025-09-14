#!/bin/bash

# تحقق من إمكانية التصدير الثابت
# Static Export Verification Script

echo "🔍 Checking Static Export Compatibility..."
echo ""

# Check if static export is enabled in next.config.ts
if grep -q "output: 'export'" next.config.ts && ! grep -q "// output: 'export'" next.config.ts; then
    echo "✅ Static export is ENABLED in next.config.ts"
    EXPORT_ENABLED=true
else
    echo "❌ Static export is DISABLED in next.config.ts"
    echo "   To enable: uncomment 'output: export' lines in next.config.ts"
    EXPORT_ENABLED=false
fi

echo ""
echo "📋 Static Export Impact Analysis:"
echo ""

echo "✅ Features that WILL work with static export:"
echo "   - Basic UI and styling"
echo "   - Product browsing (if products are pre-built)"
echo "   - Static pages (About, Contact forms without backend)"
echo "   - Client-side routing between pages"
echo ""

echo "❌ Features that will NOT work with static export:"
echo "   - Firebase database integration"
echo "   - AI chatbot functionality"
echo "   - Real-time cart updates"
echo "   - Order processing and payments"
echo "   - Admin dashboard"
echo "   - User authentication"
echo "   - Server actions and API routes"
echo "   - Dynamic content updates"
echo ""

echo "🎯 Recommended Alternatives to Webflow:"
echo "   1. Vercel (Best for Next.js) - https://vercel.com"
echo "   2. Netlify (Good alternative) - https://netlify.com"
echo "   3. Firebase App Hosting - https://firebase.google.com/docs/app-hosting"
echo ""

if [ "$EXPORT_ENABLED" = true ]; then
    echo "🚀 To build static version:"
    echo "   npm run build"
    echo "   # Files will be in 'out' folder"
else
    echo "🚀 To test static export:"
    echo "   1. Edit next.config.ts - uncomment static export lines"
    echo "   2. Run: npm run build"
    echo "   3. Check 'out' folder for static files"
fi

echo ""
echo "📚 For detailed deployment guide, see:"
echo "   - DEPLOYMENT.md (comprehensive guide)"
echo "   - DEPLOYMENT_CONFIG.md (configuration examples)"