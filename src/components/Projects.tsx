'use client';

import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, useCursor, OrbitControls, Billboard, Line, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { easing } from 'maath';
import * as THREE from 'three';
import { FaExternalLinkAlt, FaDatabase, FaCode, FaCube, FaDumbbell } from 'react-icons/fa';
import { useLanguage } from '@/context/LanguageContext';

const POSITIONS: [number, number, number][] = [
    [-4.2, 1.6, -1.4],
    [-1.6, 2.9, 0.6],
    [1.7, 0.5, 1.3],
    [4.1, 2.1, -0.9],
];

const TURQUOISE_VARIANTS = ['#5eead4', '#2dd4bf', '#22d3ee', '#67e8f9'];

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

const ProjectStar = ({ data, position, index, t, color }: any) => {
    const spriteRef = useRef<THREE.Sprite>(null);
    const [hovered, setHovered] = useState(false);
    const clickable = data.url !== '#';
    useCursor(hovered && clickable);

    const texture = useMemo(() => getGlowTexture(), []);

    useFrame((state, delta) => {
        if (spriteRef.current) {
            // Titileo sutil para una sola estrella
            const baseScale = 0.22;
            const twinkle = baseScale + Math.sin(state.clock.elapsedTime * 3 + index * 2) * 0.03;
            const targetScale = hovered ? 0.35 : twinkle;
            easing.damp3(spriteRef.current.scale, [targetScale, targetScale, 1], 0.15, delta);
        }
    });

    return (
        <group position={position}>
            <mesh
                onClick={() => clickable && window.open(data.url, '_blank')}
                onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
                onPointerOut={() => setHovered(false)}
            >
                <sphereGeometry args={[0.24, 8, 8]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>

            {/* Estrella Única: Resplandor (Sprite) */}
            <sprite ref={spriteRef}>
                <spriteMaterial
                    map={texture ?? undefined}
                    color={color}
                    transparent
                    opacity={0.9}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    toneMapped={false}
            />
            </sprite>

            {/* Estrella Única: Núcleo sólido diminuto */}
            <mesh>
                <sphereGeometry args={[0.012, 8, 8]} />
                <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </mesh>

            <pointLight distance={3.5} intensity={hovered ? 2.2 : 0.8} color={color} />

            <Billboard>
                <Text position={[0, 0.34, 0]} fontSize={0.13} color="#555" anchorX="center" anchorY="middle" font="/fonts/gibed.otf">
                    {`0${index + 1}`}
                </Text>
                {hovered && (
                    <>
                        <Text position={[0, -0.32, 0]} fontSize={0.15} color="#fff" anchorX="center" anchorY="middle" font="/fonts/gibed.otf">
                            {data.title}
                        </Text>
                        <Text position={[0, -0.5, 0]} fontSize={0.085} color={color} anchorX="center" anchorY="middle">
                            {clickable ? data.tech : `${data.tech} · ${t('projects.coming_soon')}`}
                        </Text>
                    </>
                )}
            </Billboard>
        </group>
    );
};

const FlightPath = () => (
    <Line
        points={POSITIONS}
        color="#3a3a3a"
        lineWidth={1}
        dashed
        dashSize={0.08}
        gapSize={0.06}
        transparent
        opacity={0.5}
    />
);

const PATH_VECTORS = POSITIONS.map((p) => new THREE.Vector3(...p));
const SEGMENT_LENGTHS = PATH_VECTORS.slice(1).map((p, i) => p.distanceTo(PATH_VECTORS[i]));
const TOTAL_LENGTH = SEGMENT_LENGTHS.reduce((sum, l) => sum + l, 0);
const TRAVEL_DURATION = 6; 

const TravelingSpark = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshBasicMaterial>(null);
    const progress = useRef(0);

    useFrame((_, delta) => {
        progress.current = (progress.current + delta / TRAVEL_DURATION) % 1;
        const distAlong = progress.current * TOTAL_LENGTH;

        let remaining = distAlong;
        let segIndex = 0;
        while (segIndex < SEGMENT_LENGTHS.length - 1 && remaining > SEGMENT_LENGTHS[segIndex]) {
            remaining -= SEGMENT_LENGTHS[segIndex];
            segIndex++;
        }
        const segLength = SEGMENT_LENGTHS[segIndex] || 1;
        const localT = segLength > 0 ? remaining / segLength : 0;

        if (meshRef.current) {
            meshRef.current.position.lerpVectors(PATH_VECTORS[segIndex], PATH_VECTORS[segIndex + 1], localT);
        }

        const FADE = 0.1;
        let opacity = 1;
        if (progress.current < FADE) opacity = progress.current / FADE;
        else if (progress.current > 1 - FADE) opacity = (1 - progress.current) / FADE;

        if (materialRef.current) {
            materialRef.current.opacity = opacity;
        }
    });

    return (
        <mesh ref={meshRef}>
            {/* Partícula de viaje reducida de tamaño */}
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshBasicMaterial ref={materialRef} color="#a7fff0" transparent toneMapped={false} />
        </mesh>
    );
};

