'use client';

import { useRef, useState, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useCursor, OrbitControls, Line, Sparkles, Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useReducedMotion } from 'framer-motion';
import { easing } from 'maath';
import * as THREE from 'three';
import { FaExternalLinkAlt, FaDatabase, FaCode, FaCube, FaRobot, FaTasks } from 'react-icons/fa';
import { useLanguage } from '@/context/LanguageContext';
import { CyberCard, CyberLink, Chip, type Accent } from '@/components/ui/Cyber';

const POSITIONS: [number, number, number][] = [
    [-4.2, 1.6, -1.4],
    [-1.6, 2.9, 0.6],
    [1.7, 0.5, 1.3],
    [4.1, 2.1, -0.9],
    [2.0, -1.0, -1.5],
];

interface Project {
    id: number;
    title: string;
    category: string;
    description: string;
    tech: string;
    color: string;
    accent: Accent;
    url: string;
    icon: ReactNode;
}

/** Hook mínimo de media query sin efectos (seguro para SSR: en el servidor devuelve false). */
const useMediaQuery = (query: string) =>
    useSyncExternalStore(
        (onChange) => {
            const media = window.matchMedia(query);
            media.addEventListener('change', onChange);
            return () => media.removeEventListener('change', onChange);
        },
        () => window.matchMedia(query).matches,
        () => false
    );

let sharedGlowTexture: THREE.Texture | null = null;
function getGlowTexture() {
    if (sharedGlowTexture) return sharedGlowTexture;
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    sharedGlowTexture = new THREE.CanvasTexture(canvas);
    return sharedGlowTexture;
}

const isLive = (url: string) => url !== '#';

