'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, ReactNode } from 'react';
import { es } from '@/i18n/es';
import { en } from '@/i18n/en';

export type Language = 'es' | 'en';

interface LanguageContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    /** Devuelve el texto de la clave (ej. "hero.title"). Si no existe, devuelve la clave. */
    t: (key: string) => string;
    /** Devuelve una lista a partir de un texto separado por "|" (ej. etiquetas de tecnología). */
    list: (key: string) => string[];
}

const STORAGE_KEY = 'quasar-lang';
const CHANGE_EVENT = 'quasar-lang-change';
const dictionaries = { es, en } as const;

/* ---- Almacén externo del idioma (localStorage con respaldo en memoria) ---- */
let memoryLang: Language | null = null;

const readLang = (): Language => {
    if (memoryLang) return memoryLang;
    try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved === 'es' || saved === 'en') return saved;
    } catch {
        /* almacenamiento no disponible */
    }
    return 'es';
};

const subscribe = (onChange: () => void) => {
    window.addEventListener(CHANGE_EVENT, onChange);
    window.addEventListener('storage', onChange);
    return () => {
        window.removeEventListener(CHANGE_EVENT, onChange);
        window.removeEventListener('storage', onChange);
    };
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const resolve = (dictionary: unknown, key: string): string => {
    let current: unknown = dictionary;
    for (const part of key.split('.')) {
        if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
            current = (current as Record<string, unknown>)[part];
        } else {
            return key;
        }
    }
    return typeof current === 'string' ? current : key;
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    // En el servidor siempre es español; en el cliente se lee el idioma guardado sin romper la hidratación
    const lang = useSyncExternalStore<Language>(subscribe, readLang, () => 'es');

    // Mantiene <html lang> y el título de la pestaña sincronizados con el idioma
    useEffect(() => {
        document.documentElement.lang = lang;
        document.title = resolve(dictionaries[lang], 'meta.title');
    }, [lang]);

    const setLang = useCallback((next: Language) => {
        memoryLang = next;
        try {
            window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
            /* ignorar */
        }
        window.dispatchEvent(new Event(CHANGE_EVENT));
    }, []);

    const value = useMemo<LanguageContextType>(() => {
        const t = (key: string) => resolve(dictionaries[lang], key);
        const list = (key: string) => t(key).split('|').map((item) => item.trim()).filter(Boolean);
        return { lang, setLang, t, list };
    }, [lang, setLang]);

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage debe usarse dentro de un LanguageProvider');
    return context;
};
