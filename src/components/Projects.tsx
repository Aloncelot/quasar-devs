'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshReflectorMaterial, Text, useCursor, BakeShadows, OrbitControls, Billboard } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing';
import { easing } from 'maath';
import * as THREE from 'three';
import { FaExternalLinkAlt, FaDatabase, FaCode, FaCube, FaDumbbell } from 'react-icons/fa';

const RADIUS = 3;

const projects = [
    {
        id: 1,
        title: "COST ESTIMATOR",
        tech: "NEXT.JS + .NET",
        description: "Sistema de cálculo de costos de construcción con base de datos en tiempo real.",
        color: "#cc5530",
        url: "#",
        icon: <FaDatabase />
    },
    {
        id: 2,
        title: "NUTRITION PRO",
        tech: "REACT + FIREBASE",
        description: "Plataforma para nutriólogos con seguimiento de pacientes y dietas.",
        color: "#00c3d9",
        url: "#",
        icon: <FaCode />
    },
    {
        id: 3,
        title: "QUASAR DEVS",
        tech: "THREE.JS + R3F",
        description: "Portafolio inmersivo con efectos de partículas y shaders personalizados.",
        color: "#8b5cf6",
        url: "#",
        icon: <FaCube />
    },
    {
        id: 4,
        title: "COACH DIEGO",
        tech: "PYTHON + PYTORCH",
        description: "Asistente de entrenamiento personal impulsado por IA.",
        color: "#97220d",
        url: "#",
        icon: <FaDumbbell />
    }
];

const ProjectMonolith = ({ data, index, total, onFocus, ...props }: any) => {
    const mesh = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);
    useCursor(hovered);

    const angle = (index / total) * Math.PI * 2;
    const x = Math.sin(angle) * RADIUS;
    const z = Math.cos(angle) * RADIUS;

    useFrame((state, delta) => {
        if (mesh.current) {
            mesh.current.position.y = 0.8 + Math.sin(state.clock.elapsedTime + index) * 0.1;
            easing.damp3(mesh.current.scale, hovered ? 1.1 : 1, 0.1, delta);
        }
    });

    return (
        <Billboard position={[x, 0, z]} follow={true} lockX={false} lockY={false} lockZ={false} {...props}>
            <mesh
                ref={mesh}
                onClick={() => window.open(data.url, '_blank')}
                onPointerOver={(e) => { e.stopPropagation(); setHover(true); onFocus(new THREE.Vector3(x, 0, z)); }}
                onPointerOut={() => setHover(false)}
            >
                <boxGeometry args={[2.2, 1.4, 0.05]} />
                <meshStandardMaterial
                    color="#151515"
                    roughness={0.2}
                    metalness={0.8}
                    emissive={data.color}
                    emissiveIntensity={hovered ? 2 : 0.2}
                    toneMapped={false}
                />
                <Text position={[0, 0.2, 0.06]} fontSize={0.2} font="/fonts/gibed.otf" color="#ffffff" anchorX="center" anchorY="middle">
                    {data.title}
                </Text>
                <Text position={[0, -0.2, 0.06]} fontSize={0.1} color={data.color} anchorX="center" anchorY="middle">
                    {data.tech}
                </Text>
            </mesh>
            <pointLight position={[0, -0.4, 0.5]} distance={2} intensity={1} color={data.color} />
        </Billboard>
    );
};

const MobileProjectCard = ({ project }: { project: any }) => (
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
                Acceder al Sistema <FaExternalLinkAlt />
            </a>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20 rounded-lg" />
    </div>
);

export const Projects = () => {
    const [focusTarget, setFocusTarget] = useState(new THREE.Vector3(0, 0, 0));

    return (
        <section id="proyectos" className="relative w-full min-h-screen bg-black">

            <div className="absolute top-10 left-0 w-full text-center z-10 pointer-events-none md:top-10">
                <h2 className="font-gibed text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 opacity-50">
                    ARCHIVO GALÁCTICO
                </h2>
                <p className="text-gray-400 text-xs tracking-[0.5em] mt-4">
                    EXPLORA EL SISTEMA
                </p>
            </div>

            {/* VISTA MÓVIL */}
            <div className="md:hidden w-full px-6 pt-36 pb-12 flex flex-col relative z-20">
                {projects.map((project) => (
                    <MobileProjectCard key={project.id} project={project} />
                ))}
            </div>

            {/* VISTA ESCRITORIO */}
            <div className="hidden md:block absolute inset-0 z-0">
                <Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 4, 10], fov: 35 }}>

                    <color attach="background" args={['#050505']} />
                    <fog attach="fog" args={['#050505', 5, 30]} />
                    <hemisphereLight intensity={0.3} groundColor="black" />
                    <spotLight position={[10, 20, 10]} angle={0.5} penumbra={1} intensity={1} />

                    {/* CONTROLES DESKTOP ACTUALIZADOS */}
                    <OrbitControls
                        enablePan={false}
                        enableZoom={false}
                        enableRotate={true}
                        minPolarAngle={0}
                        maxPolarAngle={Math.PI / 2.1}
                        autoRotate={true}
                        autoRotateSpeed={0.5}
                    />

                    <group position={[0, -0.5, 0]}>
                        {projects.map((project, i) => (
                            <ProjectMonolith
                                key={project.id}
                                data={project}
                                index={i}
                                total={projects.length}
                                onFocus={setFocusTarget}
                            />
                        ))}
                        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]}>
                            <planeGeometry args={[100, 100]} />
                            <MeshReflectorMaterial
                                blur={[300, 100]}
                                resolution={2048}
                                mixBlur={1}
                                mixStrength={40}
                                roughness={1}
                                depthScale={1.2}
                                minDepthThreshold={0.4}
                                maxDepthThreshold={1.4}
                                color="#080808"
                                metalness={0.5}
                                mirror={1}
                            />
                        </mesh>
                    </group>

                    <EffectComposer>
                        <Bloom luminanceThreshold={1} mipmapBlur intensity={1.2} radius={0.5} />
                        <DepthOfField target={focusTarget} focalLength={0.6} bokehScale={4} height={700} />
                    </EffectComposer>
                    <BakeShadows />
                </Canvas>
            </div>
        </section>
    );
};