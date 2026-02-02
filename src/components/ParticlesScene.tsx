'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

// --- NUEVO: Función para crear una textura redonda y difusa al vuelo ---
// Esto evita que los puntos se vean cuadrados.
const useCircleTexture = () => {
    const texture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const context = canvas.getContext('2d');
        if (context) {
            const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255,255,255,1)'); // Centro blanco opaco
            gradient.addColorStop(0.4, 'rgba(255,255,255,0.8)');
            gradient.addColorStop(1, 'rgba(0,0,0,0)'); // Borde transparente

            context.fillStyle = gradient;
            context.fillRect(0, 0, 64, 64);
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        return tex;
    }, []);
    return texture;
}

// --- COMPONENTE 1: LA GALAXIA ---
const Galaxy = () => {
    const count = 20000;
    const mesh = useRef<any>(null);
    const circleTex = useCircleTexture(); // Usamos la textura redonda

    const colorInside = new THREE.Color('#ff6030');
    const colorOutside = new THREE.Color('#1b3984');

    const { positions, colors } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const radius = Math.random() * 12;
            const spinAngle = radius * 0.8;
            const branchAngle = (i % 3) * ((2 * Math.PI) / 3);

            const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * (radius / 2);
            const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * (radius / 2);
            const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * (radius / 2);

            positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
            positions[i3 + 1] = randomY * (1 - radius / 15);
            positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

            const mixedColor = colorInside.clone();
            mixedColor.lerp(colorOutside, radius / 12);

            colors[i3] = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;
        }
        return { positions, colors };
    }, [count]);

    useFrame((state, delta) => {
        if (mesh.current) {
            mesh.current.rotation.y += delta * 0.05;
        }
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={positions.length / 3} args={[positions, 3]} />
                <bufferAttribute attach="attributes-color" count={colors.length / 3} args={[colors, 3]} />
            </bufferGeometry>
            {/* APLICAMOS LA TEXTURA REDONDA (map={circleTex}) */}
            <pointsMaterial
                size={0.1} // Aumenté un poco el tamaño porque la textura difusa se ve más pequeña
                map={circleTex}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                vertexColors={true}
            />
        </points>
    );
};

// --- COMPONENTE 2: EL HAZ DE LUZ ---
const JetStream = () => {
    const count = 2000;
    const geom = useRef<THREE.BufferGeometry>(null);
    const circleTex = useCircleTexture(); // Usamos la textura aquí también
    const height = 10;
    const radius = 0.3;

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            pos[i3] = (Math.random() - 0.5) * radius;
            pos[i3 + 1] = Math.random() * height;
            pos[i3 + 2] = (Math.random() - 0.5) * radius;
        }
        return pos;
    }, [count]);

    useFrame((state, delta) => {
        if (geom.current) {
            const positionAttribute = geom.current.getAttribute('position');
            const positions = positionAttribute.array as Float32Array;

            for (let i = 0; i < count; i++) {
                const i3 = i * 3;
                positions[i3 + 1] += delta * 5;
                if (positions[i3 + 1] > height) {
                    positions[i3 + 1] = 0;
                }
            }
            positionAttribute.needsUpdate = true;
        }
    });

    return (
        <points>
            <bufferGeometry ref={geom}>
                <bufferAttribute attach="attributes-position" count={positions.length / 3} args={[positions, 3]} />
            </bufferGeometry>
            {/* APLICAMOS LA TEXTURA REDONDA Y AUMENTAMOS TAMAÑO */}
            <pointsMaterial
                size={0.2} // Puntos más grandes para que parezca energía densa
                map={circleTex}
                color="#ffffff"
                transparent
                opacity={0.8}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
};

// --- COMPONENTE 3: NÚCLEO blackhole ---
const Core = () => {
    return (
        <group>
            {/* 1. El Horizonte de Sucesos (La esfera negra) */}
            {/* Le damos color #000000 (negro puro) para que sea un vacío en el espacio */}
            <mesh>
                <sphereGeometry args={[0.6, 32, 32]} />
                <meshBasicMaterial color="#000000" />
            </mesh>

            {/* 2. (Opcional) El Anillo de Fuego Interior */}
            {/* Un pequeño anillo brillante justo en el borde para resaltar la oscuridad */}
            <mesh rotation={[1.6, 0, 0]}> {/* Rotado para alinearse con el disco */}
                <torusGeometry args={[0.65, 0.02, 16, 100]} />
                <meshBasicMaterial color="#ff6030" transparent opacity={0.8} />
            </mesh>
        </group>
    )
}


// --- LA ESCENA FINAL ---
export const ParticlesScene = () => {
    const tiltRotation: [number, number, number] = [-0.4, 0, -0.5];
    return (
        <div className="h-screen w-full bg-[#02020a] fixed top-0 left-0 -z-10">
            <Canvas camera={{ position: [8, 10, 12], fov: 50 }} gl={{ antialias: true }}>
                <fog attach="fog" args={['#02020a', 10, 40]} />
                <group rotation={tiltRotation}>
                    <Core />
                    <JetStream />
                    <Galaxy />
                </group>
            </Canvas>
        </div>
    );
};