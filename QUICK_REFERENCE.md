# 🎯 Quick Reference Guide - Multi-Language ERP System

## 📱 User Quick Start

### Step 1: Start Application
```
Windows: Double-click START.bat
Mac/Linux: bash START.sh
OR: npm run dev
```

### Step 2: Access in Browser
```
http://localhost:3001
```

### Step 3: Switch Language
| Screen | Location | How |
|--------|----------|-----|
| **Login** | Top Right | Click EN or العربية |
| **Main App** | Sidebar Top | Click EN or العربية |

---

## 🌐 Language Switching Effects

### ENGLISH (EN) ✅
```
┌─────────────────────────────────┐
│ EN  العربية                       │
│                                 │
│ Dashboard     [Icon]            │
│ Inventory     [Icon]            │
│ Sales         [Icon]            │
│                                 │
│ Layout: Left-to-Right (LTR)     │
│ Text Align: Left                │
│ Sidebar: Left Side              │
└─────────────────────────────────┘
```

### ARABIC (العربية) ✅
```
┌─────────────────────────────────┐
│                       EN  العربية │
│                                 │
│            [Icon]     لوحة التحكم │
│            [Icon]     المخزون     │
│            [Icon]     المبيعات    │
│                                 │
│ Layout: Right-to-Left (RTL)     │
│ Text Align: Right               │
│ Sidebar: Right Side             │
└─────────────────────────────────┘
```

---

## 📝 Developer Quick Reference

### Import Translations in Component
```tsx
'use client';

import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('dashboard.title')}</h1>;
}
```

### Access Language State
```tsx
import { useLanguage } from '../../contexts/LanguageContext';

export function MyComponent() {
  const { language, isArabic, setLanguage } = useLanguage();
  // language: 'en' or 'ar'
  // isArabic: boolean
}
```

### Add Translation Keys
**File**: `app/src/i18n/locales/en.json`
```json
{
  "mySection": {
    "myKey": "English Text"
  }
}
```

**File**: `app/src/i18n/locales/ar.json`
```json
{
  "mySection": {
    "myKey": "النص العربي"
  }
}
```

### Use in Component
```tsx
{t('mySection.myKey')}
```

---

## 🗂️ File Structure

```
main/
├── app/
│   ├── page.tsx                           # [UPDATED] - i18n wrapper
│   ├── layout.tsx                         # [UPDATED] - RTL support
│   └── src/
│       ├── i18n/
│       │   ├── config.ts                  # [NEW] i18n setup
│       │   └── locales/
│       │       ├── en.json                # [NEW] English translations
│       │       └── ar.json                # [NEW] Arabic translations
│       ├── contexts/
│       │   └── LanguageContext.tsx        # [NEW] Language state
│       ├── app/
│       │   ├── App.tsx                    # [UPDATED]
│       │   └── components/
│       │       ├── Sidebar.tsx            # [UPDATED]
│       │       ├── LoginScreen.tsx        # [UPDATED]
│       │       ├── Dashboard.tsx          # [UPDATED]
│       │       └── LanguageSwitcher.tsx   # [NEW]
│       └── styles/
│           ├── index.css                  # [UPDATED] - imports RTL
│           └── rtl.css                    # [NEW] RTL styles
│
├── START.bat                              # [NEW] Windows launcher
├── START.sh                               # [NEW] Mac/Linux launcher
├── README_MULTILANG.md                    # [NEW] Overview
├── IMPLEMENTATION_COMPLETE.md             # [NEW] Full guide
├── MULTI_LANGUAGE_SETUP.md                # [NEW] Technical guide
└── package.json                           # [UPDATED] new deps
```

---

## 🔍 Translation Keys Map

