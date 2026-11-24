'use client';

import dynamic from 'next/dynamic';

/** Mismo contenedor y resplandor CSS que muestra la escena mientras arranca WebGL. */
const SceneFallback = () => (
    <div aria-hidden="true" className="fixed left-0 top-0 -z-10 h-screen w-full bg-void">
        <div data-loaded="false" className="scene-fallback skeleton-fade" />
    </div>
);

/**
 * Galaxia de fondo de la principal. three.js (~230 KB gzip) se descarga aparte y solo en el
 * navegador: el texto de la página se pinta e hidrata sin esperar a la escena 3D.
 */
export const ParticlesSceneLazy = dynamic(() => import('./ParticlesScene'), { ssr: false, loading: SceneFallback });
