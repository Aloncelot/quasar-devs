import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                // Wordmark de la marca (solo mayúsculas y sin acentos; no usar en textos largos)
                gibed: ["var(--font-gibed)", "sans-serif"],
                display: ['"Chakra Petch"', "ui-sans-serif", "system-ui", "sans-serif"],
                body: ['"IBM Plex Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
            },
            colors: {
                void: "#060414",
                panel: "#0d0a26",
                "panel-2": "#130f36",
                cyan: { neon: "#4debff" },
                azure: { neon: "#3c8dff" },
                violet: { neon: "#8a63ff" },
                magenta: { neon: "#e055ff" },
                ink: "#e9ecff",
                dim: "#9ca3d9",
            },
        },
    },
    plugins: [],
};
export default config;
