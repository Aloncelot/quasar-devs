'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, Environment, Float, Octahedron } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

const Artifact = () => {
    const mesh = useRef<THREE.Mesh>(null!);

    useFrame((state, delta) => {
        mesh.current.rotation.x += delta * 0.2;
        mesh.current.rotation.y += delta * 0.2;
    });

    return (
        <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
            <Octahedron args={[3]} ref={mesh}>
                {/* Este material es la clave del look "Premium" */}
                <MeshTransmissionMaterial
                    backside
                    backsideThickness={5}
                    thickness={2}
                    roughness={0}
                    transmission={1}
                    ior={1.5}
                    chromaticAberration={1} // Separa colores (efecto prisma)
                    anisotropy={20}
                    distortion={0.5}
                    distortionScale={0.5}
                    temporalDistortion={0.2}
                    color="#a855f7" // Un tinte violeta sutil
                    background={new THREE.Color('#0a0a0a')}
                />
            </Octahedron>
        </Float>
    );
};

export default function CrystalScene() {
    return (
        <div className="h-screen w-full bg-[#050505] absolute top-0 left-0 -z-10">
            <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                {/* Iluminación para que el cristal brille */}
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={100} color="#00f3ff" />
                <pointLight position={[-10, -10, -10]} intensity={50} color="#ff00aa" />

                <Artifact />

                {/* Entorno de estudio para reflejos */}
                <Environment preset="city" />
            </Canvas>
        </div>
    );
}