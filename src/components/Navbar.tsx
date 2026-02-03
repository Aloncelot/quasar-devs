'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';
import Link from 'next/link';


export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'HOME', href: '#' },
        { name: 'SERVICES', href: '#servicios' },
        { name: 'PROJECTS', href: '#proyectos' },
        { name: 'ABOUT', href: '#sobre-mi' },
        { name: 'CONTACT', href: '#contacto' },
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

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden text-teal-500 p-2 border border-teal-500/30 rounded bg-teal-500/10 active:scale-95 transition-transform"
            >
                {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>


            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-black/95 border-b border-teal-900/50 overflow-hidden backdrop-blur-xl"
                    >
                        <div className="flex flex-col items-center py-8 gap-6">
                            {navLinks.map((link, i) => (
                                <motion.a
                                    key={link.name}
                                    href={link.href}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    onClick={() => setIsOpen(false)} // Cierra el menú al hacer clic
                                    className="text-lg font-mono text-gray-300 hover:text-teal-400 tracking-widest w-full text-center py-2 border-l-2 border-transparent hover:border-teal-500 hover:bg-teal-500/10 transition-all"
                                >
                            // {link.name}
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </motion.nav>
    );
};