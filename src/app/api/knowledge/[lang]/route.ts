import { buildKnowledge, type KnowledgeLang } from '@/lib/knowledge';

/**
 * GET /api/knowledge/es  y  /api/knowledge/en
 * Texto (Markdown) con todo lo que dice la landing, para que Randall responda con la misma información.
 * Se genera al compilar (estático): no consume funciones ni base de datos.
 */
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
    return [{ lang: 'es' }, { lang: 'en' }];
}

export async function GET(_request: Request, { params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    if (lang !== 'es' && lang !== 'en') return new Response('Not found', { status: 404 });

    return new Response(buildKnowledge(lang as KnowledgeLang), {
        headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Cache-Control': 'public, max-age=300, s-maxage=3600',
            'X-Robots-Tag': 'noindex',
        },
    });
}
