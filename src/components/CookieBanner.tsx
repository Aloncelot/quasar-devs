'use client';

import { useSyncExternalStore } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useLanguage } from '@/context/LanguageContext';
import { CyberCard, CyberButton } from '@/components/ui/Cyber';

/*
 * Aviso de cookies (LFPDPPP). El sitio solo usa almacenamiento local indispensable
 * (idioma, esta elección e historial temporal del chat), por eso basta con informar
 * y enlazar al Aviso de Privacidad. Si en el futuro se agregan cookies de analítica
 * o de terceros, aquí deben ofrecerse las opciones "Aceptar" / "Solo necesarias".
 *
 * Sube STORAGE_KEY de versión cuando cambie lo que se informa: el aviso vuelve a mostrarse.
 */
const STORAGE_KEY = 'quasar-cookie-notice-v2';
const CHANGE_EVENT = 'quasar-notice-change';

// Respaldo en memoria por si el navegador bloquea localStorage
let dismissedInMemory = false;

const readDismissed = () => {
    if (dismissedInMemory) return true;
    try {
        return window.localStorage.getItem(STORAGE_KEY) !== null;
    } catch {
        return false;
    }
};

const subscribe = (onChange: () => void) => {
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
};

export const CookieBanner = () => {
    const { t } = useLanguage();
    // En el servidor se considera cerrado: así no aparece un destello antes de hidratar
    const dismissed = useSyncExternalStore(subscribe, readDismissed, () => true);

    if (dismissed) return null;

    const close = () => {
        dismissedInMemory = true;
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ value: 'necessary', date: new Date().toISOString() }));
        } catch {
            /* ignorar */
        }
        window.dispatchEvent(new Event(CHANGE_EVENT));
    };

    return (
        <div
            role="region"
            aria-label={t('cookies.label')}
            className="fixed bottom-[calc(100vh/15_+_1.75rem)] left-4 right-24 z-40 max-w-sm sm:right-auto"
        >
            <CyberCard accent="violet" bodyClassName="!p-4 pr-11">
                <p className="font-display text-sm font-semibold text-white">{t('cookies.title')}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink/90">{t('cookies.text')}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                    <CyberButton variant="solid" onClick={close} className="text-sm">
                        {t('cookies.accept')}
                    </CyberButton>
                    <a href="/aviso-de-privacidad#cookies" className="text-sm text-cyan-neon underline underline-offset-4 hover:text-white">
                        {t('cookies.more')}
                    </a>
                </div>
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
