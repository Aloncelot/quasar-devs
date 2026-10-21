'use client';

import { useState, useRef, type FormEvent, type ReactNode } from 'react';
import {
    FaGithub, FaLinkedin, FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaCalendarCheck, FaCopy, FaCheck,
} from 'react-icons/fa';
import emailjs from '@emailjs/browser';
import { useLanguage } from '@/context/LanguageContext';
import { CyberCard, CyberButton } from '@/components/ui/Cyber';
import { EMAIL, GITHUB_URL, LINKEDIN_URL, BOOKING_URL, WHATSAPP, EMAILJS } from '@/lib/config';

const MAX = { name: 80, email: 120, message: 2000 } as const;
const COOLDOWN_MS = 30_000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = 'idle' | 'sending' | 'sent' | 'error';
type FieldErrors = Partial<Record<'name' | 'email' | 'message', boolean>>;

const PROJECT_TYPES = ['software', 'supply', 'both', 'other'] as const;

const ContactLink = ({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-3 text-dim transition-colors hover:text-cyan-neon"
    >
        <span className="text-xl text-cyan-neon" aria-hidden="true">{icon}</span>
        <span className="font-display text-lg font-medium text-ink group-hover:text-cyan-neon">{children}</span>
    </a>
);

export const Contact = () => {
    const { t } = useLanguage();

    const [status, setStatus] = useState<Status>('idle');
    const [errors, setErrors] = useState<FieldErrors>({});
    const [errorText, setErrorText] = useState('');
    const [copied, setCopied] = useState(false);
    const lastSent = useRef(0);

    const copyEmail = async () => {
        try {
            await navigator.clipboard.writeText(EMAIL);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            window.location.href = `mailto:${EMAIL}`;
        }
    };

    const clearError = (field: keyof FieldErrors) => {
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: false }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (status === 'sending' || status === 'sent') return;

        const form = event.currentTarget;
        const data = new FormData(form);
        const name = String(data.get('user_name') ?? '').trim().slice(0, MAX.name);
        const email = String(data.get('user_email') ?? '').trim().slice(0, MAX.email);
        const message = String(data.get('message') ?? '').trim().slice(0, MAX.message);
        const typeKey = String(data.get('project_type') ?? 'software');
        const honeypot = String(data.get('company') ?? '');

        const nextErrors: FieldErrors = {};
        if (!name) nextErrors.name = true;
        if (!EMAIL_RE.test(email)) nextErrors.email = true;
        if (!message) nextErrors.message = true;
        setErrors(nextErrors);

        const firstInvalid = (['name', 'email', 'message'] as const).find((field) => nextErrors[field]);
        if (firstInvalid) {
            const fieldName = { name: 'user_name', email: 'user_email', message: 'message' }[firstInvalid];
            form.querySelector<HTMLElement>(`[name="${fieldName}"]`)?.focus();
            return;
        }

        // Campo trampa: los bots lo rellenan, las personas no lo ven. Se simula éxito sin enviar nada.
        if (honeypot) {
            setStatus('sent');
            form.reset();
            setTimeout(() => setStatus('idle'), 6000);
            return;
        }

        if (Date.now() - lastSent.current < COOLDOWN_MS) {
            setErrorText(t('contact.err_wait'));
            setStatus('error');
            setTimeout(() => setStatus('idle'), 5000);
            return;
        }

        const { serviceId, templateId, publicKey } = EMAILJS;
        if (!serviceId || !templateId || !publicKey) {
            setErrorText(t('contact.err_text'));
            setStatus('error');
            setTimeout(() => setStatus('idle'), 5000);
            return;
        }

        const typeLabel = t(`contact.type_${PROJECT_TYPES.includes(typeKey as (typeof PROJECT_TYPES)[number]) ? typeKey : 'other'}`);

        setStatus('sending');
        setErrorText('');
        try {
            await emailjs.send(
                serviceId,
                templateId,
                {
                    user_name: name,
                    user_email: email,
                    project_type: typeLabel,
                    // El tipo de proyecto también va dentro del mensaje para que llegue aunque la plantilla no tenga {{project_type}}
                    message: `[${typeLabel}]\n\n${message}`,
                },
                { publicKey }
            );
            lastSent.current = Date.now();
            setStatus('sent');
            form.reset();
            setTimeout(() => setStatus('idle'), 6000);
        } catch {
            setErrorText(t('contact.err_text'));
            setStatus('error');
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    const buttonLabel =
        status === 'sending' ? t('contact.btn_sending')
            : status === 'sent' ? t('contact.btn_sent')
                : status === 'error' ? t('contact.btn_err')
                    : t('contact.btn_idle');

    return (
        <section id="contacto" className="veil-deep relative scroll-mt-16 py-24 md:py-32">
            <div className="mx-auto grid max-w-7xl gap-14 px-6 md:px-10 lg:grid-cols-2 lg:gap-20">
                {/* Datos de contacto */}
                <div className="flex flex-col justify-center">
                    <h2 className="font-display text-4xl font-bold leading-tight text-white md:text-5xl">
                        {t('contact.title')}
                    </h2>
                    <p className="mt-5 max-w-lg text-lg leading-relaxed text-dim">{t('contact.desc')}</p>

                    <ul className="mt-10 space-y-5">
                        <li className="flex flex-wrap items-center gap-3">
                            <a
                                href={`mailto:${EMAIL}`}
                                className="group inline-flex items-center gap-3"
                            >
                                <span className="text-xl text-cyan-neon" aria-hidden="true"><FaEnvelope /></span>
                                <span className="font-display text-lg font-medium text-ink group-hover:text-cyan-neon">{EMAIL}</span>
                            </a>
                            <button
                                type="button"
                                onClick={copyEmail}
                                aria-label={t('contact.copy')}
                                className="inline-flex items-center gap-2 rounded-sm border border-violet-neon/40 px-2.5 py-1 text-sm text-dim transition-colors hover:border-cyan-neon hover:text-cyan-neon"
                            >
                                {copied ? <FaCheck aria-hidden="true" /> : <FaCopy aria-hidden="true" />}
                                <span aria-live="polite">{copied ? t('contact.copied') : t('contact.copy')}</span>
                            </button>
                        </li>
                        {WHATSAPP && (
                            <li>
                                <ContactLink href={`https://wa.me/${WHATSAPP}`} icon={<FaWhatsapp />}>
                                    {t('contact.whatsapp')}
                                </ContactLink>
                            </li>
                        )}
                        {BOOKING_URL && (
                            <li>
                                <ContactLink href={BOOKING_URL} icon={<FaCalendarCheck />}>
                                    {t('contact.booking')}
                                </ContactLink>
                            </li>
                        )}
                        <li className="flex items-center gap-3 text-dim">
                            <span className="text-xl text-cyan-neon" aria-hidden="true"><FaMapMarkerAlt /></span>
                            <span className="font-display text-lg font-medium text-ink">{t('contact.city')}</span>
                        </li>
                        <li className="flex gap-3 pt-2">
                            {GITHUB_URL && (
                                <a
                                    href={GITHUB_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={t('contact.github')}
                                    className="rounded-sm border border-violet-neon/40 p-3 text-xl text-dim transition-colors hover:border-cyan-neon hover:text-cyan-neon"
                                >
                                    <FaGithub aria-hidden="true" />
                                </a>
                            )}
                            {LINKEDIN_URL && (
                                <a
                                    href={LINKEDIN_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={t('contact.linkedin')}
                                    className="rounded-sm border border-violet-neon/40 p-3 text-xl text-dim transition-colors hover:border-cyan-neon hover:text-cyan-neon"
                                >
                                    <FaLinkedin aria-hidden="true" />
                                </a>
                            )}
                        </li>
                    </ul>
                </div>

                {/* Formulario */}
                <CyberCard accent="cyan" bodyClassName="!p-6 md:!p-8">
                    <form onSubmit={handleSubmit} noValidate className="block space-y-5">
                        <h3 className="font-display text-2xl font-semibold text-white">{t('contact.form_title')}</h3>

                        {/* Campo trampa anti-spam (oculto a personas y lectores de pantalla) */}
                        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                            <label htmlFor="company">Company</label>
                            <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
                        </div>

                        <div>
                            <label htmlFor="user_name" className="mb-2 block font-display text-sm font-medium text-dim">
                                {t('contact.label_name')}
                            </label>
                            <input
                                id="user_name"
                                name="user_name"
                                type="text"
                                autoComplete="name"
                                maxLength={MAX.name}
                                placeholder={t('contact.ph_name')}
                                onChange={() => clearError('name')}
                                aria-invalid={errors.name ? 'true' : 'false'}
                                aria-describedby={errors.name ? 'err-name' : undefined}
                                className="field"
                            />
                            {errors.name && <p id="err-name" role="alert" className="mt-2 text-sm text-magenta-neon">{t('contact.err_name')}</p>}
                        </div>

                        <div>
                            <label htmlFor="user_email" className="mb-2 block font-display text-sm font-medium text-dim">
                                {t('contact.label_email')}
                            </label>
                            <input
                                id="user_email"
                                name="user_email"
                                type="email"
                                inputMode="email"
                                autoComplete="email"
                                maxLength={MAX.email}
                                placeholder={t('contact.ph_email')}
                                onChange={() => clearError('email')}
                                aria-invalid={errors.email ? 'true' : 'false'}
                                aria-describedby={errors.email ? 'err-email' : undefined}
                                className="field"
                            />
                            {errors.email && <p id="err-email" role="alert" className="mt-2 text-sm text-magenta-neon">{t('contact.err_email')}</p>}
                        </div>

                        <div>
                            <label htmlFor="project_type" className="mb-2 block font-display text-sm font-medium text-dim">
                                {t('contact.label_type')}
                            </label>
                            <select id="project_type" name="project_type" defaultValue="software" className="field">
                                {PROJECT_TYPES.map((type) => (
                                    <option key={type} value={type}>{t(`contact.type_${type}`)}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="message" className="mb-2 block font-display text-sm font-medium text-dim">
                                {t('contact.label_msg')}
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                rows={5}
                                maxLength={MAX.message}
                                placeholder={t('contact.ph_msg')}
                                onChange={() => clearError('message')}
                                aria-invalid={errors.message ? 'true' : 'false'}
                                aria-describedby={errors.message ? 'err-message' : undefined}
                                className="field resize-y"
                            />
                            {errors.message && <p id="err-message" role="alert" className="mt-2 text-sm text-magenta-neon">{t('contact.err_msg')}</p>}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 pt-1">
                            <CyberButton
                                type="submit"
                                variant="solid"
                                accent={status === 'error' ? 'magenta' : 'cyan'}
                                disabled={status === 'sending' || status === 'sent'}
                            >
                                {buttonLabel}
                            </CyberButton>
                            <p className="text-sm text-dim">{t('contact.privacy')}</p>
                        </div>

                        <div role="status" aria-live="polite">
                            {status === 'sent' && (
                                <div className="border-l-2 border-cyan-neon bg-cyan-neon/10 p-4">
                                    <p className="font-display text-lg font-semibold text-cyan-neon">{t('contact.sent_title')}</p>
                                    <p className="mt-1 text-sm text-ink/90">{t('contact.sent_text')}</p>
                                </div>
                            )}
                            {status === 'error' && (
                                <div className="border-l-2 border-magenta-neon bg-magenta-neon/10 p-4">
                                    <p className="text-sm text-ink/90">{errorText}</p>
                                </div>
                            )}
                        </div>
                    </form>
                </CyberCard>
            </div>
        </section>
    );
};
