'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { es } from '@/i18n/es';
import { en } from '@/i18n/en';

type Language = 'es' | 'en';
type Dictionary = typeof es;

interface LanguageContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [lang, setLang] = useState<Language>('es');

    const t = (key: string) => {
        const dictionary: any = lang === 'es' ? es : en;
        const keys = key.split('.');
        let value = dictionary;

        for (const k of keys) {
            value = value[k];
            if (!value) return key;
        }
        return value;
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage debe usarse dentro de un LanguageProvider');
    return context;
};