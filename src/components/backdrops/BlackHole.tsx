'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';

/* ------------------------------------------------------------------
   Agujero negro de /software: un shader en un plano a pantalla completa.
   Capas: halo magenta, anillo de fotones, la parte trasera del disco
   curvada por la gravedad (anillo de lente) y el disco de acreción que
   gira, más brillante del lado que se acerca (efecto Doppler).
------------------------------------------------------------------- */

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uRes;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 p = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0) * 2.0;
    // ligera inclinación del conjunto
    float c = cos(-0.14), s = sin(-0.14);
    p = mat2(c, -s, s, c) * p;

    float R = 0.34;                 // radio de la sombra
    float r = length(p);
    float ang = atan(p.y, p.x);
    float t = uTime;

    // Disco de acreción visto casi de canto
    vec2 d = vec2(p.x, p.y / 0.17);
    float dr = length(d);
    float dAng = atan(d.y, d.x);
    float band = smoothstep(R * 1.02, R * 1.32, dr) * (1.0 - smoothstep(R * 1.5, R * 3.4, dr));
    float swirl = fbm(vec2(dAng * 3.0 - t * 0.55 + dr * 4.0, dr * 6.0));
    float streak = fbm(vec2(dAng * 9.0 - t * 0.85, dr * 16.0));
    float disk = band * (0.35 + 0.95 * swirl) * (0.55 + 0.7 * streak);
    disk *= 0.6 + 0.6 * (-p.x / (abs(p.x) + 0.45));   // Doppler: el lado izquierdo brilla más

    // Anillo de lente, anillo de fotones y halo
    float lens = exp(-pow((r - R * 1.2) / (R * 0.13), 2.0)) * (0.5 + 0.7 * fbm(vec2(ang * 4.0 - t * 0.45, r * 8.0)));
    float photon = exp(-pow((r - R * 1.03) / (R * 0.03), 2.0));
    float halo = exp(-pow(max(r - R, 0.0) / (R * 1.25), 1.2)) * 0.36;
    float aura = exp(-pow((r - R * 1.75) / (R * 0.6), 2.0)) * 0.10;
    float shadow = 1.0 - smoothstep(R * 0.96, R * 1.0, r);

    vec3 cWhite = vec3(1.0, 0.94, 1.0);
    vec3 cVio = vec3(0.72, 0.62, 1.0);
    vec3 cMag = vec3(0.88, 0.33, 1.0);
    vec3 cCyan = vec3(0.30, 0.92, 1.0);

    float k = smoothstep(R * 1.1, R * 2.8, dr);
    vec3 diskCol = mix(cWhite, mix(cVio, cMag, smoothstep(0.35, 1.0, k)), smoothstep(0.0, 0.45, k));

    vec3 col = cMag * halo + mix(cVio, cWhite, 0.35) * lens * 1.15 + cWhite * photon * 1.5 + cCyan * aura;
    col *= 1.0 - shadow;
    // la mitad trasera del disco queda detrás de la sombra; la delantera pasa por encima
    float front = step(p.y, 0.0);
    col += diskCol * disk * mix(1.0 - shadow, 1.0, front) * 1.35;

    // se desvanece antes del borde del lienzo (sin cortes rectos)
    vec2 q = abs(vUv - 0.5) * 2.0;
    float edge = 1.0 - smoothstep(0.62, 0.98, max(q.x, q.y));
    float roundEdge = 1.0 - smoothstep(0.7, 1.0, length(q));
    col *= edge * roundEdge;

    float a = clamp(max(max(col.r, max(col.g, col.b)), shadow), 0.0, 1.0);
    gl_FragColor = vec4(col, a);   // alfa premultiplicado
  }
`;

const Plane = ({ animate }: { animate: boolean }) => {
    const { size } = useThree();
    const material = useRef<THREE.ShaderMaterial>(null);
    const uniforms = useMemo(
        () => ({ uTime: { value: 8 }, uRes: { value: new THREE.Vector2(1, 1) } }),
        []
    );

    useFrame((_, delta) => {
        const m = material.current;
        if (!m) return;
        m.uniforms.uRes.value.set(size.width, size.height);
        if (animate) m.uniforms.uTime.value += Math.min(delta, 0.1);
    });

    return (
        <mesh frustumCulled={false}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                ref={material}
                vertexShader={vertex}
                fragmentShader={fragment}
                uniforms={uniforms}
                transparent
                premultipliedAlpha
                depthWrite={false}
            />
        </mesh>
    );
};

/** Lienzo cuadrado con el agujero negro; el contenedor decide su tamaño. */
export default function BlackHole({ className = '' }: { className?: string }) {
    const animate = !useReducedMotion();
    return (
        <div aria-hidden="true" className={`pointer-events-none ${className}`}>
            <Canvas
                orthographic
                dpr={[1, 1.5]}
                gl={{ alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'high-performance' }}
                frameloop={animate ? 'always' : 'demand'}
            >
                <Plane animate={animate} />
            </Canvas>
        </div>
    );
}
