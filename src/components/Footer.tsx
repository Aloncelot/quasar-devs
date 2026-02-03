'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FaArrowUp, FaReact } from 'react-icons/fa';
import { SiNextdotjs, SiTailwindcss, SiTypescript } from 'react-icons/si';

// --- 1. FUNCIÓN DE TEXTURA ---
const useCircleTexture = () => {
    const texture = useMemo(() => {
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
    return texture;
}

// --- 2. COMPONENTE WARPFIELD (CORREGIDO) ---
const WarpField = () => {
    const circleTex = useCircleTexture();
    const colorInside = new THREE.Color('#ff6030'); // Naranja Quasar
    const colorOutside = new THREE.Color('#1b3984'); // Azul Profundo

    const numLayers = 4;
    const pointsPerLayer = 150;

    // El ancho total del campo es 40 (de -20 a 20)
    const FIELD_WIDTH = 40;
    const BOUNDARY_LEFT = -20;

    // Generamos los datos de las partículas
    const layers = useMemo(() => {
        const layerData = [];
        for (let l = 0; l < numLayers; l++) {
            const positions = new Float32Array(pointsPerLayer * 3);
            const colors = new Float32Array(pointsPerLayer * 3);

            const depthFactor = l / (numLayers - 1);
            const zPos = 2 - depthFactor * 10;
            const speed = 0.05 * (1 - depthFactor * 0.5);

            for (let i = 0; i < pointsPerLayer; i++) {
                const i3 = i * 3;
                positions[i3] = (Math.random() - 0.5) * FIELD_WIDTH; // X: -20 a 20
                positions[i3 + 1] = (Math.random() - 0.5) * 6;      // Y: Altura reducida
                positions[i3 + 2] = zPos;                            // Z: Profundidad

                const mixedColor = colorInside.clone().lerp(colorOutside, Math.random());
                mixedColor.multiplyScalar(1 - depthFactor * 0.8);

                colors[i3] = mixedColor.r;
                colors[i3 + 1] = mixedColor.g;
                colors[i3 + 2] = mixedColor.b;
            }
            layerData.push({ positions, colors, speed });
        }
        return layerData;
    }, []);

    const layerRefs = useRef<any[]>([]);

    useFrame((state, delta) => {
        // FIX 1: Limitar el delta para evitar saltos temporales grandes
        const safeDelta = Math.min(delta, 0.1);

        layerRefs.current.forEach((mesh, i) => {
            if (!mesh) return;
            const { speed } = layers[i];
            const positionAttribute = mesh.geometry.getAttribute('position');
            const posArray = positionAttribute.array as Float32Array;

            for (let j = 0; j < pointsPerLayer; j++) {
                const i3 = j * 3;

                // Movimiento horizontal usando safeDelta
                posArray[i3] -= speed * 20 * safeDelta;

                // Ondulación Vertical
                posArray[i3 + 1] += Math.sin(state.clock.elapsedTime * 1.5 + posArray[i3] * 0.3) * 0.005;

                // FIX 2: Loop Infinito Suave
                // Si se pasa del límite izquierdo (-20), le sumamos el ancho total (40).
                // Esto lo coloca a la derecha, pero respetando cuánto se "pasó", 
                // manteniendo la distancia relativa entre partículas.
                if (posArray[i3] < BOUNDARY_LEFT) {
                    posArray[i3] += FIELD_WIDTH;
                }
            }
            positionAttribute.needsUpdate = true;
        });
    });

    return (
        <group rotation={[0.2, 0, 0]}>
            {layers.map((layer, i) => (
                <points key={i} ref={el => (layerRefs.current[i] = el)}>
                    <bufferGeometry>
                        <bufferAttribute attach="attributes-position" count={pointsPerLayer} args={[layer.positions, 3]} />
                        <bufferAttribute attach="attributes-color" count={pointsPerLayer} args={[layer.colors, 3]} />
                    </bufferGeometry>
                    <pointsMaterial
                        size={0.15}
                        map={circleTex}
                        transparent
                        opacity={0.9}
                        depthWrite={false}
                        blending={THREE.AdditiveBlending}
                        vertexColors={true}
                    />
                </points>
            ))}
        </group>
    );
};

// --- 3. COMPONENTE FOOTER PRINCIPAL ---
export const Footer = () => {

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="w-full h-[400px] md:h-[300px] bg-black border-t border-teal-900/30 relative overflow-hidden flex flex-col justify-end">

            {/* FONDO ANIMADO (WARPFIELD) */}
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 8], fov: 45 }} gl={{ antialias: false }}>
                    <fog attach="fog" args={['#000000', 5, 20]} />
                    <WarpField />
                </Canvas>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />
            </div>

            {/* CONTENIDO DEL FOOTER */}
            <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 w-full flex flex-col md:flex-row items-center justify-between gap-6">

                {/* IZQUIERDA: Marca */}
                <div className="text-center md:text-left">
                    <h3 className="font-gibed text-xl text-white tracking-widest mb-2">
                        QUASAR <span className="text-teal-500">DEVS</span>
                    </h3>
                    <p className="text-xs text-gray-500 font-mono">
                        SYSTEM_VERSION: 2.0.26_BETA <br />
                        STATUS: <span className="text-teal-500">OPERATIONAL</span>
                    </p>
                </div>

                {/* CENTRO: Stack */}
                <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">
                        Powering this system
                    </span>
                    <div className="flex gap-4 text-gray-400">
                        <SiNextdotjs className="hover:text-white transition-colors cursor-help" title="Next.js" />
                        <FaReact className="hover:text-cyan-400 transition-colors cursor-help" title="React" />
                        <SiTypescript className="hover:text-blue-400 transition-colors cursor-help" title="TypeScript" />
                        <SiTailwindcss className="hover:text-teal-400 transition-colors cursor-help" title="Tailwind" />
                    </div>
                </div>

                {/* DERECHA: Botón y Copy */}
                <div className="flex flex-col items-center md:items-end gap-4">
                    <button
                        onClick={scrollToTop}
                        className="group flex items-center gap-2 text-xs font-mono text-teal-500 hover:text-teal-300 transition-colors uppercase tracking-widest"
                    >
                        <span>Return to Surface</span>
                        <div className="p-2 border border-teal-500/30 rounded bg-teal-500/5 group-hover:bg-teal-500/20 transition-all">
                            <FaArrowUp className="group-hover:-translate-y-1 transition-transform" />
                        </div>
                    </button>
                    <p className="text-xs text-gray-600">
                        © {new Date().getFullYear()} Alonso Correa. All rights reserved.
                    </p>
                </div>

            </div>

            {/* Barra final decorativa */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-900/50 to-transparent z-20" />
        </footer>
    );
};