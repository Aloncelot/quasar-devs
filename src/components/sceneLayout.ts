/**
 * Medidas compartidas entre la escena 3D de la principal y el Hero.
 * Vive aparte para que el Hero no importe three.js solo por esta constante.
 */

/** Desplazamiento del quasar en pantalla durante el Hero (fracción del ancho/alto del viewport). */
export const HERO_CORE_SHIFT = { desktopX: 0.18, mobileY: 0.2 } as const;
