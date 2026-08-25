import { useParams, useNavigate } from "react-router-dom"
import { restriccionesHorarioService } from "@/services/restriccionesHorarioService"
import { useFetch } from "@/lib/useFetch"
import {
    textoHorarioRestriccion,
    textoAlcanceRestriccion,
    formatearFechaRestriccion,
} from "@/lib/restriccionTexto"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function RestriccionDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data, loading, error } = useFetch(
        () => restriccionesHorarioService.obtenerPorId(id),
        [id]
    )

    if (loading) {
        return (
            <div className="mx-auto max-w-2xl px-5 py-10 sm:px-6">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-muted-foreground">
                            Cargando restricción...
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="mx-auto max-w-2xl space-y-4 px-5 py-10 sm:px-6">
                <Card>
                    <CardContent className="space-y-4 p-6">
                        <p className="text-destructive">
                            No se pudo cargar esta restricción.
                            {error ? ` (${error.message})` : ""}
                        </p>

                        <Button
                            variant="outline"
                            onClick={() => navigate("/restricciones")}
                        >
                            Volver
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const r = data

    return (
        <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6 lg:px-8">

            {/* =========================================================
                ENCABEZADO
            ========================================================= */}

            <div className="mb-8 border-l-4 border-ring pl-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ring">
                    Restricción de horario
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                    {formatearFechaRestriccion(r.fecha)}
                </h1>

                <p className="mt-1 text-base text-muted-foreground">
                    {r.tipoRestriccion?.nombre}
                </p>
            </div>


            {/* =========================================================
                TARJETA PRINCIPAL
            ========================================================= */}

            <Card className="overflow-hidden border-border shadow-sm">

                {/* Encabezado de la tarjeta */}

                <CardHeader className="border-b border-border bg-muted/30 px-6 py-5">
                    <div className="flex items-start justify-between gap-4">

                        <div>
                            <CardTitle className="text-xl text-primary">
                                Información de la restricción
                            </CardTitle>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Detalles de disponibilidad para reservas
                            </p>
                        </div>

                        <Badge
                            variant={r.activo ? "default" : "destructive"}
                            className={
                                r.activo
                                    ? "rounded-full bg-primary text-white hover:bg-primary"
                                    : "rounded-full"
                            }
                        >
                            {r.activo ? "Vigente" : "Inactiva"}
                        </Badge>

                    </div>
                </CardHeader>


                <CardContent className="space-y-0 p-0">

                    {/* =====================================================
                        HORARIO Y ALCANCE
                    ===================================================== */}

                    <div className="grid gap-0 border-b border-border sm:grid-cols-2">

                        <div className="px-6 py-5 sm:border-r sm:border-border">
                            <p className="text-sm text-muted-foreground">
                                Horario afectado
                            </p>

                            <p className="mt-1 text-base font-semibold text-primary">
                                {textoHorarioRestriccion(r)}
                            </p>
                        </div>

                        <div className="px-6 py-5">
                            <p className="text-sm text-muted-foreground">
                                Alcance
                            </p>

                            <p className="mt-1 text-base font-semibold text-primary">
                                {textoAlcanceRestriccion(r)}
                            </p>
                        </div>

                    </div>


                    {/* =====================================================
                        GUÍA
                    ===================================================== */}

                    {r.empleado && (
                        <div className="border-b border-border px-6 py-5">
                            <p className="text-sm text-muted-foreground">
                                Correo del guía
                            </p>

                            <p className="mt-1 font-medium text-foreground">
                                {r.empleado.usuario.correo}
                            </p>
                        </div>
                    )}


                    {/* =====================================================
                        MOTIVO
                    ===================================================== */}

                    <div className="border-b border-border px-6 py-6">

                        <p className="mb-2 text-sm font-medium text-muted-foreground">
                            Motivo
                        </p>

                        <div className="rounded-lg border-l-4 border-ring bg-muted/30 px-5 py-4">
                            <p className="text-base leading-relaxed text-foreground">
                                {r.motivo}
                            </p>
                        </div>

                    </div>


                    {/* =====================================================
                        ACCIONES
                    ===================================================== */}

                    <div className="flex flex-wrap gap-3 px-6 py-5">

                        <Button
                            onClick={() => navigate("/restricciones")}
                            className="
                                bg-primary
                                text-white
                                hover:bg-primary/90
                            "
                        >
                            Volver a restricciones
                        </Button>

                    </div>

                </CardContent>

            </Card>

        </div>
    )
}