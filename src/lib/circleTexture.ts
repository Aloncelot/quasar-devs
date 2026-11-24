import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

/** Textura circular con degradado para las partículas (puntos suaves en lugar de cuadrados). */
export const useCircleTexture = () => {
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

    // Libera la textura de la GPU al desmontar la escena
    useEffect(() => () => texture.dispose(), [texture]);

    return texture;
};
