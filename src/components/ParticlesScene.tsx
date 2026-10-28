'use client';

import { useRef, useMemo, useEffect, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { easing } from 'maath';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import { createRandom } from '@/lib/random';

/* Paleta cyberpunk */
const CORE_COLOR = '#ff4fe8';   // magenta incandescente
const MID_COLOR = '#8a63ff';    // violeta
const EDGE_COLOR = '#3c8dff';   // azul eléctrico
const JET_COLOR = '#7df9ff';    // cian neón

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

/** Progreso de scroll de toda la página (0 arriba, 1 abajo), compartido sin re-renders. */
const useScrollProgress = () => {
    const progress = useRef(0);
    useEffect(() => {
        const update = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            progress.current = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
        };
        update();
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        return () => {
            window.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
        };
    }, []);
    return progress;
};

const Galaxy = ({ animate }: { animate: boolean }) => {
    // Menos partículas en pantallas pequeñas (este componente solo se monta en el cliente, dentro del Canvas)
    const count = useMemo(() => (window.innerWidth < 768 ? 9000 : 18000), []);
    const mesh = useRef<THREE.Points>(null);
    const circleTex = useCircleTexture();

    const { positions, colors } = useMemo(() => {
        const rand = createRandom(1337);
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const core = new THREE.Color(CORE_COLOR);
        const mid = new THREE.Color(MID_COLOR);
        const edge = new THREE.Color(EDGE_COLOR);
        const jet = new THREE.Color(JET_COLOR);
        const mixed = new THREE.Color();

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const radius = rand() * 12;
            const spinAngle = radius * 0.8;
            const branchAngle = (i % 3) * ((2 * Math.PI) / 3);
            const randomX = Math.pow(rand(), 3) * (rand() < 0.5 ? 1 : -1) * (radius / 2);
            const randomY = Math.pow(rand(), 3) * (rand() < 0.5 ? 1 : -1) * (radius / 2);
            const randomZ = Math.pow(rand(), 3) * (rand() < 0.5 ? 1 : -1) * (radius / 2);
            positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
            positions[i3 + 1] = randomY * (1 - radius / 15);
            positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

            // magenta (centro) → violeta → azul (borde), con una rama teñida de cian
            const t = radius / 12;
            if (t < 0.5) mixed.copy(core).lerp(mid, t / 0.5);
            else mixed.copy(mid).lerp(edge, (t - 0.5) / 0.5);
            if (i % 3 === 1) mixed.lerp(jet, 0.22);
            colors[i3] = mixed.r;
            colors[i3 + 1] = mixed.g;
            colors[i3 + 2] = mixed.b;
        }
        return { positions, colors };
    }, [count]);

    useFrame((_, delta) => {
        if (animate && mesh.current) mesh.current.rotation.y += Math.min(delta, 0.1) * 0.05;
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={positions.length / 3} args={[positions, 3]} />
                <bufferAttribute attach="attributes-color" count={colors.length / 3} args={[colors, 3]} />
            </bufferGeometry>
            <pointsMaterial
                size={0.1}
                map={circleTex}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                vertexColors
            />
        </points>
    );
};

/** Doble chorro del quasar (arriba y abajo del disco). */
const JetStream = ({ animate }: { animate: boolean }) => {
    const count = 2000;
    const geoms = useRef<(THREE.BufferGeometry | null)[]>([null, null]);
    const circleTex = useCircleTexture();
    const height = 10;
    const radius = 0.3;

    const positions = useMemo(() => {
        const rand = createRandom(2024);
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            pos[i3] = (rand() - 0.5) * radius;
            pos[i3 + 1] = rand() * height;
            pos[i3 + 2] = (rand() - 0.5) * radius;
        }
        return pos;
    }, []);

    useFrame((_, delta) => {
        if (!animate) return;
        const safeDelta = Math.min(delta, 0.1);
        // Se modifica el arreglo del buffer de la geometría (no el valor de useMemo, que React trata como inmutable).
        // Ambos chorros comparten ese arreglo: se actualiza una vez y se sube a la GPU en cada geometría.
        const first = geoms.current[0]?.getAttribute('position') as THREE.BufferAttribute | undefined;
        if (!first) return;
        const array = first.array as Float32Array;
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            array[i3 + 1] += safeDelta * 5;
            if (array[i3 + 1] > height) array[i3 + 1] %= height;
        }
        geoms.current.forEach((geometry) => {
            const attribute = geometry?.getAttribute('position');
            if (attribute) attribute.needsUpdate = true;
        });
    });

    return (
        <group>
            {[1, -1].map((side, index) => (
                <points key={side} scale={[1, side, 1]}>
                    <bufferGeometry ref={(geometry) => { geoms.current[index] = geometry as THREE.BufferGeometry | null; }}>
                        <bufferAttribute attach="attributes-position" count={positions.length / 3} args={[positions, 3]} />
                    </bufferGeometry>
                    <pointsMaterial
                        size={0.2}
                        map={circleTex}
                        color={JET_COLOR}
                        transparent
                        opacity={0.8}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                    />
                </points>
            ))}
        </group>
    );
};

