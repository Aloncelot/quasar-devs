/**
 * Detalles técnicos de los proyectos, SOLO para la base de conocimiento de Randall
 * (no se muestran en la página). Explican qué hace cada proyecto y con qué tecnologías se construyó.
 *
 * - `byKey`: complementa los proyectos de data/projects.ts (misma `key`).
 * - `extra`: proyectos que no están en la sección "Proyectos en órbita".
 *
 * Al agregar o cambiar un proyecto, actualiza también este archivo.
 */
export interface ProjectDetail {
    es: string;
    en: string;
}

export interface ExtraProject extends ProjectDetail {
    title: string;
}

export const PROJECT_DETAILS: Record<string, ProjectDetail> = {
    p1: {
        es: 'Proyecto en desarrollo (próximamente). Sistema web para estimar costos de proyectos con base de datos en tiempo real. Tecnologías: Next.js y .NET.',
        en: 'Project in development (coming soon). Web system to estimate project costs with a real-time database. Tech: Next.js and .NET.',
    },
    p3: {
        es: 'Torre de control logística (proyecto de portafolio con datos ficticios). Se sube un CSV del reporte de entregas de SAP y en segundos muestra el cumplimiento OTIF: 7 indicadores con meta y semáforo, evolución semanal y mensual, mapa de fallas por estado, Pareto de causas raíz, desempeño por transportista y CEDIS, impacto financiero y un plan de acción con recomendaciones generadas a partir de los datos. Descarga un reporte ejecutivo en PDF y PowerPoint, en español e inglés. Tecnologías: frontend en Next.js 16, React 19, TypeScript, Tailwind CSS 4, Recharts, Framer Motion y React Simple Maps (desplegado en Vercel); backend en Python con FastAPI, pandas, ReportLab (PDF) y python-pptx (PowerPoint), empaquetado en Docker y desplegado en Azure Container Apps y AWS EC2, con AWS Lambda, SES y EventBridge para encender y apagar el servidor bajo demanda.',
        en: 'Logistics control tower (portfolio project with fictional data). Upload a CSV of the SAP delivery report and in seconds it shows OTIF performance: 7 KPIs with targets and traffic lights, weekly and monthly trends, a failure map by state, root-cause Pareto, carrier and distribution-center performance, financial impact and an action plan with recommendations generated from the data. It downloads an executive report in PDF and PowerPoint, in Spanish and English. Tech: frontend in Next.js 16, React 19, TypeScript, Tailwind CSS 4, Recharts, Framer Motion and React Simple Maps (deployed on Vercel); backend in Python with FastAPI, pandas, ReportLab (PDF) and python-pptx (PowerPoint), packaged with Docker and deployed on Azure Container Apps and AWS EC2, using AWS Lambda, SES and EventBridge to start and stop the server on demand.',
    },
    p4: {
        es: 'Tienda en línea de suplementos y recetas fit (cliente real). Catálogo con filtros por marca y categoría, carrito, cuentas de cliente (registro y recuperación de contraseña), listas, reseñas, solicitudes de productos y recetas altas en proteína con sus macros. Incluye un panel de administración con inventario por SKU, análisis con gráficas, demanda exportable a CSV y gestión de recetas, reseñas y solicitudes. La portada tiene un video 3D hecho en Blender. Los pagos en línea aún no están activos. Tecnologías: Next.js 16 (App Router, Server Actions), React 19, TypeScript, Azure SQL, Cloudinary para imágenes, Recharts, Framer Motion y CSS Modules, con sesión de administrador firmada y protegida en varias capas.',
        en: 'Online store for supplements and fit recipes (real client). Catalog with brand and category filters, cart, customer accounts (sign-up and password recovery), lists, reviews, product requests and high-protein recipes with their macros. It includes an admin panel with SKU inventory, analytics charts, demand export to CSV and management of recipes, reviews and requests. The home page features a 3D video made in Blender. Online payments are not active yet. Tech: Next.js 16 (App Router, Server Actions), React 19, TypeScript, Azure SQL, Cloudinary for images, Recharts, Framer Motion and CSS Modules, with a signed admin session protected in several layers.',
    },
    p5: {
        es: 'Gestor de tareas tipo Kanban con estética cyberpunk (versión demo). Permite crear proyectos y tareas, moverlas entre columnas, ver el historial de cambios y recibir alertas; se entra como invitado con un clic. En la demo todo vive en memoria (sin base de datos). Tecnologías: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Zustand para el estado y Lucide para íconos, con cabeceras de seguridad (CSP).',
        en: 'Kanban-style task manager with a cyberpunk look (demo version). You can create projects and tasks, move them between columns, see the change history and get alerts; guests can enter with one click. In the demo everything lives in memory (no database). Tech: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Zustand for state and Lucide icons, with security headers (CSP).',
    },
    p6: {
        es: 'Proyecto próximo (en planeación). Herramienta de S&OP (planeación de ventas y operaciones) que integra inventarios, planeación de la demanda y programación para alinear lo que se vende con lo que se puede surtir y producir. Tecnologías previstas: Next.js con TypeScript y Tailwind CSS, base de datos en Azure SQL y Python para el análisis de datos y pronósticos.',
        en: 'Upcoming project (in planning). S&OP (sales and operations planning) tool that brings together inventory, demand planning and scheduling to align what is sold with what can be supplied and produced. Planned tech: Next.js with TypeScript and Tailwind CSS, an Azure SQL database and Python for data analysis and forecasting.',
    },
};

