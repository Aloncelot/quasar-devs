/**
 * Generador pseudoaleatorio con semilla (mulberry32).
 * Se usa en lugar de Math.random() al crear partículas durante el render: React (y su
 * regla de lint de pureza) exige que el render sea determinista, y con una semilla fija
 * el resultado es siempre el mismo. Visualmente no hay diferencia.
 */
export const createRandom = (seed: number) => {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};
