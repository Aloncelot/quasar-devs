'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/Skeleton';

/** Lugar del avatar mientras se descarga Randall (mismo tamaño y posición). */
const RandallSkeleton = () => (
    <div className="fixed bottom-4 left-4 z-[45] h-[calc(100vh/15)] w-[calc(100vh/15)] supports-[height:1svh]:h-[calc(100svh/15)] supports-[height:1svh]:w-[calc(100svh/15)]">
        <Skeleton chamfer className="h-full w-full opacity-70" />
    </div>
);

/**
 * Randall se carga solo en el navegador y después del contenido principal,
 * así no afecta el tiempo de carga ni el SEO de la landing.
 */
export const RandallLazy = dynamic(() => import('./Randall'), { ssr: false, loading: RandallSkeleton });
