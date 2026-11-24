'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { CyberCard } from '@/components/ui/Cyber';
import { Skeleton } from '@/components/ui/Skeleton';
import { Kicker } from '@/components/route/RouteParts';

/** Bloque corto "Quién está detrás" de la página principal; la historia completa vive en /sobre-mi. */
export const AboutTeaser = () => {
    const { t } = useLanguage();
    const [loaded, setLoaded] = useState(false);

    return (
        <section id="sobre-mi" className="veil relative scroll-mt-16 py-20 md:py-24">
            <div className="mx-auto max-w-7xl px-6 md:px-10">
                {/* Texto a la izquierda con tipografía grande; foto pequeña a la derecha, en su proporción original (sin recorte ni zoom) */}
                <CyberCard
                    accent="violet"
                    bodyClassName="grid grid-cols-[1fr_6.5rem] items-center gap-x-5 gap-y-4 sm:grid-cols-[1fr_10rem] sm:gap-x-10 md:grid-cols-[1fr_11.5rem] md:!px-10 md:!py-9"
                >
                    <div className="col-span-2 sm:col-span-1">
                        <Kicker>{t('about_teaser.kicker')}</Kicker>
                    </div>
                    <div className="min-w-0">
                        <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">{t('about.name')}</h2>
                        <p className="mt-2 font-display text-base font-semibold text-cyan-neon sm:text-lg md:text-xl">{t('about.role')}</p>
                    </div>
                    <span className="duotone relative block aspect-[1536/1826] w-full overflow-hidden sm:col-start-2 sm:row-span-3 sm:row-start-1 sm:self-center">
                        <Image
                            src="/alonso-correa.jpeg"
                            alt={t('about.photo_alt')}
                            fill
                            sizes="(min-width: 768px) 184px, (min-width: 640px) 160px, 104px"
                            className="object-cover object-top"
                            onLoad={() => setLoaded(true)}
                        />
                        <Skeleton loaded={loaded} className="absolute inset-0" />
                    </span>
                    <div className="col-span-2 sm:col-span-1">
                        <p className="max-w-3xl text-lg leading-relaxed text-dim md:text-xl">{t('about_teaser.text')}</p>
                        <Link
                            href="/sobre-mi"
                            className="mt-5 inline-flex font-display text-lg font-semibold text-cyan-neon transition-colors hover:text-white"
                        >
                            {t('about_teaser.cta')} →
                        </Link>
                    </div>
                </CyberCard>
            </div>
        </section>
    );
};
