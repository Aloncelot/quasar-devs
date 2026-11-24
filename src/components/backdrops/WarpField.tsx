'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createRandom } from '@/lib/random';
import { useCircleTexture } from '@/lib/circleTexture';

const FIELD_WIDTH = 40;
const BOUNDARY_LEFT = -20;
const NUM_LAYERS = 4;
const POINTS_PER_LAYER = 150;

/** Campo de estrellas en movimiento horizontal (sensación de velocidad de crucero). */
const Stars = () => {
    const circleTex = useCircleTexture();

    const layers = useMemo(() => {
        const rand = createRandom(7);
        const colorInside = new THREE.Color('#ff4fe8');
        const colorOutside = new THREE.Color('#3c8dff');
        const mixed = new THREE.Color();
        const data = [];
        for (let l = 0; l < NUM_LAYERS; l++) {
            const positions = new Float32Array(POINTS_PER_LAYER * 3);
            const colors = new Float32Array(POINTS_PER_LAYER * 3);
            const depthFactor = l / (NUM_LAYERS - 1);
            const zPos = 2 - depthFactor * 10;
            const speed = 0.05 * (1 - depthFactor * 0.5);

            for (let i = 0; i < POINTS_PER_LAYER; i++) {
                const i3 = i * 3;
                positions[i3] = (rand() - 0.5) * FIELD_WIDTH;
                positions[i3 + 1] = (rand() - 0.5) * 6;
                positions[i3 + 2] = zPos;

                mixed.copy(colorInside).lerp(colorOutside, rand());
                mixed.multiplyScalar(1 - depthFactor * 0.8);
                colors[i3] = mixed.r;
                colors[i3 + 1] = mixed.g;
                colors[i3 + 2] = mixed.b;
            }
            data.push({ positions, colors, speed });
        }
        return data;
    }, []);

    const layerRefs = useRef<(THREE.Points | null)[]>([]);

    useFrame((state, delta) => {
        const safeDelta = Math.min(delta, 0.1);
        layerRefs.current.forEach((points, i) => {
            if (!points) return;
            const { speed } = layers[i];
            const attribute = points.geometry.getAttribute('position');
            const array = attribute.array as Float32Array;

            for (let j = 0; j < POINTS_PER_LAYER; j++) {
                const j3 = j * 3;
                array[j3] -= speed * 20 * safeDelta;
                array[j3 + 1] += Math.sin(state.clock.elapsedTime * 1.5 + array[j3] * 0.3) * 0.005;
                if (array[j3] < BOUNDARY_LEFT) array[j3] += FIELD_WIDTH;
            }
            attribute.needsUpdate = true;
        });
    });

    return (
        <group rotation={[0.2, 0, 0]}>
            {layers.map((layer, i) => (
                <points key={i} ref={(el) => { layerRefs.current[i] = el as THREE.Points | null; }}>
                    <bufferGeometry>
                        <bufferAttribute attach="attributes-position" count={POINTS_PER_LAYER} args={[layer.positions, 3]} />
                        <bufferAttribute attach="attributes-color" count={POINTS_PER_LAYER} args={[layer.colors, 3]} />
                    </bufferGeometry>
                    <pointsMaterial
                        size={0.15}
                        map={circleTex}
                        transparent
                        opacity={0.9}
                        depthWrite={false}
                        blending={THREE.AdditiveBlending}
                        vertexColors
                    />
                </points>
            ))}
        </group>
    );
};

/** Escena del footer. `active`: anima solo mientras el footer está en pantalla (ahorra GPU). */
export default function WarpField({ active }: { active: boolean }) {
    return (
        <Canvas
            camera={{ position: [0, 0, 8], fov: 45 }}
            gl={{ antialias: false }}
            dpr={[1, 1.5]}
            frameloop={active ? 'always' : 'demand'}
        >
            <fog attach="fog" args={['#060414', 5, 20]} />
            <Stars />
        </Canvas>
    );
}
