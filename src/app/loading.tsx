import { Skeleton } from '@/components/ui/Skeleton';

/** Se muestra mientras carga una ruta (por ejemplo, al abrir el aviso de privacidad). */
export default function Loading() {
    return (
        <div role="status" aria-live="polite" className="min-h-screen bg-void pt-32">
            <span className="sr-only">Cargando…</span>
            <div className="mx-auto max-w-7xl px-6 md:px-10">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="mt-6 h-12 w-full max-w-2xl" />
                <Skeleton className="mt-3 h-12 w-3/4 max-w-xl" />
                <div className="mt-8 max-w-2xl space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-11/12" />
                    <Skeleton className="h-4 w-4/5" />
                </div>
                <div className="mt-12 grid gap-6 md:grid-cols-3">
                    <Skeleton chamfer className="h-44" />
                    <Skeleton chamfer className="h-44" />
                    <Skeleton chamfer className="h-44" />
                </div>
            </div>
        </div>
    );
}
