'use client';

import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from './ui/button';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, isArabic } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4" />
      <Button
        variant={language === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setLanguage('en')}
        className="min-w-12"
      >
        EN
      </Button>
      <Button
        variant={language === 'ar' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setLanguage('ar')}
        className="min-w-12"
      >
        العربية
      </Button>
    </div>
  );
};
