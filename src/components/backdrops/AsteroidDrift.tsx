'use client';

import { useEffect, useRef } from 'react';
import { createRandom } from '@/lib/random';

/* ------------------------------------------------------------------
   Fondo de /sobre-mi: cinturón de asteroides con estética de capas
   planas (tipo Firewatch). Cada capa es más clara y brumosa cuanto más
   lejos está, y avanza de derecha a izquierda a su propia velocidad.
   Sin colisiones: dentro de una capa todos van a la misma velocidad y en
   carriles separados, así la distancia entre ellos nunca cambia.
------------------------------------------------------------------- */

interface Rock {
    x: number;
    y: number;
    r: number;
    rot: number;
    spin: number;
    pts: [number, number][];
}

interface Layer {
    speed: number;        // px/s (a 1440 px de ancho)
    base: string;         // color de la cara en sombra
    lit: string;          // color de la cara iluminada
    rim?: string;         // borde de luz (capas cercanas)
    rocks: Rock[];
    period: number;       // ancho del ciclo antes de repetir
}

// Paleta del sitio en versión más clara: violeta → magenta, con luz cian
const SKY = ['#2b1a5c', '#46267a', '#6e3592', '#a04a9e', '#d06aa6'];
const LAYERS = [
    { speed: 7, base: '#9a5ab0', lit: '#b97cc4', count: 14, rMin: 6, rMax: 14, band: [0.18, 0.62] },
    { speed: 13, base: '#7a4196', lit: '#a066b6', count: 11, rMin: 12, rMax: 26, band: [0.22, 0.78] },
    { speed: 24, base: '#53287a', lit: '#7c4ca6', count: 8, rMin: 24, rMax: 46, band: [0.3, 0.88] },
    { speed: 40, base: '#2c1652', lit: '#4c2d7d', rim: '#4debff', count: 5, rMin: 46, rMax: 84, band: [0.45, 1.02] },
];

const makeRock = (rand: () => number, r: number): [number, number][] => {
    const n = 8 + Math.floor(rand() * 4);
    return Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + rand() * 0.35;
        const k = 0.72 + rand() * 0.32;
        return [Math.cos(a) * r * k, Math.sin(a) * r * k * (0.78 + rand() * 0.2)];
    });
};

const buildLayers = (w: number, h: number): Layer[] => {
    const rand = createRandom(2026);
    const scale = Math.max(0.6, Math.min(w / 1440, 1.3));
    return LAYERS.map((cfg) => {
        // carriles: cada roca ocupa un carril vertical y un hueco horizontal propio
        const lanes = cfg.count;
        const [b0, b1] = cfg.band;
        const laneH = ((b1 - b0) * h) / lanes;
        const period = w + cfg.rMax * scale * 4;
        const step = period / lanes;
        const rocks: Rock[] = [];
        for (let i = 0; i < lanes; i++) {
            const r = (cfg.rMin + rand() * (cfg.rMax - cfg.rMin)) * scale;
            const lane = (i * 7) % lanes;                          // reparte carriles sin orden visible
            rocks.push({
                x: i * step + rand() * step * 0.4,
                y: b0 * h + lane * laneH + laneH / 2 + (rand() - 0.5) * laneH * 0.3,
                r,
                rot: rand() * Math.PI * 2,
                spin: (rand() - 0.5) * 0.12,
                pts: makeRock(rand, r),
            });
        }
        return { speed: cfg.speed * scale, base: cfg.base, lit: cfg.lit, rim: cfg.rim, rocks, period };
    });
};

const pathRock = (ctx: CanvasRenderingContext2D, pts: [number, number][], dx = 0, dy = 0) => {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x + dx, y + dy) : ctx.moveTo(x + dx, y + dy)));
    ctx.closePath();
};

