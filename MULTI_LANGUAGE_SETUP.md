# Multi-Language Support (English & Arabic) - Setup Complete

## Overview
Your ERP project now has full internationalization (i18n) support with English and Arabic (UAE) languages enabled. The system includes:

- **Language Switcher Button**: Available on login screen and sidebar
- **RTL Support**: Full right-to-left layout for Arabic
- **Translation Files**: Comprehensive English and Arabic translations
- **Language Persistence**: Selected language is saved to localStorage
- **Auto-Direction**: HTML dir attribute automatically switches between "ltr" and "rtl"

## What's Been Added

### 1. **Dependencies Installed**
```bash
- i18next
- react-i18next
- i18next-browser-languagedetector
```

### 2. **File Structure Created**
```
src/
├── i18n/
│   ├── config.ts
│   └── locales/
│       ├── en.json (English translations)
│       └── ar.json (Arabic translations)
├── contexts/
│   └── LanguageContext.tsx (Language state management)
├── styles/
│   └── rtl.css (RTL styling support)
└── app/
    └── components/
        └── LanguageSwitcher.tsx (Language switcher component)
```

### 3. **Updated Components**
- **App.tsx**: Wrapped with i18n provider and LanguageProvider
- **Sidebar.tsx**: Added language switcher button, translated navigation items
- **LoginScreen.tsx**: Added language switcher on login page
- **Dashboard.tsx**: Integrated translations
- **Layout.tsx**: Added i18n import and RTL dir support

## How to Use

### Language Switcher
The language switcher appears in two places:

1. **Login Screen** (Top Right Corner)
   - Click "EN" for English
   - Click "العربية" for Arabic

2. **Sidebar** (Below Logo)
   - Two buttons for switching between languages
   - Active language is highlighted

### Translation Keys Structure

The translation files are organized by sections:
- **nav**: Navigation menu items
- **common**: Common UI elements (buttons, etc.)
- **login**: Login screen text
- **dashboard**: Dashboard-specific text
- **inventory**: Inventory management text
- **sales**: Sales module text
- **purchases**: Purchase module text
- **production**: Production management text
- **customers**: Customer management text
- **suppliers**: Supplier management text
- **accounting**: Accounting module text
- **reports**: Reports section text
- **language**: Language labels

## Adding Translations to New Components

### Example: Translating a Component

1. **Import the hook:**
```tsx
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation();
  // Now use t('key.path') to get translated text
}
```

2. **Replace hardcoded strings:**
```tsx
// Before
<button>Add Item</button>

// After
<button>{t('inventory.addItem')}</button>
```

3. **Add translation keys to JSON files:**
```json
// en.json
{
  "inventory": {
    "addItem": "Add Item"
  }
}

// ar.json
{
  "inventory": {
    "addItem": "إضافة عنصر"
  }
}
```

## RTL (Right-to-Left) Styling

The project automatically handles RTL styling for Arabic:

- **Layout**: Flexbox items reverse direction
- **Text Alignment**: Switches between left and right
- **Borders**: Left borders become right borders (e.g., sidebar card accent)
- **Padding/Margin**: Left/right values swap
- **Input Direction**: Text inputs automatically set to RTL

The `rtl.css` file handles all RTL transformations automatically when `html[dir="rtl"]` is set.

## Language Persistence

Selected language is automatically saved to `localStorage` and restored on page reload:
```
localStorage.getItem('language') // Returns 'en' or 'ar'
```

## Context Usage

To access language in any component:

```tsx
import { useLanguage } from '../contexts/LanguageContext';

export function MyComponent() {
  const { language, setLanguage, isArabic } = useLanguage();
  
  // language: current language code ('en' or 'ar')
  // setLanguage: function to change language
  // isArabic: boolean for conditional rendering
}
```

## Components to Translate Next

These components should be updated with translation keys:

1. **InventoryManagement.tsx**
2. **ItemsManagement.tsx**
3. **PurchaseModule.tsx**
4. **SalesModule.tsx**
5. **ProductionBOM.tsx**
6. **ProductionManagement.tsx**
7. **WorkOrders.tsx**
8. **RepairMaintenance.tsx**
9. **CustomerManagement.tsx**
10. **SupplierManagement.tsx**
11. **AccountingModule.tsx**
12. **ReportsScreen.tsx**
13. **FinancialReports.tsx**
14. **VATModule.tsx**
15. **SettingsScreen.tsx**

## Quick Start

1. **Run the project:**
```bash
cd main
npm run dev
```

2. **Test Language Switching:**
   - Go to login screen
   - Click "EN" or "العربية" button
   - See the interface language change
   - Login to see sidebar language switcher

3. **Check RTL:**
   - Switch to Arabic
   - Notice layout flips to right-to-left
   - Text aligns right
   - Sidebar moves to right side (when implemented)

## Adding More Languages

To add another language (e.g., French):

1. Create `src/i18n/locales/fr.json`
2. Update `src/i18n/config.ts`:
```tsx
import frTranslations from './locales/fr.json';

const resources = {
  en: { translation: enTranslations },
  ar: { translation: arTranslations },
  fr: { translation: frTranslations },
};
```

3. Add button to LanguageSwitcher component

## Troubleshooting

### Translation not appearing?
- Check the key path is correct: `t('section.key')`
- Verify key exists in both en.json and ar.json
- Check browser console for i18next warnings

### RTL not working?
- Verify `html[dir="rtl"]` is set (check DevTools)
- Clear browser cache
- Check that rtl.css is imported in index.css

### Language not persisting?
- Check localStorage is enabled
- Verify `setLanguage()` is being called
- Check browser console for errors

## Support

For more information on i18next, visit: https://www.i18next.com/
