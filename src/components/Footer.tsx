'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import { FaArrowUp, FaReact } from 'react-icons/fa';
import { SiNextdotjs, SiTailwindcss, SiTypescript } from 'react-icons/si';
import { useLanguage } from '@/context/LanguageContext';

const YEAR = new Date().getFullYear();

const useCircleTexture = () =>
    useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const context = canvas.getContext('2d');
        if (context) {
            const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255,255,255,1)');
            gradient.addColorStop(0.4, 'rgba(255,255,255,0.8)');
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            context.fillStyle = gradient;
            context.fillRect(0, 0, 64, 64);
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        return tex;
    }, []);

const FIELD_WIDTH = 40;
const BOUNDARY_LEFT = -20;
const NUM_LAYERS = 4;
const POINTS_PER_LAYER = 150;

/** Campo de estrellas en movimiento horizontal (sensación de velocidad de crucero). */
const WarpField = () => {
    const circleTex = useCircleTexture();

    const layers = useMemo(() => {
        const colorInside = new THREE.Color('#ff4fe8');
        const colorOutside = new THREE.Color('#3c8dff');
        const data = [];
        for (let l = 0; l < NUM_LAYERS; l++) {
            const positions = new Float32Array(POINTS_PER_LAYER * 3);
            const colors = new Float32Array(POINTS_PER_LAYER * 3);
            const depthFactor = l / (NUM_LAYERS - 1);
            const zPos = 2 - depthFactor * 10;
            const speed = 0.05 * (1 - depthFactor * 0.5);

            for (let i = 0; i < POINTS_PER_LAYER; i++) {
                const i3 = i * 3;
                positions[i3] = (Math.random() - 0.5) * FIELD_WIDTH;
                positions[i3 + 1] = (Math.random() - 0.5) * 6;
                positions[i3 + 2] = zPos;

                const mixed = colorInside.clone().lerp(colorOutside, Math.random());
                mixed.multiplyScalar(1 - depthFactor * 0.8);
                colors[i3] = mixed.r;
                colors[i3 + 1] = mixed.g;
                colors[i3 + 2] = mixed.b;
            }
            data.push({ positions, colors, speed });
        }
        return data;
    }, []);

    const layerRefs = useRef<(THREE.Points | null)[]>([]);

    useFrame((state, delta) => {
        const safeDelta = Math.min(delta, 0.1);
        layerRefs.current.forEach((points, i) => {
            if (!points) return;
            const { speed } = layers[i];
            const attribute = points.geometry.getAttribute('position');
            const array = attribute.array as Float32Array;

            for (let j = 0; j < POINTS_PER_LAYER; j++) {
                const j3 = j * 3;
                array[j3] -= speed * 20 * safeDelta;
                array[j3 + 1] += Math.sin(state.clock.elapsedTime * 1.5 + array[j3] * 0.3) * 0.005;
                if (array[j3] < BOUNDARY_LEFT) array[j3] += FIELD_WIDTH;
            }
            attribute.needsUpdate = true;
        });
    });

    return (
        <group rotation={[0.2, 0, 0]}>
            {layers.map((layer, i) => (
                <points key={i} ref={(el) => { layerRefs.current[i] = el; }}>
                    <bufferGeometry>
                        <bufferAttribute attach="attributes-position" count={POINTS_PER_LAYER} args={[layer.positions, 3]} />
                        <bufferAttribute attach="attributes-color" count={POINTS_PER_LAYER} args={[layer.colors, 3]} />
                    </bufferGeometry>
                    <pointsMaterial
                        size={0.15}
                        map={circleTex}
                        transparent
                        opacity={0.9}
                        depthWrite={false}
                        blending={THREE.AdditiveBlending}
                        vertexColors
                    />
                </points>
            ))}
        </group>
    );
};

export const Footer = () => {
    const { t } = useLanguage();
    const reduceMotion = useReducedMotion();
    const footerRef = useRef<HTMLElement>(null);
    const [visible, setVisible] = useState(false);

    // Solo anima cuando el footer está en pantalla (ahorra GPU)
    useEffect(() => {
        const node = footerRef.current;
        if (!node) return;
        const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });

    const links = [
        { label: t('nav.services'), href: '#servicios' },
        { label: t('nav.projects'), href: '#proyectos' },
        { label: t('nav.about'), href: '#sobre-mi' },
        { label: t('nav.contact'), href: '#contacto' },
    ];

    return (
        <footer ref={footerRef} className="relative overflow-hidden border-t border-violet-neon/30 bg-void">
            <div className="absolute inset-0" aria-hidden="true">
                <Canvas
                    camera={{ position: [0, 0, 8], fov: 45 }}
                    gl={{ antialias: false }}
                    dpr={[1, 1.5]}
                    frameloop={visible && !reduceMotion ? 'always' : 'demand'}
                >
                    <fog attach="fog" args={['#060414', 5, 20]} />
                    <WarpField />
                </Canvas>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-void/60 to-void/20" />
            </div>

            <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3 md:px-10">
                <div>
                    <p className="font-gibed text-2xl tracking-[0.08em] text-white">
                        QUASAR <span className="text-cyan-neon">DEVS</span>
                    </p>
                    <p className="mt-3 max-w-xs text-sm leading-relaxed text-dim">{t('footer.tagline')}</p>
                </div>

                <nav aria-label="Pie de página" className="flex flex-wrap gap-x-8 gap-y-3 md:justify-center">
                    {links.map((link) => (
                        <a key={link.href} href={link.href} className="nav-link">
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="flex flex-col gap-4 md:items-end">
                    <button
                        type="button"
                        onClick={scrollToTop}
                        className="group inline-flex items-center gap-3 font-display text-sm font-medium text-cyan-neon transition-colors hover:text-white"
                    >
                        <span>{t('footer.top')}</span>
                        <span className="rounded-sm border border-cyan-neon/40 bg-cyan-neon/10 p-2 transition-colors group-hover:bg-cyan-neon/25">
                            <FaArrowUp aria-hidden="true" />
                        </span>
                    </button>
                    <div className="flex items-center gap-3 text-dim" role="img" aria-label={t('footer.stack')}>
                        <SiNextdotjs aria-hidden="true" />
                        <FaReact aria-hidden="true" />
                        <SiTypescript aria-hidden="true" />
                        <SiTailwindcss aria-hidden="true" />
                    </div>
                    <p className="text-xs text-dim">
                        © {YEAR} Alonso Correa. {t('footer.rights')}
                    </p>
                </div>
            </div>
        </footer>
    );
};
