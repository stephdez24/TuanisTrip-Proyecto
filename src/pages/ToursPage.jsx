import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import { useAuth } from "@/auth/useAuth"
import { useFetch } from "@/lib/useFetch"
import { serviciosService } from "@/services/serviciosService"
import { getImagenLocal } from "@/lib/imagenLocal"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Foto de relleno para cuando un tour no tiene imagen guardada en
// localStorage (ver lib/imagenLocal.js — bypass temporal del hueco de
// subida de imágenes en el API).
const IMAGEN_POR_DEFECTO =
    "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&auto=format&fit=crop"

export default function ToursPage() {
    const { rol } = useAuth()
    const esAdmin = rol === "Administrador"

    // Mismo truco que en ExtrasPage: cambiar este número fuerza a useFetch
    // a volver a pedir la lista después de activar/desactivar un tour.
    const [refrescarClave, setRefrescarClave] = useState(0)

    // listar() (no listarActivos()) a propósito: el Admin necesita ver los
    // tours inactivos también para poder reactivarlos.
    const { data: tours, loading, error } = useFetch(
        () => serviciosService.listar(),
        [refrescarClave]
    )

    async function handleCambiarEstado(tour) {
        try {
            await serviciosService.cambiarEstado(tour.id, !tour.activo)
            toast.success(
                tour.activo ? "Tour desactivado correctamente" : "Tour activado correctamente"
            )
            setRefrescarClave((clave) => clave + 1)
        } catch (err) {
            // Aquí es donde aparecería el mensaje del backend si el tour
            // tiene citas pendientes/confirmadas y no se puede desactivar.
            toast.error(err.message || "No se pudo cambiar el estado del tour")
        }
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-10">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold">Tours</h1>
                    <p className="text-muted-foreground">
                        Explora las experiencias disponibles en Costa Rica
                    </p>
                </div>

                {esAdmin && (
                    <Button asChild>
                        <Link to="/tours/nuevo">Nuevo tour</Link>
                    </Button>
                )}
            </div>

            {/* Skeletons en vez de un simple "Cargando...": se ve más parecido
                al layout final y evita el salto brusco de contenido. */}
            {loading && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-72 w-full rounded-xl" />
                    ))}
                </div>
            )}

            {error && (
                <p className="text-center text-destructive">
                    No se pudieron cargar los tours: {error.message}
                </p>
            )}

            {!loading && !error && tours?.length === 0 && (
                <p className="text-center text-muted-foreground">
                    Todavía no hay tours registrados.
                </p>
            )}

            {!loading && !error && tours?.length > 0 && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {tours.map((tour) => (
                        <Card key={tour.id} className="flex flex-col overflow-hidden pt-0">
                            <img
                                src={getImagenLocal(tour.id) || IMAGEN_POR_DEFECTO}
                                alt={tour.nombre}
                                className="h-40 w-full object-cover"
                            />

                            <CardHeader>
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="text-lg">{tour.nombre}</CardTitle>
                                    <Badge variant={tour.activo ? "default" : "secondary"}>
                                        {tour.activo ? "Disponible" : "Inactivo"}
                                    </Badge>
                                </div>
                                {/* tour.especialidad viene incluido directo en la respuesta
                                    del API (el backend hace el include de Prisma por
                                    nosotros) — no hace falta una segunda llamada. */}
                                <p className="text-sm text-muted-foreground">
                                    {tour.especialidad?.nombre}
                                </p>
                            </CardHeader>

                            <CardContent className="flex-1 space-y-1 text-sm">
                                <p className="line-clamp-2 text-muted-foreground">
                                    {tour.descripcion}
                                </p>
                                {/* toLocaleString("es-CR") -> "25 000" en vez de "25000":
                                    el enunciado exige formato legible, nada de valores crudos. */}
                                <p className="font-semibold">
                                    ₡{Number(tour.precioBase).toLocaleString("es-CR")} / persona
                                </p>
                                <p className="text-muted-foreground">
                                    {tour.duracionMinutos} minutos
                                </p>
                            </CardContent>

                            <CardFooter className="flex flex-wrap gap-2">
                                <Button asChild variant="outline" size="sm" className="flex-1">
                                    <Link to={`/tours/${tour.id}`}>Ver detalle</Link>
                                </Button>

                                {/* Editar/Activar-Desactivar solo para Administrador —
                                    Cliente y Empleado ni ven estos botones en el DOM. */}
                                {esAdmin && (
                                    <>
                                        <Button asChild variant="outline" size="sm">
                                            <Link to={`/tours/${tour.id}/editar`}>Editar</Link>
                                        </Button>
                                        <Button
                                            variant={tour.activo ? "destructive" : "default"}
                                            size="sm"
                                            onClick={() => handleCambiarEstado(tour)}
                                        >
                                            {tour.activo ? "Desactivar" : "Activar"}
                                        </Button>
                                    </>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}