export const EXTRA_PROJECTS: ExtraProject[] = [
    {
        title: 'Quasar Devs (este sitio)',
        es: 'La propia landing de Quasar Devs, bilingüe (español e inglés), con escena 3D animada, formulario de contacto con aviso de privacidad y cabeceras de seguridad. Tecnologías: Next.js 16, React 19, TypeScript, Tailwind CSS, Three.js con React Three Fiber, Framer Motion y EmailJS, desplegada en Vercel.',
        en: 'The Quasar Devs landing page itself, bilingual (Spanish and English), with an animated 3D scene, a contact form with a privacy notice and security headers. Tech: Next.js 16, React 19, TypeScript, Tailwind CSS, Three.js with React Three Fiber, Framer Motion and EmailJS, deployed on Vercel.',
    },
    {
        title: 'Randall (asistente de este sitio)',
        es: 'Chatbot con IA de Quasar Devs y ejemplo del servicio de chatbots. Responde con la información de este sitio, que se genera automáticamente desde sus textos; si la IA no está disponible, contesta con respuestas predefinidas. Tiene límites de uso por visitante y solo acepta peticiones de este sitio. Tecnologías: backend en Python con FastAPI (desplegado en Vercel) y un modelo de lenguaje vía Groq; frontend en React y TypeScript con un avatar en pixel art animado (SVG).',
        en: 'Quasar Devs\' AI chatbot and a sample of the chatbot service. It answers with this site\'s information, which is generated automatically from the site copy; if the AI is unavailable it replies with predefined answers. It has per-visitor usage limits and only accepts requests from this site. Tech: Python backend with FastAPI (deployed on Vercel) and a language model through Groq; React and TypeScript frontend with an animated pixel-art avatar (SVG).',
    },
    {
        title: 'Lector PDF con IA (app móvil)',
        es: 'App que lee en voz alta libros y documentos PDF ya limpios: el usuario recorta el área de texto, elige páginas y el servidor quita encabezados, números de página y basura visual antes de leer. Tiene controles desde la notificación, audífonos y reloj, y se pausa sola si otra app usa el audio. Tecnologías: app en Flutter (Dart) con texto a voz (TTS) y backend en Python con FastAPI.',
        en: 'App that reads PDF books and documents aloud after cleaning them: the user crops the text area, picks pages and the server removes headers, page numbers and visual noise before reading. It has controls from the notification, headphones and smartwatch, and pauses automatically when another app uses audio. Tech: Flutter (Dart) app with text-to-speech (TTS) and a Python backend with FastAPI.',
    },
];
