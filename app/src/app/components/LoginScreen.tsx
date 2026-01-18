'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Factory, Globe } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950">
      {/* Language Switcher Top Right */}
      <div className="absolute top-6 right-6 flex gap-2">
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
          {t('language.arabic')}
        </Button>
      </div>

      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-blue-900 flex items-center justify-center">
              <Factory className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Manufacturing ERP System</CardTitle>
          <CardDescription>
            {t('login.title')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('login.email')}</Label>
              <Input
                id="email"
                type="text"
                placeholder={t('login.email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('login.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('login.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11 bg-blue-900 hover:bg-blue-800">
              {t('login.login')}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Wood & Manufacturing Business Solutions
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
