'use client';

import { useState, useEffect } from 'react';
import { FaCommentDots, FaWhatsapp } from 'react-icons/fa';
import { useLanguage } from '@/context/LanguageContext';
import { CyberLink } from '@/components/ui/Cyber';
import { WHATSAPP } from '@/lib/config';

/** Botón flotante de contacto: aparece al avanzar la página y lleva al formulario (o a WhatsApp si está configurado). */
export const FloatingLink = () => {
    const { t } = useLanguage();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggle = () => setIsVisible(window.scrollY > 300);
        toggle();
        window.addEventListener('scroll', toggle, { passive: true });
        return () => window.removeEventListener('scroll', toggle);
    }, []);

    const hasWhatsapp = WHATSAPP.length > 0;

    return (
        <div
            inert={!isVisible}
            className={`fixed bottom-6 right-6 z-40 h-[3.75rem] w-[3.75rem] transition-all duration-300 ${
                isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
            }`}
        >
            {/* Anillo de pulso periódico detrás del botón */}
            <span className="fab-pulse" aria-hidden="true" />
            <CyberLink
                href={hasWhatsapp ? `https://wa.me/${WHATSAPP}` : '#contacto'}
                external={hasWhatsapp}
                variant="solid"
                accent="magenta"
                className="cyber-btn--hex"
                ariaLabel={hasWhatsapp ? t('floating.whatsapp') : t('floating.label')}
            >
                {hasWhatsapp ? <FaWhatsapp aria-hidden="true" /> : <FaCommentDots aria-hidden="true" />}
            </CyberLink>
        </div>
    );
};
