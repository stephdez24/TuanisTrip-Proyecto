import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { Compass, CalendarCheck } from "lucide-react"

import { useAuth } from "@/auth/useAuth"
import { useFetch } from "@/lib/useFetch"
import { useOrdenamiento } from "@/lib/useOrdenamiento"
import { empleadosService } from "@/services/empleadosService"
import { especialidadesService } from "@/services/especialidadesService"
import { getImagenLocalGuia } from "@/lib/imagenLocal"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import SelectorOrden from "@/components/SelectorOrden"

import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"


const TODAS = "todas"

const IMAGEN_POR_DEFECTO =
    "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=600&auto=format&fit=crop"


const OPCIONES_ORDEN = [
    {
        value: "nombre:asc",
        label: "Nombre (A-Z)",
    },
    {
        value: "nombre:desc",
        label: "Nombre (Z-A)",
    },
    {
        value: "tours:desc",
        label: "Más tours asignados",
    },
    {
        value: "tours:asc",
        label: "Menos tours asignados",
    },
    {
        value: "reservas:desc",
        label: "Más reservas totales",
    },
    {
        value: "reservas:asc",
        label: "Menos reservas totales",
    },
]


export default function GuiasPage() {

    const { rol } = useAuth()

    const esAdmin = rol === "Administrador"

    const [refrescarClave, setRefrescarClave] = useState(0)

    const [busqueda, setBusqueda] = useState("")

    const [especialidadId, setEspecialidadId] =
        useState(TODAS)


    /* =========================================================
       DATOS
    ========================================================= */

    const {
        data: guias,
        loading,
        error,
    } = useFetch(
        () => empleadosService.listar(),
        [refrescarClave]
    )


    const {
        data: especialidades,
    } = useFetch(
        () => especialidadesService.listar(),
        []
    )


    /* =========================================================
       FILTROS
    ========================================================= */

    const guiasFiltrados = useMemo(() => {

        if (!guias) {
            return []
        }

        const texto =
            busqueda.trim().toLowerCase()


        return guias.filter((guia) => {

            const nombreCompleto =
                `${guia.usuario?.nombre ?? ""} ${guia.usuario?.primerApellido ?? ""}`
                    .toLowerCase()


            const codigo =
                guia.codigoEmpleado?.toLowerCase() ?? ""


            const coincideTexto =
                !texto ||
                nombreCompleto.includes(texto) ||
                codigo.includes(texto)


            const coincideEspecialidad =
                especialidadId === TODAS ||
                guia.especialidadId === Number(
                    especialidadId
                )


            return (
                coincideTexto &&
                coincideEspecialidad
            )
        })

    }, [
        guias,
        busqueda,
        especialidadId,
    ])


    /* =========================================================
       ORDENAMIENTO
    ========================================================= */

    const {
        datosOrdenados: guiasOrdenados,
        criterios,
        establecerOrden,
    } = useOrdenamiento(
        guiasFiltrados,
        {
            nombre: (guia) =>
                `${guia.usuario?.nombre ?? ""} ${guia.usuario?.primerApellido ?? ""}`
                    .toLowerCase(),

            tours: (guia) =>
                guia.servicios?.length ?? 0,

            reservas: (guia) =>
                guia._count?.citas ?? 0,
        },
        null
    )


    /* =========================================================
       CAMBIAR ESTADO
    ========================================================= */

    async function handleCambiarEstado(guia) {

        try {

            await empleadosService.cambiarEstado(
                guia.id,
                !guia.activo
            )


            toast.success(
                guia.activo
                    ? "Guía desactivado correctamente"
                    : "Guía activado correctamente"
            )


            setRefrescarClave(
                (clave) => clave + 1
            )

        } catch (err) {

            toast.error(
                err.message ||
                "No se pudo cambiar el estado del guía"
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
                    relative flex min-h-[380px]
                    items-end overflow-hidden
                    bg-cover bg-center
                    text-white
                    sm:min-h-[430px]
                "
                style={{
                    backgroundImage:
                        "url('/images/bannerGuias.png')",
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
                        relative z-10 mx-auto w-full
                        max-w-6xl
                        px-5 pb-16 pt-28
                        sm:px-6 sm:pb-20
                        lg:px-8
                    "
                >

                    <div className="max-w-3xl">


                        {/* Texto pequeño */}

                        <p
                            className="
                                font-script text-3xl
                                font-bold
                                text-secondary
                                sm:text-4xl
                            "
                        >
                            Explora Costa Rica
                        </p>


                        {/* Título */}

                        <div className="mt-2 inline-block">

                            <h1
                                className="
                                    text-5xl font-bold
                                    leading-tight
                                    tracking-tight
                                    text-white
                                    sm:text-6xl
                                "
                            >
                                Información de guías
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
                            Conoce a nuestros guías locales,
                            su experiencia, especialidad e idiomas
                            para elegir el que mejor se adapte
                            a tu próxima aventura.
                        </p>

                    </div>

                </div>


                {/* Detalle inferior */}

                <div
                    className="
                        absolute bottom-0
                        left-0 right-0 h-20
                        bg-linear-to-t
                        from-background
                        to-transparent
                    "
                />

            </section>


            {/* =========================================================
                CONTENIDO
            ========================================================= */}

            <main
                className="
                    mx-auto max-w-6xl
                    px-5 py-12
                    sm:px-6
                    lg:px-8
                "
            >


                {/* =====================================================
                    ENCABEZADO
                ===================================================== */}

                <div
                    className="
                        mb-8 flex flex-col gap-6
                        lg:flex-row
                        lg:items-end
                        lg:justify-between
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
                            NUESTROS GUÍAS
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
                            Guías turísticos
                        </h2>

                        <p
                            className="
                                mt-2
                                text-base
                                text-muted-foreground
                                sm:text-lg
                            "
                        >
                            Conoce a los guías que llevan
                            las experiencias de Tuanis Trip
                        </p>

                    </div>

                    </div>


                    {/* NUEVO GUÍA */}

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
                            <Link to="/guias/nuevo">
                                Nuevo guía
                            </Link>
                        </Button>

                    )}

                </div>


                {/* =====================================================
                    FILTROS
                ===================================================== */}

                <div
                    className="
                        mb-8 flex flex-col gap-3
                        sm:flex-row
                        sm:flex-wrap
                    "
                >

                    <Input
                        placeholder="Buscar por nombre o código..."
                        value={busqueda}
                        onChange={(e) =>
                            setBusqueda(e.target.value)
                        }
                        className="sm:max-w-sm"
                    />


                    <Select
                        value={especialidadId}
                        onValueChange={setEspecialidadId}
                    >

                        <SelectTrigger
                            className="w-full sm:w-60"
                        >

                            <SelectValue
                                placeholder="Especialidad"
                            />

                        </SelectTrigger>


                        <SelectContent>

                            <SelectItem value={TODAS}>
                                Todas las especialidades
                            </SelectItem>


                            {especialidades?.map(
                                (especialidad) => (

                                    <SelectItem
                                        key={especialidad.id}
                                        value={String(
                                            especialidad.id
                                        )}
                                    >
                                        {especialidad.nombre}
                                    </SelectItem>

                                )
                            )}

                        </SelectContent>

                    </Select>


                    <SelectorOrden
                        opciones={OPCIONES_ORDEN}
                        criterios={criterios}
                        onCambiar={establecerOrden}
                    />

                </div>


                {/* =====================================================
                    CANTIDAD
                ===================================================== */}

                {!loading && !error && (

                    <p
                        className="
                            mb-5
                            text-sm
                            text-muted-foreground
                        "
                    >
                        {guiasOrdenados?.length ?? 0}{" "}
                        guías encontrados
                    </p>

                )}


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

                        {Array.from({
                            length: 6,
                        }).map((_, i) => (

                            <Skeleton
                                key={i}
                                className="
                                    h-[470px]
                                    w-full
                                    rounded-2xl
                                "
                            />

                        ))}

                    </div>

                )}


                {/* =====================================================
                    ERROR
                ===================================================== */}

                {error && (

                    <div
                        className="
                            py-12 text-center
                        "
                    >

                        <p className="text-destructive">
                            No se pudieron cargar los guías:{" "}
                            {error.message}
                        </p>

                    </div>

                )}


                {/* =====================================================
                    SIN RESULTADOS
                ===================================================== */}

                {!loading &&
                    !error &&
                    guiasOrdenados?.length === 0 && (

                        <div
                            className="
                                rounded-2xl
                                border border-dashed
                                border-border
                                bg-muted/40
                                px-6 py-12
                                text-center
                            "
                        >

                            <p
                                className="
                                    text-muted-foreground
                                "
                            >
                                No se encontraron guías
                                con los filtros seleccionados.
                            </p>

                        </div>

                    )}


                {/* =====================================================
                    TARJETAS
                ===================================================== */}

                {!loading &&
                    !error &&
                    guiasOrdenados?.length > 0 && (

                        <div
                            className="
                                grid grid-cols-1 gap-6
                                sm:grid-cols-2
                                lg:grid-cols-3
                            "
                        >

                            {guiasOrdenados.map(
                                (guia) => {

                                    const nombreCompleto =
                                        `${guia.usuario?.nombre ?? ""} ${guia.usuario?.primerApellido ?? ""}`


                                    const imagen =
                                        getImagenLocalGuia(
                                            guia.id
                                        ) ||
                                        IMAGEN_POR_DEFECTO


                                    return (

                                        <Card
                                            key={guia.id}
                                            className="
                                                group flex
                                                flex-col
                                                overflow-hidden
                                                rounded-2xl
                                                border-border/70
                                                pt-0
                                                transition-all
                                                duration-300
                                                hover:-translate-y-1
                                                hover:shadow-lg
                                            "
                                        >


                                            {/* =================================
                                                IMAGEN
                                            ================================= */}

                                            <div
                                                className="
                                                    relative
                                                    h-60
                                                    overflow-hidden
                                                "
                                            >

                                                <img
                                                    src={imagen}
                                                    alt={
                                                        nombreCompleto
                                                    }
                                                    className="
                                                        h-full w-full
                                                        object-cover
                                                        transition-transform
                                                        duration-500
                                                        group-hover:scale-105
                                                    "
                                                />


                                                {/* Overlay */}

                                                <div
                                                    className="
                                                        absolute
                                                        inset-x-0
                                                        top-0
                                                        h-20
                                                        bg-linear-to-b
                                                        from-black/60
                                                        to-transparent
                                                    "
                                                />


                                                {/* Badges */}

                                                <div
                                                    className="
                                                        absolute
                                                        inset-x-0
                                                        top-0
                                                        flex
                                                        items-start
                                                        justify-between
                                                        p-4
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
                                                        {guia.especialidad?.nombre ??
                                                            "Guía"}
                                                    </Badge>


                                                    <Badge
                                                        className="
                                                            bg-primary
                                                            !text-white
                                                            hover:bg-primary
                                                            hover:!text-white
                                                        "
                                                    >
                                                        {guia.activo
                                                            ? "Activo"
                                                            : "Inactivo"}
                                                    </Badge>

                                                </div>

                                            </div>


                                            {/* =================================
                                                CONTENIDO
                                            ================================= */}

                                            <CardContent
                                                className="
                                                    flex-1
                                                    space-y-4
                                                    p-5
                                                "
                                            >

                                                <div>

                                                    <h3
                                                        className="
                                                            text-xl
                                                            font-semibold
                                                            text-primary
                                                        "
                                                    >
                                                        {nombreCompleto}
                                                    </h3>


                                                    <p
                                                        className="
                                                            mt-1
                                                            text-sm
                                                            text-muted-foreground
                                                        "
                                                    >
                                                        {guia.codigoEmpleado}
                                                    </p>

                                                </div>


                                                {/* Información */}

                                                <div
                                                    className="
                                                        flex
                                                        flex-wrap
                                                        gap-2
                                                    "
                                                >

                                                    <span
                                                        className="
                                                            inline-flex
                                                            items-center
                                                            gap-1.5
                                                            rounded-full
                                                            bg-secondary
                                                            px-3 py-1.5
                                                            text-xs
                                                            font-medium
                                                            text-secondary-foreground
                                                        "
                                                    >

                                                        <Compass
                                                            className="
                                                                h-3.5
                                                                w-3.5
                                                            "
                                                        />

                                                        {guia.servicios?.length ??
                                                            0}{" "}
                                                        tours

                                                    </span>


                                                    <span
                                                        className="
                                                            inline-flex
                                                            items-center
                                                            gap-1.5
                                                            rounded-full
                                                            bg-secondary
                                                            px-3 py-1.5
                                                            text-xs
                                                            font-medium
                                                            text-secondary-foreground
                                                        "
                                                    >

                                                        <CalendarCheck
                                                            className="
                                                                h-3.5
                                                                w-3.5
                                                            "
                                                        />

                                                        {guia._count?.citas ??
                                                            0}{" "}
                                                        reservas

                                                    </span>

                                                </div>

                                            </CardContent>


                                            {/* =================================
                                                BOTONES
                                            ================================= */}

                                            <CardFooter
                                                className="
                                                    flex
                                                    flex-wrap
                                                    gap-2
                                                    border-t
                                                    bg-muted/30
                                                    p-4
                                                "
                                            >

                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                >

                                                    <Link
                                                        to={`/guias/${guia.id}`}
                                                    >
                                                        Ver perfil
                                                    </Link>

                                                </Button>


                                                {esAdmin && (

                                                    <>

                                                        <Button
                                                            asChild
                                                            variant="outline"
                                                            size="sm"
                                                        >

                                                            <Link
                                                                to={`/guias/${guia.id}/editar`}
                                                            >
                                                                Editar
                                                            </Link>

                                                        </Button>


                                                        <Button
                                                            size="sm"
                                                            variant={
                                                                guia.activo
                                                                    ? "destructive"
                                                                    : "default"
                                                            }
                                                            className={
                                                                !guia.activo
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
                                                                    guia
                                                                )
                                                            }
                                                        >
                                                            {guia.activo
                                                                ? "Desactivar"
                                                                : "Activar"}
                                                        </Button>

                                                    </>

                                                )}

                                            </CardFooter>

                                        </Card>

                                    )
                                }
                            )}

                        </div>

                    )}

            </main>

        </div>
    )
}