const Core = () => (
    <group>
        <mesh>
            <sphereGeometry args={[0.6, 32, 32]} />
            <meshBasicMaterial color="#000000" />
        </mesh>
        {/* Aro del núcleo: magenta neón como el centro de la galaxia y el logo.
            Sin tone mapping ni niebla, que lo apagaban hasta verse gris. */}
        <mesh rotation={[1.6, 0, 0]}>
            <torusGeometry args={[0.65, 0.032, 16, 128]} />
            <meshBasicMaterial color={CORE_COLOR} toneMapped={false} fog={false} />
        </mesh>
        {/* Halo suave alrededor del aro */}
        <mesh rotation={[1.6, 0, 0]}>
            <torusGeometry args={[0.66, 0.11, 16, 128]} />
            <meshBasicMaterial
                color={CORE_COLOR}
                transparent
                opacity={0.22}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                toneMapped={false}
                fog={false}
            />
        </mesh>
    </group>
);

/**
 * El viaje espacial: al hacer scroll la cámara se acerca al núcleo del quasar
 * y la galaxia gira, de modo que cada sección se siente como otro tramo del trayecto.
 */
/** Desplazamiento del quasar en pantalla durante el Hero (fracción del ancho/alto del viewport). */
export const HERO_CORE_SHIFT = { desktopX: 0.18, mobileY: 0.2 } as const;

const CameraRig = ({ progress, animate }: { progress: RefObject<number>; animate: boolean }) => {
    const { camera, size } = useThree();
    const target = useMemo(() => new THREE.Vector3(), []);
    const offset = useRef<{ x: number; y: number } | null>(null);

    useFrame((_, delta) => {
        const p = animate ? progress.current : 0;
        target.set(8 - 5.5 * p, 10 - 7.5 * p, 12 - 8 * p);
        easing.damp3(camera.position, target, 0.5, delta);
        camera.lookAt(0, 0, 0);

        // En el Hero, el núcleo se corre a la derecha (escritorio) o hacia arriba (móvil)
        // para dejar espacio al texto; al bajar de la primera pantalla vuelve al centro.
        const heroFade = 1 - Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);
        const tx = size.width >= 1024 ? HERO_CORE_SHIFT.desktopX * size.width * heroFade : 0;
        const ty = size.width < 768 ? HERO_CORE_SHIFT.mobileY * size.height * heroFade : 0;
        if (!offset.current || !animate) offset.current = { x: tx, y: ty };
        else {
            const k = 1 - Math.exp(-delta * 6);
            offset.current.x += (tx - offset.current.x) * k;
            offset.current.y += (ty - offset.current.y) * k;
        }
        (camera as THREE.PerspectiveCamera).setViewOffset(
            size.width, size.height, -offset.current.x, offset.current.y, size.width, size.height
        );
    });
    return null;
};

export const ParticlesScene = () => {
    const reduceMotion = useReducedMotion();
    const progress = useScrollProgress();

    const animate = !reduceMotion;
    const tiltRotation: [number, number, number] = [-0.4, 0, -0.5];

    return (
        <div aria-hidden="true" className="fixed left-0 top-0 -z-10 h-screen w-full bg-void">
            <Canvas
                camera={{ position: [8, 10, 12], fov: 50 }}
                dpr={[1, 1.5]}
                gl={{ antialias: false, powerPreference: 'high-performance' }}
            >
                <fog attach="fog" args={['#060414', 10, 40]} />
                <CameraRig progress={progress} animate={animate} />
                <group rotation={tiltRotation}>
                    <Core />
                    <JetStream animate={animate} />
                    <Galaxy animate={animate} />
                </group>
            </Canvas>
        </div>
    );
};
