'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const ScanlinesOverlay = () => (
    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-50 z-20" />
);

const LanguageToggle = () => {
    const { lang, setLang } = useLanguage();

    return (
        <div className="flex items-center gap-2 bg-gray-900/50 border border-teal-900/50 p-1 rounded backdrop-blur-md">
            <span className="text-[10px] font-mono text-teal-400 tracking-widest pl-2 hidden lg:block">
                SYS.LANG:
            </span>

            <div className="flex relative">
                <motion.div
                    className="absolute top-0 bottom-0 w-10 bg-teal-500/20 border border-teal-500 rounded-sm shadow-[0_0_10px_rgba(20,184,166,0.3)] z-0"
                    initial={false}
                    animate={{ 
                        x: lang === 'es' ? 0 : 40
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />

                <button 
                    onClick={() => setLang('es')}
                    className="relative w-10 h-6 flex items-center justify-center z-10 overflow-hidden rounded-sm group"
                >
                    <img 
                        src="/flag-mx.webp" 
                        alt="ES" 
                        className={`w-full h-full object-cover transition-all duration-300 ${lang === 'es' ? 'opacity-100' : 'opacity-30 grayscale'}`}
                    />
                    {lang === 'es' && <ScanlinesOverlay />}
                </button>

                <button 
                    onClick={() => setLang('en')}
                    className="relative w-10 h-6 flex items-center justify-center z-10 overflow-hidden rounded-sm group"
                >
                    <img 
                        src="/flag-en.png" 
                        alt="EN" 
                        className={`w-full h-full object-cover transition-all duration-300 ${lang === 'en' ? 'opacity-100' : 'opacity-30 grayscale'}`}
                    />
                    {lang === 'en' && <ScanlinesOverlay />}
                </button>
            </div>
        </div>
    );
};

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const { t } = useLanguage();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: t('nav.home'), href: '#' },
        { name: t('nav.services'), href: '#servicios' },
        { name: t('nav.projects'), href: '#proyectos' },
        { name: t('nav.about'), href: '#sobre-mi' },
        { name: t('nav.contact'), href: '#contacto' },
    ];

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1, type: "spring", stiffness: 50 }}
            className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 md:px-12 backdrop-blur-md bg-black/30 border-b border-white/10"
        >

            <Link href="/" className="relative group">
                <span className="font-gibed text-2xl text-white tracking-widest group-hover:text-teal-400 transition-colors duration-300">
                    QUASAR
                </span>
                <span className="absolute -right-2 top-0 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => (
                    <Link key={link.name} href={link.href} className="relative group text-sm text-gray-300 hover:text-white uppercase tracking-wider transition-colors">
                        {link.name}
                        <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-teal-400 transition-all duration-300 group-hover:w-full" />
                    </Link>
                ))}
            </div>

            <div className="flex items-center gap-4">                
                <LanguageToggle />
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden text-teal-500 p-2 border border-teal-500/30 rounded bg-teal-500/10 active:scale-95 transition-transform"
                >
                    {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="absolute top-full left-0 w-full md:hidden bg-black/95 border-b border-teal-900/50 overflow-hidden backdrop-blur-xl"
                    >
                        <div className="flex flex-col items-center py-8 gap-6">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="w-full flex justify-center"
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className="text-lg font-mono text-gray-300 hover:text-teal-400 tracking-widest w-full text-center py-2 border-l-2 border-transparent hover:border-teal-500 hover:bg-teal-500/10 transition-all flex justify-center items-center"
                                    >
                                        {link.name}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </motion.nav>
    );
};