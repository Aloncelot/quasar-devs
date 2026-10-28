import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/**
 * Content-Security-Policy.
 * - 'unsafe-inline' en script-src es necesario para los scripts de arranque de Next.js
 *   (se puede endurecer con nonces + middleware más adelante).
 * - connect-src solo permite el propio sitio, la API de EmailJS (formulario de contacto) y el backend de Randall.
 * - worker-src/blob: lo usan three.js / drei.
 * Solo se aplica en producción para no romper el HMR de `next dev`.
 */
/** Origen del backend de Randall (chatbot) para permitirlo en connect-src. */
const randallOrigin = (() => {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_RANDALL_API_URL ?? "");
    return url.protocol === "https:" ? url.origin : "";
  } catch {
    return "";
  }
})();

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' https://api.emailjs.com ${randallOrigin}`.trim(),
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  ...(isProd ? [{ key: "Content-Security-Policy", value: csp }] : []),
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
