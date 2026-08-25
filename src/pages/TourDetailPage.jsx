import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { Wallet, Clock, Users } from "lucide-react"

import { useAuth } from "@/auth/useAuth"
import { useFetch } from "@/lib/useFetch"
import { serviciosService } from "@/services/serviciosService"
import { getImagenLocal } from "@/lib/imagenLocal"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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
                tour.activo
                    ? "Tour desactivado correctamente"
                    : "Tour activado correctamente"
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
            <div className="mx-auto max-w-2xl px-4 py-10">
                <Skeleton className="h-96 w-full rounded-xl" />
            </div>
        )
    }

    // Cubre dos casos con el mismo mensaje: error real de red, o un :id que
    // no existe (el API responde 404 y useFetch lo captura igual como error).
    if (error || !tour) {
        return (
            <div className="mx-auto max-w-md px-4 py-16 text-center">
                <p className="text-destructive">
                    No se pudo cargar este tour
                    {error ? `: ${error.message}` : ""}.
                </p>

                <Button asChild variant="outline" className="mt-4">
                    <Link to="/tours">Volver a Tours</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-10">
            <Card className="overflow-hidden pt-0">

                {/* Foto con degradado + nombre encima, mismo lenguaje visual
                    que el detalle de guía — el degradado es fijo (no depende
                    del contenido de la foto), así el texto siempre se lee bien. */}
                <div className="relative">
                    <img
                        src={getImagenLocal(tour.id) || IMAGEN_POR_DEFECTO}
                        alt={tour.nombre}
                        className="h-64 w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

                    <Badge
                        className={`absolute right-3 top-3 ${
                            tour.activo
                                ? "bg-[#0d3528] !text-white"
                                : ""
                        }`}
                        variant={tour.activo ? "default" : "secondary"}
                    >
                        {tour.activo ? "Disponible" : "Inactivo"}
                    </Badge>

                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                        <h1 className="text-2xl font-bold">
                            {tour.nombre}
                        </h1>

                        <p className="text-white/85">
                            {tour.especialidad?.nombre}
                        </p>
                    </div>
                </div>

                {/* divide-y: cada bloque de info queda separado por una línea
                    sutil, igual que en el detalle de guía — se lee como
                    secciones distintas, no como un párrafo continuo. */}
                <CardContent className="divide-y divide-border p-0">

                    <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                        {tour.descripcion}
                    </p>

                    {/* Estadísticas con ícono, en vez de solo números sueltos —
                        más fácil de escanear de un vistazo. */}
                    <div className="grid grid-cols-3 gap-3 px-5 py-4">

                        <div className="flex flex-col items-center gap-1 rounded-lg bg-secondary py-3 text-center">
                            <Wallet className="h-4 w-4 text-primary" />

                            <p className="text-xs text-muted-foreground">
                                Por persona
                            </p>

                            <p className="text-sm font-semibold text-primary">
                                ₡{Number(
                                    tour.precioBase
                                ).toLocaleString("es-CR")}
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-1 rounded-lg bg-secondary py-3 text-center">
                            <Clock className="h-4 w-4 text-primary" />

                            <p className="text-xs text-muted-foreground">
                                Duración
                            </p>

                            <p className="text-sm font-semibold text-primary">
                                {tour.duracionMinutos} min
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-1 rounded-lg bg-secondary py-3 text-center">
                            <Users className="h-4 w-4 text-primary" />

                            <p className="text-xs text-muted-foreground">
                                Guías
                            </p>

                            {/* tour.empleados viene incluido en obtenerPorId() del
                                backend (son los guías que tienen este tour asignado). */}
                            <p className="text-sm font-semibold text-primary">
                                {tour.empleados?.length ?? 0}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 px-5 py-4">

                        {esAdmin && (
                            <>
                                {/* Editar: botón verde con letra blanca */}
                                <Button
                                    asChild
                                    size="sm"
                                    className="bg-[#0d3528] !text-white hover:bg-[#164b39] hover:!text-white"
                                >
                                    <Link to={`/tours/${tour.id}/editar`}>
                                        Editar
                                    </Link>
                                </Button>

                                {/* Activar/Desactivar:
                                    Activar = verde con letra blanca.
                                    Desactivar = mantiene el estilo rojo original. */}
                                <Button
                                    variant={
                                        tour.activo
                                            ? "destructive"
                                            : "default"
                                    }
                                    size="sm"
                                    className={
                                        tour.activo
                                            ? ""
                                            : "bg-[#0d3528] !text-white hover:bg-[#164b39] hover:!text-white"
                                    }
                                    onClick={handleCambiarEstado}
                                >
                                    {tour.activo
                                        ? "Desactivar"
                                        : "Activar"}
                                </Button>
                            </>
                        )}

                        {/* Este botón mantiene su estilo original */}
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                        >
                            <Link to="/tours">
                                Volver a Tours
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}