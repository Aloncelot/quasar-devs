'use client';

import dynamic from 'next/dynamic';

/**
 * Randall se carga solo en el navegador y después del contenido principal,
 * así no afecta el tiempo de carga ni el SEO de la landing.
 */
export const RandallLazy = dynamic(() => import('./Randall'), { ssr: false });
