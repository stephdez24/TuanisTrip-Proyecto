import { Link, useParams } from "react-router-dom"

import { useAuth } from "@/auth/useAuth"
import { useFetch } from "@/lib/useFetch"
import { extrasService } from "@/services/extrasService"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
                <Skeleton className="h-48 w-full rounded-xl" />
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
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-2xl">{extra.nombre}</CardTitle>
                        <Badge variant={extra.activo ? "default" : "secondary"}>
                            {extra.activo ? "Activo" : "Inactivo"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{extra.descripcion}</p>
                    <p className="text-xl font-semibold">
                        ₡{Number(extra.precio).toLocaleString("es-CR")}
                    </p>

                    <div className="flex flex-wrap gap-3 pt-2">
                        <Button asChild>
                            <Link to="/extras">Volver a Extras</Link>
                        </Button>
                        {/* Solo el Admin puede editar; el resto de roles ven la
                            info en modo "solo lectura", sin este botón. */}
                        {esAdmin && (
                            <Button asChild variant="outline">
                                <Link to={`/extras/${extra.id}/editar`}>Editar</Link>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}