'use client';

import Image from 'next/image';
import { FaMapMarkerAlt, FaLanguage } from 'react-icons/fa';
import { useLanguage } from '@/context/LanguageContext';
import { CyberCard, CyberLink, Chip, type Accent } from '@/components/ui/Cyber';

const STATS = [
    { value: 'about.stat1_value', label: 'about.stat1_label', color: 'text-magenta-neon' },
    { value: 'about.stat2_value', label: 'about.stat2_label', color: 'text-cyan-neon' },
    { value: 'about.stat3_value', label: 'about.stat3_label', color: 'text-violet-neon' },
] as const;

const STACKS: { list: string; label: string; accent: Accent }[] = [
    { list: 'about.stack_sw', label: 'about.stack_sw_label', accent: 'cyan' },
    { list: 'about.stack_cloud', label: 'about.stack_cloud_label', accent: 'violet' },
    { list: 'about.stack_sc', label: 'about.stack_sc_label', accent: 'magenta' },
];

export const About = () => {
    const { t, list } = useLanguage();

    return (
        <section id="sobre-mi" className="veil relative scroll-mt-16 py-24 md:py-32">
            <div className="mx-auto grid max-w-7xl gap-14 px-6 md:px-10 lg:grid-cols-12 lg:gap-16">
                {/* Retrato */}
                <div className="lg:col-span-4">
                    <CyberCard accent="violet" bodyClassName="!p-3">
                        <span className="duotone relative block h-96 w-full overflow-hidden">
                            <Image
                                src="/alonso-correa.jpeg"
                                alt={t('about.photo_alt')}
                                fill
                                sizes="(min-width: 1024px) 380px, (min-width: 640px) 520px, 90vw"
                                className="object-cover"
                            />
                        </span>
                    </CyberCard>

                    <ul className="mt-6 space-y-3 text-dim">
                        <li className="flex items-center gap-3">
                            <FaMapMarkerAlt className="text-cyan-neon" aria-hidden="true" />
                            <span>{t('about.base')}</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <FaLanguage className="text-cyan-neon" aria-hidden="true" />
                            <span>{t('about.langs')}</span>
                        </li>
                    </ul>
                </div>

                {/* Texto */}
                <div className="lg:col-span-8">
                    <h2 className="max-w-2xl font-display text-4xl font-bold leading-tight text-white md:text-5xl">
                        {t('about.title')}
                    </h2>
                    <p className="mt-4 font-display text-xl font-semibold text-cyan-neon">
                        {t('about.name')}
                        <span className="font-medium text-dim"> · {t('about.role')}</span>
                    </p>

                    <div className="mt-8 max-w-2xl space-y-4 text-lg leading-relaxed text-ink/90">
                        <p>{t('about.p1')}</p>
                        <p>{t('about.p2')}</p>
                        <p>{t('about.p3')}</p>
                    </div>

                    <dl className="mt-10 grid gap-6 sm:grid-cols-3">
                        {STATS.map((stat) => (
                            <div key={stat.value} className="flex flex-col-reverse border-l-2 border-violet-neon/50 pl-4">
                                <dt className="mt-1 text-sm leading-snug text-dim">{t(stat.label)}</dt>
                                <dd className={`font-display text-3xl font-bold ${stat.color}`}>{t(stat.value)}</dd>
                            </div>
                        ))}
                    </dl>

                    <h3 className="mt-12 font-display text-xl font-semibold text-white">{t('about.stack_title')}</h3>
                    <div className="mt-5 grid gap-6 sm:grid-cols-2">
                        {STACKS.map((group) => (
                            <div key={group.list}>
                                <p className="mb-2 font-display text-sm font-medium text-dim">{t(group.label)}</p>
                                <ul className="flex flex-wrap gap-2">
                                    {list(group.list).map((item) => (
                                        <li key={item}>
                                            <Chip accent={group.accent}>{item}</Chip>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12">
                        <CyberLink href="#contacto" variant="solid">
                            {t('about.cta')}
                        </CyberLink>
                    </div>
                </div>
            </div>
        </section>
    );
};
