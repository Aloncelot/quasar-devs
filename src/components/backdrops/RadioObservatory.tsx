'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import { createRandom } from '@/lib/random';

/* ------------------------------------------------------------------
   Fondo de /supply-chain: un arreglo de radiotelescopios (estilo ALMA)
   en un desierto de altura, de noche, bajo la Vía Láctea. Paleta verde
   azulada (la de la ruta supply chain); software usa violeta.
   Las antenas rastrean el cielo juntas, muy despacio, y de vez en
   cuando cruza una estrella fugaz.
------------------------------------------------------------------- */

const TEAL = '#3ee0cf';
const MINT = '#2bd4a4';

/* ---------------- Plano de la galaxia en el cielo ----------------
   A: dirección del núcleo (cerca del horizonte, a la derecha del centro).
   B: dirección dentro del plano, 90° hacia arriba-izquierda.
   N: normal del plano (latitud galáctica = d · N). */
const GALAXY = (() => {
    const a = new THREE.Vector3(0.34, 0.03, -0.94).normalize();
    const up = new THREE.Vector3(-0.3, 0.8, -0.52).normalize();
    const n = new THREE.Vector3().crossVectors(a, up).normalize();
    const b = new THREE.Vector3().crossVectors(n, a).normalize();
    return { a, b, n };
})();

/** Dirección en el cielo a partir de coordenadas galácticas (l: longitud, b: latitud, en radianes). */
const galacticDir = (l: number, b: number, out = new THREE.Vector3()) =>
    out
        .copy(GALAXY.a).multiplyScalar(Math.cos(l) * Math.cos(b))
        .addScaledVector(GALAXY.b, Math.sin(l) * Math.cos(b))
        .addScaledVector(GALAXY.n, Math.sin(b));

/* ---------------- Cielo: degradado, resplandor del horizonte y Vía Láctea (shader) ---------------- */
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
  uniform vec3 uA;
  uniform vec3 uB;
  uniform vec3 uN;
  varying vec3 vDir;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 6; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
  void main() {
    vec3 d = normalize(vDir);
    float h = clamp(d.y, -0.2, 1.0);

    // noche: verde azulado profundo arriba, más claro hacia el horizonte
    vec3 top = vec3(0.004, 0.02, 0.032);
    vec3 low = vec3(0.016, 0.07, 0.085);
    vec3 col = mix(low, top, smoothstep(0.02, 0.75, h));
    // airglow: franja verde azulada pegada al horizonte (como en los cielos de desierto)
    col += vec3(0.06, 0.34, 0.29) * exp(-max(h, 0.0) * 10.0) * 0.5;

    // ---- Vía Láctea ----
    float b = dot(d, uN);                         // latitud
    float l = atan(dot(d, uB), dot(d, uA));       // longitud (0 = núcleo)
    float core = exp(-l * l / 0.32);              // bulbo del núcleo
    float w = 0.085 + 0.075 * core;               // la banda se ensancha en el núcleo
    float band = exp(-b * b / (w * w));
    float halo = exp(-b * b / 0.08);
    vec2 g = vec2(l * 2.4, b * 9.0);
    float clouds = fbm(g * 1.4 + vec2(uTime * 0.003, 0.0));
    float grain = fbm(g * 5.0 + 3.1);
    float glow = band * (0.2 + 1.3 * smoothstep(0.3, 0.8, clouds)) * (0.35 + 0.95 * grain * grain * 1.6) * (0.45 + 1.6 * core);
    // franjas de polvo oscuro que parten la banda a lo largo
    float lane = exp(-pow((b - 0.018 * sin(l * 3.0)) / (0.03 + 0.025 * core), 2.0));
    float dust = smoothstep(0.42, 0.78, fbm(vec2(l * 4.5, b * 24.0) + 11.0));
    glow *= clamp(1.0 - 0.95 * lane * dust - 0.45 * dust * band, 0.0, 1.0);
    vec3 mw = mix(vec3(0.35, 0.92, 0.84), vec3(0.86, 1.0, 0.97), clamp(core * band * 1.4, 0.0, 1.0)) * glow * 0.62;
    mw += vec3(0.16, 0.55, 0.52) * halo * 0.06;
    // toque violeta/magenta en los bordes de las nubes estelares (paleta del sitio)
    mw += vec3(0.55, 0.22, 0.72) * band * smoothstep(0.58, 0.9, clouds) * (1.0 - core) * 0.07;
    // la atmósfera apaga la galaxia cerca del horizonte
    col += mw * smoothstep(-0.02, 0.16, d.y);

    // luna baja a la derecha (resplandor suave, no compite con la galaxia)
    float moon = max(dot(d, normalize(vec3(0.78, 0.2, -0.59))), 0.0);
    col += vec3(0.6, 0.98, 0.92) * pow(moon, 220.0) * 1.2 + vec3(0.2, 0.55, 0.52) * pow(moon, 10.0) * 0.12;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const Sky = ({ animate }: { animate: boolean }) => {
    const mat = useRef<THREE.ShaderMaterial>(null);
    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uA: { value: GALAXY.a },
            uB: { value: GALAXY.b },
            uN: { value: GALAXY.n },
        }),
        []
    );
    useFrame((_, dt) => {
        if (animate && mat.current) mat.current.uniforms.uTime.value += Math.min(dt, 0.1);
    });
    return (
        <mesh>
            <sphereGeometry args={[90, 64, 40]} />
            <shaderMaterial ref={mat} vertexShader={skyVertex} fragmentShader={skyFragment} uniforms={uniforms} side={THREE.BackSide} depthWrite={false} fog={false} />
        </mesh>
    );
};