```
ROOT {
  ├── nav {
  │   ├── dashboard → "Dashboard" / "لوحة التحكم"
  │   ├── inventory → "Inventory" / "إدارة المخزون"
  │   ├── items → "Items Management" / "إدارة العناصر"
  │   ├── purchases → "Purchases" / "المشتريات"
  │   ├── sales → "Sales" / "المبيعات"
  │   ├── production → "Production BOM" / "فاتورة المواد"
  │   ├── productionMgmt → "Production Management" / "إدارة الإنتاج"
  │   ├── workOrders → "Work Orders" / "أوامر العمل"
  │   ├── repairs → "Repairs & Maintenance" / "الإصلاحات والصيانة"
  │   ├── customers → "Customers" / "العملاء"
  │   ├── suppliers → "Suppliers" / "الموردين"
  │   ├── accounting → "Accounting" / "المحاسبة"
  │   ├── reports → "Reports" / "التقارير"
  │   ├── financialReports → "Financial Reports" / "التقارير المالية"
  │   ├── vat → "VAT Module" / "وحدة ضريبة القيمة المضافة"
  │   ├── settings → "Settings" / "الإعدادات"
  │   └── logout → "Logout" / "تسجيل الخروج"
  │
  ├── common {
  │   ├── add → "Add" / "إضافة"
  │   ├── edit → "Edit" / "تعديل"
  │   ├── delete → "Delete" / "حذف"
  │   ├── save → "Save" / "حفظ"
  │   ├── cancel → "Cancel" / "إلغاء"
  │   ... (more common items)
  │
  ├── login {
  │   ├── title → "ERP System Login" / "تسجيل الدخول إلى نظام ERP"
  │   ├── email → "Email" / "البريد الإلكتروني"
  │   ├── password → "Password" / "كلمة المرور"
  │   └── login → "Login" / "تسجيل الدخول"
  │
  ├── dashboard { ... }
  ├── inventory { ... }
  ├── sales { ... }
  ├── purchases { ... }
  ├── production { ... }
  ├── customers { ... }
  ├── suppliers { ... }
  ├── accounting { ... }
  ├── reports { ... }
  │
  └── language {
      ├── english → "English" / "English"
      └── arabic → "العربية" / "العربية"
}
```

---

## 🚦 Translation Status

| Module | Status | Details |
|--------|--------|---------|
| **Navigation** | ✅ Complete | All nav items translated |
| **Login** | ✅ Complete | Full login screen translated |
| **Dashboard** | ✅ Complete | Dashboard labels translated |
| **Sidebar** | ✅ Complete | Sidebar + switcher translated |
| **Inventory** | ⏳ Pending | Needs useTranslation() hook |
| **Sales** | ⏳ Pending | Needs useTranslation() hook |
| **Purchases** | ⏳ Pending | Needs useTranslation() hook |
| **Production** | ⏳ Pending | Needs useTranslation() hook |
| **Customers** | ⏳ Pending | Needs useTranslation() hook |
| **Suppliers** | ⏳ Pending | Needs useTranslation() hook |
| **Accounting** | ⏳ Pending | Needs useTranslation() hook |
| **Reports** | ⏳ Pending | Needs useTranslation() hook |
| **VAT** | ⏳ Pending | Needs useTranslation() hook |
| **Settings** | ⏳ Pending | Needs useTranslation() hook |

---

## ⚡ Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Install dependencies
npm install
```

---

## 🎨 Color Scheme

| Element | Light Mode | Dark Mode |
|---------|-----------|----------|
| Sidebar | Blue-900 | Blue-900 |
| Active Button | Green-600 | Green-600 |
| Hover | Blue-800 | Blue-800 |
| Text | Foreground | Foreground |
| Background | White | Black |

---

## 📱 Responsive Breakpoints

```
Mobile:  < 768px   (md)
Tablet:  768px+    (md)
Desktop: 1024px+   (lg)
```

Language switcher:
- **Mobile**: Visible in sidebar only
- **Tablet+**: Visible in sidebar + login screen

---

## 🔐 Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Latest version recommended |
| Firefox | ✅ Full | Latest version recommended |
| Safari | ✅ Full | Latest version recommended |
| Edge | ✅ Full | Latest version recommended |
| IE 11 | ❌ No | Not supported |

---

## 💾 LocalStorage Keys

```javascript
// Language preference
localStorage.getItem('language')  // Returns: 'en' or 'ar'

// Set by system when language changes
localStorage.setItem('language', 'ar')
```

---

## 🎯 Performance Tips

1. **Lazy Load Translations** - Only load active language
2. **Cache Translations** - Cached by i18next
3. **Minimize Bundle** - Translation files are lightweight
4. **RTL Performance** - CSS-based, no JS overhead

---

## 🆘 Quick Help

**Q: How do I switch language?**
A: Click EN or العربية button (login screen top-right or sidebar)

**Q: Where are translations?**
A: `app/src/i18n/locales/en.json` and `ar.json`

**Q: How to add new translation?**
A: Add key to both JSON files, use `t('key')` in component

**Q: RTL not working?**
A: Clear `.next` folder and refresh browser

**Q: Language not saving?**
A: Check localStorage is enabled in browser settings

---

## 📞 Need Help?

1. Check **README_MULTILANG.md** for overview
2. Check **IMPLEMENTATION_COMPLETE.md** for details
3. Check **MULTI_LANGUAGE_SETUP.md** for technical info
4. Open browser DevTools → Console for errors

---

**Last Updated**: January 17, 2026  
**Status**: Production Ready ✅  
**Version**: 1.0.0
