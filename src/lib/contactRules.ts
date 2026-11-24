/**
 * Reglas del formulario de contacto, compartidas por el navegador (Contact.tsx) y el servidor
 * (/api/contact): así lo que el formulario acepta es exactamente lo que el servidor acepta.
 */

/** Largo máximo de cada campo. */
export const CONTACT_MAX = { name: 80, email: 120, message: 2000 } as const;

/** Correo con dominio y terminación de al menos 2 letras (ej. nombre@empresa.mx). */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const PROJECT_TYPES = ['software', 'supply', 'both', 'other'] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const isProjectType = (value: unknown): value is ProjectType =>
    PROJECT_TYPES.includes(value as ProjectType);
