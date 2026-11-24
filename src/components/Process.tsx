'use client';

import { useLanguage } from '@/context/LanguageContext';
import { CyberLink } from '@/components/ui/Cyber';

const STEPS = ['s1', 's2', 's3', 's4'] as const;

type Tone = 'default' | 'sw';

// Colores por ruta (clases completas para Tailwind)
const TONE = {
    default: { line: '[--dash:#8a63ff]', dot: 'bg-cyan-neon shadow-[0_0_12px_#4debff]', stroke: '[-webkit-text-stroke:1px_#8a63ff]', btn: 'cyan' as const },
    sw: { line: '[--dash:#b9a3ff]', dot: 'bg-[#b9a3ff] shadow-[0_0_12px_#8a63ff]', stroke: '[-webkit-text-stroke:1px_#e055ff]', btn: 'violet' as const },
};

export const Process = ({ tone = 'default' }: { tone?: Tone }) => {
    const c = TONE[tone];
    const { t } = useLanguage();

    return (
        <section id="proceso" className="veil-deep relative scroll-mt-16 py-24 md:py-28">
            <div className="mx-auto max-w-7xl px-6 md:px-10">
                <h2 className="max-w-3xl font-display text-3xl font-bold leading-tight text-white md:text-5xl">
                    {t('process.title')}
                </h2>

                {/* Los pasos sí son una secuencia: por eso van numerados */}
                <ol className="mt-14 grid gap-10 md:grid-cols-4 md:gap-8">
                    {STEPS.map((step, index) => (
                        <li key={step} className="relative pt-8">
                            <span aria-hidden="true" className={`dash-line absolute inset-x-0 top-0 ${c.line}`} />
                            <span
                                aria-hidden="true"
                                className={`absolute -top-[6px] left-0 h-3 w-3 rounded-full ${c.dot}`}
                            />
                            <span
                                aria-hidden="true"
                                className={`block font-display text-5xl font-bold leading-none text-transparent ${c.stroke}`}
                            >
                                {index + 1}
                            </span>
                            <h3 className="mt-4 font-display text-xl font-semibold text-white">
                                {t(`process.${step}_title`)}
                            </h3>
                            <p className="mt-2 max-w-xs text-[0.95rem] leading-relaxed text-dim">
                                {t(`process.${step}_desc`)}
                            </p>
                        </li>
                    ))}
                </ol>

                <div className="mt-12">
                    <CyberLink href="#contacto" variant="solid" accent={c.btn}>
                        {t('process.cta')}
                    </CyberLink>
                </div>
            </div>
        </section>
    );
};
