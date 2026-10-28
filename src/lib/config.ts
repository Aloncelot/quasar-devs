/**
 * Configuración pública del sitio.
 * Las variables NEXT_PUBLIC_* se incluyen en el JavaScript del navegador: nunca guardes aquí secretos.
 */

/** Solo se aceptan URLs https para evitar esquemas peligrosos (javascript:, data:) desde variables de entorno. */
const safeHttps = (value: string | undefined, fallback?: string) =>
    value && /^https:\/\//i.test(value) ? value : fallback;

export const EMAIL = process.env.NEXT_PUBLIC_EMAIL || 'aloncelot@gmail.com';
export const GITHUB_URL = safeHttps(process.env.NEXT_PUBLIC_GITHUB_URL, 'https://github.com/Aloncelot');
export const LINKEDIN_URL = safeHttps(
    process.env.NEXT_PUBLIC_LINKEDIN_URL,
    'https://www.linkedin.com/in/alonso-correap/'
);
/** Opcional: enlace de agenda (Calendly, Cal.com, Google Calendar...). */
export const BOOKING_URL = safeHttps(process.env.NEXT_PUBLIC_BOOKING_URL);
/** Opcional: número de WhatsApp con lada país, solo dígitos (ej. 5215512345678). */
export const WHATSAPP = (process.env.NEXT_PUBLIC_WHATSAPP || '').replace(/\D/g, '');

/**
 * URL del backend de Randall (chatbot en Python). En desarrollo usa http://localhost:8000 por defecto.
 * Solo acepta https (o http en localhost). Si falta en producción, Randall no se muestra.
 */
const safeApi = (value: string | undefined) =>
    value && (/^https:\/\//i.test(value) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(value))
        ? value.replace(/\/+$/, '')
        : undefined;
export const RANDALL_API_URL =
    safeApi(process.env.NEXT_PUBLIC_RANDALL_API_URL) ??
    (process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : undefined);

export const EMAILJS = {
    serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
    templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
    publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
};
