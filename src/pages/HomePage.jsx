import { Link } from "react-router-dom"
import {
    Clock,
    Users,
    ArrowRight,
    CalendarCheck,
    Wallet,
    Headphones,
} from "lucide-react"

import { useFetch } from "@/lib/useFetch"
import { serviciosService } from "@/services/serviciosService"
import { empleadosService } from "@/services/empleadosService"
import { imagenesService } from "@/services/imagenesService"
import { getImagenLocalGuia } from "@/lib/imagenLocal"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Imagen de respaldo si un tour todavía no tiene imagen subida
const IMAGEN_TOUR_POR_DEFECTO =
    "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&auto=format&fit=crop"

// Los guías siguen sin campo de imagen real en el API (el modelo Empleado
// no lo tiene, a diferencia de Servicio) — bypass legítimo, no un hueco.
const IMAGEN_GUIA_POR_DEFECTO =
    "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop"

// Estadísticas decorativas sobre Costa Rica
const ESTADISTICAS = [
    {
        imagen: "/images/Perezoso.png",
        valor: "5%",
        texto: "De la biodiversidad mundial",
    },
    {
        imagen: "/images/Mapa.png",
        valor: "30%",
        texto: "Del territorio es área protegida",
    },
    {
        imagen: "/images/Ave.png",
        valor: "500+",
        texto: "Especies de ave",
    },
    {
        imagen: "/images/EnergíaRenovable.png",
        valor: "99%",
        texto: "Energía renovable generada",
    },
]

function formatColones(monto) {
    return `₡${Number(monto).toLocaleString("es-CR")}`
}

function formatDuracion(minutos) {
    const horas = Math.floor(minutos / 60)
    const resto = minutos % 60

    if (resto === 0) {
        return `${horas} horas`
    }

    return `${horas}h ${resto}min`
}

