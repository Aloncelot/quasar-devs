'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const navLinks = [
    { name: 'Servicios', href: '#servicios' },
    { name: 'Portafolio', href: '#portafolio' },
    { name: 'Nosotros', href: '#nosotros' },
];

export const Navbar = () => {
    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1, type: "spring", stiffness: 50 }}
            className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 md:px-12 backdrop-blur-md bg-black/30 border-b border-white/10"
        >
            {/* --- LOGO --- */}
            <Link href="/" className="relative group">
                <span className="font-gibed text-2xl text-white tracking-widest group-hover:text-cyan-400 transition-colors duration-300">
                    QUASAR
                </span>
                {/* Pequeño punto brillante en el logo */}
                <span className="absolute -right-2 top-0 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
            </Link>

            {/* --- ENLACES (Desktop) --- */}
            <div className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => (
                    <Link key={link.name} href={link.href} className="relative group text-sm text-gray-300 hover:text-white uppercase tracking-wider transition-colors">
                        {link.name}
                        {/* Línea animada debajo del link */}
                        <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-cyan-400 transition-all duration-300 group-hover:w-full" />
                    </Link>
                ))}

                {/* --- BOTÓN CTA (Call To Action) --- */}
                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px rgb(0, 243, 255)" }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 text-xs font-bold uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all rounded-sm"
                >
                    Iniciar Proyecto
                </motion.button>
            </div>

            {/* --- MENU HAMBURGUESA (Móvil - Visual por ahora) --- */}
            <div className="md:hidden text-white cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
            </div>
        </motion.nav>
    );
};