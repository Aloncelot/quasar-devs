import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Chakra_Petch, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { CookieBanner } from "@/components/CookieBanner";
import { LanguageProvider } from "@/context/LanguageContext";
import { es } from "@/i18n/es";

// Next.js descarga estas fuentes al compilar y las sirve desde tu propio dominio (sin peticiones a Google).
const display = Chakra_Petch({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

// Wordmark de la marca. Solo tiene mayúsculas sin acentos: úsese únicamente para "QUASAR DEVS".
const gibed = localFont({
  src: "./fonts/Gibed.otf",
  variable: "--font-gibed",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://quasar-devs.vercel.app"),
  title: es.meta.title,
  description: es.meta.description,
  applicationName: "Quasar Devs",
  authors: [{ name: "Alonso Correa" }],
  keywords: [
    "desarrollo web", "desarrollo full stack", "chatbots con IA", "RAG",
    "consultoría supply chain", "layout de almacén", "diseño de CEDIS", "cross dock",
    "implementación WMS", "sorter", "conveyors", "AS/RS", "CDMX", "México",
  ],
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Quasar Devs",
    title: es.meta.title,
    description: es.meta.description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Quasar Devs" }],
  },
  twitter: { card: "summary_large_image", title: es.meta.title, description: es.meta.description, images: ["/og.png"] },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#060414",
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Quasar Devs",
  description: es.meta.description,
  areaServed: "MX",
  address: { "@type": "PostalAddress", addressLocality: "Ciudad de México", addressCountry: "MX" },
  founder: { "@type": "Person", name: "Alonso Correa" },
  knowsAbout: [
    "Desarrollo web", "Backend", "Full stack", "Chatbots", "Supply chain",
    "Layouts de almacén", "WMS", "Sorters y conveyors", "AS/RS",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${gibed.variable} ${display.variable} ${body.variable}`}>
      <body className="bg-void font-body text-ink">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-void focus:px-4 focus:py-2 focus:text-cyan-neon"
        >
          Saltar al contenido
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <LanguageProvider>
          <Navbar />
          {children}
          <CookieBanner />
        </LanguageProvider>
      </body>
    </html>
  );
}
