import React, { useState, useEffect } from 'react';
import LanguageContext from './LanguageContext';
import { translations, partyTranslations } from './constants/translations';

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');

  useEffect(() => {
    localStorage.setItem('language', language);
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: language }));
  }, [language]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'language' && e.newValue) {
        setLanguage(e.newValue);
      }
    };

    const handleLanguageChange = (e) => {
      setLanguage(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('languageChanged', handleLanguageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ne' : 'en'));
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, translations, partyTranslations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
