import { Link, useParams } from "react-router-dom"
import { PackagePlus, Wallet } from "lucide-react"

import { useAuth } from "@/auth/useAuth"
import { useFetch } from "@/lib/useFetch"
import { extrasService } from "@/services/extrasService"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ExtraDetailPage() {
    // useParams() lee el :id de la URL (ej. /extras/5 -> id = "5", string, no number).
    const { id } = useParams()
    const { rol } = useAuth()
    const esAdmin = rol === "Administrador"

    // El segundo argumento de useFetch es su array de dependencias: si el
    // usuario navega de /extras/5 a /extras/8 sin recargar la página, "id"
    // cambia y useFetch vuelve a pedir los datos automáticamente.
    const { data: extra, loading, error } = useFetch(
        () => extrasService.obtenerPorId(id),
        [id]
    )

    if (loading) {
        return (
            <div className="mx-auto max-w-xl px-4 py-10">
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        )
    }

    // Cubre dos casos con el mismo mensaje: error real de red/API, o un id
    // que no existe (el backend responde 404 y useFetch lo captura como error).
    if (error || !extra) {
        return (
            <div className="mx-auto max-w-md px-4 py-16 text-center">
                <p className="text-destructive">No se pudo cargar este extra.</p>
                <Button asChild variant="outline" className="mt-4">
                    <Link to="/extras">Volver a Extras</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-xl px-4 py-10">
            <Card className="overflow-hidden pt-0">
                {/* Los extras no tienen imagen en el modelo de datos (a
                    diferencia de Tours), así que en vez de una foto se usa
                    una franja de color de marca con un ícono — mismo
                    propósito visual (anclar la pantalla arriba), sin
                    inventar una foto que no existe. */}
                <div className="bg-primary px-5 py-8 text-primary-foreground">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
                                <PackagePlus className="h-5 w-5" />
                            </span>
                            <h1 className="text-xl font-bold">{extra.nombre}</h1>
                        </div>
                        <Badge
                            variant={extra.activo ? "default" : "secondary"}
                            className={extra.activo ? "bg-primary-foreground/15 text-primary-foreground" : ""}
                        >
                            {extra.activo ? "Activo" : "Inactivo"}
                        </Badge>
                    </div>
                </div>

                {/* divide-y: mismo patrón que en Tours/Guías — cada bloque de
                    info queda separado por una línea sutil. */}
                <CardContent className="divide-y divide-border p-0">
                    <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                        {extra.descripcion}
                    </p>

                    <div className="px-5 py-4">
                        <div className="flex w-fit items-center gap-2 rounded-lg bg-secondary px-4 py-3">
                            <Wallet className="h-5 w-5 text-primary" />
                            <p className="text-sm">
                                <span className="text-lg font-semibold text-primary">
                                    ₡{Number(extra.precio).toLocaleString("es-CR")}
                                </span>{" "}
                                <span className="text-muted-foreground">por reserva</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 px-5 py-4">
                        {/* Solo el Admin puede editar; el resto de roles ven la
                            info en modo "solo lectura", sin este botón. */}
                        {esAdmin && (
                            <Button asChild size="sm">
                                <Link to={`/extras/${extra.id}/editar`}>Editar</Link>
                            </Button>
                        )}
                        <Button asChild variant="outline" size="sm">
                            <Link to="/extras">Volver a Extras</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}