import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { useAuth } from "@/auth/useAuth"
import { useFetch } from "@/lib/useFetch"
import { serviciosService } from "@/services/serviciosService"
import { getImagenLocal } from "@/lib/imagenLocal"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

const IMAGEN_POR_DEFECTO =
    "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200&auto=format&fit=crop"

export default function TourDetailPage() {
    const { id } = useParams()
    const { rol } = useAuth()
    const esAdmin = rol === "Administrador"
    const navigate = useNavigate()

    const { data: tour, loading, error } = useFetch(
        () => serviciosService.obtenerPorId(id),
        [id]
    )

    async function handleCambiarEstado() {
        try {
            await serviciosService.cambiarEstado(tour.id, !tour.activo)
            toast.success(
                tour.activo ? "Tour desactivado correctamente" : "Tour activado correctamente"
            )
            // navigate(0) = recargar la ruta actual. Más simple que manejar un
            // segundo estado local solo para refrescar esta página específica.
            navigate(0)
        } catch (err) {
            toast.error(err.message || "No se pudo cambiar el estado del tour")
        }
    }

    if (loading) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-10">
                <Skeleton className="h-72 w-full rounded-xl" />
                <Skeleton className="mt-4 h-8 w-2/3" />
                <Skeleton className="mt-2 h-4 w-full" />
            </div>
        )
    }

    // Cubre dos casos con el mismo mensaje: error real de red, o un :id que
    // no existe (el API responde 404 y useFetch lo captura igual como error).
    if (error || !tour) {
        return (
            <div className="mx-auto max-w-md px-4 py-16 text-center">
                <p className="text-destructive">
                    No se pudo cargar este tour{error ? `: ${error.message}` : ""}.
                </p>
                <Button asChild variant="outline" className="mt-4">
                    <Link to="/tours">Volver a Tours</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-10">
            <img
                src={getImagenLocal(tour.id) || IMAGEN_POR_DEFECTO}
                alt={tour.nombre}
                className="h-80 w-full rounded-xl object-cover"
            />

            <div className="mt-6 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold">{tour.nombre}</h1>
                    <p className="text-muted-foreground">{tour.especialidad?.nombre}</p>
                </div>
                <Badge variant={tour.activo ? "default" : "secondary"}>
                    {tour.activo ? "Disponible" : "Inactivo"}
                </Badge>
            </div>

            <p className="mt-4 text-muted-foreground">{tour.descripcion}</p>

            <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border p-4 sm:grid-cols-3">
                <div>
                    <p className="text-sm text-muted-foreground">Precio por persona</p>
                    <p className="text-lg font-semibold">
                        ₡{Number(tour.precioBase).toLocaleString("es-CR")}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Duración</p>
                    <p className="text-lg font-semibold">{tour.duracionMinutos} min</p>
                </div>
                <div>
                    {/* tour.empleados viene incluido en obtenerPorId() del backend
                        (son los guías que tienen este tour asignado). Todavía va a
                        salir en 0 hasta que construyamos el módulo de Guías. */}
                    <p className="text-sm text-muted-foreground">Guías disponibles</p>
                    <p className="text-lg font-semibold">{tour.empleados?.length ?? 0}</p>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                    <Link to="/tours">Volver a Tours</Link>
                </Button>

                {esAdmin && (
                    <>
                        <Button asChild variant="outline">
                            <Link to={`/tours/${tour.id}/editar`}>Editar</Link>
                        </Button>
                        <Button
                            variant={tour.activo ? "destructive" : "default"}
                            onClick={handleCambiarEstado}
                        >
                            {tour.activo ? "Desactivar" : "Activar"}
                        </Button>
                    </>
                )}
            </div>
        </div>
    )
}