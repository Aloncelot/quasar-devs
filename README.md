# Quasar Devs

Landing de Quasar Devs: desarrollo de software (frontend, backend, full stack, chatbots) y consultoría de supply chain (layouts de almacén/CEDIS/cross dock, WMS, sorters y conveyors, AS/RS).

Next.js 16 · React 19 · TypeScript · Tailwind 3 · Three.js (react-three-fiber) · EmailJS.

## Arranque

```bash
npm install
cp .env.example .env.local   # completa los valores
npm run dev                  # http://localhost:3000
npm run build && npm start   # producción
npm run lint
npm run typecheck
```

## Estructura

- `src/app/globals.css`: paleta cyberpunk, tarjetas/botones con esquinas cortadas y el efecto de parpadeo en hover.
- `src/components/ui/Cyber.tsx`: `CyberCard`, `CyberLink`, `CyberButton`, `Chip`.
- `src/components/`: Hero, Services, Process, Projects (constelación 3D), About, Contact, Footer, Navbar, FloatingLink, ParticlesScene (galaxia fija que avanza con el scroll).
- `src/i18n/es.ts` y `en.ts`: todos los textos. `en.ts` debe tener las mismas claves que `es.ts` (TypeScript avisa si falta alguna).

### Cambiar textos o servicios

Edita `src/i18n/es.ts` y `en.ts`. Las etiquetas de tecnología son listas separadas por `|`.

### Parpadeo en hover

Todo vive en `globals.css` (`edge-ignite`, `glow-ignite`, ...). Es una ráfaga de ~0.7 s y después un pulso lento (< 1 Hz); con `prefers-reduced-motion` queda un brillo estático. Mantén esa regla: parpadeos de más de 3 por segundo pueden provocar molestias o crisis en personas fotosensibles (WCAG 2.3.1).

## Seguridad

- `next.config.ts` agrega cabeceras: CSP (solo en producción), HSTS, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`. Si agregas servicios externos (analítica, mapas, fuentes remotas), añade su dominio a `connect-src`/`script-src`.
- Las variables `NEXT_PUBLIC_*` son públicas. Los IDs de EmailJS no son secretos, pero cualquiera puede copiarlos y enviar correos con tu cuota. En el panel de EmailJS:
  1. *Account → Security*: limita los **dominios permitidos** al dominio de tu sitio y activa la protección contra envíos desde navegadores no autorizados.
  2. Activa **reCAPTCHA** si empiezas a recibir spam.
  3. Define un límite mensual de envíos.
- El formulario ya incluye campo trampa (honeypot), límite de longitud, validación de correo y una espera de 30 s entre envíos.
- Revisa que `.env.local` nunca se haya subido a git: `git log --all -- .env.local` debe salir vacío. Si aparece algo, rota las llaves de EmailJS.
- Ejecuta `npm audit` de forma periódica y mantén Next.js/React al día.

## Plantilla de EmailJS

Además de `user_name`, `user_email` y `message`, el formulario envía `project_type` (software / supply chain / ambos / otro). Agrega `{{project_type}}` a tu plantilla si quieres verlo en un campo propio (ya viene también dentro del mensaje).
