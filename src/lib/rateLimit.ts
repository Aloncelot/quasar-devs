/**
 * Límite de peticiones para rutas del servidor (ventana fija).
 *
 * En Vercel cada petición puede ejecutarse en una instancia distinta, así que los contadores
 * viven en Upstash Redis (REST). Variables: KV_REST_API_URL + KV_REST_API_TOKEN (integración de
 * Vercel) o UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN. Si faltan o Redis falla, se usa
 * memoria (protege menos, pero el sitio sigue funcionando).
 */

const REDIS_URL = (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '').replace(/\/+$/, '');
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';

const memory = new Map<string, { count: number; expires: number }>();

function incrMemory(key: string, windowSec: number): number {
    const now = Date.now();
    const entry = memory.get(key);
    if (!entry || entry.expires <= now) {
        memory.set(key, { count: 1, expires: now + windowSec * 1000 });
        if (memory.size > 10_000) {
            for (const [k, v] of memory) if (v.expires <= now) memory.delete(k);
        }
        return 1;
    }
    entry.count += 1;
    return entry.count;
}

async function incr(key: string, windowSec: number): Promise<number> {
    const bucket = Math.floor(Date.now() / 1000 / windowSec);
    const fullKey = `qd:${key}:${bucket}`;
    if (REDIS_URL && REDIS_TOKEN) {
        try {
            const res = await fetch(`${REDIS_URL}/pipeline`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
                body: JSON.stringify([['INCR', fullKey], ['EXPIRE', fullKey, String(windowSec + 5)]]),
                cache: 'no-store',
                signal: AbortSignal.timeout(2000),
            });
            if (res.ok) {
                const data = (await res.json()) as Array<{ result?: number }>;
                const value = Number(data?.[0]?.result);
                if (Number.isFinite(value)) return value;
            }
        } catch {
            // Redis no disponible: seguimos con memoria
        }
    }
    return incrMemory(fullKey, windowSec);
}

export interface Limit {
    key: string;
    max: number;
    windowSec: number;
}

/** Devuelve true si TODAS las reglas permiten la petición. Se detiene en la primera que se excede. */
export async function allow(limits: Limit[]): Promise<boolean> {
    for (const { key, max, windowSec } of limits) {
        if ((await incr(key, windowSec)) > max) return false;
    }
    return true;
}

/** IP del visitante (Vercel pone la IP real en x-real-ip / x-forwarded-for). */
export function clientIp(headers: Headers): string {
    return (
        headers.get('x-real-ip')?.trim() ||
        headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        'unknown'
    );
}
