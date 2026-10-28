'use client';

import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { FaPaperPlane, FaTimes, FaRedo } from 'react-icons/fa';
import { useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { RANDALL_API_URL } from '@/lib/config';
import { RandallSprite } from './RandallSprite';
import { RichText } from './RichText';
import type { Mood } from './sprite';
import styles from './randall.module.css';

interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    /** Mensajes locales (errores) que no se envían a la API. */
    local?: boolean;
}

const HISTORY_KEY = 'randall-history';
const GREETED_KEY = 'randall-greeted';
const MAX_INPUT = 600;
const SLEEP_AFTER_MS = 45_000;
const SERVER_MOODS: Mood[] = ['idle', 'happy', 'surprised', 'sad', 'sleepy', 'wink', 'thinking'];

/* ---------- almacenamiento de sesión (con try/catch: puede estar bloqueado) ---------- */
const loadHistory = (): Message[] => {
    try {
        const raw = window.sessionStorage.getItem(HISTORY_KEY);
        const parsed = raw ? (JSON.parse(raw) as Message[]) : [];
        return Array.isArray(parsed) ? parsed.slice(-30) : [];
    } catch {
        return [];
    }
};
const saveHistory = (messages: Message[]) => {
    try {
        window.sessionStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-30)));
    } catch {
        /* ignorar */
    }
};
const flag = {
    get: (key: string) => {
        try {
            return window.sessionStorage.getItem(key) === '1';
        } catch {
            return false;
        }
    },
    set: (key: string) => {
        try {
            window.sessionStorage.setItem(key, '1');
        } catch {
            /* ignorar */
        }
    },
};

