'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaLinkedin, FaEnvelope, FaMapMarkerAlt, FaTerminal } from 'react-icons/fa';
import { BiErrorAlt } from "react-icons/bi";
import emailjs from '@emailjs/browser'; // <--- IMPORTANTE

// --- HOOKS Y COMPONENTES AUXILIARES (IGUAL QUE ANTES) ---
const useScrambleText = (targetText: string, duration: number, trigger: boolean) => {
    const [displayText, setDisplayText] = useState(targetText);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&[]{}<>';
    useEffect(() => {
        if (!trigger) { setDisplayText(targetText); return; }
        let startTime: number | null = null;
        let animationFrameId: number;
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const ratio = Math.min(progress / duration, 1);
            const solvedCount = Math.floor(ratio * targetText.length);
            let result = '';
            for (let i = 0; i < targetText.length; i++) {
                if (i < solvedCount) result += targetText[i];
                else result += chars[Math.floor(Math.random() * chars.length)];
            }
            setDisplayText(result);
            if (progress < duration) animationFrameId = requestAnimationFrame(animate);
            else setDisplayText(targetText);
        };
        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, [trigger, targetText, duration]);
    return displayText;
};

const TerminalError = ({ message }: { message: string }) => (
    <motion.div
        initial={{ opacity: 0, height: 0, y: -10 }}
        animate={{ opacity: 1, height: 'auto', y: 0 }}
        exit={{ opacity: 0, height: 0, y: -10 }}
        className="mt-2 relative overflow-hidden bg-red-950/30 border-l-2 border-red-600/50 p-2 text-red-500 font-mono text-xs flex items-center gap-2"
    >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(50,0,0,0.1)_50%,transparent_50%)] bg-[length:100%_2px] pointer-events-none opacity-50" />
        <BiErrorAlt className="text-lg shrink-0" />
        <span>&gt; ERROR: {message} <span className="animate-pulse">_</span></span>
    </motion.div>
);

const ScanlinesOverlay = () => (
    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-60" />
);