const ProjectStar = ({ project, position, index, comingSoon }: {
    project: Project;
    position: [number, number, number];
    index: number;
    comingSoon: string;
}) => {
    const spriteRef = useRef<THREE.Sprite>(null);
    const [hovered, setHovered] = useState(false);
    const clickable = isLive(project.url);
    useCursor(hovered && clickable);

    const texture = useMemo(() => getGlowTexture(), []);

    useFrame((state, delta) => {
        if (!spriteRef.current) return;
        // Titileo sutil de la estrella
        const twinkle = 0.22 + Math.sin(state.clock.elapsedTime * 3 + index * 2) * 0.03;
        const targetScale = hovered ? 0.38 : twinkle;
        easing.damp3(spriteRef.current.scale, [targetScale, targetScale, 1], 0.15, delta);
    });

    return (
        <group position={position}>
            {/* Zona sensible al puntero (invisible) */}
            <mesh
                onClick={() => {
                    if (clickable) window.open(project.url, '_blank', 'noopener,noreferrer');
                }}
                onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
                onPointerOut={() => setHovered(false)}
            >
                <sphereGeometry args={[0.28, 8, 8]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>

            <sprite ref={spriteRef}>
                <spriteMaterial
                    map={texture ?? undefined}
                    color={project.color}
                    transparent
                    opacity={0.95}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    toneMapped={false}
                />
            </sprite>

            <mesh>
                <sphereGeometry args={[0.014, 8, 8]} />
                <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </mesh>

            {hovered && (
                <Html position={[0, -0.6, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
                    <div className="w-56 text-center font-display">
                        <div className="text-lg font-semibold leading-tight text-white">{project.title}</div>
                        <div className="mt-1 text-sm font-medium" style={{ color: project.color }}>
                            {project.category}
                        </div>
                        <div className="text-xs text-dim">{clickable ? project.tech : comingSoon}</div>
                    </div>
                </Html>
            )}
        </group>
    );
};

const FlightPath = () => (
    <Line points={POSITIONS} color="#8a63ff" lineWidth={1} dashed dashSize={0.08} gapSize={0.06} transparent opacity={0.55} />
);

const PATH_VECTORS = POSITIONS.map((p) => new THREE.Vector3(...p));
const SEGMENT_LENGTHS = PATH_VECTORS.slice(1).map((p, i) => p.distanceTo(PATH_VECTORS[i]));
const TOTAL_LENGTH = SEGMENT_LENGTHS.reduce((sum, l) => sum + l, 0);
const TRAVEL_DURATION = 6;

/** Nave de luz que recorre la ruta entre proyectos. */
const TravelingSpark = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshBasicMaterial>(null);
    const progress = useRef(0);

    useFrame((_, delta) => {
        progress.current = (progress.current + Math.min(delta, 0.1) / TRAVEL_DURATION) % 1;
        let remaining = progress.current * TOTAL_LENGTH;
        let segIndex = 0;
        while (segIndex < SEGMENT_LENGTHS.length - 1 && remaining > SEGMENT_LENGTHS[segIndex]) {
            remaining -= SEGMENT_LENGTHS[segIndex];
            segIndex++;
        }
        const segLength = SEGMENT_LENGTHS[segIndex] || 1;
        const localT = remaining / segLength;

        if (meshRef.current) {
            meshRef.current.position.lerpVectors(PATH_VECTORS[segIndex], PATH_VECTORS[segIndex + 1], localT);
        }

        const FADE = 0.1;
        let opacity = 1;
        if (progress.current < FADE) opacity = progress.current / FADE;
        else if (progress.current > 1 - FADE) opacity = (1 - progress.current) / FADE;
        if (materialRef.current) materialRef.current.opacity = opacity;
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial ref={materialRef} color="#7df9ff" transparent toneMapped={false} />
        </mesh>
    );
};

const ProjectCard = ({ project, btnLabel, soonLabel }: { project: Project; btnLabel: string; soonLabel: string }) => {
    const live = isLive(project.url);
    return (
        <li>
            <CyberCard accent={project.accent} className="h-full" bodyClassName="flex h-full flex-col gap-4">
                <span className="flex items-start justify-between gap-4">
                    <span className="text-2xl" style={{ color: project.color }} aria-hidden="true">
                        {project.icon}
                    </span>
                    <Chip accent={project.accent}>{project.category}</Chip>
                </span>
                <span className="block">
                    <h3 className="font-display text-2xl font-semibold text-white">{project.title}</h3>
                    <span className="mt-2 block text-[0.95rem] leading-relaxed text-dim">{project.description}</span>
                </span>
                <span className="mt-auto block pt-2">
                    {live ? (
                        <CyberLink href={project.url} external variant="ghost" className="w-full">
                            {btnLabel} <FaExternalLinkAlt aria-hidden="true" />
                        </CyberLink>
                    ) : (
                        <span className="block border border-dashed border-violet-neon/40 py-3 text-center font-display text-sm text-dim">
                            {soonLabel}
                        </span>
                    )}
                </span>
            </CyberCard>
        </li>
    );
};

export const Projects = () => {
    const { t } = useLanguage();
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const reduceMotion = useReducedMotion();

    const projects: Project[] = [
        {
            id: 1, title: t('projects.p1_title'), category: t('projects.p1_cat'), description: t('projects.p1_desc'),
            tech: 'Next.js + .NET', color: '#8a63ff', accent: 'violet', url: '#', icon: <FaDatabase />,
        },
        {
            id: 2, title: t('projects.p2_title'), category: t('projects.p2_cat'), description: t('projects.p2_desc'),
            tech: 'React + Firebase', color: '#4debff', accent: 'cyan',
            url: 'https://www.jorge-valdez-nutricion-clinica.com.mx', icon: <FaCode />,
        },
        {
            id: 3, title: t('projects.p3_title'), category: t('projects.p3_cat'), description: t('projects.p3_desc'),
            tech: 'Docker + AWS + TypeScript', color: '#e055ff', accent: 'magenta',
            url: 'https://quasar-logistic.vercel.app/', icon: <FaCube />,
        },
        {
            id: 4, title: t('projects.p4_title'), category: t('projects.p4_cat'), description: t('projects.p4_desc'),
            tech: 'Next.js + Azure SQL', color: '#3c8dff', accent: 'azure', 
            url: 'https://vibe-fit-lac.vercel.app/', icon: <FaRobot />,
        },
        {
            id: 5, title: t('projects.p5_title'), category: t('projects.p5_cat'), description: t('projects.p5_desc'),
            tech: '', color: '#7df9ff', accent: 'cyan', 
            url: 'https://task-manager-orcin-omega-81.vercel.app/', icon: <FaTasks />,
        },
    ];

    return (
        <section id="proyectos" className="relative scroll-mt-16 bg-void md:min-h-screen">
            {/* Constelación 3D solo en pantallas anchas (no se monta en móvil) */}
            {isDesktop && (
                <div className="absolute inset-0" aria-hidden="true">
                    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 2.4, 9], fov: 40 }}>
                        <color attach="background" args={['#060414']} />
                        <fog attach="fog" args={['#060414', 6, 22]} />
                        <hemisphereLight intensity={0.25} groundColor="black" />

                        <Sparkles count={200} scale={12} size={1.4} speed={reduceMotion ? 0 : 0.15} color="#9be9ff" opacity={0.45} />

                        <OrbitControls
                            enablePan={false}
                            enableZoom={false}
                            enableRotate
                            minPolarAngle={Math.PI / 3}
                            maxPolarAngle={Math.PI / 1.8}
                            autoRotate={!reduceMotion}
                            autoRotateSpeed={0.35}
                        />

                        <group position={[0, -0.3, 0]}>
                            <FlightPath />
                            {!reduceMotion && <TravelingSpark />}
                            {projects.map((project, i) => (
                                <ProjectStar
                                    key={project.id}
                                    project={project}
                                    position={POSITIONS[i]}
                                    index={i}
                                    comingSoon={t('projects.coming_soon')}
                                />
                            ))}
                        </group>

                        <EffectComposer>
                            <Bloom luminanceThreshold={0.8} mipmapBlur intensity={1.4} radius={0.6} />
                        </EffectComposer>
                    </Canvas>
                </div>
            )}

            <div className="pointer-events-none relative z-10 mx-auto max-w-7xl px-6 pt-24 md:px-10 md:pt-28">
                <h2 className="font-display text-4xl font-bold leading-tight text-white md:text-6xl">
                    {t('projects.title')}
                </h2>
                <p className="mt-3 max-w-md text-lg text-dim">
                    <span className="md:hidden">{t('projects.subtitle_mobile')}</span>
                    <span className="hidden md:inline">{t('projects.subtitle_desktop')}</span>
                </p>
            </div>

            {/* Tarjetas (móvil) */}
            <ul
                aria-label={t('projects.list_label')}
                className="relative z-10 mx-auto mt-10 grid max-w-7xl gap-6 px-6 pb-20 md:hidden"
            >
                {projects.map((project) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        btnLabel={t('projects.btn_access')}
                        soonLabel={t('projects.coming_soon')}
                    />
                ))}
            </ul>

            {/* Lista accesible (lectores de pantalla y teclado) para la versión 3D */}
            <ul aria-label={t('projects.list_label')} className="sr-only max-md:hidden">
                {projects.map((project) => (
                    <li key={project.id}>
                        {isLive(project.url) ? (
                            <a href={project.url} target="_blank" rel="noopener noreferrer">
                                {project.title}: {project.description}
                            </a>
                        ) : (
                            <span>{project.title}: {project.description} ({t('projects.coming_soon')})</span>
                        )}
                    </li>
                ))}
            </ul>

            {/* Llamado a la acción sobre la constelación */}
            <div className="pointer-events-none absolute inset-x-0 bottom-10 z-10 hidden md:block">
                <div className="mx-auto flex max-w-7xl items-center gap-6 px-10">
                    <p className="font-display text-lg text-white">{t('projects.cta_text')}</p>
                    <div className="pointer-events-auto">
                        <CyberLink href="#contacto" variant="solid" accent="magenta">
                            {t('projects.cta')}
                        </CyberLink>
                    </div>
                </div>
            </div>
        </section>
    );
};