/** Randall: asistente flotante con avatar pixelado (esquina inferior izquierda). */
export default function Randall() {
    const { t, list, lang } = useLanguage();
    const reduceMotion = useReducedMotion();
    const panelId = useId();

    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>(loadHistory);
    const [input, setInput] = useState('');
    const [pending, setPending] = useState(false);
    const [greeting, setGreeting] = useState(false);
    /** Mensaje que se está "escribiendo" letra por letra. */
    const [typing, setTyping] = useState<{ id: number; shown: number } | null>(null);

    // Estado visual del avatar
    const [mood, setMood] = useState<Mood>('idle');
    const [blink, setBlink] = useState(false);
    const [mouthOpen, setMouthOpen] = useState(false);
    const [look, setLook] = useState<-1 | 0 | 1>(0);
    const [wave, setWave] = useState<0 | 1 | null>(null);
    const [bump, setBump] = useState<'hop' | 'shake' | null>(null);

    const avatarRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const logRef = useRef<HTMLDivElement>(null);
    const moodTimer = useRef<number | undefined>(undefined);
    const moodRef = useRef<Mood>('idle');
    const openRef = useRef(false);
    const lastActivity = useRef(0);
    const nextId = useRef(0);

    useEffect(() => {
        moodRef.current = mood;
        openRef.current = open;
    }, [mood, open]);

    const newId = () => Date.now() * 1000 + (nextId.current++ % 1000);

    /** Cambia la expresión; si ms > 0 vuelve a `after` al terminar. */
    const express = useCallback((next: Mood, ms = 0, after: Mood = 'idle') => {
        window.clearTimeout(moodTimer.current);
        setMood(next);
        if (ms > 0) moodTimer.current = window.setTimeout(() => setMood(after), ms);
    }, []);

    const doWave = useCallback(() => {
        let frame = 0;
        const id = window.setInterval(() => {
            frame += 1;
            if (frame > 6) {
                window.clearInterval(id);
                setWave(null);
            } else {
                setWave((frame % 2) as 0 | 1);
            }
        }, 170);
        setWave(0);
    }, []);

    const doBump = useCallback((kind: 'hop' | 'shake') => {
        setBump(kind);
        window.setTimeout(() => setBump(null), 600);
    }, []);

    /* ---------- parpadeo aleatorio ---------- */
    useEffect(() => {
        let timer: number;
        const schedule = () => {
            timer = window.setTimeout(() => {
                setBlink(true);
                timer = window.setTimeout(() => {
                    setBlink(false);
                    schedule();
                }, 140);
            }, 2200 + Math.random() * 3500);
        };
        schedule();
        return () => window.clearTimeout(timer);
    }, []);

    /* ---------- boca mientras habla ---------- */
    useEffect(() => {
        if (mood !== 'talking') return;
        const id = window.setInterval(() => setMouthOpen((v) => !v), 130);
        return () => window.clearInterval(id);
    }, [mood]);

    /* ---------- mirada que sigue al cursor + dormir por inactividad ---------- */
    useEffect(() => {
        let frame = 0;
        lastActivity.current = Date.now();

        const wake = () => {
            lastActivity.current = Date.now();
            if (moodRef.current === 'sleepy') express('surprised', 700);
        };
        const onPointer = (e: PointerEvent) => {
            wake();
            if (frame) return;
            frame = window.requestAnimationFrame(() => {
                frame = 0;
                const rect = avatarRef.current?.getBoundingClientRect();
                if (!rect) return;
                const dx = e.clientX - (rect.left + rect.width / 2);
                setLook(dx > 80 ? 1 : dx < -80 ? -1 : 0);
            });
        };
        const sleepCheck = window.setInterval(() => {
            if (!openRef.current && moodRef.current === 'idle' && Date.now() - lastActivity.current > SLEEP_AFTER_MS) {
                setMood('sleepy');
            }
        }, 5000);

        window.addEventListener('pointermove', onPointer, { passive: true });
        window.addEventListener('keydown', wake);
        window.addEventListener('scroll', wake, { passive: true });
        return () => {
            window.cancelAnimationFrame(frame);
            window.clearInterval(sleepCheck);
            window.removeEventListener('pointermove', onPointer);
            window.removeEventListener('keydown', wake);
            window.removeEventListener('scroll', wake);
        };
    }, [express]);

    /* ---------- saludo inicial (una vez por sesión) ---------- */
    useEffect(() => {
        if (flag.get(GREETED_KEY)) return;
        const show = window.setTimeout(() => {
            if (openRef.current) return;
            flag.set(GREETED_KEY);
            setGreeting(true);
            express('happy', 2200);
            doWave();
        }, 3500);
        const hide = window.setTimeout(() => setGreeting(false), 12_000);
        return () => {
            window.clearTimeout(show);
            window.clearTimeout(hide);
        };
    }, [express, doWave]);

    /* ---------- efecto máquina de escribir ---------- */
    useEffect(() => {
        if (!typing) return;
        const target = messages.find((m) => m.id === typing.id);
        if (!target) return;
        const id = window.setTimeout(() => {
            setTyping((cur) => {
                if (!cur) return cur;
                const shown = cur.shown + 3;
                return shown >= target.content.length ? null : { ...cur, shown };
            });
        }, 16);
        return () => window.clearTimeout(id);
    }, [typing, messages]);

    /* ---------- persistencia y scroll del historial ---------- */
    useEffect(() => saveHistory(messages), [messages]);
    useEffect(() => {
        const log = logRef.current;
        if (log) log.scrollTop = log.scrollHeight;
    }, [messages, typing, pending, open]);

    /* ---------- abrir / cerrar ---------- */
    const openPanel = useCallback(() => {
        setOpen(true);
        setGreeting(false);
        flag.set(GREETED_KEY);
        express('happy', 1400);
        doWave();
        window.setTimeout(() => inputRef.current?.focus(), 60);
    }, [express, doWave]);

    const closePanel = useCallback(() => {
        setOpen(false);
        express('wink', 900);
        avatarRef.current?.focus();
    }, [express]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closePanel();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, closePanel]);

    /* ---------- enviar pregunta ---------- */
    const ask = async (raw: string) => {
        const text = raw.trim().slice(0, MAX_INPUT);
        if (!text || pending || !RANDALL_API_URL) return;

        const userMsg: Message = { id: newId(), role: 'user', content: text };
        const history = [...messages.filter((m) => !m.local), userMsg].slice(-10);
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setPending(true);
        express('thinking');

        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 25_000);
        try {
            const res = await fetch(`${RANDALL_API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lang,
                    messages: history.map(({ role, content }) => ({ role, content })),
                }),
                signal: controller.signal,
            });
            const data = (await res.json().catch(() => null)) as { reply?: unknown; mood?: unknown } | null;
            if (!data || typeof data.reply !== 'string' || (!res.ok && res.status !== 429)) throw new Error('bad response');

            const reply = data.reply.slice(0, 2000);
            const finalMood = SERVER_MOODS.includes(data.mood as Mood) ? (data.mood as Mood) : 'happy';
            const botMsg: Message = { id: newId(), role: 'assistant', content: reply, local: res.status === 429 };
            setMessages((prev) => [...prev, botMsg]);

            // Habla mientras "escribe" y luego muestra la emoción que indicó el servidor
            const talkMs = reduceMotion ? 600 : Math.min(4500, Math.max(900, reply.length * 6));
            if (!reduceMotion) setTyping({ id: botMsg.id, shown: 0 });
            express('talking', talkMs, finalMood);
            window.setTimeout(() => {
                if (finalMood === 'happy' || finalMood === 'surprised') doBump('hop');
                if (finalMood !== 'idle') express(finalMood, 2200);
            }, talkMs);
        } catch {
            setMessages((prev) => [
                ...prev,
                { id: newId(), role: 'assistant', content: t('randall.error'), local: true },
            ]);
            express('sad', 2600);
            doBump('shake');
        } finally {
            window.clearTimeout(timeout);
            setPending(false);
        }
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        void ask(input);
    };

    const reset = () => {
        setMessages([]);
        setTyping(null);
        express('wink', 900);
        inputRef.current?.focus();
    };

    // Al pulsar un ancla en pantallas chicas se cierra el chat para ver la sección
    const onAnchor = () => {
        if (window.matchMedia('(max-width: 639px)').matches) setOpen(false);
    };

    if (!RANDALL_API_URL) return null;

    const hasUserMessages = messages.some((m) => m.role === 'user');
    const avatarClass = [
        styles.avatar,
        reduceMotion ? '' : styles.float,
        bump === 'hop' && !reduceMotion ? styles.hop : '',
        bump === 'shake' && !reduceMotion ? styles.shake : '',
    ].join(' ');

    return (
        <div className={styles.root}>
            {/* ---------- Panel de chat ---------- */}
            {open && (
                <section id={panelId} className={styles.panel} aria-label={t('randall.log')}>
                    <div className={styles.frame}>
                        <div className={styles.panelInner}>
                            <header className={styles.header}>
                                <RandallSprite mood={mood === 'sleepy' ? 'idle' : mood} blink={blink} mouthOpen={mouthOpen} look={0} className={styles.headerSprite} />
                                <div className={styles.headerText}>
                                    <p className={styles.name}>{t('randall.name')}</p>
                                    <p className={styles.role}>
                                        <span className={styles.statusDot} aria-hidden="true" />
                                        {t('randall.role')}
                                    </p>
                                </div>
                                {hasUserMessages && (
                                    <button type="button" onClick={reset} className={styles.iconBtn} aria-label={t('randall.clear')} title={t('randall.clear')}>
                                        <FaRedo aria-hidden="true" size={11} />
                                    </button>
                                )}
                                <button type="button" onClick={closePanel} className={styles.iconBtn} aria-label={t('randall.close')}>
                                    <FaTimes aria-hidden="true" size={12} />
                                </button>
                            </header>

                            <div ref={logRef} className={styles.log} role="log" aria-live="polite" aria-relevant="additions">
                                <div className={`${styles.msg} ${styles.bot}`}>
                                    <RichText text={t('randall.welcome')} onAnchor={onAnchor} linkClassName={styles.link} />
                                </div>
                                {messages.map((m) => {
                                    const text = typing?.id === m.id ? m.content.slice(0, typing.shown) : m.content;
                                    return (
                                        <div key={m.id} className={`${styles.msg} ${m.role === 'user' ? styles.user : styles.bot}`}>
                                            {m.role === 'user' ? <p>{m.content}</p> : <RichText text={text} onAnchor={onAnchor} linkClassName={styles.link} />}
                                        </div>
                                    );
                                })}
                                {pending && (
                                    <div className={`${styles.msg} ${styles.bot} ${styles.dots}`} aria-label={t('randall.thinking')}>
                                        <span />
                                        <span />
                                        <span />
                                    </div>
                                )}
                                {!hasUserMessages && !pending && (
                                    <div className={styles.chips}>
                                        {list('randall.chips').map((chip) => (
                                            <button key={chip} type="button" className={styles.chip} onClick={() => void ask(chip)}>
                                                {chip}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <form className={styles.form} onSubmit={onSubmit}>
                                <label htmlFor={`${panelId}-input`} className="sr-only">
                                    {t('randall.placeholder')}
                                </label>
                                <input
                                    id={`${panelId}-input`}
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onFocus={() => mood === 'idle' && express('wink', 700)}
                                    placeholder={t('randall.placeholder')}
                                    maxLength={MAX_INPUT}
                                    autoComplete="off"
                                    className={styles.input}
                                />
                                <button type="submit" className={styles.send} disabled={pending || !input.trim()} aria-label={t('randall.send')}>
                                    <FaPaperPlane aria-hidden="true" size={13} />
                                </button>
                            </form>
                            <p className={styles.disclaimer}>{t('randall.disclaimer')}</p>
                        </div>
                    </div>
                </section>
            )}

            {/* ---------- Globo de saludo ---------- */}
            {greeting && !open && (
                <div className={styles.bubble} role="status">
                    <button type="button" className={styles.bubbleText} onClick={openPanel}>
                        {t('randall.greeting')}
                    </button>
                    <button type="button" className={styles.bubbleClose} onClick={() => setGreeting(false)} aria-label={t('randall.dismiss')}>
                        <FaTimes aria-hidden="true" size={9} />
                    </button>
                </div>
            )}

            {/* ---------- Avatar ---------- */}
            <button
                ref={avatarRef}
                type="button"
                className={avatarClass}
                onClick={() => (open ? closePanel() : openPanel())}
                onMouseEnter={() => {
                    if (moodRef.current === 'idle' || moodRef.current === 'sleepy') {
                        express('happy', 1200);
                        doWave();
                    }
                }}
                aria-expanded={open}
                aria-controls={open ? panelId : undefined}
                aria-label={open ? t('randall.close') : t('randall.open')}
            >
                <RandallSprite mood={mood} blink={blink} mouthOpen={mouthOpen} look={look} wave={wave} className={styles.sprite} />
                {mood === 'thinking' && (
                    <span className={styles.think} aria-hidden="true">
                        <i />
                        <i />
                        <i />
                    </span>
                )}
                {mood === 'sleepy' && (
                    <span className={styles.zzz} aria-hidden="true">
                        z<span>z</span>
                    </span>
                )}
            </button>
        </div>
    );
}