export const Contact = () => {
    const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [copied, setCopied] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

    // Referencia al FORMULARIO completo para EmailJS
    const form = useRef<HTMLFormElement>(null);

    // Referencias a inputs para validación visual
    const nameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const messageRef = useRef<HTMLTextAreaElement>(null);

    const emailStr = process.env.NEXT_PUBLIC_EMAIL || "aloncelot@gmail.com";
    const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/Aloncelot";
    const linkedinUrl = process.env.NEXT_PUBLIC_LINKEDIN_URL || "https://www.linkedin.com/in/alonso-correap/";

    const sendingText = useScrambleText("SENDING...", 2000, formStatus === 'sending');

    const copyEmail = () => {
        navigator.clipboard.writeText(emailStr);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const validateForm = () => {
        const newErrors: { [key: string]: boolean } = {};
        let isValid = true;
        if (!nameRef.current?.value.trim()) { newErrors.name = true; isValid = false; }
        if (!emailRef.current?.value.trim()) { newErrors.email = true; isValid = false; }
        if (!messageRef.current?.value.trim()) { newErrors.message = true; isValid = false; }
        setErrors(newErrors);
        return isValid;
    };

    const clearError = (field: string) => {
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: false }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setFormStatus('sending');

        emailjs.sendForm(
            process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
            process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
            form.current!,
            process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
        )
            .then((result) => {
                setFormStatus('sent');
                if (form.current) form.current.reset();
                setTimeout(() => setFormStatus('idle'), 5000);
            }, (error) => {
                console.error("Error sending email:", error.text);
                setFormStatus('error');
                setTimeout(() => setFormStatus('idle'), 5000);
            });
    };

    return (
        <section id="contacto" className="relative w-full min-h-screen bg-black py-24 px-6 md:px-12 flex items-center justify-center overflow-hidden">

            <div className="absolute inset-0 bg-[linear-gradient(rgba(20,20,20,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,20,0.8)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none opacity-20" />

            <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">

                {/* COLUMNA IZQUIERDA (IGUAL) */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col justify-center space-y-8"
                >
                    <div>
                        <h2 className="font-gibed text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-600 mb-2">
                            SECURE UPLINK
                        </h2>
                        <p className="text-gray-400 font-mono text-sm tracking-widest">
                    // ESTABLISH ENCRYPTED CONNECTION
                        </p>
                    </div>

                    <p className="text-gray-300 leading-relaxed text-lg">
                        ¿Listo para iniciar una nueva misión? Ya sea para arquitectura de software, consultoría en supply chain o un proyecto 3D, mis canales están abiertos.
                    </p>

                    <div className="space-y-6 font-mono text-sm">
                        <div className="group cursor-pointer" onClick={copyEmail}>
                            <div className="flex items-center gap-4 text-gray-400 group-hover:text-teal-400 transition-colors">
                                <div className="relative p-3 bg-gray-900 border border-gray-800 rounded overflow-hidden hover-ignition transition-none">
                                    <ScanlinesOverlay />
                                    <FaEnvelope size={20} className="relative z-10" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-600">COMMS CHANNEL</span>
                                    <span className="text-lg tracking-wider">{emailStr}</span>
                                </div>
                                {copied && (
                                    <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="text-teal-400 text-xs border border-teal-500 px-2 py-0.5">[COPIED]</motion.span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-gray-400">
                            <div className="p-3 bg-gray-900 border border-gray-800 rounded">
                                <FaMapMarkerAlt size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-600">BASE OF OPERATIONS</span>
                                <span className="text-lg tracking-wider">Mexico City, CDMX</span>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-4">
                            <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="relative p-3 bg-gray-900 border border-gray-800 text-gray-400 rounded overflow-hidden hover-ignition transition-none">
                                <ScanlinesOverlay />
                                <FaGithub size={24} className="relative z-10" />
                            </a>
                            <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="relative p-3 bg-gray-900 border border-gray-800 text-gray-400 rounded overflow-hidden hover-ignition transition-none">
                                <ScanlinesOverlay />
                                <FaLinkedin size={24} className="relative z-10" />
                            </a>
                        </div>
                    </div>
                </motion.div>

                {/* COLUMNA DERECHA: FORMULARIO */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="bg-gray-900/30 border border-gray-800 p-8 rounded-lg backdrop-blur-sm relative overflow-visible"
                >
                    <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-teal-500/30 rounded-tr-lg pointer-events-none" />
                    <div className="flex items-center gap-2 mb-8 text-teal-500/50 font-mono text-xs">
                        <FaTerminal />
                        <span>TERMINAL_V.1.0.4 :: INPUT_REQUIRED</span>
                    </div>

                    {/* AQUI ESTÁ LA REFERENCIA AL FORM */}
                    <form ref={form} onSubmit={handleSubmit} noValidate className="space-y-6">
                        <div className="mt-2">
                            <div className="relative group mt-6">
                                {/* AGREGAMOS name="user_name" */}
                                <input ref={nameRef} name="user_name" type="text" onChange={() => clearError('name')} className={`relative z-10 w-full bg-transparent border-b pt-4 pb-2 text-white font-mono focus:outline-none transition-colors peer placeholder-transparent ${errors.name ? 'border-red-500/50 focus:border-red-500' : 'border-gray-700 focus:border-teal-500'}`} placeholder="OPERATOR NAME" />
                                <label className={`absolute left-0 top-2 z-0 text-sm font-mono transition-all duration-300 peer-focus:-top-6 peer-focus:text-xs peer-not-placeholder-shown:-top-6 peer-not-placeholder-shown:text-xs cursor-text ${errors.name ? 'text-red-500 peer-focus:text-red-400 peer-not-placeholder-shown:text-red-400' : 'text-gray-500 peer-focus:text-teal-400 peer-not-placeholder-shown:text-teal-400'}`}>OPERATOR NAME</label>
                            </div>
                            <AnimatePresence>{errors.name && <TerminalError message="CAMPO REQUERIDO. INGRESE DATOS." />}</AnimatePresence>
                        </div>

                        <div className="mt-2">
                            <div className="relative group mt-6">
                                {/* AGREGAMOS name="user_email" */}
                                <input ref={emailRef} name="user_email" type="email" onChange={() => clearError('email')} className={`relative z-10 w-full bg-transparent border-b pt-4 pb-2 text-white font-mono focus:outline-none transition-colors peer placeholder-transparent ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-gray-700 focus:border-teal-500'}`} placeholder="RETURN ADDRESS (EMAIL)" />
                                <label className={`absolute left-0 top-2 z-0 text-sm font-mono transition-all duration-300 peer-focus:-top-6 peer-focus:text-xs peer-not-placeholder-shown:-top-6 peer-not-placeholder-shown:text-xs cursor-text ${errors.email ? 'text-red-500 peer-focus:text-red-400 peer-not-placeholder-shown:text-red-400' : 'text-gray-500 peer-focus:text-teal-400 peer-not-placeholder-shown:text-teal-400'}`}>RETURN ADDRESS (EMAIL)</label>
                            </div>
                            <AnimatePresence>{errors.email && <TerminalError message="DIRECCIÓN DE CORREO INVÁLIDA." />}</AnimatePresence>
                        </div>

                        <div className="mt-2">
                            <div className="relative group mt-6">
                                {/* AGREGAMOS name="message" */}
                                <textarea ref={messageRef} name="message" rows={4} onChange={() => clearError('message')} className={`relative z-10 w-full bg-transparent border-b pt-4 pb-2 text-white font-mono focus:outline-none transition-colors peer resize-none placeholder-transparent ${errors.message ? 'border-red-500/50 focus:border-red-500' : 'border-gray-700 focus:border-teal-500'}`} placeholder="DATA PACKET (MESSAGE)"></textarea>
                                <label className={`absolute left-0 top-2 z-0 text-sm font-mono transition-all duration-300 peer-focus:-top-6 peer-focus:text-xs peer-not-placeholder-shown:-top-6 peer-not-placeholder-shown:text-xs cursor-text ${errors.message ? 'text-red-500 peer-focus:text-red-400 peer-not-placeholder-shown:text-red-400' : 'text-gray-500 peer-focus:text-teal-400 peer-not-placeholder-shown:text-teal-400'}`}>DATA PACKET (MESSAGE)</label>
                            </div>
                            <AnimatePresence>{errors.message && <TerminalError message="NO SE DETECTARON DATOS PARA TRANSMITIR." />}</AnimatePresence>
                        </div>

                        <button
                            type="submit"
                            disabled={formStatus === 'sending' || formStatus === 'sent'}
                            className="w-full py-4 mt-8 bg-teal-500/10 border border-teal-500 text-teal-400 font-gibed tracking-widest disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group terminal-button transition-none"
                        >
                            <div className="absolute inset-0 group-hover:hover-glitch-animation pointer-events-none" />
                            <ScanlinesOverlay />
                            <span className="relative z-10 flex items-center justify-center w-full h-full">
                                {formStatus === 'idle' && "INITIATE TRANSMISSION"}
                                {formStatus === 'sending' && <span className="font-mono text-sm tracking-normal text-teal-200">[{sendingText}]</span>}
                                {formStatus === 'sent' && "TRANSMISSION COMPLETE"}
                                {/* Nuevo estado visual para error */}
                                {formStatus === 'error' && <span className="text-red-500 font-mono">TRANSMISSION FAILED</span>}
                            </span>
                        </button>
                    </form>
                </motion.div>

            </div>
        </section>
    );
};