/* ---------------- Estrellas: cielo general + nube densa a lo largo de la galaxia ---------------- */
const starVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPR;
  attribute float aSize;
  attribute float aPhase;
  attribute float aTint;
  varying float vAlpha;
  varying float vTint;
  void main() {
    vAlpha = 0.6 + 0.4 * sin(uTime * (0.8 + aPhase) + aPhase * 6.28);
    vTint = aTint;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPR;
    gl_Position = projectionMatrix * mv;
  }
`;
const starFragment = /* glsl */ `
  varying float vAlpha;
  varying float vTint;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = pow(smoothstep(0.5, 0.0, d), 1.5) * vAlpha * 1.4;
    vec3 c = mix(vec3(0.86, 1.0, 0.97), vec3(0.88, 0.82, 1.0), vTint);
    gl_FragColor = vec4(c * a, a);
  }
`;

const Stars = ({ animate }: { animate: boolean }) => {
    const mat = useRef<THREE.ShaderMaterial>(null);
    const dpr = useThree((s) => s.viewport.dpr);
    const { positions, sizes, phases, tints } = useMemo(() => {
        const rand = createRandom(911);
        const gauss = () => Math.sqrt(-2 * Math.log(rand() + 1e-6)) * Math.cos(2 * Math.PI * rand());
        const field = 1900;
        const milky = 7000;
        const pos: number[] = [];
        const size: number[] = [];
        const phase: number[] = [];
        const tint: number[] = [];
        const v = new THREE.Vector3();
        const push = (s: number) => {
            pos.push(v.x * 80, v.y * 80, v.z * 80);
            size.push(s);
            phase.push(rand());
            tint.push(rand() < 0.12 ? rand() : 0);
        };
        // estrellas sueltas en todo el hemisferio superior
        for (let i = 0; i < field; i++) {
            const theta = rand() * Math.PI * 2;
            const y = 0.03 + rand() * 0.97;
            const r = Math.sqrt(1 - y * y);
            v.set(Math.cos(theta) * r, y, Math.sin(theta) * r);
            push(rand() < 0.05 ? 3.4 : 1.3 + rand() * 1.4);
        }
        // polvo de estrellas concentrado en la banda (más denso hacia el núcleo)
        for (let i = 0; i < milky; i++) {
            const l = rand() < 0.55 ? gauss() * 0.8 : (rand() * 2 - 1) * Math.PI;
            const spread = 0.05 + 0.07 * Math.exp((-l * l) / 0.32);
            galacticDir(l, gauss() * spread, v);
            if (v.y < 0.01) continue;
            push(rand() < 0.03 ? 2.6 : 0.9 + rand() * 1.1);
        }
        return {
            positions: new Float32Array(pos),
            sizes: new Float32Array(size),
            phases: new Float32Array(phase),
            tints: new Float32Array(tint),
        };
    }, []);
    const uniforms = useMemo(() => ({ uTime: { value: 0 }, uPR: { value: 1 } }), []);
    useFrame((_, dt) => {
        if (!mat.current) return;
        mat.current.uniforms.uPR.value = dpr;
        if (animate) mat.current.uniforms.uTime.value += Math.min(dt, 0.1);
    });
    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={positions.length / 3} args={[positions, 3]} />
                <bufferAttribute attach="attributes-aSize" count={sizes.length} args={[sizes, 1]} />
                <bufferAttribute attach="attributes-aPhase" count={phases.length} args={[phases, 1]} />
                <bufferAttribute attach="attributes-aTint" count={tints.length} args={[tints, 1]} />
            </bufferGeometry>
            <shaderMaterial ref={mat} vertexShader={starVertex} fragmentShader={starFragment} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
        </points>
    );
};

/* ---------------- Suelo: meseta de desierto con cerros al fondo ---------------- */
const Ground = () => {
    const geometry = useMemo(() => {
        const rand = createRandom(77);
        const g = new THREE.PlaneGeometry(160, 80, 160, 80);
        g.rotateX(-Math.PI / 2);
        const pos = g.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i), z = pos.getZ(i);
            // meseta casi plana donde están las antenas; cerros que suben al fondo
            const far = Math.max(0, -z - 30) / 10;
            const h = Math.sin(x * 0.18 + z * 0.07) * 0.12 + (rand() - 0.5) * 0.08
                + far * (1.2 + Math.sin(x * 0.09) * 0.9 + Math.sin(x * 0.23 + 1.7) * 0.5);
            pos.setY(i, h);
        }
        g.computeVertexNormals();
        return g;
    }, []);
    const rocks = useMemo(() => {
        const rand = createRandom(5);
        return Array.from({ length: 22 }, () => ({
            p: [(rand() - 0.5) * 34, -0.1, -1 - rand() * 12] as [number, number, number],
            s: 0.1 + rand() * 0.35,
            r: [rand() * 3, rand() * 3, rand() * 3] as [number, number, number],
        }));
    }, []);
    return (
        <group>
            <mesh geometry={geometry}>
                <meshStandardMaterial color="#0d2527" roughness={1} flatShading />
            </mesh>
            {rocks.map((rock, i) => (
                <mesh key={i} position={rock.p} rotation={rock.r} scale={rock.s}>
                    <dodecahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial color="#143234" roughness={1} flatShading />
                </mesh>
            ))}
        </group>
    );
};

/* ---------------- Radiotelescopio (estilo ALMA) ----------------
   Base cilíndrica sobre su losa de concreto, rodamiento de azimut, horquilla
   con cabina de receptores, plato parabólico de paneles con estructura
   trasera, y cuadrípode que sostiene el subreflector. */
const DISH_R = 1.5;
const DISH_F = 1.2;
const DISH_DEPTH = (DISH_R * DISH_R) / (4 * DISH_F);
const ELEV_AXIS_Y = 1.55;   // eje de elevación sobre la horquilla
const DISH_LIFT = 0.42;     // vértice del plato sobre el eje de elevación

/** Paneles del plato: costuras radiales y anillos (UV del torno: u = vuelta, v = radio). */
const makePanelTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#f1faf8';
        ctx.fillRect(0, 0, 1024, 256);
        // brillo irregular de cada panel
        const rand = createRandom(3);
        const rings = [0, 0.22, 0.42, 0.6, 0.76, 0.9, 1];
        const sectors = 32;
        for (let r = 0; r < rings.length - 1; r++) {
            for (let s = 0; s < sectors; s++) {
                const shade = 236 + Math.floor(rand() * 16);
                ctx.fillStyle = `rgb(${shade - 6}, ${shade}, ${shade - 2})`;
                ctx.fillRect((s / sectors) * 1024, rings[r] * 256, 1024 / sectors, (rings[r + 1] - rings[r]) * 256);
            }
        }
        ctx.strokeStyle = '#a9c2be';
        ctx.lineWidth = 2;
        for (let s = 0; s < sectors; s++) {
            const x = (s / sectors) * 1024;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 256);
            ctx.stroke();
        }
        for (const r of rings.slice(1, -1)) {
            ctx.beginPath();
            ctx.moveTo(0, r * 256);
            ctx.lineTo(1024, r * 256);
            ctx.stroke();
        }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
};

/** Geometrías y materiales compartidos por todas las antenas (se crean una vez). */
const useAntennaKit = () => {
    const kit = useMemo(() => {
        const dishProfile: THREE.Vector2[] = [];
        for (let i = 0; i <= 28; i++) {
            const r = 0.16 + ((DISH_R - 0.16) * i) / 28;
            dishProfile.push(new THREE.Vector2(r, (r * r) / (4 * DISH_F)));
        }
        const backProfile = [
            new THREE.Vector2(0.4, -0.38),
            new THREE.Vector2(0.62, -0.3),
            new THREE.Vector2(1.0, -0.12),
            new THREE.Vector2(DISH_R * 0.985, DISH_DEPTH - 0.03),
        ];

        // cuadrípode: 4 patas desde el plato (a ~0.78 R) hasta el subreflector
        const apex = new THREE.Vector3(0, DISH_F * 0.92, 0);
        const yAxis = new THREE.Vector3(0, 1, 0);
        const legs = [0, 1, 2, 3].map((k) => {
            const ang = (k / 4) * Math.PI * 2 + Math.PI / 4;
            const r = DISH_R * 0.78;
            const foot = new THREE.Vector3(Math.cos(ang) * r, (r * r) / (4 * DISH_F), Math.sin(ang) * r);
            const dir = apex.clone().sub(foot);
            const len = dir.length();
            return {
                position: foot.clone().addScaledVector(dir, 0.5),
                quaternion: new THREE.Quaternion().setFromUnitVectors(yAxis, dir.normalize()),
                len,
            };
        });

        const panelTex = makePanelTexture();
        const geometries = {
            pad: new THREE.CylinderGeometry(1.75, 1.8, 0.12, 48),
            drum: new THREE.CylinderGeometry(0.82, 0.96, 1.5, 48),
            drumBand: new THREE.CylinderGeometry(0.952, 0.958, 0.07, 48),
            door: new THREE.BoxGeometry(0.34, 0.62, 0.05),
            bearing: new THREE.CylinderGeometry(0.98, 0.98, 0.16, 48),
            traverse: new THREE.BoxGeometry(1.95, 0.42, 1.15),
            arm: new THREE.BoxGeometry(0.3, 1.32, 0.95),
            hub: new THREE.CylinderGeometry(0.25, 0.25, 0.16, 24),
            cabinet: new THREE.BoxGeometry(0.44, 0.34, 0.3),
            cabin: new THREE.BoxGeometry(1.2, 0.9, 1.0),
            dish: new THREE.LatheGeometry(dishProfile, 96),
            back: new THREE.LatheGeometry(backProfile, 48),
            rim: new THREE.TorusGeometry(DISH_R, 0.03, 8, 120),
            vertexHub: new THREE.CylinderGeometry(0.2, 0.26, 0.16, 24),
            strut: new THREE.CylinderGeometry(0.022, 0.022, 1, 6),
            sub: new THREE.CylinderGeometry(0.17, 0.06, 0.1, 24),
            beacon: new THREE.SphereGeometry(0.05, 10, 10),
        };
        const materials = {
            white: new THREE.MeshStandardMaterial({ color: '#e2efec', roughness: 0.5, metalness: 0.15 }),
            panel: new THREE.MeshStandardMaterial({ color: '#ffffff', map: panelTex, roughness: 0.35, metalness: 0.3, side: THREE.DoubleSide }),
            back: new THREE.MeshStandardMaterial({ color: '#b9cfcb', roughness: 0.65, metalness: 0.25, side: THREE.DoubleSide }),
            grey: new THREE.MeshStandardMaterial({ color: '#93aeaa', roughness: 0.55, metalness: 0.45 }),
            dark: new THREE.MeshStandardMaterial({ color: '#21403f', roughness: 0.8 }),
            concrete: new THREE.MeshStandardMaterial({ color: '#2b4a49', roughness: 1 }),
        };
        return { geometries, materials, legs, apex, panelTex };
    }, []);

    useEffect(
        () => () => {
            Object.values(kit.geometries).forEach((g) => g.dispose());
            Object.values(kit.materials).forEach((m) => m.dispose());
            kit.panelTex.dispose();
        },
        [kit]
    );
    return kit;
};

type Kit = ReturnType<typeof useAntennaKit>;

interface AntennaProps {
    kit: Kit;
    position: [number, number, number];
    scale?: number;
    /** Hacia dónde apunta (rad): 0 = hacia la cámara, π = hacia el fondo. */
    yaw: number;
    /** Inclinación del plato desde el cenit (rad). */
    tilt: number;
    phase?: number;
    animate: boolean;
}

const Antenna = ({ kit, position, scale = 1, yaw, tilt, phase = 0, animate }: AntennaProps) => {
    const { geometries: g, materials: m, legs, apex } = kit;
    const yawRef = useRef<THREE.Group>(null);
    const pitchRef = useRef<THREE.Group>(null);
    const beacon = useRef<THREE.MeshBasicMaterial>(null);
    const t = useRef(0);

    useFrame((_, dt) => {
        if (animate) t.current += Math.min(dt, 0.1);
        const time = t.current;
        // todo el arreglo sigue la misma fuente: se mueven juntas, con un desfase mínimo
        if (yawRef.current) yawRef.current.rotation.y = yaw + Math.sin(time * 0.03 + phase * 0.15) * 0.16;
        if (pitchRef.current) pitchRef.current.rotation.x = tilt + Math.sin(time * 0.022 + 1 + phase * 0.1) * 0.07;
        if (beacon.current) beacon.current.opacity = 0.2 + 0.8 * Math.max(0, Math.sin(time * 2.2 + phase * 4)) ** 8;
    });

    return (
        <group position={position} scale={scale}>
            {/* losa de concreto */}
            <mesh geometry={g.pad} material={m.concrete} position={[0, 0.06, 0]} />
            {/* base */}
            <mesh geometry={g.drum} material={m.white} position={[0, 0.87, 0]} />
            <mesh geometry={g.drumBand} material={m.grey} position={[0, 0.42, 0]} />
            <mesh geometry={g.door} material={m.dark} position={[0, 0.52, 0.93]} />
            <mesh geometry={g.bearing} material={m.grey} position={[0, 1.7, 0]} />

            <group ref={yawRef} position={[0, 1.78, 0]} rotation={[0, yaw, 0]}>
                {/* horquilla */}
                <mesh geometry={g.traverse} material={m.white} position={[0, 0.21, 0]} />
                <mesh geometry={g.cabinet} material={m.grey} position={[0.5, 0.59, -0.42]} />
                {[-1, 1].map((side) => (
                    <group key={side} position={[side * 0.85, 0, 0]}>
                        <mesh geometry={g.arm} material={m.white} position={[0, 0.42 + 0.66, 0]} />
                        <mesh geometry={g.hub} material={m.grey} position={[side * 0.2, ELEV_AXIS_Y, 0]} rotation={[0, 0, Math.PI / 2]} />
                    </group>
                ))}

                <group ref={pitchRef} position={[0, ELEV_AXIS_Y, 0]} rotation={[tilt, 0, 0]}>
                    {/* cabina de receptores */}
                    <mesh geometry={g.cabin} material={m.white} position={[0, -0.15, 0]} />
                    <group position={[0, DISH_LIFT, 0]}>
                        {/* plato: superficie de paneles, borde y estructura trasera */}
                        <mesh geometry={g.dish} material={m.panel} />
                        <mesh geometry={g.back} material={m.back} />
                        <mesh geometry={g.rim} material={m.white} position={[0, DISH_DEPTH, 0]} rotation={[Math.PI / 2, 0, 0]} />
                        <mesh geometry={g.vertexHub} material={m.grey} position={[0, 0.04, 0]} />
                        {/* cuadrípode y subreflector */}
                        {legs.map((leg, k) => (
                            <mesh key={k} geometry={g.strut} material={m.white} position={leg.position} quaternion={leg.quaternion} scale={[1, leg.len, 1]} />
                        ))}
                        <mesh geometry={g.sub} material={m.white} position={[apex.x, apex.y + 0.02, apex.z]} />
                        {/* luz de posición */}
                        <mesh geometry={g.beacon} position={[apex.x, apex.y + 0.12, apex.z]}>
                            <meshBasicMaterial ref={beacon} color={MINT} transparent toneMapped={false} />
                        </mesh>
                    </group>
                </group>
            </group>
        </group>
    );
};

/** Losa vacía (en ALMA las antenas se mueven entre losas para cambiar la configuración). */
const EmptyPad = ({ kit, position }: { kit: Kit; position: [number, number, number] }) => (
    <mesh geometry={kit.geometries.pad} material={kit.materials.concrete} position={[position[0], position[1] + 0.06, position[2]]} />
);

/** Posiciones del arreglo: todas apuntan al mismo punto del cielo (arriba y a la derecha), con el plato hacia el espectador. */
const ARRAY: Omit<AntennaProps, 'kit' | 'animate'>[] = [
    { position: [-7, 0, -31], scale: 0.95, yaw: 0.75, tilt: 0.72 },
    { position: [-2, 0, -21], scale: 1.05, yaw: 0.7, tilt: 0.7 },
    { position: [2.6, 0, -27], scale: 1, yaw: 0.78, tilt: 0.72 },
    { position: [5.2, 0, -16.5], scale: 1.15, yaw: 0.66, tilt: 0.68 },
    { position: [9.4, 0, -22], scale: 1.05, yaw: 0.72, tilt: 0.7 },
    { position: [13.4, 0, -15.5], scale: 1.2, yaw: 0.62, tilt: 0.66 },
    { position: [17, 0, -27], scale: 1, yaw: 0.7, tilt: 0.71 },
    { position: [21, 0, -19], scale: 1.05, yaw: 0.66, tilt: 0.69 },
];
const EMPTY_PADS: [number, number, number][] = [[-4.5, 0, -14], [11, 0, -30], [24, 0, -26]];

const Observatory = ({ animate }: { animate: boolean }) => {
    const kit = useAntennaKit();
    return (
        <group>
            {EMPTY_PADS.map((p, i) => <EmptyPad key={i} kit={kit} position={p} />)}
            {ARRAY.map((a, i) => (
                <Antenna key={i} kit={kit} {...a} phase={i} animate={animate} />
            ))}
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
                <fog attach="fog" args={['#062226', 22, 80]} />
                <ambientLight intensity={0.22} color={TEAL} />
                <hemisphereLight args={['#bff7ef', '#04181a', 0.75]} />
                {/* luz de luna desde la derecha: ilumina el costado de las antenas */}
                <directionalLight position={[14, 8, 6]} intensity={2.8} color="#ecfffb" />
                {/* contraluz suave desde la galaxia */}
                <directionalLight position={[-6, 10, -20]} intensity={0.5} color={TEAL} />
                <Sky animate={animate} />
                <Stars animate={animate} />
                <ShootingStar animate={animate} />
                <Ground />
                <Observatory animate={animate} />
                <Drift animate={animate} />
            </Canvas>
            {/* velo a la izquierda para que el texto se lea sobre la escena */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#03161a]/85 via-[#03161a]/35 to-transparent" />
        </div>
    );
}
