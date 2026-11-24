'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import { createRandom } from '@/lib/random';

/* ------------------------------------------------------------------
   Fondo de /supply-chain: un observatorio de radiotelescopios en un
   desierto rocoso, de noche, bajo una nebulosa verde azulada. Las antenas
   rastrean el cielo despacio y de vez en cuando cruza una estrella fugaz.
------------------------------------------------------------------- */

const TEAL = '#3ee0cf';
const MINT = '#2bd4a4';

/* ---------------- Cielo: degradado + nebulosa (shader) ---------------- */
const skyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const skyFragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  varying vec3 vDir;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 6; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; } return v; }
  void main() {
    vec3 d = normalize(vDir);
    float h = clamp(d.y, -0.2, 1.0);
    vec3 top = vec3(0.012, 0.055, 0.07);
    vec3 horizon = vec3(0.03, 0.17, 0.19);
    vec3 col = mix(horizon, top, smoothstep(0.0, 0.6, h));
    // nebulosa: una banda diagonal de nubes
    vec2 uv = vec2(atan(d.x, -d.z) * 1.6, d.y * 3.0);
    float band = exp(-pow((uv.y - 1.1 + uv.x * 0.45) / 0.9, 2.0));
    float n = fbm(uv * 1.6 + vec2(uTime * 0.01, 0.0));
    float n2 = fbm(uv * 3.2 - vec2(0.0, uTime * 0.008));
    float cloud = smoothstep(0.35, 0.9, n) * band;
    col += vec3(0.16, 0.75, 0.68) * cloud * 0.55;            // verde azulado
    col += vec3(0.12, 0.62, 0.48) * smoothstep(0.5, 0.95, n2) * band * 0.35;
    col += vec3(0.75, 0.25, 0.85) * smoothstep(0.62, 0.95, n * n2 * 1.6) * band * 0.35; // toque magenta
    // polvo oscuro que recorta la nebulosa
    col *= 1.0 - smoothstep(0.55, 0.85, fbm(uv * 2.4 + 7.0)) * band * 0.55;
    // resplandor de la luna (derecha, baja)
    float moon = max(dot(d, normalize(vec3(0.62, 0.16, -0.77))), 0.0);
    col += vec3(0.55, 0.95, 0.9) * pow(moon, 60.0) * 0.6 + vec3(0.25, 0.6, 0.58) * pow(moon, 8.0) * 0.18;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const Sky = ({ animate }: { animate: boolean }) => {
    const mat = useRef<THREE.ShaderMaterial>(null);
    const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
    useFrame((_, dt) => {
        if (animate && mat.current) mat.current.uniforms.uTime.value += Math.min(dt, 0.1);
    });
    return (
        <mesh>
            <sphereGeometry args={[90, 48, 32]} />
            <shaderMaterial ref={mat} vertexShader={skyVertex} fragmentShader={skyFragment} uniforms={uniforms} side={THREE.BackSide} depthWrite={false} fog={false} />
        </mesh>
    );
};

/* ---------------- Estrellas que titilan ---------------- */
const starVertex = /* glsl */ `
  uniform float uTime;
  attribute float aSize;
  attribute float aPhase;
  varying float vAlpha;
  void main() {
    vAlpha = 0.55 + 0.45 * sin(uTime * (0.8 + aPhase) + aPhase * 6.28);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize;
    gl_Position = projectionMatrix * mv;
  }
`;
const starFragment = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vAlpha;
    gl_FragColor = vec4(vec3(0.86, 1.0, 0.97) * a, a);
  }
