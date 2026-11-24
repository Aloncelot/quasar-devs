import type { MetadataRoute } from 'next';

const BASE = 'https://quasardevs.com';

export default function sitemap(): MetadataRoute.Sitemap {
    const pages: { path: string; priority: number }[] = [
        { path: '', priority: 1 },
        { path: '/software', priority: 0.9 },
        { path: '/supply-chain', priority: 0.9 },
        { path: '/sobre-mi', priority: 0.6 },
        { path: '/aviso-de-privacidad', priority: 0.2 },
    ];
    return pages.map(({ path, priority }) => ({ url: `${BASE}${path}`, changeFrequency: 'monthly', priority }));
}
