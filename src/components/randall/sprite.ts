/**
 * Sprite de Randall v3: robot flotante blanco y turquesa con casco redondeado.
 * Sus ojos y expresiones se dibujan como luz en un display oscuro dentro del casco.
 * Rejilla de 13 × 13 "píxeles grandes" (≈15 % más pequeños que la versión de 11 × 11).
 *
 * - Filas 1–11: cuerpo (al flotar sube a 0–10).
 * - Fila 12: sombra en el "suelo", fija.
 * Todo se dibuja con datos (sin imágenes), así que pesa casi nada y escala nítido.
 */

export type Mood =
    | 'idle'
    | 'happy'
    | 'talking'
    | 'thinking'
    | 'surprised'
    | 'sad'
    | 'sleepy'
    | 'wink';

export const GRID = 13;

/** Paleta blanco + turquesa. */
export const PALETTE = {
    o: '#0d4f4a', // contorno
    L: '#ffffff', // brillo
    W: '#eef9f8', // blanco del casco
    S: '#bfe4e0', // sombra del casco (blanco con tinte turquesa)
    T: '#3ee0cf', // turquesa (cuello, costados y manos)
    k: '#0b3f3b', // marco del display
    V: '#06222a', // display
    U: '#0a2e36', // línea de barrido del display
    P: '#ff9cc4', // rubor
} as const;

/** Color de la luz del display según el ánimo. */
export const GLOW: Record<Mood, string> = {
    idle: '#5ff5e4',
    talking: '#5ff5e4',
    happy: '#7dffe9',
    wink: '#7dffe9',
    surprised: '#a8fff4',
    thinking: '#c58bff',
    sad: '#ff7a96',
    sleepy: '#2f9c91',
};

type Color = keyof typeof PALETTE;
export type Pixel = [x: number, y: number, color: string];

/** El cuerpo empieza en la fila 1; al flotar sube a la fila 0. */
const BODY_TOP = 1;

/* Casco con display, cuello turquesa y cuerpo que termina en punta (flota, sin piernas). */
const BODY = [
    '...ooooooo...',
    '.ooLLWWWWWSo.',
    'oLWkkkkkkkWSo',
    'oWkVVVVVVVkSo',
    'oWkUUUUUUUkSo',
    'oWkVVVVVVVkSo',
    '.oWkkkkkkkSo.',
    '..ooTTTTToo..',
    '..oTWWWWWTo..',
    '...oTWLWTo...',
    '....ooooo....',
];

/** Sombra en el suelo (fila 12), fija mientras el cuerpo flota. */
export const SHADOW: Pixel[] = [4, 5, 6, 7, 8].map((x) => [x, 12, PALETTE.T]);

const px = (x: number, y: number, c: Color): Pixel => [x, y, PALETTE[c]];

export interface FrameOptions {
    mood: Mood;
    /** Ojos cerrados un instante (parpadeo). */
    blink?: boolean;
    /** Boca abierta / cerrada mientras habla. */
    mouthOpen?: boolean;
    /** Mirada horizontal: -1 izquierda, 0 centro, 1 derecha. */
    look?: -1 | 0 | 1;
    /** Fotograma del saludo con la mano (null = manos abajo). */
    wave?: 0 | 1 | null;
}

/*
 * Cara dentro del display: columnas 3–9, filas 3–5 (coordenadas del cuerpo).
 * Las posiciones se devuelven sin color; se pintan con el brillo del ánimo.
 */
type Spot = [x: number, y: number];

const eyesOpen = (l: number): Spot[] => [[4 + l, 3], [4 + l, 4], [8 + l, 3], [8 + l, 4]];
const eyesClosed: Spot[] = [[3, 4], [4, 4], [8, 4], [9, 4]];

function face({ mood, blink, mouthOpen, look = 0 }: FrameOptions): Spot[] {
    switch (mood) {
        case 'happy':
            return [[3, 4], [4, 3], [5, 4], [7, 4], [8, 3], [9, 4], [6, 5]];
        case 'wink':
            return [[4, 3], [4, 4], [7, 4], [8, 4], [9, 4], [5, 5], [6, 5]];
        case 'talking':
            return [
                ...(blink ? eyesClosed : eyesOpen(look)),
                ...((mouthOpen ? [[5, 5], [6, 5], [7, 5]] : [[6, 5]]) as Spot[]),
            ];
        case 'thinking':
            return [[5, 3], [9, 3], [7, 5], [8, 5]];
        case 'surprised':
            return [[3, 3], [4, 3], [3, 4], [4, 4], [8, 3], [9, 3], [8, 4], [9, 4], [6, 5]];
        case 'sad':
            return blink ? [...eyesClosed, [6, 5]] : [[3, 4], [4, 3], [9, 4], [8, 3], [5, 5], [6, 5], [7, 5]];
        case 'sleepy':
            return [...eyesClosed];
        case 'idle':
        default:
            return blink ? eyesClosed : eyesOpen(look);
    }
}

/** Rubor fuera del display, en las mejillas del casco. */
const blush = (mood: Mood): Pixel[] =>
    mood === 'happy' || mood === 'wink' ? [px(1, 6, 'P'), px(11, 6, 'P')] : [];

/** Manos flotantes (sin brazos), a los lados del cuerpo. */
function hands(wave: FrameOptions['wave']): Pixel[] {
    const left = px(0, 8, 'T');
    if (wave === 0) return [left, px(12, 6, 'T')];
    if (wave === 1) return [left, px(12, 7, 'T')];
    return [left, px(12, 8, 'T')];
}

/** Píxeles del cuerpo (sin la sombra), ya en coordenadas de la rejilla. */
export function buildFrame(opts: FrameOptions): Pixel[] {
    const pixels: Pixel[] = [];
    BODY.forEach((row, y) => {
        [...row].forEach((ch, x) => {
            if (ch !== '.') pixels.push([x, y, PALETTE[ch as Color]]);
        });
    });
    const glow = GLOW[opts.mood];
    const lit: Pixel[] = face(opts).map(([x, y]) => [x, y, glow]);
    // Cara, rubor y manos se pintan encima del cuerpo (los últimos ganan)
    return [...pixels, ...hands(opts.wave ?? null), ...blush(opts.mood), ...lit].map(
        ([x, y, c]) => [x, y + BODY_TOP, c] as Pixel,
    );
}
