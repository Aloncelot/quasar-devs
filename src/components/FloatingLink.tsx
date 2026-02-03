'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiMessageSquareDots } from 'react-icons/bi';
import { FaWifi } from 'react-icons/fa';

export const FloatingLink = () => {
    const [hovered, setHovered] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Efecto para que el botón aparezca solo después de scrollear un poco (para no ensuciar el Hero)
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToContact = () => {
        const contactSection = document.getElementById('contacto');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0, rotate: 180 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0, rotate: -180 }}
                    className="fixed bottom-8 right-8 z-50 flex items-center justify-end"
                >
                    {/* ETIQUETA HOLOGRÁFICA (Aparece a la izquierda al hacer Hover) */}
                    <AnimatePresence>
                        {hovered && (
                            <motion.div
                                initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
                                animate={{ opacity: 1, x: -16, filter: "blur(0px)" }}
                                exit={{ opacity: 0, x: 10, filter: "blur(5px)" }}
                                className="hidden md:block mr-2"
                            >
                                <div className="bg-black/80 border border-teal-500/30 text-teal-400 text-xs font-mono py-1 px-3 rounded backdrop-blur-md shadow-[0_0_15px_rgba(20,184,166,0.3)] flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
                                    INITIATE UPLINK
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* EL NÚCLEO DEL BOTÓN */}
                    <button
                        onClick={scrollToContact}
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                        className="relative w-16 h-16 flex items-center justify-center group focus:outline-none"
                    >
                        {/* 1. ANILLO DE ORBITA (Gira lento, acelera en hover) */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <motion.div
                                animate={{ rotate: hovered ? 360 : 0 }}
                                transition={{ duration: hovered ? 2 : 10, repeat: Infinity, ease: "linear" }}
                                className="w-full h-full border border-dashed border-teal-500/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            />
                        </div>

                        {/* 2. HEXÁGONO DE FONDO (Con Clip-path) */}
                        {/* Usamos un div con forma hexagonal CSS */}
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="relative w-14 h-14 bg-black flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-all duration-300 group-hover:shadow-[0_0_35px_rgba(20,184,166,0.6)]"
                            style={{
                                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                            }}
                        >
                            {/* Borde brillante del hexágono (Simulado con un inset shadow o div interno) */}
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-black to-teal-900 opacity-80" />

                            {/* Capa de Scanlines interna */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(20,184,166,0.1)_50%),linear-gradient(90deg,rgba(0,0,0,0.06),rgba(0,0,0,0.02),rgba(0,0,0,0.06))] bg-[length:100%_4px,3px_100%] opacity-50" />

                            {/* 3. ICONO (Cambia sutilmente) */}
                            <div className="relative z-10 text-teal-400 group-hover:text-white transition-colors duration-300">
                                {hovered ? <FaWifi className="text-2xl animate-pulse" /> : <BiMessageSquareDots className="text-2xl" />}
                            </div>

                            {/* Borde Hexagonal Fino (SVG Overlay para que se vea sharp) */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" fill="none">
                                <path
                                    d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="text-teal-500/50 group-hover:text-teal-400 transition-colors duration-300"
                                />
                            </svg>
                        </motion.div>

                        {/* 4. EFECTO PING (Ondas de señal cuando está inactivo) */}
                        {!hovered && (
                            <span className="absolute flex h-full w-full items-center justify-center pointer-events-none">
                                <span className="absolute inline-flex h-12 w-12 animate-ping opacity-20 bg-teal-400"
                                    style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                                </span>
                            </span>
                        )}

                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};