`;
const Stars = ({ animate }: { animate: boolean }) => {
    const mat = useRef<THREE.ShaderMaterial>(null);
    const { positions, sizes, phases } = useMemo(() => {
        const rand = createRandom(911);
        const n = 2200;
        const positions = new Float32Array(n * 3);
        const sizes = new Float32Array(n);
        const phases = new Float32Array(n);
        for (let i = 0; i < n; i++) {
            const theta = rand() * Math.PI * 2;
            const y = 0.04 + rand() * 0.96;          // solo el hemisferio superior
            const r = Math.sqrt(1 - y * y);
            positions.set([Math.cos(theta) * r * 80, y * 80, Math.sin(theta) * r * 80], i * 3);
            sizes[i] = rand() < 0.06 ? 3.2 : 1.1 + rand() * 1.3;
            phases[i] = rand();
        }
        return { positions, sizes, phases };
    }, []);
    const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
    useFrame((_, dt) => {
        if (animate && mat.current) mat.current.uniforms.uTime.value += Math.min(dt, 0.1);
    });
    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={positions.length / 3} args={[positions, 3]} />
                <bufferAttribute attach="attributes-aSize" count={sizes.length} args={[sizes, 1]} />
                <bufferAttribute attach="attributes-aPhase" count={phases.length} args={[phases, 1]} />
            </bufferGeometry>
            <shaderMaterial ref={mat} vertexShader={starVertex} fragmentShader={starFragment} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
        </points>
    );
};

/* ---------------- Suelo rocoso ---------------- */
const Ground = () => {
    const geometry = useMemo(() => {
        const rand = createRandom(77);
        const g = new THREE.PlaneGeometry(140, 70, 140, 70);
        g.rotateX(-Math.PI / 2);
        const pos = g.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i), z = pos.getZ(i);
            // dunas suaves + piedras (ruido de alta frecuencia), más altas al fondo
            const far = Math.max(0, -z - 6) / 30;
            const h = Math.sin(x * 0.18 + z * 0.07) * 0.35 + Math.sin(x * 0.05 - z * 0.11) * 0.8 * far * 3
                + (rand() - 0.5) * 0.18 + (far > 0.6 ? (rand() * 1.6) * far : 0);
            pos.setY(i, h);
        }
        g.computeVertexNormals();
        return g;
    }, []);
    const rocks = useMemo(() => {
        const rand = createRandom(5);
        return Array.from({ length: 26 }, () => ({
            p: [(rand() - 0.5) * 34, -0.1, -2 - rand() * 22] as [number, number, number],
            s: 0.15 + rand() * 0.55,
            r: [rand() * 3, rand() * 3, rand() * 3] as [number, number, number],
        }));
    }, []);
    return (
        <group>
            <mesh geometry={geometry} receiveShadow>
                <meshStandardMaterial color="#0f2a2c" roughness={1} flatShading />
            </mesh>
            {rocks.map((rock, i) => (
                <mesh key={i} position={rock.p} rotation={rock.r} scale={rock.s}>
                    <dodecahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial color="#163638" roughness={1} flatShading />
                </mesh>
            ))}
        </group>
    );
};

/* ---------------- Radiotelescopio ---------------- */
const dishProfile = (() => {
    // paraboloide: y = r² / (4f)
    const pts: THREE.Vector2[] = [];
    const R = 1.6, f = 0.75;
    for (let i = 0; i <= 18; i++) {
        const r = (i / 18) * R;
        pts.push(new THREE.Vector2(r, (r * r) / (4 * f)));
    }
    return pts;
})();

const Antenna = ({ position, scale = 1, phase = 0, animate }: { position: [number, number, number]; scale?: number; phase?: number; animate: boolean }) => {
    const yaw = useRef<THREE.Group>(null);
    const pitch = useRef<THREE.Group>(null);
    const beacon = useRef<THREE.MeshBasicMaterial>(null);
    const t = useRef(phase * 10);

    useFrame((_, dt) => {
        if (animate) t.current += Math.min(dt, 0.1);
        const time = t.current;
        if (yaw.current) yaw.current.rotation.y = 0.5 + Math.sin(time * 0.07 + phase) * 0.35;
        if (pitch.current) pitch.current.rotation.x = 0.75 + Math.sin(time * 0.05 + phase * 2) * 0.12;
        if (beacon.current) beacon.current.opacity = 0.25 + 0.75 * Math.max(0, Math.sin(time * 2.2 + phase * 4)) ** 8;
    });

    const white = <meshStandardMaterial color="#d9eeea" roughness={0.55} metalness={0.15} />;
    return (
        <group position={position} scale={scale}>
            {/* base y pedestal */}
            <mesh position={[0, 0.25, 0]}>
                <cylinderGeometry args={[0.95, 1.1, 0.5, 24]} />
                {white}
            </mesh>
            <mesh position={[0, 1.25, 0]}>
                <cylinderGeometry args={[0.45, 0.7, 1.6, 20]} />
                {white}
            </mesh>
            <group ref={yaw} position={[0, 2.1, 0]}>
                {/* horquilla */}
                <mesh position={[0, 0.25, 0]}>
                    <boxGeometry args={[1.2, 0.5, 0.9]} />
                    {white}
                </mesh>
                <group ref={pitch} position={[0, 0.75, 0]}>
                    {/* plato */}
                    <mesh position={[0, 0.2, 0]}>
                        <latheGeometry args={[dishProfile, 40]} />
                        <meshStandardMaterial color="#e7f6f3" roughness={0.45} metalness={0.2} side={THREE.DoubleSide} />
                    </mesh>
                    {/* soportes del receptor */}
                    {[0, 1, 2, 3].map((k) => {
                        const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
                        return (
                            <mesh key={k} position={[Math.cos(a) * 0.62, 0.95, Math.sin(a) * 0.62]} rotation={[Math.sin(a) * 0.62, 0, -Math.cos(a) * 0.62]}>
                                <cylinderGeometry args={[0.018, 0.018, 1.45, 6]} />
                                {white}
                            </mesh>
                        );
                    })}
                    <mesh position={[0, 1.6, 0]}>
                        <cylinderGeometry args={[0.1, 0.14, 0.28, 12]} />
                        {white}
                    </mesh>
                    {/* luz de posición */}
                    <mesh position={[0, 1.8, 0]}>
                        <sphereGeometry args={[0.06, 10, 10]} />
                        <meshBasicMaterial ref={beacon} color={MINT} transparent toneMapped={false} />
                    </mesh>
                </group>
            </group>
        </group>
    );
};

/* ---------------- Estrella fugaz ---------------- */
const ShootingStar = ({ animate }: { animate: boolean }) => {
    const mesh = useRef<THREE.Mesh>(null);
    const mat = useRef<THREE.MeshBasicMaterial>(null);
    const state = useRef({ t: 0, next: 3, from: new THREE.Vector3(), dir: new THREE.Vector3() });
    const rand = useMemo(() => createRandom(31), []);

    useFrame((_, dt) => {
        const s = state.current;
        const m = mesh.current, mt = mat.current;
        if (!m || !mt || !animate) return;
        s.t += Math.min(dt, 0.1);
        if (s.t > s.next) {
            s.t = 0;
            s.next = 5 + rand() * 7;
            s.from.set(-25 + rand() * 40, 22 + rand() * 12, -60);
            s.dir.set(1, -0.42 - rand() * 0.2, 0).normalize();
            m.rotation.z = Math.atan2(s.dir.y, s.dir.x);
        }
        const life = s.t / 1.1;
        if (life <= 1) {
            m.position.copy(s.from).addScaledVector(s.dir, life * 26);
            mt.opacity = Math.sin(life * Math.PI);
        } else mt.opacity = 0;
    });

    return (
        <mesh ref={mesh}>
            <planeGeometry args={[4, 0.06]} />
            <meshBasicMaterial ref={mat} color="#c9fff6" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
        </mesh>
    );
};

/* ---------------- Cámara: deriva muy lenta ---------------- */
const Drift = ({ animate }: { animate: boolean }) => {
    const t = useRef(0);
    useFrame(({ camera }, dt) => {
        if (animate) t.current += Math.min(dt, 0.1);
        camera.position.x = Math.sin(t.current * 0.05) * 0.6;
        camera.position.y = 1.7 + Math.sin(t.current * 0.07) * 0.12;
        camera.lookAt(0.6, 7, -10);
    });
    return null;
};

export default function RadioObservatory() {
    const animate = !useReducedMotion();
    return (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
            <Canvas
                camera={{ position: [0, 1.7, 8], fov: 50 }}
                dpr={[1, 1.5]}
                gl={{ antialias: true, powerPreference: 'high-performance' }}
                frameloop={animate ? 'always' : 'demand'}
            >
                <color attach="background" args={['#03161a']} />
                <fog attach="fog" args={['#062226', 18, 70]} />
                <ambientLight intensity={0.6} color={TEAL} />
                <hemisphereLight args={['#7af0e2', '#031214', 0.7]} />
                <directionalLight position={[14, 6, 4]} intensity={2.4} color="#d8fff8" />
                <Sky animate={animate} />
                <Stars animate={animate} />
                <ShootingStar animate={animate} />
                <Ground />
                <Antenna position={[-4.5, 0, -24]} scale={1} phase={0} animate={animate} />
                <Antenna position={[1.6, 0, -15]} scale={1.15} phase={1.3} animate={animate} />
                <Antenna position={[5.8, 0, -19]} scale={1.3} phase={2.1} animate={animate} />
                <Antenna position={[9.8, 0, -14]} scale={1.05} phase={3.4} animate={animate} />
                <Antenna position={[14, 0, -22]} scale={1} phase={4.2} animate={animate} />
                <Drift animate={animate} />
            </Canvas>
            {/* velo a la izquierda para que el texto se lea sobre la escena */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#03161a]/85 via-[#03161a]/35 to-transparent" />
        </div>
    );
}