export default function AsteroidDrift() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        let w = 0, h = 0, dpr = 1;
        let layers: Layer[] = [];
        let stars: { x: number; y: number; s: number; a: number }[] = [];
        let sky: CanvasGradient | null = null;

        const resize = () => {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = window.innerWidth;
            h = window.innerHeight;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            layers = buildLayers(w, h);
            const rand = createRandom(404);
            stars = Array.from({ length: 140 }, () => ({ x: rand() * w, y: rand() * h * 0.6, s: rand() < 0.1 ? 1.6 : 0.9, a: 0.3 + rand() * 0.6 }));
            sky = ctx.createLinearGradient(0, 0, 0, h);
            SKY.forEach((c, i) => sky!.addColorStop(i / (SKY.length - 1), c));
        };

        const draw = (t: number) => {
            if (!sky) return;
            ctx.fillStyle = sky;
            ctx.fillRect(0, 0, w, h);

            // estrellas tenues y un planeta grande que asoma abajo a la derecha
            for (const s of stars) {
                ctx.globalAlpha = s.a;
                ctx.fillStyle = '#fff3ff';
                ctx.fillRect(s.x, s.y, s.s, s.s);
            }
            ctx.globalAlpha = 1;
            const px = w * 0.86, py = h * 1.18, pr = Math.max(w, h) * 0.42;
            const glow = ctx.createRadialGradient(px, py, pr * 0.9, px, py, pr * 1.35);
            glow.addColorStop(0, 'rgba(255,190,230,0.35)');
            glow.addColorStop(1, 'rgba(255,190,230,0)');
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#e48fc2';
            ctx.beginPath();
            ctx.arc(px, py, pr, 0, Math.PI * 2);
            ctx.fill();

            layers.forEach((layer, li) => {
                // bruma entre capas (perspectiva atmosférica)
                const mist = ctx.createLinearGradient(0, h * 0.35, 0, h);
                mist.addColorStop(0, 'rgba(208,106,166,0)');
                mist.addColorStop(1, `rgba(208,106,166,${0.1 - li * 0.02})`);
                ctx.fillStyle = mist;
                ctx.fillRect(0, 0, w, h);

                for (const rock of layer.rocks) {
                    let x = (rock.x - (t * layer.speed) / 1000) % layer.period;
                    if (x < 0) x += layer.period;
                    x -= rock.r * 2;                            // entra por la derecha y sale por la izquierda
                    if (x < -rock.r * 2 || x > w + rock.r * 2) continue;
                    ctx.save();
                    ctx.translate(x, rock.y);
                    ctx.rotate(rock.rot + (t / 1000) * rock.spin);
                    // cara iluminada (arriba a la izquierda) y cara en sombra encima, desplazada
                    pathRock(ctx, rock.pts);
                    ctx.fillStyle = layer.lit;
                    ctx.fill();
                    ctx.save();
                    pathRock(ctx, rock.pts);
                    ctx.clip();
                    pathRock(ctx, rock.pts, rock.r * 0.2, rock.r * 0.24);
                    ctx.fillStyle = layer.base;
                    ctx.fill();
                    ctx.restore();
                    if (layer.rim) {
                        ctx.lineWidth = 1.5;
                        ctx.strokeStyle = layer.rim;
                        ctx.globalAlpha = 0.55;
                        ctx.beginPath();
                        const half = Math.ceil(rock.pts.length / 2);
                        rock.pts.slice(half - 1).concat([rock.pts[0]]).forEach(([px2, py2], i) => (i ? ctx.lineTo(px2, py2) : ctx.moveTo(px2, py2)));
                        ctx.stroke();
                        ctx.globalAlpha = 1;
                    }
                    ctx.restore();
                }
            });
        };

        resize();
        let frame = 0;
        const start = performance.now();
        const loop = (now: number) => {
            draw(now - start + 60000);
            frame = requestAnimationFrame(loop);
        };
        if (reduce) draw(60000);
        else frame = requestAnimationFrame(loop);

        const onResize = () => {
            resize();
            if (reduce) draw(60000);
        };
        window.addEventListener('resize', onResize);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('resize', onResize);
        };
    }, []);

    return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
}
