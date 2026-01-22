import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from '../i18n/translations.json';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // Get language from localStorage or user profile
    const savedLanguage = localStorage.getItem('language');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (user.language) {
      setLanguage(user.language);
    } else if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    
    // Update user language preference in backend
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user._id) {
      user.language = lang;
      localStorage.setItem('user', JSON.stringify(user));
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  const value = {
    language,
    changeLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
