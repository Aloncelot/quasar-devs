/**
 * Sprite de Randall: rejilla de 11 × 11 "píxeles grandes".
 * Todo se dibuja a partir de datos (sin imágenes), así que pesa casi nada y escala nítido.
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

export const GRID = 11;

/** Paleta turquesa. */
export const PALETTE = {
    o: '#0b3f3b', // contorno
    T: '#3ee0cf', // turquesa base
    L: '#a8fff4', // brillo
    D: '#1fa89b', // sombra
    E: '#072b28', // ojos / boca
    W: '#ffffff', // reflejo
    P: '#ff7ab6', // lengua / rubor
} as const;

/** Color de la luz de la antena según el estado de ánimo. */
export const ANTENNA: Record<Mood, string> = {
    idle: '#4debff',
    talking: '#4debff',
    happy: '#ffe066',
    wink: '#ffe066',
    thinking: '#e055ff',
    surprised: '#ffffff',
    sad: '#ff5577',
    sleepy: '#8a63ff',
};

type Color = keyof typeof PALETTE;
export type Pixel = [x: number, y: number, color: string];

/* Cuerpo base. "." = transparente, "a" = antena (color dinámico). */
const BODY = [
    '.....a.....',
    '.....o.....',
    '..ooooooo..',
    '.oLLLTTTTo.',
    '.oTTTTTTDo.',
    '.oTTTTTTDo.',
    '.oTTTTTTDo.',
    '.oTTTTTDDo.',
    '..ooooooo..',
    '...oTLTo...',
    '...oo.oo...',
];

const px = (x: number, y: number, c: Color): Pixel => [x, y, PALETTE[c]];

export interface FrameOptions {
    mood: Mood;
    /** Ojos cerrados un instante (parpadeo). */
    blink?: boolean;
    /** Boca abierta / cerrada mientras habla. */
    mouthOpen?: boolean;
    /** Mirada horizontal: -1 izquierda, 0 centro, 1 derecha. */
    look?: -1 | 0 | 1;
    /** Fotograma del saludo con el brazo (null = brazos abajo). */
    wave?: 0 | 1 | null;
}

/** Ojos de 2 × 2; el reflejo blanco indica hacia dónde mira. */
const eyesOpen = (look: number): Pixel[] => {
    const eye = (x0: number): Pixel[] => [
        px(x0, 4, 'E'), px(x0 + 1, 4, 'E'), px(x0, 5, 'E'), px(x0 + 1, 5, 'E'),
        px(look < 0 ? x0 : x0 + 1, 4, 'W'),
    ];
    return [...eye(2), ...eye(7)];
};

const eyesBlink: Pixel[] = [px(2, 5, 'E'), px(3, 5, 'E'), px(7, 5, 'E'), px(8, 5, 'E')];
const smile: Pixel[] = [px(4, 6, 'E'), px(5, 7, 'E'), px(6, 6, 'E')];

function face({ mood, blink, mouthOpen, look = 0 }: FrameOptions): Pixel[] {
    switch (mood) {
        case 'happy':
            return [
                px(2, 5, 'E'), px(3, 4, 'E'), px(4, 5, 'E'),
                px(6, 5, 'E'), px(7, 4, 'E'), px(8, 5, 'E'),
                px(4, 6, 'E'), px(5, 6, 'E'), px(6, 6, 'E'), px(5, 7, 'P'),
                px(2, 6, 'P'), px(8, 6, 'P'),
            ];
        case 'wink':
            return [
                px(2, 4, 'E'), px(3, 4, 'W'), px(2, 5, 'E'), px(3, 5, 'E'),
                px(7, 5, 'E'), px(8, 5, 'E'),
                ...smile, px(8, 6, 'P'),
            ];
        case 'talking':
            return [
                ...(blink ? eyesBlink : eyesOpen(look)),
                ...(mouthOpen
                    ? [px(4, 6, 'E'), px(5, 6, 'E'), px(6, 6, 'E'), px(5, 7, 'P')]
                    : [px(4, 7, 'E'), px(5, 7, 'E'), px(6, 7, 'E')]),
            ];
        case 'thinking':
            return [
                px(3, 3, 'E'), px(4, 3, 'E'), px(3, 4, 'E'), px(4, 4, 'W'),
                px(7, 3, 'E'), px(8, 3, 'E'), px(7, 4, 'E'), px(8, 4, 'W'),
                px(5, 7, 'E'), px(6, 7, 'E'),
            ];
        case 'surprised':
            return [
                px(2, 3, 'E'), px(3, 3, 'E'), px(2, 4, 'E'), px(3, 4, 'W'), px(2, 5, 'E'), px(3, 5, 'E'),
                px(7, 3, 'E'), px(8, 3, 'E'), px(7, 4, 'E'), px(8, 4, 'W'), px(7, 5, 'E'), px(8, 5, 'E'),
                px(5, 6, 'E'), px(5, 7, 'E'),
            ];
        case 'sad':
            return [
                ...(blink ? eyesBlink : [px(2, 5, 'E'), px(3, 5, 'E'), px(3, 4, 'E'), px(7, 5, 'E'), px(8, 5, 'E'), px(7, 4, 'E')]),
                px(4, 7, 'E'), px(5, 6, 'E'), px(6, 7, 'E'),
            ];
        case 'sleepy':
            return [px(2, 5, 'E'), px(3, 5, 'E'), px(7, 5, 'E'), px(8, 5, 'E'), px(5, 7, 'E')];
        case 'idle':
        default:
            return [...(blink ? eyesBlink : eyesOpen(look)), ...smile];
    }
}

function arms(wave: FrameOptions['wave']): Pixel[] {
    const left = px(2, 9, 'T');
    if (wave === 0) return [left, px(8, 8, 'T'), px(9, 7, 'T')];
    if (wave === 1) return [left, px(8, 9, 'T'), px(9, 8, 'T')];
    return [left, px(8, 9, 'T')];
}

/** Devuelve la lista de píxeles de un fotograma. */
export function buildFrame(opts: FrameOptions): Pixel[] {
    const pixels: Pixel[] = [];
    BODY.forEach((row, y) => {
        [...row].forEach((ch, x) => {
            if (ch === '.') return;
            pixels.push([x, y, ch === 'a' ? ANTENNA[opts.mood] : PALETTE[ch as Color]]);
        });
    });
    // La cara y los brazos se pintan encima del cuerpo (los últimos ganan)
    return [...pixels, ...arms(opts.wave ?? null), ...face(opts)];
}