const MobileProjectCard = ({ project, t }: { project: any, t: any }) => {
    // Variable táctica para determinar si el puerto está abierto
    const isClickable = project.url !== '#';

    return (
        <div className="relative group w-full mb-8">
            <div className="absolute inset-0 bg-gray-900/80 border border-gray-700 rounded-lg transform transition-transform duration-300 group-hover:scale-[1.02]" />
            <div
                className="absolute inset-0 opacity-20 blur-xl transition-opacity group-hover:opacity-40"
                style={{ backgroundColor: project.color }}
            />
            <div className="relative p-6 flex flex-col gap-4 z-10">
                <div className="flex justify-between items-start">
                    <div className="p-3 rounded bg-black/50 border border-white/10 text-white text-xl">
                        {project.icon}
                    </div>
                    <div className="text-right">
                        <h3 className="text-xl font-gibed text-white tracking-wider">{project.title}</h3>
                        <span className="text-xs font-mono font-bold" style={{ color: project.color }}>{project.tech}</span>
                    </div>
                </div>
                <p className="text-sm text-gray-300 font-mono leading-relaxed border-l-2 pl-4" style={{ borderColor: project.color }}>
                    {project.description}
                </p>
                
                {/* Lógica condicional de renderizado */}
                {isClickable ? (
                    <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 flex items-center justify-center gap-2 w-full py-3 bg-white/5 border border-white/10 text-white font-mono text-xs hover:bg-white/10 hover:border-white/30 transition-all uppercase tracking-widest"
                    >
                        {t('projects.btn_access')} <FaExternalLinkAlt />
                    </a>
                ) : (
                    <div className="mt-2 flex items-center justify-center gap-2 w-full py-3 bg-black/40 border border-white/5 text-gray-500 font-mono text-xs uppercase tracking-widest cursor-not-allowed select-none">
                        {t('projects.coming_soon')}
                    </div>
                )}
                
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20 rounded-lg" />
        </div>
    );
};

export const Projects = () => {
    const { t } = useLanguage();

    const projectsData = [
        {
            id: 1,
            title: t('projects.p1_title'),
            tech: "NEXT.JS + .NET",
            description: t('projects.p1_desc'),
            color: "#cc5530",
            url: "#",
            icon: <FaDatabase />
        },
        {
            id: 2,
            title: t('projects.p2_title'),
            tech: "REACT + FIREBASE",
            description: t('projects.p2_desc'),
            color: "#00c3d9",
            url: "https://www.jorge-valdez-nutricion-clinica.com.mx",
            icon: <FaCode />
        },
        {
            id: 3,
            title: t('projects.p3_title'),
            tech: "Docker + AWS + Typescript",
            description: t('projects.p3_desc'),
            color: "#8b5cf6",
            url: "https://quasar-logistic.vercel.app/",
            icon: <FaCube />
        },
        {
            id: 4,
            title: t('projects.p4_title'),
            tech: "PYTHON + PYTORCH",
            description: t('projects.p4_desc'),
            color: "#97220d",
            url: "#",
            icon: <FaDumbbell />
        }
    ];

    return (
        <section id="proyectos" className="relative w-full min-h-screen bg-black">

            <div className="absolute top-10 left-0 w-full text-center z-10 pointer-events-none md:top-10">
                <h2 className="font-gibed text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 opacity-50">
                    {t('projects.title')}
                </h2>
                <p className="text-gray-400 text-xs tracking-[0.5em] mt-4">
                    {t('projects.subtitle')}
                </p>
            </div>

            <div className="md:hidden w-full px-6 pt-36 pb-12 flex flex-col relative z-20">
                {projectsData.map((project) => (
                    <MobileProjectCard key={project.id} project={project} t={t} />
                ))}
            </div>

            <div className="hidden md:block absolute inset-0 z-0">
                <Canvas dpr={[1, 1.5]} camera={{ position: [0, 2.4, 9], fov: 40 }}>

                    <color attach="background" args={['#050505']} />
                    <fog attach="fog" args={['#050505', 6, 22]} />
                    <hemisphereLight intensity={0.25} groundColor="black" />

                    <Sparkles count={200} scale={12} size={1.2} speed={0.15} color="#ffffff" opacity={0.4} />

                    <OrbitControls
                        enablePan={false}
                        enableZoom={false}
                        enableRotate={true}
                        minPolarAngle={Math.PI / 3}
                        maxPolarAngle={Math.PI / 1.8}
                        autoRotate
                        autoRotateSpeed={0.35}
                    />

                    <group position={[0, -0.3, 0]}>
                        <FlightPath />
                        <TravelingSpark />
                        {projectsData.map((project, i) => (
                            <ProjectStar
                                key={project.id}
                                data={project}
                                position={POSITIONS[i]}
                                index={i}
                                t={t}
                                color={TURQUOISE_VARIANTS[i % TURQUOISE_VARIANTS.length]}
                            />
                        ))}
                    </group>

                    <EffectComposer>
                        <Bloom luminanceThreshold={0.8} mipmapBlur intensity={1.4} radius={0.6} />
                    </EffectComposer>
                </Canvas>
            </div>
        </section>
    );
};