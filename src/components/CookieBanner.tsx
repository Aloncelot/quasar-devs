'use client';

import { useSyncExternalStore } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useLanguage } from '@/context/LanguageContext';
import { CyberCard } from '@/components/ui/Cyber';

const STORAGE_KEY = 'quasar-notice-dismissed';
const CHANGE_EVENT = 'quasar-notice-change';

// Respaldo en memoria por si el navegador bloquea localStorage
let dismissedInMemory = false;

const readDismissed = () => {
    if (dismissedInMemory) return true;
    try {
        return window.localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
        return false;
    }
};

const subscribe = (onChange: () => void) => {
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
};

/** Aviso breve de almacenamiento/cookies. Se cierra con la X y no vuelve a aparecer. */
export const CookieBanner = () => {
    const { t } = useLanguage();
    // En el servidor se considera cerrado: así no aparece un destello antes de hidratar
    const dismissed = useSyncExternalStore(subscribe, readDismissed, () => true);

    if (dismissed) return null;

    const close = () => {
        dismissedInMemory = true;
        try {
            window.localStorage.setItem(STORAGE_KEY, '1');
        } catch {
            /* ignorar */
        }
        window.dispatchEvent(new Event(CHANGE_EVENT));
    };

    return (
        <div
            role="region"
            aria-label={t('cookies.label')}
            className="fixed bottom-4 left-4 right-24 z-40 max-w-sm sm:right-auto"
        >
            <CyberCard accent="violet" bodyClassName="!p-4 pr-11">
                <p className="text-sm leading-relaxed text-ink/90">{t('cookies.text')}</p>
                <button
                    type="button"
                    onClick={close}
                    aria-label={t('cookies.close')}
                    className="absolute right-3 top-3 rounded-sm border border-violet-neon/40 p-1.5 text-dim transition-colors hover:border-cyan-neon hover:text-cyan-neon"
                >
                    <FaTimes aria-hidden="true" size={12} />
                </button>
            </CyberCard>
        </div>
    );
};
