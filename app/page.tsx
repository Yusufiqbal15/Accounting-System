'use client';

import { I18nextProvider } from 'react-i18next';
import i18n from './src/i18n/config';
import { LanguageProvider } from './src/contexts/LanguageContext';
import App from './src/app/App';

export default function Home() {
  return (
    <I18nextProvider i18n={i18n}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </I18nextProvider>
  );
}
