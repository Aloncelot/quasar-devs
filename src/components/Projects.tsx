'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, useCursor, OrbitControls, Billboard, Line, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { easing } from 'maath';
import * as THREE from 'three';
import { FaExternalLinkAlt, FaDatabase, FaCode, FaCube, FaDumbbell } from 'react-icons/fa';
import { useLanguage } from '@/context/LanguageContext';

// Posiciones fijas a mano: no es un círculo mecánico, se lee como una ruta de vuelo real
const POSITIONS: [number, number, number][] = [
    [-4.2, 1.6, -1.4],
    [-1.6, 2.9, 0.6],
    [1.7, 0.5, 1.3],
    [4.1, 2.1, -0.9],
];

const ProjectStar = ({ data, position, index, t }: any) => {
    const mesh = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);
    const clickable = data.url !== '#';
    useCursor(hovered && clickable);

    useFrame((state, delta) => {
        if (mesh.current) {
            // Titileo sutil tipo estrella real, más notorio al hacer hover
            const twinkle = 1 + Math.sin(state.clock.elapsedTime * 1.4 + index * 2) * 0.06;
            easing.damp3(mesh.current.scale, hovered ? 1.7 : twinkle, 0.15, delta);
        }
    });

    return (
        <group position={position}>
            <mesh
                ref={mesh}
                onClick={() => clickable && window.open(data.url, '_blank')}
                onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
                onPointerOut={() => setHovered(false)}
            >
                <icosahedronGeometry args={[0.16, 1]} />
                <meshStandardMaterial
                    color={data.color}
                    emissive={data.color}
                    emissiveIntensity={hovered ? 3.2 : 1.3}
                    toneMapped={false}
                />
            </mesh>
            <pointLight distance={3.5} intensity={hovered ? 2.2 : 0.7} color={data.color} />

            <Billboard>
                <Text position={[0, 0.34, 0]} fontSize={0.13} color="#555" anchorX="center" anchorY="middle" font="/fonts/gibed.otf">
                    {`0${index + 1}`}
                </Text>
                {hovered && (
                    <>
                        <Text position={[0, -0.32, 0]} fontSize={0.15} color="#fff" anchorX="center" anchorY="middle" font="/fonts/gibed.otf">
                            {data.title}
                        </Text>
                        <Text position={[0, -0.5, 0]} fontSize={0.085} color={data.color} anchorX="center" anchorY="middle">
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
    // Tip: si luego quieres que la línea "fluya" con el tiempo (efecto transmisión de datos),
    // pásale un ref y en useFrame haz: ref.current.material.dashOffset -= delta * 0.3
);

const MobileProjectCard = ({ project, t }: { project: any, t: any }) => (
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
            <a
                href={project.url}
                target="_blank"
                className="mt-2 flex items-center justify-center gap-2 w-full py-3 bg-white/5 border border-white/10 text-white font-mono text-xs hover:bg-white/10 hover:border-white/30 transition-all uppercase tracking-widest"
            >
                {t('projects.btn_access')} <FaExternalLinkAlt />
            </a>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20 rounded-lg" />
    </div>
);

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
            tech: "THREE.JS + R3F",
            description: t('projects.p3_desc'),
            color: "#8b5cf6",
            url: "#",
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
                        {projectsData.map((project, i) => (
                            <ProjectStar key={project.id} data={project} position={POSITIONS[i]} index={i} t={t} />
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