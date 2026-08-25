import { Link } from "react-router-dom"
import { Compass, Users } from "lucide-react"

import { useFavoritos } from "@/lib/useFavoritos"
import { useFetch } from "@/lib/useFetch"
import { serviciosService } from "@/services/serviciosService"
import { empleadosService } from "@/services/empleadosService"
import { imagenesService } from "@/services/imagenesService"
import { getImagenLocalGuia } from "@/lib/imagenLocal"

import BotonFavorito from "@/components/BotonFavorito"
import { Card, CardContent } from "@/components/ui/card"

const IMAGEN_TOUR_POR_DEFECTO =
    "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&auto=format&fit=crop"
const IMAGEN_GUIA_POR_DEFECTO =
    "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop"

export default function FavoritosPage() {
    const { favoritos } = useFavoritos()

    const idsServicios = favoritos.filter((f) => f.tipo === "servicio").map((f) => f.id)
    const idsEmpleados = favoritos.filter((f) => f.tipo === "empleado").map((f) => f.id)

    // Favoritos solo guarda {tipo, id} — se trae el detalle real de cada
    // uno en paralelo. Si algún tour/guía fue eliminado después de
    // marcarlo como favorito, esa promesa individual falla y simplemente
    // no aparece en la lista (no rompe el resto).
    const { data: tours, loading: cargandoTours } = useFetch(
        () =>
            Promise.all(
                idsServicios.map((id) =>
                    serviciosService
                        .obtenerPorId(id)
                        .then((r) => r.data)
                        .catch(() => null)
                )
            ).then((resultados) => ({ data: resultados.filter(Boolean) })),
        [favoritos.length, idsServicios.join(",")]
    )

    const { data: guias, loading: cargandoGuias } = useFetch(
        () =>
            Promise.all(
                idsEmpleados.map((id) =>
                    empleadosService
                        .obtenerPorId(id)
                        .then((r) => r.data)
                        .catch(() => null)
                )
            ).then((resultados) => ({ data: resultados.filter(Boolean) })),
        [favoritos.length, idsEmpleados.join(",")]
    )

    const cargando = cargandoTours || cargandoGuias
    const sinFavoritos = !cargando && favoritos.length === 0

    return (
        <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
            <div className="border-l-4 border-ring pl-4">
                <h1 className="text-3xl font-semibold text-primary">Favoritos</h1>
                <p className="text-muted-foreground">
                    Los tours y guías que marcaste para no perderlos de vista.
                </p>
            </div>

            {cargando && <p className="text-muted-foreground">Cargando favoritos...</p>}

            {sinFavoritos && (
                <p className="text-center text-muted-foreground py-10">
                    Todavía no tienes favoritos. Explora{" "}
                    <Link to="/tours" className="text-primary underline">
                        los tours
                    </Link>{" "}
                    o{" "}
                    <Link to="/guias" className="text-primary underline">
                        los guías
                    </Link>{" "}
                    y marca los que más te llamen la atención con el ❤️.
                </p>
            )}

            {!cargando && tours?.length > 0 && (
                <section>
                    <h2 className="mb-3 flex items-center gap-1.5 text-lg font-semibold text-primary">
                        <Compass className="h-5 w-5" />
                        Tours favoritos
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {tours.map((tour) => (
                            <Card key={tour.id} className="overflow-hidden pt-0">
                                <div className="relative">
                                    <img
                                        src={imagenesService.urlDescarga(tour.imagen) || IMAGEN_TOUR_POR_DEFECTO}
                                        alt={tour.nombre}
                                        className="h-36 w-full object-cover"
                                    />
                                    <BotonFavorito
                                        tipo="servicio"
                                        id={tour.id}
                                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-destructive shadow-sm"
                                    />
                                </div>
                                <CardContent>
                                    <Link
                                        to={`/tours/${tour.id}`}
                                        className="font-semibold text-primary hover:underline"
                                    >
                                        {tour.nombre}
                                    </Link>
                                    <p className="text-sm text-muted-foreground">
                                        ₡{Number(tour.precioBase).toLocaleString("es-CR")}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {!cargando && guias?.length > 0 && (
                <section>
                    <h2 className="mb-3 flex items-center gap-1.5 text-lg font-semibold text-primary">
                        <Users className="h-5 w-5" />
                        Guías favoritos
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {guias.map((guia) => (
                            <Card key={guia.id} className="overflow-hidden pt-0">
                                <div className="relative">
                                    <img
                                        src={getImagenLocalGuia(guia.id) || IMAGEN_GUIA_POR_DEFECTO}
                                        alt={`${guia.usuario?.nombre} ${guia.usuario?.primerApellido}`}
                                        className="h-36 w-full object-cover"
                                    />
                                    <BotonFavorito
                                        tipo="empleado"
                                        id={guia.id}
                                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-destructive shadow-sm"
                                    />
                                </div>
                                <CardContent>
                                    <Link
                                        to={`/guias/${guia.id}`}
                                        className="font-semibold text-primary hover:underline"
                                    >
                                        {guia.usuario?.nombre} {guia.usuario?.primerApellido}
                                    </Link>
                                    <p className="text-sm text-muted-foreground">
                                        {guia.especialidad?.nombre}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}