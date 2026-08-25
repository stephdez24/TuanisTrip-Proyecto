import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { Wallet, Clock } from "lucide-react"

import { useAuth } from "@/auth/useAuth"
import { useFetch } from "@/lib/useFetch"
import { useOrdenamiento } from "@/lib/useOrdenamiento"
import { serviciosService } from "@/services/serviciosService"
import { getImagenLocal } from "@/lib/imagenLocal"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import SelectorOrden from "@/components/SelectorOrden"
import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Foto de relleno para cuando un tour no tiene imagen guardada en
// localStorage (ver lib/imagenLocal.js — bypass temporal del hueco de
// subida de imágenes en el API).
const IMAGEN_POR_DEFECTO =
    "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&auto=format&fit=crop"

const OPCIONES_ORDEN = [
    { value: "nombre:asc", label: "Nombre (A-Z)" },
    { value: "nombre:desc", label: "Nombre (Z-A)" },
    { value: "precio:desc", label: "Precio: mayor a menor" },
    { value: "precio:asc", label: "Precio: menor a mayor" },
    { value: "duracion:desc", label: "Duración: más larga primero" },
    { value: "duracion:asc", label: "Duración: más corta primero" },
]

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

    const { datosOrdenados: toursOrdenados, criterios, establecerOrden } = useOrdenamiento(
        tours,
        {
            nombre: (t) => t.nombre?.toLowerCase() ?? "",
            precio: (t) => Number(t.precioBase),
            duracion: (t) => t.duracionMinutos,
        },
        null
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
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold">Tours</h1>
                    <p className="text-muted-foreground">
                        Explora las experiencias disponibles en Costa Rica
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <SelectorOrden
                        opciones={OPCIONES_ORDEN}
                        criterios={criterios}
                        onCambiar={establecerOrden}
                    />
                    {esAdmin && (
                        <Button asChild>
                            <Link to="/tours/nuevo">Nuevo tour</Link>
                        </Button>
                    )}
                </div>
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

            {!loading && !error && toursOrdenados?.length === 0 && (
                <p className="text-center text-muted-foreground">
                    Todavía no hay tours registrados.
                </p>
            )}

            {!loading && !error && toursOrdenados?.length > 0 && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {toursOrdenados.map((tour) => (
                        <Card
                            key={tour.id}
                            className="group flex flex-col overflow-hidden pt-0 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                        >
                            <div className="relative">
                                <img
                                    src={getImagenLocal(tour.id) || IMAGEN_POR_DEFECTO}
                                    alt={tour.nombre}
                                    className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                {/* Degradado fijo (no depende de la foto de fondo), para
                                    que las insignias se lean bien sobre cualquier imagen. */}
                                <div className="absolute inset-x-0 top-0 h-16 bg-linear-to-b from-black/60 to-transparent" />
                                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
                                    <Badge className="bg-primary text-primary-foreground">
                                        {tour.especialidad?.nombre}
                                    </Badge>
                                    <Badge
                                        variant={tour.activo ? "default" : "secondary"}
                                        className={tour.activo ? "bg-primary text-primary-foreground" : ""}
                                    >
                                        {tour.activo ? "Disponible" : "Inactivo"}
                                    </Badge>
                                </div>
                            </div>

                            <CardContent className="flex-1 space-y-3">
                                <div>
                                    <h3 className="text-lg font-semibold text-primary">
                                        {tour.nombre}
                                    </h3>
                                    <p className="line-clamp-2 text-sm text-muted-foreground">
                                        {tour.descripcion}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                                        <Wallet className="h-3.5 w-3.5" />
                                        {/* toLocaleString("es-CR") -> "25 000" en vez de "25000":
                                            el enunciado exige formato legible, nada de valores crudos. */}
                                        ₡{Number(tour.precioBase).toLocaleString("es-CR")}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                                        <Clock className="h-3.5 w-3.5" />
                                        {tour.duracionMinutos} min
                                    </span>
                                </div>
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