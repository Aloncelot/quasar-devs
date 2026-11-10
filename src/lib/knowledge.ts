/**
 * Base de conocimiento de Randall generada desde los textos de la landing.
 *
 * Es la ÚNICA fuente de verdad: Randall (randall-api) descarga este texto desde
 * /api/knowledge/es y /api/knowledge/en, así que al cambiar es.ts / en.ts,
 * data/projects.ts o lib/config.ts, Randall se actualiza solo en el siguiente despliegue.
 */
import { es } from '@/i18n/es';
import { en } from '@/i18n/en';
import { PROJECTS } from '@/data/projects';
import { BOOKING_URL, EMAIL, GITHUB_URL, LINKEDIN_URL, WHATSAPP } from '@/lib/config';

export type KnowledgeLang = 'es' | 'en';

type Dict = typeof es;
type Section = Record<string, string>;

const LABELS = {
    es: {
        heading: 'Quasar Devs — base de conocimiento de Randall (generada desde el sitio)',
        about_site: 'Qué es Quasar Devs',
        services: 'Servicios',
        process: 'Proceso de trabajo (sección #proceso)',
        projects: 'Proyectos en órbita (sección #proyectos)',
        about: 'Sobre el fundador (sección #sobre-mi)',
        contact: 'Contacto y cotizaciones (sección #contacto)',
        privacy: 'Privacidad',
        tags: 'Tecnologías / temas',
        tech: 'Tecnología',
        link: 'Enlace',
        soon: 'Próximamente',
        email: 'Correo',
        whatsapp: 'WhatsApp',
        booking: 'Agendar llamada',
        form: 'Formulario de contacto en #contacto. Tipos de proyecto',
        experience: 'Experiencia',
        tools: 'Herramientas',
        languages: 'Idiomas',
        base: 'Ubicación',
        pricing: 'Precios: no hay precios fijos publicados; cada proyecto se cotiza según su alcance después del diagnóstico.',
    },
    en: {
        heading: "Quasar Devs — Randall's knowledge base (generated from the website)",
        about_site: 'What Quasar Devs is',
        services: 'Services',
        process: 'How we work (section #proceso)',
        projects: 'Projects in orbit (section #proyectos)',
        about: 'About the founder (section #sobre-mi)',
        contact: 'Contact and quotes (section #contacto)',
        privacy: 'Privacy',
        tags: 'Technologies / topics',
        tech: 'Tech',
        link: 'Link',
        soon: 'Coming soon',
        email: 'Email',
        whatsapp: 'WhatsApp',
        booking: 'Book a call',
        form: 'Contact form at #contacto. Project types',
        experience: 'Experience',
        tools: 'Tools',
        languages: 'Languages',
        base: 'Location',
        pricing: 'Pricing: there are no fixed published prices; each project is quoted by scope after the assessment.',
    },
} as const;

const tags = (value: string | undefined) => (value ?? '').split('|').map((t) => t.trim()).filter(Boolean).join(', ');

/** Toma pares *_title / *_desc / *_tags de una sección (servicios). */
function items(section: Section, l: (typeof LABELS)[KnowledgeLang]): string[] {
    return Object.keys(section)
        .filter((k) => k.endsWith('_title'))
        .map((k) => {
            const p = k.slice(0, -'_title'.length);
            const t = tags(section[`${p}_tags`]);
            return `- **${section[k]}**: ${section[`${p}_desc`] ?? ''}${t ? ` (${l.tags}: ${t})` : ''}`;
        });
}

export function buildKnowledge(lang: KnowledgeLang): string {
    const d: Dict = lang === 'es' ? es : en;
    const l = LABELS[lang];
    const sw = d.services.sw as Section;
    const sc = d.services.sc as Section;
    const proc = d.process as Section;
    const proj = d.projects as Section;
    const ab = d.about as Section;
    const ct = d.contact as Section;

    const steps = [1, 2, 3, 4, 5, 6]
        .filter((n) => proc[`s${n}_title`])
        .map((n) => `${n}. **${proc[`s${n}_title`]}**: ${proc[`s${n}_desc`]}`);

    const projects = PROJECTS.map((p) => {
        const extra = [
            p.tech ? `${l.tech}: ${p.tech}` : '',
            p.url && p.url !== '#' ? `${l.link}: ${p.url}` : l.soon,
        ].filter(Boolean);
        return `- **${proj[`${p.key}_title`]}** (${proj[`${p.key}_cat`]}): ${proj[`${p.key}_desc`]} ${extra.join(' · ')}`;
    });

    const contact = [
        `- ${l.email}: ${EMAIL}`,
        LINKEDIN_URL ? `- LinkedIn: ${LINKEDIN_URL}` : '',
        GITHUB_URL ? `- GitHub: ${GITHUB_URL}` : '',
        WHATSAPP ? `- ${l.whatsapp}: https://wa.me/${WHATSAPP}` : '',
        BOOKING_URL ? `- ${l.booking}: ${BOOKING_URL}` : '',
        `- ${l.form}: ${[ct.type_software, ct.type_supply, ct.type_both, ct.type_other].join('; ')}.`,
        `- ${ct.desc}`,
        `- ${l.pricing}`,
    ].filter(Boolean);

    return [
        `# ${l.heading}`,
        '',
        `## ${l.about_site}`,
        `- ${d.hero.headline}`,
        `- ${d.hero.sub}`,
        `- ${d.meta.description}`,
        `- ${d.footer.tagline}`,
        '',
        `## ${l.services}: ${d.services.title}`,
        `### ${sw.title} (#software)`,
        sw.desc,
        ...items(sw, l),
        '',
        `### ${sc.title} (#supply-chain)`,
        sc.desc,
        ...items(sc, l),
        '',
        `## ${l.process}`,
        proc.title,
        ...steps,
        '',
        `## ${l.projects}`,
        ...projects,
        '',
        `## ${l.about}`,
        `- ${ab.name}: ${ab.role}`,
        `- ${ab.p1}`,
        `- ${ab.p2}`,
        `- ${ab.p3}`,
        `- ${l.experience}: ${ab.stat1_value} ${ab.stat1_label}; ${ab.stat2_value} ${ab.stat2_label}; ${ab.stat3_value} ${ab.stat3_label}.`,
        `- ${l.tools}: ${ab.stack_sw_label}: ${tags(ab.stack_sw)}. ${ab.stack_cloud_label}: ${tags(ab.stack_cloud)}. ${ab.stack_sc_label}: ${tags(ab.stack_sc)}.`,
        `- ${l.languages}: ${ab.langs}. ${l.base}: ${ab.base}.`,
        '',
        `## ${l.contact}`,
        ...contact,
        '',
        `## ${l.privacy}`,
        `- ${d.cookies.text}`,
        `- ${ct.privacy}`,
        '',
    ].join('\n');
}
