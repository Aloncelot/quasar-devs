import { es } from '@/i18n/es';
import { en } from '@/i18n/en';
import { allow, clientIp } from '@/lib/rateLimit';

/**
 * POST /api/contact — envía el formulario de contacto por EmailJS desde el servidor.
 *
 * Por qué en el servidor: la llave privada de EmailJS nunca llega al navegador, y los límites,
 * el campo trampa y el tiempo mínimo de llenado se validan aquí, donde un bot no puede saltárselos.
 *
 * Variables (solo servidor): EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY,
 * EMAILJS_PRIVATE_KEY. Límites opcionales: CONTACT_PER_HOUR, CONTACT_PER_DAY, CONTACT_GLOBAL_PER_DAY.
 */
export const dynamic = 'force-dynamic';

const MAX = { name: 80, email: 120, message: 2000 } as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TYPES = ['software', 'supply', 'both', 'other'] as const;
const MIN_FILL_MS = 3_000; // un humano tarda más de 3 s en llenar el formulario
const MAX_BODY_BYTES = 10_000;

const num = (value: string | undefined, fallback: number) => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : fallback;
};

/** Quita caracteres de control (menos saltos de línea y tabuladores) y recorta. */
const clean = (value: unknown, max: number) =>
    // eslint-disable-next-line no-control-regex
    (typeof value === 'string' ? value : '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);

const json = (body: Record<string, unknown>, status: number, headers?: Record<string, string>) =>
    Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });

export async function POST(request: Request) {
    // 1. Solo desde este mismo sitio
    const origin = request.headers.get('origin');
    if (!origin || origin !== new URL(request.url).origin) return json({ error: 'forbidden' }, 403);

    // 2. Tamaño y formato del cuerpo
    const length = Number(request.headers.get('content-length') ?? 0);
    if (length > MAX_BODY_BYTES) return json({ error: 'too_large' }, 413);
    let raw: Record<string, unknown>;
    try {
        const text = await request.text();
        if (text.length > MAX_BODY_BYTES) return json({ error: 'too_large' }, 413);
        raw = JSON.parse(text);
    } catch {
        return json({ error: 'invalid' }, 400);
    }

    const lang = raw.lang === 'en' ? 'en' : 'es';
    const name = clean(raw.name, MAX.name);
    const email = clean(raw.email, MAX.email);
    const message = clean(raw.message, MAX.message);
    const type = TYPES.includes(raw.type as (typeof TYPES)[number]) ? (raw.type as (typeof TYPES)[number]) : 'other';
    const startedAt = Number(raw.startedAt);

    if (!name || !EMAIL_RE.test(email) || !message || raw.consent !== true) {
        return json({ error: 'invalid' }, 422);
    }

    // 3. Trampas para bots: campo oculto relleno o formulario llenado "instantáneamente".
    //    Se responde como si todo saliera bien para no darle pistas al bot.
    const elapsed = Date.now() - startedAt;
    if (clean(raw.company, 200) || !Number.isFinite(startedAt) || elapsed < MIN_FILL_MS) {
        return json({ ok: true }, 200);
    }

    // 4. Límites: por visitante y global (el plan gratis de EmailJS tiene un tope mensual)
    const ip = clientIp(request.headers);
    const allowed = await allow([
        { key: `contact:ip:${ip}:h`, max: num(process.env.CONTACT_PER_HOUR, 3), windowSec: 3_600 },
        { key: `contact:ip:${ip}:d`, max: num(process.env.CONTACT_PER_DAY, 5), windowSec: 86_400 },
        { key: 'contact:global:d', max: num(process.env.CONTACT_GLOBAL_PER_DAY, 20), windowSec: 86_400 },
    ]);
    if (!allowed) return json({ error: 'rate_limited' }, 429, { 'Retry-After': '3600' });

    // 5. Envío por la API REST de EmailJS con la llave privada
    const serviceId = process.env.EMAILJS_SERVICE_ID || process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID || process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY || process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;
    if (!serviceId || !templateId || !publicKey || !privateKey) {
        console.error('[contact] Faltan variables de EmailJS en el servidor');
        return json({ error: 'unavailable' }, 503);
    }

    const dict = lang === 'en' ? en : es;
    const typeLabel = dict.contact[`type_${type}`];

    try {
        const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                service_id: serviceId,
                template_id: templateId,
                user_id: publicKey,
                accessToken: privateKey,
                template_params: {
                    user_name: name,
                    user_email: email,
                    project_type: typeLabel,
                    // Evidencia del consentimiento al Aviso de Privacidad (fecha y hora de aceptación)
                    privacy_accepted: new Date().toISOString(),
                    // El tipo de proyecto también va en el mensaje por si la plantilla no tiene {{project_type}}
                    message: `[${typeLabel}]\n\n${message}`,
                },
            }),
            cache: 'no-store',
            signal: AbortSignal.timeout(10_000),
        });
        if (!res.ok) {
            console.error('[contact] EmailJS respondió', res.status);
            return json({ error: 'send_failed' }, 502);
        }
        return json({ ok: true }, 200);
    } catch {
        console.error('[contact] No se pudo contactar a EmailJS');
        return json({ error: 'send_failed' }, 502);
    }
}
