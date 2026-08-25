import { Link, useParams } from "react-router-dom"
import {
    MessageCircle,
    AtSign,
    Compass,
    ShieldAlert,
    CalendarCheck,
} from "lucide-react"

import { useAuth } from "@/auth/useAuth"
import { useFetch } from "@/lib/useFetch"
import { empleadosService } from "@/services/empleadosService"
import {
    getImagenLocalGuia,
    getInstagramGuia,
} from "@/lib/imagenLocal"
import {
    formatearFechaCortaDesdeISO,
    horaDesdeISO,
} from "@/lib/fecha"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const IMAGEN_POR_DEFECTO =
    "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop"

// Formatea "87777777" -> "+506 8777 7777"
function formatearTelefonoCR(telefono) {
    const digitos = telefono.replace(/\D/g, "")

    if (digitos.length !== 8) {
        return telefono
    }

    return `+506 ${digitos.slice(0, 4)} ${digitos.slice(4)}`
}

export default function GuiaDetailPage() {

    const { id } = useParams()

    const { rol } = useAuth()

    const esAdmin = rol === "Administrador"

    const {
        data: guia,
        loading,
        error,
    } = useFetch(
        () => empleadosService.obtenerPorId(id),
        [id]
    )

    if (loading) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
                <Skeleton className="h-[620px] w-full rounded-2xl" />
            </div>
        )
    }

    if (error || !guia) {
        return (
            <div className="mx-auto max-w-md px-4 py-16 text-center">

                <p className="text-destructive">
                    No se pudo cargar este guía.
                </p>

                <Button
                    asChild
                    variant="outline"
                    className="mt-4"
                >
                    <Link to="/guias">
                        Volver a Guías
                    </Link>
                </Button>

            </div>
        )
    }

    const instagram = getInstagramGuia(guia.id)

    return (
        <div className="min-h-full bg-background">

            <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">

                <Card
                    className="
                        overflow-hidden
                        rounded-2xl
                        border-border/70
                        bg-card
                        p-0
                        shadow-lg
                    "
                >

                    {/* =====================================================
                        FOTO Y ENCABEZADO
                    ===================================================== */}

                    <div className="relative">

                        <img
                            src={
                                getImagenLocalGuia(guia.id) ||
                                IMAGEN_POR_DEFECTO
                            }
                            alt={`${guia.usuario?.nombre} ${guia.usuario?.primerApellido}`}
                            className="
                                h-72
                                w-full
                                object-cover
                                object-top
                                sm:h-80
                            "
                        />

                        {/* Degradado para que el texto se lea bien */}

                        <div
                            className="
                                absolute inset-0
                                bg-gradient-to-t
                                from-black/80
                                via-black/20
                                to-transparent
                            "
                        />

                        {/* Estado */}

                        <Badge
                            className={`
                                absolute
                                right-4
                                top-4
                                rounded-full
                                px-3
                                py-1
                                text-xs
                                font-semibold
                                ${
                                    guia.activo
                                        ? "bg-[#052b1e] text-white hover:bg-[#052b1e]"
                                        : ""
                                }
                            `}
                            variant={
                                guia.activo
                                    ? "default"
                                    : "secondary"
                            }
                        >
                            {guia.activo
                                ? "Activo"
                                : "Inactivo"}
                        </Badge>

                        {/* Nombre */}

                        <div
                            className="
                                absolute
                                inset-x-0
                                bottom-0
                                p-6
                                text-white
                                sm:p-7
                            "
                        >

                            <h1
                                className="
                                    text-2xl
                                    font-bold
                                    leading-tight
                                    sm:text-3xl
                                "
                            >
                                {guia.usuario?.nombre}{" "}
                                {guia.usuario?.primerApellido}
                            </h1>

                            <p
                                className="
                                    mt-2
                                    text-sm
                                    font-medium
                                    text-white/90
                                    sm:text-base
                                "
                            >
                                {guia.especialidad?.nombre}
                                {" · "}
                                Código: {guia.codigoEmpleado}
                            </p>

                        </div>

                    </div>


                    {/* =====================================================
                        CONTENIDO
                    ===================================================== */}

                    <CardContent className="p-0">


                        {/* =================================================
                            DESCRIPCIÓN
                        ================================================= */}

                        {guia.descripcion && (
                            <div className="px-6 py-7 sm:px-8">

                                <div
                                    className="
                                        rounded-xl
                                        border-l-4
                                        border-[#c8893a]
                                        bg-muted/40
                                        px-5
                                        py-5
                                        sm:px-6
                                        sm:py-6
                                    "
                                >

                                    <p
                                        className="
                                            text-sm
                                            leading-7
                                            text-muted-foreground
                                            sm:text-base
                                        "
                                    >
                                        {guia.descripcion}
                                    </p>

                                </div>

                            </div>
                        )}


                        {/* =================================================
                            CONTACTO
                        ================================================= */}

                        <div
                            className="
                                border-t
                                border-border
                                px-6
                                py-5
                                sm:px-8
                            "
                        >

                            <div className="flex flex-wrap gap-2">

                                {guia.usuario?.telefono && (
                                    <a
                                        href={`https://wa.me/506${guia.usuario.telefono.replace(/\D/g, "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="
                                            inline-flex
                                            items-center
                                            gap-2
                                            rounded-full
                                            border
                                            border-green-200
                                            bg-green-50
                                            px-4
                                            py-2
                                            text-xs
                                            font-medium
                                            text-green-700
                                            transition-colors
                                            hover:bg-green-100
                                        "
                                    >
                                        <MessageCircle className="h-4 w-4" />

                                        {formatearTelefonoCR(
                                            guia.usuario.telefono
                                        )}
                                    </a>
                                )}

                                {instagram && (
                                    <a
                                        href={`https://instagram.com/${instagram}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="
                                            inline-flex
                                            items-center
                                            gap-2
                                            rounded-full
                                            border
                                            border-pink-200
                                            bg-pink-50
                                            px-4
                                            py-2
                                            text-xs
                                            font-medium
                                            text-pink-700
                                            transition-colors
                                            hover:bg-pink-100
                                        "
                                    >
                                        <AtSign className="h-4 w-4" />

                                        {instagram}
                                    </a>
                                )}

                            </div>

                        </div>


                        {/* =================================================
                            TOURS QUE PUEDE ATENDER
                        ================================================= */}

                        <div
                            className="
                                border-t
                                border-border
                                px-6
                                py-6
                                sm:px-8
                            "
                        >

                            <p
                                className="
                                    mb-4
                                    flex
                                    items-center
                                    gap-2
                                    text-sm
                                    font-semibold
                                    text-primary
                                "
                            >
                                <Compass className="h-4 w-4" />

                                Tours que puede atender
                            </p>

                            {guia.servicios?.length > 0 ? (

                                <div
                                    className="
                                        grid
                                        grid-cols-1
                                        gap-2
                                        sm:grid-cols-2
                                    "
                                >

                                    {guia.servicios.map((s) => (

                                        <span
                                            key={s.id}
                                            className="
                                                rounded-lg
                                                border
                                                border-primary/15
                                                bg-secondary
                                                px-4
                                                py-2.5
                                                text-sm
                                                text-secondary-foreground
                                            "
                                            title={s.nombre}
                                        >
                                            {s.nombre}
                                        </span>

                                    ))}

                                </div>

                            ) : (

                                <p className="text-sm text-muted-foreground">
                                    No tiene tours asignados
                                </p>

                            )}

                        </div>


                        {/* =================================================
                            RESTRICCIONES
                        ================================================= */}

                        <div
                            className="
                                border-t
                                border-border
                                px-6
                                py-6
                                sm:px-8
                            "
                        >

                            <p
                                className="
                                    mb-4
                                    flex
                                    items-center
                                    gap-2
                                    text-sm
                                    font-semibold
                                    text-primary
                                "
                            >
                                <ShieldAlert className="h-4 w-4" />

                                Restricciones registradas (
                                {guia.restricciones?.length ?? 0}
                                )
                            </p>

                            {guia.restricciones?.length > 0 ? (

                                <div className="space-y-2">

                                    {guia.restricciones.map((r) => (

                                        <div
                                            key={r.id}
                                            className="
                                                rounded-lg
                                                border
                                                border-destructive/20
                                                bg-destructive/5
                                                px-4
                                                py-3
                                                text-sm
                                            "
                                        >

                                            <span className="font-medium">
                                                {formatearFechaCortaDesdeISO(
                                                    r.fecha
                                                )}
                                            </span>

                                            {" — "}

                                            <span className="text-muted-foreground">
                                                {r.todoElDia
                                                    ? "Todo el día"
                                                    : `${horaDesdeISO(r.horaInicio)}–${horaDesdeISO(r.horaFin)}`}

                                                {" "}
                                                ({r.motivo})
                                            </span>

                                        </div>

                                    ))}

                                </div>

                            ) : (

                                <p className="text-sm text-muted-foreground">
                                    Sin restricciones registradas
                                </p>

                            )}

                        </div>


                        {/* =================================================
                            RESERVAS Y BOTONES
                        ================================================= */}

                        <div
                            className="
                                flex
                                flex-col
                                gap-4
                                border-t
                                border-border
                                px-6
                                py-6
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                                sm:px-8
                            "
                        >

                            {/* Reservas */}

                            <div
                                className="
                                    inline-flex
                                    w-fit
                                    items-center
                                    gap-2
                                    rounded-lg
                                    bg-secondary
                                    px-4
                                    py-2.5
                                "
                            >

                                <CalendarCheck
                                    className="
                                        h-4
                                        w-4
                                        text-primary
                                    "
                                />

                                <p className="text-sm">

                                    <span
                                        className="
                                            font-semibold
                                            text-primary
                                        "
                                    >
                                        {guia.citas?.length ?? 0}
                                    </span>

                                    {" "}
                                    reservas totales

                                </p>

                            </div>


                            {/* Botones */}

                            <div className="flex flex-wrap gap-2">

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
                                        <Link
                                            to={`/guias/${guia.id}/editar`}
                                        >
                                            Editar
                                        </Link>
                                    </Button>
                                )}

                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                >
                                    <Link to="/guias">
                                        Volver a Guías
                                    </Link>
                                </Button>

                            </div>

                        </div>

                    </CardContent>

                </Card>

            </div>

        </div>
    )
}