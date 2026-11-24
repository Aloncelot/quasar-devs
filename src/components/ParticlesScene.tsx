'use client';

import { useRef, useMemo, useEffect, useState, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { easing } from 'maath';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import { createRandom } from '@/lib/random';
import { useCircleTexture } from '@/lib/circleTexture';
import { HERO_CORE_SHIFT } from '@/components/sceneLayout';

/* Paleta cyberpunk */
const CORE_COLOR = '#ff4fe8';   // magenta incandescente
const MID_COLOR = '#8a63ff';    // violeta
const EDGE_COLOR = '#3c8dff';   // azul eléctrico
const JET_COLOR = '#00d4ff';    // cian neón saturado: con mezcla aditiva no llega a verse blanco

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
/* ------------------------------------------------------------------
   Chorros del quasar: niebla brillante (como el halo del agujero negro
   de /software) en lugar de partículas. Cada chorro son dos cilindros
   con un shader aditivo: un núcleo fino casi blanco y un velo amplio
   cian; el ruido fluye hacia afuera y el brillo se apaga al alejarse.
------------------------------------------------------------------- */
const jetVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const jetFragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uStrength;
  uniform float uSharp;
  uniform float uWhite;
  uniform float uLen;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
  void main() {
    // centro del cilindro (de frente a la cámara) brillante; bordes desvanecidos: parece un volumen
    float facing = abs(dot(normalize(vNormal), normalize(vView)));
    float body = pow(facing, uSharp);
    float y = vUv.y;                                  // 0 en el núcleo, 1 en la punta
    float ang = vUv.x * 6.28318;
    float flow = fbm(vec2(y * uLen - uTime * 1.6, sin(ang) * 1.1 + cos(ang) * 0.5));
    float wisps = fbm(vec2(y * uLen * 2.3 - uTime * 3.1, cos(ang) * 2.0));
    float along = smoothstep(0.0, 0.03, y) * pow(1.0 - smoothstep(0.15, 1.0, y), 1.3);
    float cloud = smoothstep(0.25, 0.85, flow);
    float glow = body * along * (0.25 + 1.25 * cloud) * (0.65 + 0.6 * wisps) * uStrength;
    vec3 col = mix(uColor, vec3(0.92, 1.0, 1.0), uWhite * body * (1.0 - y));
    gl_FragColor = vec4(col * glow, glow);
  }
`;

interface JetLayer {
    radius: [number, number];   // radio en la base y en la punta
    strength: number;
    sharp: number;
    white: number;
}

const JET_LAYERS: JetLayer[] = [
    { radius: [0.06, 0.22], strength: 0.95, sharp: 2.0, white: 0.8 },    // núcleo
    { radius: [0.32, 1.25], strength: 0.95, sharp: 1.25, white: 0.15 },  // niebla brillante
    { radius: [0.85, 2.7], strength: 0.42, sharp: 0.85, white: 0.0 },    // halo exterior
];

const JetStream = ({ animate }: { animate: boolean }) => {
    const height = 10;
    const materials = useRef<(THREE.ShaderMaterial | null)[]>([]);
    const geometries = useMemo(
        () => JET_LAYERS.map((layer) => {
            const g = new THREE.CylinderGeometry(layer.radius[1], layer.radius[0], height, 40, 1, true);
            g.translate(0, height / 2, 0);
            return g;
        }),
        []
    );
    const uniforms = useMemo(
        () => JET_LAYERS.map((layer) => ({
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(JET_COLOR) },
            uStrength: { value: layer.strength },
            uSharp: { value: layer.sharp },
            uWhite: { value: layer.white },
            uLen: { value: 7 },
        })),
        []
    );

    useFrame((_, delta) => {
        if (!animate) return;
        const step = Math.min(delta, 0.1);
        // los dos chorros de cada capa comparten uniforms: basta avanzar los del chorro superior
        materials.current.slice(0, JET_LAYERS.length).forEach((m) => {
            if (m) m.uniforms.uTime.value += step;
        });
    });

    return (
        <group>
            {[1, -1].map((side) =>
                JET_LAYERS.map((_, i) => (
                    <mesh key={`${side}-${i}`} geometry={geometries[i]} scale={[1, side, 1]} renderOrder={2}>
                        <shaderMaterial
                            ref={(m) => { materials.current[(side > 0 ? 0 : JET_LAYERS.length) + i] = m; }}
                            vertexShader={jetVertex}
                            fragmentShader={jetFragment}
                            uniforms={uniforms[i]}
                            transparent
                            depthWrite={false}
                            blending={THREE.AdditiveBlending}
                            side={THREE.DoubleSide}
                            toneMapped={false}
                        />
                    </mesh>
                ))
            )}
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
const CameraRig = ({ progress, animate }: { progress: RefObject<number>; animate: boolean }) => {
    const { camera, size, invalidate } = useThree();
    const target = useMemo(() => new THREE.Vector3(), []);
    const offset = useRef<{ x: number; y: number } | null>(null);

    // Sin animación la escena solo se dibuja bajo demanda: el scroll mueve el núcleo, así que redibuja
    useEffect(() => {
        if (animate) return;
        const redraw = () => invalidate();
        window.addEventListener('scroll', redraw, { passive: true });
        return () => window.removeEventListener('scroll', redraw);
    }, [animate, invalidate]);

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

export default function ParticlesScene() {
    const reduceMotion = useReducedMotion();
    const progress = useScrollProgress();

    const animate = !reduceMotion;
    const tiltRotation: [number, number, number] = [-0.4, 0, -0.5];
    // Mientras WebGL arranca se ve un resplandor del núcleo en CSS (skeleton de la escena)
    const [ready, setReady] = useState(false);

    return (
        <div aria-hidden="true" className="fixed left-0 top-0 -z-10 h-screen w-full bg-void">
            <Canvas
                camera={{ position: [8, 10, 12], fov: 50 }}
                dpr={[1, 1.5]}
                gl={{ antialias: false, powerPreference: 'high-performance' }}
                // Con "reducir movimiento" nada se anima: no hace falta dibujar 60 veces por segundo
                frameloop={animate ? 'always' : 'demand'}
                onCreated={() => requestAnimationFrame(() => setReady(true))}
            >
                <fog attach="fog" args={['#060414', 10, 40]} />
                <CameraRig progress={progress} animate={animate} />
                <group rotation={tiltRotation}>
                    <Core />
                    <JetStream animate={animate} />
                    <Galaxy animate={animate} />
                </group>
            </Canvas>
            <div data-loaded={String(ready)} className="scene-fallback skeleton-fade" />
        </div>
    );
}
