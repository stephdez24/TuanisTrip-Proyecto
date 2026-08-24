import { Link } from "react-router-dom"
import { Clock, Users } from "lucide-react"

import { useFetch } from "@/lib/useFetch"
import { serviciosService } from "@/services/serviciosService"
import { empleadosService } from "@/services/empleadosService"
import { getImagenLocal, getImagenLocalGuia } from "@/lib/imagenLocal"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Placeholder cuando un tour/guía todavía no tiene imagen local asociada
// (ver lib/imagenLocal.js — bypass temporal mientras no exista endpoint
// real de subida de imágenes en el API).
const IMAGEN_TOUR_POR_DEFECTO =
    "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&auto=format&fit=crop"
const IMAGEN_GUIA_POR_DEFECTO =
    "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop"

function formatColones(monto) {
    return `₡${Number(monto).toLocaleString("es-CR")}`
}

function formatDuracion(minutos) {
    const horas = Math.floor(minutos / 60)
    const resto = minutos % 60
    if (resto === 0) return `${horas} horas`
    return `${horas}h ${resto}min`
}

// Estadísticas decorativas sobre Costa Rica — no vienen del API, son
// contenido fijo igual que en el mini-proyecto original (Tuanis Trip).
// Imágenes ya existentes en public/images/ del proyecto.
const ESTADISTICAS = [
    { imagen: "/images/Perezoso.png", valor: "5%", texto: "De la biodiversidad mundial" },
    { imagen: "/images/Mapa.png", valor: "30%", texto: "Del territorio es área protegida" },
    { imagen: "/images/Ave.png", valor: "500+", texto: "Especies de ave" },
    { imagen: "/images/EnergíaRenovable.png", valor: "99%", texto: "Energía renovable generada" },
]

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
        <div>
            {/* ================= HERO ================= */}
            <section
                className="relative flex min-h-140 items-end bg-cover bg-center text-primary-foreground"
                style={{ backgroundImage: "url('/images/tours/BannerVolcanArenal.png')" }}
            >
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-black/10" />
                <div className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-24">
                    <p className="font-script text-3xl text-secondary sm:text-4xl">
                        Pura vida,
                    </p>
                    <h1 className="mt-1 max-w-xl text-4xl font-bold leading-tight sm:text-5xl">
                        descubre Costa Rica
                    </h1>
                    <p className="mt-4 max-w-md text-primary-foreground/90">
                        Encuentra los mejores tours con guías locales y vive
                        experiencias inolvidables.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Button size="lg" asChild>
                            <Link to="/tours">Ver tours</Link>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="bg-transparent text-primary-foreground border-primary-foreground/40 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                            asChild
                        >
                            <Link to="/guias">Conocer guías</Link>
                        </Button>
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-6xl space-y-16 px-4 py-16">
                {/* ================= TOURS DESTACADOS ================= */}
                <section>
                    <div className="mb-6 flex items-end justify-between gap-4">
                        <div className="border-l-4 border-ring pl-4">
                            <h2 className="text-2xl font-bold text-primary">
                                Tours destacados
                            </h2>
                            <p className="text-muted-foreground">
                                Algunas de las experiencias que ofrecemos
                            </p>
                        </div>
                        <Link
                            to="/tours"
                            className="whitespace-nowrap text-sm font-medium text-ring hover:underline"
                        >
                            Ver todos los tours →
                        </Link>
                    </div>

                    {cargandoTours && (
                        <p className="text-muted-foreground">Cargando tours...</p>
                    )}

                    {!cargandoTours && toursDestacados.length === 0 && (
                        <p className="text-muted-foreground">
                            Todavía no hay tours disponibles.
                        </p>
                    )}

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {toursDestacados.map((tour) => (
                            <Link key={tour.id} to={`/tours/${tour.id}`}>
                                <Card className="h-full overflow-hidden pt-0 transition-shadow hover:shadow-lg">
                                    <div
                                        className="h-40 bg-cover bg-center"
                                        style={{
                                            backgroundImage: `url('${
                                                getImagenLocal(tour.id) ?? IMAGEN_TOUR_POR_DEFECTO
                                            }')`,
                                        }}
                                    />
                                    <CardContent className="space-y-2">
                                        <Badge variant="secondary">
                                            {tour.especialidad?.nombre}
                                        </Badge>
                                        <h3 className="font-semibold leading-snug">
                                            {tour.nombre}
                                        </h3>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <Clock className="h-3.5 w-3.5" />
                                            {formatDuracion(tour.duracionMinutos)}
                                        </div>
                                        <p className="font-semibold text-primary">
                                            {formatColones(tour.precioBase)}{" "}
                                            <span className="text-xs font-normal text-muted-foreground">
                                                por persona
                                            </span>
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* ================= GUÍAS DESTACADOS ================= */}
                <section>
                    <div className="mb-6 flex items-end justify-between gap-4">
                        <div className="border-l-4 border-ring pl-4">
                            <h2 className="text-2xl font-bold text-primary">
                                Nuestros guías
                            </h2>
                            <p className="text-muted-foreground">
                                Expertos locales listos para acompañarte
                            </p>
                        </div>
                        <Link
                            to="/guias"
                            className="whitespace-nowrap text-sm font-medium text-ring hover:underline"
                        >
                            Ver todos los guías →
                        </Link>
                    </div>

                    {cargandoGuias && (
                        <p className="text-muted-foreground">Cargando guías...</p>
                    )}

                    <div className="grid gap-6 sm:grid-cols-3">
                        {guiasDestacados.map((guia) => (
                            <Link key={guia.id} to={`/guias/${guia.id}`}>
                                <Card className="h-full overflow-hidden pt-0 transition-shadow hover:shadow-lg">
                                    <div
                                        className="h-48 bg-cover bg-center"
                                        style={{
                                            backgroundImage: `url('${
                                                getImagenLocalGuia(guia.id) ??
                                                IMAGEN_GUIA_POR_DEFECTO
                                            }')`,
                                        }}
                                    />
                                    <CardContent className="space-y-1">
                                        <h3 className="font-semibold text-primary">
                                            {guia.usuario?.nombre} {guia.usuario?.primerApellido}
                                        </h3>
                                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <Users className="h-3.5 w-3.5" />
                                            {guia.especialidad?.nombre}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* ================= ESTADÍSTICAS ================= */}
                <section className="border-l-4 border-ring pl-4">
                    <h2 className="mb-6 text-2xl font-bold text-primary">
                        ¿Por qué visitar Costa Rica?
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {ESTADISTICAS.map(({ imagen, valor, texto }) => (
                            <Card key={texto} className="border-none bg-secondary py-0">
                                <CardContent className="flex items-center gap-4 p-4">
                                    <img
                                        src={imagen}
                                        alt=""
                                        className="h-16 w-16 shrink-0 rounded-xl object-cover"
                                    />
                                    <div>
                                        <p className="text-2xl font-bold text-primary">
                                            {valor}
                                        </p>
                                        <p className="text-sm text-secondary-foreground/80">
                                            {texto}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* ================= SOBRE LA PLATAFORMA ================= */}
                <section className="rounded-2xl bg-secondary p-8 sm:p-10">
                    <h2 className="text-2xl font-bold text-primary">
                        Sobre la plataforma
                    </h2>
                    <p className="mt-3 max-w-2xl text-secondary-foreground/90">
                        Tuanis Trip reúne en un solo lugar los mejores tours y guías
                        turísticos de Costa Rica. Explora experiencias por
                        especialidad, conoce a los guías locales y da seguimiento a
                        tus reservas en tiempo real.
                    </p>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <p className="font-semibold text-primary">Reservas claras</p>
                            <p className="text-sm text-secondary-foreground/80">
                                Disponibilidad verificada al instante
                            </p>
                        </div>
                        <div>
                            <p className="font-semibold text-primary">Guías locales</p>
                            <p className="text-sm text-secondary-foreground/80">
                                Expertos certificados por zona
                            </p>
                        </div>
                        <div>
                            <p className="font-semibold text-primary">
                                Seguimiento de estado
                            </p>
                            <p className="text-sm text-secondary-foreground/80">
                                Sabes en qué va tu reserva siempre
                            </p>
                        </div>
                        <div>
                            <p className="font-semibold text-primary">Soporte local</p>
                            <p className="text-sm text-secondary-foreground/80">
                                Acompañamiento antes y durante el tour
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            {/* ================= FOOTER ================= */}
            <footer className="bg-primary text-primary-foreground">
                <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
                    <div>
                        <p className="text-lg font-bold">Tuanis Trip</p>
                        <p className="text-sm text-primary-foreground/70">
                            Tours &amp; Guías Turísticos
                        </p>
                        <p className="mt-3 text-sm text-primary-foreground/80">
                            Conectamos viajeros con las mejores experiencias en Costa
                            Rica, guiadas por expertos locales.
                        </p>
                    </div>
                    <div>
                        <p className="font-semibold">Enlaces rápidos</p>
                        <ul className="mt-3 space-y-2 text-sm text-primary-foreground/80">
                            <li>
                                <Link to="/" className="hover:text-primary-foreground">
                                    Inicio
                                </Link>
                            </li>
                            <li>
                                <Link to="/tours" className="hover:text-primary-foreground">
                                    Tours
                                </Link>
                            </li>
                            <li>
                                <Link to="/guias" className="hover:text-primary-foreground">
                                    Guías
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <p className="font-semibold">Contacto</p>
                        <p className="mt-3 text-sm text-primary-foreground/80">
                            Correo: contacto@tuanistrip.com
                        </p>
                        <p className="text-sm text-primary-foreground/80">
                            Alajuela, Costa Rica
                        </p>
                    </div>
                </div>
                <div className="border-t border-primary-foreground/10 py-4 text-center text-xs text-primary-foreground/60">
                    © 2026 Tuanis Trip. Todos los derechos reservados.
                </div>
            </footer>
        </div>
    )
}