export default function HomePage() {
    const { data: tours, loading: cargandoTours } = useFetch(() =>
        serviciosService.listarActivos()
    )

    const { data: guias, loading: cargandoGuias } = useFetch(() =>
        empleadosService.listarActivos()
    )

    const toursDestacados = (tours ?? []).slice(0, 4)
    const guiasDestacados = (guias ?? []).slice(0, 3)

    return (
        <div className="bg-background">

            {/* =========================================================
                HERO
            ========================================================= */}

            <section
                className="
                    relative flex min-h-155 items-end overflow-hidden
                    bg-cover bg-center
                    text-white
                    sm:min-h-170
                "
                style={{
                    backgroundImage:
                        "url('/images/BannerVolcanArenal.png')",
                }}
            >

                {/* Overlay */}

                <div
                    className="
                        absolute inset-0
                        bg-linear-to-t
                        from-black/80
                        via-black/35
                        to-black/10
                    "
                />

                {/* Contenido */}

                <div
                    className="
                        relative z-10 mx-auto w-full max-w-6xl
                        px-5 pb-20 pt-32
                        sm:px-6 sm:pb-24
                        lg:px-8
                    "
                >

                    <div className="max-w-2xl">

                        <p
                            className="
                                font-script text-4xl
                                font-bold text-secondary
                                sm:text-5xl
                            "
                        >
                            Pura vida,
                        </p>

                        <h1
                            className="
                                mt-2 text-5xl font-bold
                                leading-tight tracking-tight
                                sm:text-6xl
                            "
                        >
                            descubre
                            <span className="block">
                                Costa Rica
                            </span>
                        </h1>

                        <p
                            className="
                                mt-6 max-w-xl
                                text-base leading-relaxed
                                text-white/85
                                sm:text-lg
                            "
                        >
                            Encuentra los mejores tours con guías locales
                            y vive experiencias inolvidables en los
                            destinos más increíbles de Costa Rica.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">

                            <Button
                                size="lg"
                                className="
                                    rounded-full px-7
                                    shadow-lg
                                    transition-all duration-300
                                    hover:-translate-y-0.5
                                    hover:shadow-xl
                                "
                                asChild
                            >
                                <Link to="/tours">
                                    Ver tours
                                </Link>
                            </Button>

                            <Button
                                size="lg"
                                variant="outline"
                                className="
                                    rounded-full
                                    border-white/50
                                    bg-white/10
                                    px-7
                                    text-white
                                    backdrop-blur-sm
                                    hover:bg-white/20
                                    hover:text-white
                                "
                                asChild
                            >
                                <Link to="/guias">
                                    Conocer nuestros guías
                                </Link>
                            </Button>

                        </div>

                    </div>

                </div>

                {/* Detalle inferior */}

                <div
                    className="
                        absolute bottom-0 left-0 right-0 h-24
                        bg-linear-to-t from-background
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
                    space-y-24
                    px-5 py-16
                    sm:px-6
                    lg:px-8
                "
            >

                {/* =====================================================
                    TOURS DESTACADOS
                ===================================================== */}

                <section>

                    <div
                        className="
                            mb-8 flex flex-col gap-4
                            sm:flex-row sm:items-end
                            sm:justify-between
                        "
                    >

                        <div
                            className="
                                border-l-4 border-ring
                                pl-5
                            "
                        >

                            <p
                                className="
                                    mb-1 text-sm font-semibold
                                    uppercase tracking-[0.18em]
                                    text-ring
                                "
                            >
                                Experiencias
                            </p>

                            <h2
                                className="
                                    text-3xl font-bold
                                    tracking-tight text-primary
                                "
                            >
                                Tours destacados
                            </h2>

                            <p
                                className="
                                    mt-1 text-muted-foreground
                                "
                            >
                                Algunas de las experiencias que ofrecemos
                            </p>

                        </div>

                        <Link
                            to="/tours"
                            className="
                                group flex items-center gap-1
                                text-sm font-semibold
                                text-ring
                                transition-colors
                                hover:text-primary
                            "
                        >
                            Ver todos los tours

                            <ArrowRight
                                className="
                                    h-4 w-4
                                    transition-transform
                                    group-hover:translate-x-1
                                "
                            />
                        </Link>

                    </div>


                    {cargandoTours && (
                        <div className="py-10 text-center">
                            <p className="text-muted-foreground">
                                Cargando tours...
                            </p>
                        </div>
                    )}


                    {!cargandoTours &&
                        toursDestacados.length === 0 && (
                            <div
                                className="
                                    rounded-2xl
                                    border border-dashed
                                    border-border
                                    bg-muted/40
                                    px-6 py-10
                                    text-center
                                "
                            >
                                <p className="text-muted-foreground">
                                    Todavía no hay tours disponibles.
                                </p>
                            </div>
                        )}


                    <div
                        className="
                            grid gap-5
                            sm:grid-cols-2
                            lg:grid-cols-4
                        "
                    >

                        {toursDestacados.map((tour) => (

                            <Link
                                key={tour.id}
                                to={`/tours/${tour.id}`}
                                className="group"
                            >

                                <Card
                                    className="
                                        h-full overflow-hidden
                                        rounded-2xl
                                        border-border/70
                                        bg-card p-0
                                        transition-all
                                        duration-300
                                        group-hover:-translate-y-1
                                        group-hover:shadow-xl
                                    "
                                >

                                    <div
                                        className="
                                            relative h-48
                                            overflow-hidden
                                        "
                                    >

                                        <div
                                            className="
                                                absolute inset-0
                                                bg-cover bg-center
                                                transition-transform
                                                duration-500
                                                group-hover:scale-105
                                            "
                                            style={{
                                                backgroundImage: `url('${
                                                    imagenesService.urlDescarga(tour.imagen) ??
                                                    IMAGEN_TOUR_POR_DEFECTO
                                                }')`,
                                            }}
                                        />

                                        <div
                                            className="
                                                absolute inset-x-0
                                                bottom-0 h-20
                                                bg-linear-to-t
                                                from-black/40
                                                to-transparent
                                            "
                                        />

                                    </div>


                                    <CardContent
                                        className="
                                            space-y-3 p-5
                                        "
                                    >

                                        <Badge variant="secondary">
                                            {tour.especialidad?.nombre}
                                        </Badge>

                                        <h3
                                            className="
                                                font-semibold
                                                leading-snug
                                            "
                                        >
                                            {tour.nombre}
                                        </h3>

                                        <div
                                            className="
                                                flex items-center gap-1
                                                text-sm
                                                text-muted-foreground
                                            "
                                        >
                                            <Clock className="h-3.5 w-3.5" />

                                            {formatDuracion(
                                                tour.duracionMinutos
                                            )}
                                        </div>

                                        <p
                                            className="
                                                font-semibold
                                                text-primary
                                            "
                                        >
                                            {formatColones(
                                                tour.precioBase
                                            )}

                                            <span
                                                className="
                                                    ml-1 text-xs
                                                    font-normal
                                                    text-muted-foreground
                                                "
                                            >
                                                por persona
                                            </span>
                                        </p>

                                    </CardContent>

                                </Card>

                            </Link>

                        ))}

                    </div>

                </section>


                {/* =====================================================
                    GUÍAS DESTACADOS
                ===================================================== */}

                <section>

                    <div
                        className="
                            mb-8 flex flex-col gap-4
                            sm:flex-row sm:items-end
                            sm:justify-between
                        "
                    >

                        <div
                            className="
                                border-l-4 border-ring
                                pl-5
                            "
                        >

                            <p
                                className="
                                    mb-1 text-sm font-semibold
                                    uppercase tracking-[0.18em]
                                    text-ring
                                "
                            >
                                Equipo local
                            </p>

                            <h2
                                className="
                                    text-3xl font-bold
                                    tracking-tight text-primary
                                "
                            >
                                Nuestros guías
                            </h2>

                            <p
                                className="
                                    mt-1 text-muted-foreground
                                "
                            >
                                Expertos locales listos para acompañarte
                            </p>

                        </div>


                        <Link
                            to="/guias"
                            className="
                                group flex items-center gap-1
                                text-sm font-semibold
                                text-ring
                                transition-colors
                                hover:text-primary
                            "
                        >
                            Ver todos los guías

                            <ArrowRight
                                className="
                                    h-4 w-4
                                    transition-transform
                                    group-hover:translate-x-1
                                "
                            />
                        </Link>

                    </div>


                    {cargandoGuias && (
                        <div className="py-10 text-center">
                            <p className="text-muted-foreground">
                                Cargando guías...
                            </p>
                        </div>
                    )}


                    <div
                        className="
                            grid gap-5
                            sm:grid-cols-2
                            lg:grid-cols-3
                        "
                    >

                        {guiasDestacados.map((guia) => (

                            <Link
                                key={guia.id}
                                to={`/guias/${guia.id}`}
                                className="group"
                            >

                                <Card
                                    className="
                                        h-full overflow-hidden
                                        rounded-2xl
                                        border-border/70
                                        bg-card p-0
                                        transition-all
                                        duration-300
                                        group-hover:-translate-y-1
                                        group-hover:shadow-xl
                                    "
                                >

                                    <div
                                        className="
                                            relative h-56
                                            overflow-hidden
                                        "
                                    >

                                        <div
                                            className="
                                                absolute inset-0
                                                bg-cover bg-center
                                                transition-transform
                                                duration-500
                                                group-hover:scale-105
                                            "
                                            style={{
                                                backgroundImage: `url('${
                                                    getImagenLocalGuia(
                                                        guia.id
                                                    ) ??
                                                    IMAGEN_GUIA_POR_DEFECTO
                                                }')`,
                                            }}
                                        />

                                        <div
                                            className="
                                                absolute inset-x-0
                                                bottom-0 h-24
                                                bg-linear-to-t
                                                from-black/45
                                                to-transparent
                                            "
                                        />

                                    </div>


                                    <CardContent
                                        className="
                                            space-y-2 p-5
                                        "
                                    >

                                        <h3
                                            className="
                                                font-semibold
                                                text-primary
                                            "
                                        >
                                            {guia.usuario?.nombre}{" "}
                                            {guia.usuario?.primerApellido}
                                        </h3>

                                        <p
                                            className="
                                                flex items-center gap-1
                                                text-sm
                                                text-muted-foreground
                                            "
                                        >
                                            <Users className="h-3.5 w-3.5" />

                                            {guia.especialidad?.nombre}
                                        </p>

                                    </CardContent>

                                </Card>

                            </Link>

                        ))}

                    </div>

                </section>


                {/* =====================================================
                    ESTADÍSTICAS
                ===================================================== */}

                <section>

                    <div
                        className="
                            border-l-4 border-ring
                            pl-5
                        "
                    >

                        <h2
                            className="
                                mb-6 text-3xl
                                font-bold text-primary
                            "
                        >
                            ¿Por qué visitar Costa Rica?
                        </h2>

                    </div>


                    <div
                        className="
                            grid gap-5
                            sm:grid-cols-2
                            lg:grid-cols-4
                        "
                    >

                        {ESTADISTICAS.map(
                            ({ imagen, valor, texto }) => (

                                <Card
                                    key={valor}
                                    className="
                                        rounded-2xl
                                        border-none
                                        bg-secondary
                                        shadow-none
                                    "
                                >

                                    <CardContent
                                        className="
                                            flex items-center gap-4
                                            p-5
                                        "
                                    >

                                        <img
                                            src={imagen}
                                            alt=""
                                            className="
                                                h-16 w-16
                                                shrink-0
                                                rounded-2xl
                                                object-cover
                                                ring-2 ring-white/50
                                            "
                                        />

                                        <div>

                                            <p
                                                className="
                                                    text-3xl
                                                    font-bold
                                                    leading-none
                                                    text-primary
                                                "
                                            >
                                                {valor}
                                            </p>

                                            <p
                                                className="
                                                    mt-2 text-sm
                                                    leading-snug
                                                    text-secondary-foreground/80
                                                "
                                            >
                                                {texto}
                                            </p>

                                        </div>

                                    </CardContent>

                                </Card>

                            )
                        )}

                    </div>

                </section>


                {/* =====================================================
                    SOBRE LA PLATAFORMA
                ===================================================== */}

                <section
                    className="
                        overflow-hidden
                        rounded-3xl
                        bg-secondary
                        px-6 py-8
                        sm:px-10 sm:py-10
                    "
                >

                    <div
                        className="
                            grid items-center gap-8
                            md:grid-cols-[260px_1fr]
                            lg:gap-12
                        "
                    >

                        {/* Imagen del turista */}

                        <div className="flex justify-center">

                            <img
                                src="/images/turista.png"
                                alt="Turista explorando Costa Rica"
                                className="
                                    w-full max-w-[260px]
                                    object-contain
                                    drop-shadow-sm
                                "
                            />

                        </div>


                        {/* Contenido */}

                        <div>

                            <h2
                                className="
                                    text-2xl font-bold
                                    text-primary
                                    sm:text-3xl
                                "
                            >
                                Sobre la plataforma
                            </h2>


                            <p
                                className="
                                    mt-4 max-w-3xl
                                    leading-relaxed
                                    text-secondary-foreground/90
                                "
                            >
                                Tuanis Trip reúne en un solo lugar los
                                mejores tours y actividades del país.
                                Los usuarios pueden explorar opciones
                                por tipo o provincia, encontrar
                                experiencias destacadas y planificar
                                sus aventuras de manera sencilla.
                            </p>


                            {/* Características */}

                            <div
                                className="
                                    mt-8 grid gap-6
                                    sm:grid-cols-2
                                    lg:grid-cols-4
                                "
                            >

                                {/* Reservas */}

                                <div
                                    className="
                                        flex items-start gap-3
                                    "
                                >

                                    <div
                                        className="
                                            flex h-10 w-10 shrink-0
                                            items-center justify-center
                                            rounded-full
                                            bg-primary/10
                                            text-primary
                                        "
                                    >
                                        <CalendarCheck
                                            className="h-5 w-5"
                                        />
                                    </div>

                                    <div>

                                        <p
                                            className="
                                                font-semibold
                                                text-primary
                                            "
                                        >
                                            Reservas
                                        </p>

                                        <p
                                            className="
                                                text-sm leading-snug
                                                text-secondary-foreground/80
                                            "
                                        >
                                            fáciles y rápidas
                                        </p>

                                    </div>

                                </div>


                                {/* Guías locales */}

                                <div
                                    className="
                                        flex items-start gap-3
                                    "
                                >

                                    <div
                                        className="
                                            flex h-10 w-10 shrink-0
                                            items-center justify-center
                                            rounded-full
                                            bg-primary/10
                                            text-primary
                                        "
                                    >
                                        <Users
                                            className="h-5 w-5"
                                        />
                                    </div>

                                    <div>

                                        <p
                                            className="
                                                font-semibold
                                                text-primary
                                            "
                                        >
                                            Guías locales
                                        </p>

                                        <p
                                            className="
                                                text-sm leading-snug
                                                text-secondary-foreground/80
                                            "
                                        >
                                            expertos
                                        </p>

                                    </div>

                                </div>


                                {/* Precios claros — reemplaza "Pago seguro":
                                    el sistema no procesa pagos reales (no hay
                                    ningún flujo de cobro en el API), así que
                                    "pago seguro" prometía algo que no existe. */}

                                <div
                                    className="
                                        flex items-start gap-3
                                    "
                                >

                                    <div
                                        className="
                                            flex h-10 w-10 shrink-0
                                            items-center justify-center
                                            rounded-full
                                            bg-primary/10
                                            text-primary
                                        "
                                    >
                                        <Wallet
                                            className="h-5 w-5"
                                        />
                                    </div>

                                    <div>

                                        <p
                                            className="
                                                font-semibold
                                                text-primary
                                            "
                                        >
                                            Precios claros
                                        </p>

                                        <p
                                            className="
                                                text-sm leading-snug
                                                text-secondary-foreground/80
                                            "
                                        >
                                            sin sorpresas
                                        </p>

                                    </div>

                                </div>


                                {/* Soporte local */}

                                <div
                                    className="
                                        flex items-start gap-3
                                    "
                                >

                                    <div
                                        className="
                                            flex h-10 w-10 shrink-0
                                            items-center justify-center
                                            rounded-full
                                            bg-primary/10
                                            text-primary
                                        "
                                    >
                                        <Headphones
                                            className="h-5 w-5"
                                        />
                                    </div>

                                    <div>

                                        <p
                                            className="
                                                font-semibold
                                                text-primary
                                            "
                                        >
                                            Soporte local
                                        </p>

                                        <p
                                            className="
                                                text-sm leading-snug
                                                text-secondary-foreground/80
                                            "
                                        >
                                            siempre disponible
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>

            </main>

        </div>
    )
}