import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { Wallet, Clock } from "lucide-react"

import { useAuth } from "@/auth/useAuth"
import { useFetch } from "@/lib/useFetch"
import { useOrdenamiento } from "@/lib/useOrdenamiento"
import { serviciosService } from "@/services/serviciosService"
import { imagenesService } from "@/services/imagenesService"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import SelectorOrden from "@/components/SelectorOrden"
import BotonFavorito from "@/components/BotonFavorito"
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
    const esCliente = rol === "Cliente"

    // Mismo truco que en ExtrasPage: cambiar este número fuerza a useFetch
    // a volver a pedir la lista después de activar/desactivar un tour.
    const [refrescarClave, setRefrescarClave] = useState(0)

    // listar() (no listarActivos()) a propósito: el Admin necesita ver los
    // tours inactivos también para poder reactivarlos.
    const { data: tours, loading, error } = useFetch(
        () => serviciosService.listar(),
        [refrescarClave]
    )

    const {
        datosOrdenados: toursOrdenados,
        criterios,
        establecerOrden,
    } = useOrdenamiento(
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
                tour.activo
                    ? "Tour desactivado correctamente"
                    : "Tour activado correctamente"
            )

            setRefrescarClave((clave) => clave + 1)
        } catch (err) {
            // Aquí es donde aparecería el mensaje del backend si el tour
            // tiene citas pendientes/confirmadas y no se puede desactivar.
            toast.error(
                err.message || "No se pudo cambiar el estado del tour"
            )
        }
    }

    return (
        <div className="min-h-screen">

            {/* =========================================================
                HERO
            ========================================================= */}

            <section
                className="
                    relative flex min-h-[380px] items-end overflow-hidden
                    bg-cover bg-center
                    text-white
                    sm:min-h-[430px]
                "
                style={{
                    backgroundImage:
                        "url('/images/BannerTours.png')",
                }}
            >

                {/* Overlay */}

                <div
                    className="
                        absolute inset-0
                        bg-linear-to-t
                        from-black/80
                        via-black/40
                        to-black/15
                    "
                />

                {/* Contenido */}

                <div
                    className="
                        relative z-10 mx-auto w-full max-w-6xl
                        px-5 pb-16 pt-28
                        sm:px-6 sm:pb-20
                        lg:px-8
                    "
                >

                    <div className="max-w-3xl">

                        {/* Texto pequeño igual al estilo de Inicio */}

                        <p
                            className="
                                font-script text-3xl
                                font-bold text-secondary
                                sm:text-4xl
                            "
                        >
                            Tu próxima aventura
                        </p>

                        {/* Título */}

                        <div className="mt-2 inline-block">

                            <h1
                                className="
                                    text-5xl font-bold
                                    leading-tight tracking-tight
                                    text-white
                                    sm:text-6xl
                                "
                            >
                                Todos los tours
                            </h1>

                            {/* Raya dorada */}

                            <div
                                className="
                                    mt-3 h-1
                                    w-28 rounded-full
                                    bg-[#C8893A]
                                "
                            />

                        </div>

                        {/* Descripción */}

                        <p
                            className="
                                mt-6 max-w-2xl
                                text-base font-medium
                                leading-relaxed
                                text-white/90
                                sm:text-lg
                            "
                        >
                            Explora las mejores experiencias de Costa Rica,
                            descubre nuevos destinos y encuentra el tour
                            perfecto para tu próxima aventura.
                        </p>

                    </div>

                </div>

                {/* Detalle inferior */}

                <div
                    className="
                        absolute bottom-0 left-0 right-0 h-20
                        bg-linear-to-t
                        from-background
                        to-transparent
                    "
                />

            </section>


            {/* =========================================================
                CONTENIDO PRINCIPAL
            ========================================================= */}

            <main
                className="
                    mx-auto max-w-6xl
                    px-5 py-12
                    sm:px-6
                    lg:px-8
                "
            >

                {/* Encabezado */}

                <div
                    className="
                        mb-8 flex flex-wrap
                        items-end justify-between gap-4
                    "
                >

                    {/* =====================================================
                    TÍTULO DE SECCIÓN
                ===================================================== */}

                <div className="mb-8 flex items-end justify-between gap-6">

                    <div
                        className="
                            border-l-4
                            border-[#c8893a]
                            pl-6
                        "
                    >

                        <p
                            className="
                                text-sm
                                font-semibold
                                uppercase
                                tracking-[0.22em]
                                text-[#c8893a]
                            "
                        >
                            NUESTROS TOURS
                        </p>

                        <h2
                            className="
                                mt-2
                                text-3xl
                                font-bold
                                tracking-tight
                                text-primary
                                sm:text-4xl
                            "
                        >
                            Tours
                        </h2>

                        <p
                            className="
                                mt-2
                                text-base
                                text-muted-foreground
                                sm:text-lg
                            "
                        >
                            Explora las experiencias disponibles en Costa Rica
                        </p>

                    </div>

                    </div>


                    {/* =================================================
                        ORDENAMIENTO Y BOTÓN
                    ================================================= */}

                    <div className="flex items-center gap-3">

                        <SelectorOrden
                            opciones={OPCIONES_ORDEN}
                            criterios={criterios}
                            onCambiar={establecerOrden}
                        />

                        {esAdmin && (
                            <Button
                                asChild
                                className="
                                    bg-primary
                                    !text-white
                                    hover:bg-primary/90
                                    hover:!text-white
                                "
                            >
                                <Link to="/tours/nuevo">
                                    Nuevo tour
                                </Link>
                            </Button>
                        )}

                    </div>

                </div>


                {/* =====================================================
                    LOADING
                ===================================================== */}

                {loading && (
                    <div
                        className="
                            grid grid-cols-1 gap-6
                            sm:grid-cols-2
                            lg:grid-cols-3
                        "
                    >
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton
                                key={i}
                                className="h-72 w-full rounded-xl"
                            />
                        ))}
                    </div>
                )}


                {/* =====================================================
                    ERROR
                ===================================================== */}

                {error && (
                    <div className="py-12 text-center">

                        <p className="text-destructive">
                            No se pudieron cargar los tours:{" "}
                            {error.message}
                        </p>

                    </div>
                )}


                {/* =====================================================
                    SIN TOURS
                ===================================================== */}

                {!loading &&
                    !error &&
                    toursOrdenados?.length === 0 && (
                        <div className="py-12 text-center">

                            <p className="text-muted-foreground">
                                Todavía no hay tours registrados.
                            </p>

                        </div>
                    )}


                {/* =====================================================
                    TARJETAS DE TOURS
                ===================================================== */}

                {!loading &&
                    !error &&
                    toursOrdenados?.length > 0 && (

                        <div
                            className="
                                grid grid-cols-1 gap-6
                                sm:grid-cols-2
                                lg:grid-cols-3
                            "
                        >

                            {toursOrdenados.map((tour) => (

                                <Card
                                    key={tour.id}
                                    className="
                                        group flex flex-col
                                        overflow-hidden pt-0
                                        border-border/70
                                        transition-all
                                        hover:-translate-y-1
                                        hover:shadow-lg
                                    "
                                >

                                    {/* =================================================
                                        IMAGEN
                                    ================================================= */}

                                    <div className="relative">

                                        <img
                                            src={
                                                imagenesService.urlDescarga(tour.imagen) ||
                                                IMAGEN_POR_DEFECTO
                                            }
                                            alt={tour.nombre}
                                            className="
                                                h-44 w-full
                                                object-cover
                                                transition-transform
                                                duration-300
                                                group-hover:scale-105
                                            "
                                        />

                                        {/* Degradado fijo para mejorar
                                            la lectura de las insignias. */}

                                        <div
                                            className="
                                                absolute inset-x-0 top-0
                                                h-16
                                                bg-linear-to-b
                                                from-black/60
                                                to-transparent
                                            "
                                        />

                                        <div
                                            className="
                                                absolute inset-x-0 top-0
                                                flex items-start
                                                justify-between
                                                p-3
                                            "
                                        >

                                            <Badge
                                                className="
                                                    bg-primary
                                                    !text-white
                                                    hover:bg-primary
                                                    hover:!text-white
                                                "
                                            >
                                                {tour.especialidad?.nombre}
                                            </Badge>

                                            <Badge
                                                variant={
                                                    tour.activo
                                                        ? "default"
                                                        : "secondary"
                                                }
                                                className={
                                                    tour.activo
                                                        ? `
                                                            bg-primary
                                                            !text-white
                                                            hover:bg-primary
                                                            hover:!text-white
                                                        `
                                                        : ""
                                                }
                                            >
                                                {tour.activo
                                                    ? "Disponible"
                                                    : "Inactivo"}
                                            </Badge>

                                        </div>

                                        {/* Corazón de favoritos: solo tiene sentido
                                            para el Cliente (es quien arma su
                                            selección de viaje) — abajo a la
                                            derecha, para no chocar con las
                                            insignias de arriba. */}

                                        {esCliente && (
                                            <BotonFavorito
                                                tipo="servicio"
                                                id={tour.id}
                                                className="
                                                    absolute bottom-2 right-2
                                                    flex h-8 w-8 items-center
                                                    justify-center rounded-full
                                                    bg-white/90 text-destructive
                                                    shadow-sm backdrop-blur-sm
                                                    transition-transform
                                                    hover:scale-110
                                                "
                                            />
                                        )}

                                    </div>


                                    {/* =================================================
                                        CONTENIDO
                                    ================================================= */}

                                    <CardContent
                                        className="
                                            flex-1 space-y-3
                                        "
                                    >

                                        <div>

                                            <h3
                                                className="
                                                    text-lg font-semibold
                                                    text-primary
                                                "
                                            >
                                                {tour.nombre}
                                            </h3>

                                            <p
                                                className="
                                                    line-clamp-2
                                                    text-sm
                                                    text-muted-foreground
                                                "
                                            >
                                                {tour.descripcion}
                                            </p>

                                        </div>


                                        {/* Precio y duración */}

                                        <div
                                            className="
                                                flex flex-wrap gap-2
                                            "
                                        >

                                            <span
                                                className="
                                                    inline-flex
                                                    items-center gap-1.5
                                                    rounded-full
                                                    bg-secondary
                                                    px-3 py-1
                                                    text-xs font-medium
                                                    text-secondary-foreground
                                                "
                                            >
                                                <Wallet className="h-3.5 w-3.5" />

                                                ₡
                                                {Number(
                                                    tour.precioBase
                                                ).toLocaleString("es-CR")}

                                            </span>


                                            <span
                                                className="
                                                    inline-flex
                                                    items-center gap-1.5
                                                    rounded-full
                                                    bg-secondary
                                                    px-3 py-1
                                                    text-xs font-medium
                                                    text-secondary-foreground
                                                "
                                            >
                                                <Clock className="h-3.5 w-3.5" />

                                                {tour.duracionMinutos} min

                                            </span>

                                        </div>

                                    </CardContent>


                                    {/* =================================================
                                        BOTONES
                                    ================================================= */}

                                    <CardFooter
                                        className="
                                            flex flex-wrap gap-2
                                        "
                                    >

                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                        >
                                            <Link
                                                to={`/tours/${tour.id}`}
                                            >
                                                Ver detalle
                                            </Link>
                                        </Button>


                                        {/* Editar/Activar-Desactivar solo para
                                            Administrador — Cliente y Empleado
                                            ni ven estos botones en el DOM. */}

                                        {esAdmin && (
                                            <>

                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Link
                                                        to={`/tours/${tour.id}/editar`}
                                                    >
                                                        Editar
                                                    </Link>
                                                </Button>


                                                <Button
                                                    variant={
                                                        tour.activo
                                                            ? "destructive"
                                                            : "default"
                                                    }
                                                    size="sm"
                                                    className={
                                                        !tour.activo
                                                            ? `
                                                                bg-primary
                                                                !text-white
                                                                hover:bg-primary/90
                                                                hover:!text-white
                                                            `
                                                            : ""
                                                    }
                                                    onClick={() =>
                                                        handleCambiarEstado(
                                                            tour
                                                        )
                                                    }
                                                >
                                                    {tour.activo
                                                        ? "Desactivar"
                                                        : "Activar"}
                                                </Button>

                                            </>
                                        )}

                                    </CardFooter>

                                </Card>

                            ))}

                        </div>

                    )}

            </main>

        </div>
    )
}