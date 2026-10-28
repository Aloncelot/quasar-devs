import type { Accent } from '@/components/ui/Cyber';

/**
 * Proyectos de la sección "Proyectos en órbita".
 *
 * Para agregar uno nuevo:
 *  1. Agrega un objeto al final de esta lista (el orden es el de la ruta).
 *  2. Agrega sus textos en src/i18n/es.ts y en.ts dentro de `projects`:
 *     pN_title, pN_cat y pN_desc (usa el mismo `key` que pongas aquí).
 *  3. `url: '#'` lo muestra como "Próximamente".
 *
 * La ruta se reparte sola: hasta ~5 proyectos caben en pantallas anchas; con más,
 * la ruta se puede desplazar horizontalmente (con flechas, rueda o arrastrando).
 */
export interface ProjectItem {
    key: string;          // prefijo de textos en i18n, ej. "p6"
    tech: string;
    color: string;        // color del nodo y del texto de acento
    accent: Accent;       // color del borde de la tarjeta
    url: string;          // '#' = próximamente
    icon: 'database' | 'code' | 'cube' | 'cart' | 'tasks' | 'robot' | 'warehouse' | 'chart';
}

export const PROJECTS: ProjectItem[] = [
    { key: 'p1', tech: 'Next.js + .NET', color: '#8a63ff', accent: 'violet', url: '#', icon: 'database' },
    { key: 'p2', tech: 'React + Firebase', color: '#4debff', accent: 'cyan', url: 'https://www.jorge-valdez-nutricion-clinica.com.mx', icon: 'code' },
    { key: 'p3', tech: 'Docker + AWS + TypeScript', color: '#e055ff', accent: 'magenta', url: 'https://quasar-logistic.vercel.app/', icon: 'cube' },
    { key: 'p4', tech: 'Next.js + Azure SQL', color: '#3c8dff', accent: 'azure', url: 'https://vibe-fit-lac.vercel.app/', icon: 'cart' },
    { key: 'p5', tech: '', color: '#7df9ff', accent: 'cyan', url: 'https://task-manager-orcin-omega-81.vercel.app/', icon: 'tasks' },
];
