'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';
import Image from 'next/image';
import { useLanguage, type Language } from '@/context/LanguageContext';
import { CyberLink } from '@/components/ui/Cyber';

const LanguageToggle = () => {
    const { lang, setLang, t } = useLanguage();

    const options: { code: Language; src: string; label: string }[] = [
        { code: 'es', src: '/flag-mx.webp', label: t('nav.lang_es') },
        { code: 'en', src: '/flag-en.png', label: t('nav.lang_en') },
    ];

    return (
        <div className="flex items-center gap-1 rounded-sm border border-violet-neon/40 bg-void/60 p-1">
            {options.map((option) => {
                const active = lang === option.code;
                return (
                    <button
                        key={option.code}
                        type="button"
                        onClick={() => setLang(option.code)}
                        aria-pressed={active}
                        aria-label={option.label}
                        className={`relative h-6 w-9 overflow-hidden rounded-[2px] transition-all duration-200 ${
                            active
                                ? 'opacity-100 ring-1 ring-cyan-neon shadow-[0_0_10px_rgba(77,235,255,0.5)]'
                                : 'opacity-40 grayscale hover:opacity-80 hover:grayscale-0'
                        }`}
                    >
                        <Image src={option.src} alt="" fill sizes="36px" className="object-cover" />
                    </button>
                );
            })}
        </div>
    );
};

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Cierra el menú móvil con Escape
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen]);

    const navLinks = [
        { name: t('nav.services'), href: '#servicios' },
        { name: t('nav.process'), href: '#proceso' },
        { name: t('nav.projects'), href: '#proyectos' },
        { name: t('nav.about'), href: '#sobre-mi' },
        { name: t('nav.contact'), href: '#contacto' },
    ];

    return (
        <header
            className={`fixed left-0 top-0 z-50 w-full border-b transition-colors duration-300 ${
                scrolled || isOpen
                    ? 'border-violet-neon/30 bg-void/80 backdrop-blur-md'
                    : 'border-transparent bg-transparent'
            }`}
        >
            <nav
                aria-label="Principal"
                className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3 md:px-10"
            >
                <a href="#inicio" className="group relative flex items-center gap-2" aria-label="Quasar Devs">
                    <span className="status-dot" aria-hidden="true" />
                    <span className="font-gibed text-2xl tracking-[0.08em] text-white transition-colors duration-200 group-hover:text-cyan-neon">
                        QUASAR
                    </span>
                </a>

                <div className="hidden items-center gap-8 lg:flex">
                    {navLinks.map((link) => (
                        <a key={link.href} href={link.href} className="nav-link">
                            {link.name}
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <LanguageToggle />
                    <div className="hidden md:block">
                        <CyberLink href="#contacto" variant="solid" className="text-sm">
                            {t('nav.cta')}
                        </CyberLink>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsOpen((open) => !open)}
                        aria-expanded={isOpen}
                        aria-controls="menu-movil"
                        aria-label={isOpen ? t('nav.menu_close') : t('nav.menu_open')}
                        className="rounded-sm border border-cyan-neon/40 bg-cyan-neon/10 p-2.5 text-cyan-neon transition-colors hover:bg-cyan-neon/20 lg:hidden"
                    >
                        {isOpen ? <FaTimes size={18} aria-hidden="true" /> : <FaBars size={18} aria-hidden="true" />}
                    </button>
                </div>
            </nav>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        id="menu-movil"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden border-t border-violet-neon/30 bg-void/95 lg:hidden"
                    >
                        <div className="flex flex-col gap-1 px-6 py-6">
                            {navLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="border-l-2 border-transparent px-4 py-3 font-display text-lg text-dim transition-colors hover:border-cyan-neon hover:bg-cyan-neon/5 hover:text-white"
                                >
                                    {link.name}
                                </a>
                            ))}
                            <div className="mt-4 md:hidden">
                                <CyberLink href="#contacto" variant="solid" className="w-full">
                                    {t('nav.cta')}
                                </CyberLink>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};
