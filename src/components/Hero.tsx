'use client';

import { FaCode, FaWarehouse } from 'react-icons/fa';
import { useLanguage } from '@/context/LanguageContext';
import { CyberCard, CyberLink } from '@/components/ui/Cyber';

export const Hero = () => {
    const { t } = useLanguage();

    return (
        <section id="inicio" className="relative flex min-h-screen items-end pb-16 pt-32 md:items-center md:pb-12">
            {/* Velo lateral: mantiene legible el texto sobre la galaxia */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-void/90 via-void/50 to-transparent md:via-void/35"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-void/80 to-transparent"
            />

            <div className="relative mx-auto w-full max-w-7xl px-6 md:px-10">
                <h1 className="wordmark text-[clamp(3.4rem,12vw,10rem)] leading-[0.92] tracking-[0.04em]">
                    <span className="block">QUASAR</span>
                    <span className="block">DEVS</span>
                </h1>

                <p className="mt-8 max-w-2xl font-display text-2xl font-semibold leading-snug text-white md:text-3xl">
                    {t('hero.headline')}
                </p>
                <p className="mt-4 max-w-xl text-lg leading-relaxed text-dim">{t('hero.sub')}</p>

                <div className="mt-8 flex flex-wrap gap-4">
                    <CyberLink href="#contacto" variant="solid">
                        {t('hero.cta_primary')}
                    </CyberLink>
                    <CyberLink href="#servicios" variant="ghost">
                        {t('hero.cta_secondary')}
                    </CyberLink>
                </div>

                {/* Dos rutas: cada visitante entra por su camino */}
                <div className="mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
                    <CyberCard href="#software" accent="cyan" bodyClassName="flex items-start gap-4 !p-5">
                        <span className="mt-1 text-2xl text-cyan-neon" aria-hidden="true">
                            <FaCode />
                        </span>
                        <span className="block">
                            <span className="block font-display text-lg font-semibold text-white">
                                {t('hero.route_sw_title')}
                            </span>
                            <span className="mt-1 block text-sm leading-snug text-dim">{t('hero.route_sw_desc')}</span>
                        </span>
                    </CyberCard>
                    <CyberCard href="#supply-chain" accent="magenta" bodyClassName="flex items-start gap-4 !p-5">
                        <span className="mt-1 text-2xl text-magenta-neon" aria-hidden="true">
                            <FaWarehouse />
                        </span>
                        <span className="block">
                            <span className="block font-display text-lg font-semibold text-white">
                                {t('hero.route_sc_title')}
                            </span>
                            <span className="mt-1 block text-sm leading-snug text-dim">{t('hero.route_sc_desc')}</span>
                        </span>
                    </CyberCard>
                </div>
            </div>
        </section>
    );
};
