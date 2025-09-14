# إعدادات النشر المختلفة - Different Deployment Configurations

## 1. للنشر على Vercel/Netlify (مع الميزات الكاملة)
## For Vercel/Netlify Deployment (with full features)

Use the default `next.config.ts` as-is.

### Vercel
```bash
npm install -g vercel
vercel login
vercel
```

### Netlify
```bash
npm run build
# Upload .next folder to Netlify
```

## 2. للتصدير الثابت (محدود الميزات) 
## For Static Export (limited features)

### تفعيل التصدير الثابت / Enable Static Export

في `next.config.ts`، قم بإلغاء التعليق عن:
In `next.config.ts`, uncomment:

```typescript
output: 'export',
trailingSlash: true,
images: {
  unoptimized: true,
}
```

### بناء النسخة الثابتة / Build Static Version
```bash
npm run build
```

سيتم إنشاء مجلد `out/` يحتوي على الملفات الثابتة.
This will create an `out/` folder with static files.

### الميزات المتاحة في التصدير الثابت / Features Available in Static Export
- ✅ واجهة المستخدم الأساسية / Basic UI
- ✅ التصفح بين الصفحات / Page navigation  
- ✅ التصميم المرئي / Visual design
- ❌ قاعدة البيانات / Database
- ❌ الذكاء الاصطناعي / AI features
- ❌ العربة التفاعلية / Interactive cart
- ❌ المعالجة الديناميكية / Dynamic processing

## 3. إعدادات البيئة لكل منصة
## Environment Settings for Each Platform

### Vercel
Add in Vercel dashboard > Settings > Environment Variables

### Netlify  
Add in Netlify dashboard > Site settings > Environment variables

### Firebase
```bash
firebase functions:config:set app.firebase_api_key="your_key"
# ... other configs
```

## 4. أوامر النشر السريع / Quick Deployment Commands

```bash
# Vercel (الموصى به / Recommended)
npm run deploy:vercel

# Firebase App Hosting
npm run deploy:firebase

# Static export for any static host
# (Enable static export in next.config.ts first)
npm run build
# Then upload 'out' folder to your static host
```

## الدعم الفني / Technical Support

للمساعدة في النشر، راجع:
For deployment help, see:

- `DEPLOYMENT.md` - دليل النشر الشامل
- `README.md` - معلومات المشروع الأساسية  
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)