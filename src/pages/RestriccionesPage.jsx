import { useState } from "react"
import { Link } from "react-router-dom"
import { restriccionesHorarioService } from "@/services/restriccionesHorarioService"
import { useFetch } from "@/lib/useFetch"
import {
    textoHorarioRestriccion,
    textoAlcanceRestriccion,
    formatearFechaRestriccion,
} from "@/lib/restriccionTexto"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Solo lectura a propósito: el enunciado no pide crear/editar/activar 
// restricciones desde el FrontEnd (ver nota en restriccionesHorarioService.js). 

const FILTROS = [
    { id: "todas", label: "Todas" },
    { id: "generales", label: "Generales" },
    { id: "empleado", label: "Por guía" },
]

export default function RestriccionesPage() {
    const { data, loading, error } = useFetch(() =>
        restriccionesHorarioService.listar()
    )
    const [filtro, setFiltro] = useState("todas")

    const restricciones = data ?? []

    const restriccionesFiltradas = restricciones.filter((r) => {
        if (filtro === "generales") return !r.empleado
        if (filtro === "empleado") return Boolean(r.empleado)
        return true
    })

    return (
        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 lg:px-8">

            {/* =========================================================
                ENCABEZADO
            ========================================================= */}

            <div className="mb-8 border-l-4 border-ring pl-5">
                <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                    Bloqueos y temporadas especiales
                </h1>

                <p className="mt-2 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                    Fechas y horarios en los que el establecimiento o un guía
                    en particular no está disponible para reservas.
                </p>
            </div>


            {/* =========================================================
                FILTROS
            ========================================================= */}

            <div className="mb-8 flex flex-wrap gap-2">
                {FILTROS.map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setFiltro(f.id)}
                        className={`
                            rounded-full
                            border
                            px-5 py-2
                            text-sm font-medium
                            transition-all duration-200
                            ${
                                filtro === f.id
                                    ? "border-primary bg-primary text-white shadow-sm hover:bg-primary/90"
                                    : "border-input bg-background text-foreground hover:border-primary/40 hover:bg-secondary/40"
                            }
                        `}
                    >
                        {f.label}
                    </button>
                ))}
            </div>


            {/* =========================================================
                ESTADOS
            ========================================================= */}

            {loading && (
                <div className="rounded-xl border border-border bg-card p-6 text-center">
                    <p className="text-muted-foreground">
                        Cargando restricciones...
                    </p>
                </div>
            )}

            {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
                    <p className="text-destructive">
                        No se pudieron cargar las restricciones: {error.message}
                    </p>
                </div>
            )}

            {!loading && !error && restriccionesFiltradas.length === 0 && (
                <div className="rounded-xl border border-border bg-card p-8 text-center">
                    <p className="text-muted-foreground">
                        No hay restricciones registradas para este filtro.
                    </p>
                </div>
            )}


            {/* =========================================================
                LISTA DE RESTRICCIONES
            ========================================================= */}

            {!loading && !error && restriccionesFiltradas.length > 0 && (
                <div className="space-y-4">
                    {restriccionesFiltradas.map((r) => (
                        <Link
                            key={r.id}
                            to={`/restricciones/${r.id}`}
                            className="block"
                        >
                            <Card
                                className="
                                    overflow-hidden
                                    rounded-2xl
                                    border-border
                                    bg-card
                                    shadow-sm
                                    transition-all
                                    duration-200
                                    hover:-translate-y-0.5
                                    hover:border-primary/30
                                    hover:shadow-md
                                "
                            >
                                <CardContent className="p-0">

                                    <div className="grid gap-0 md:grid-cols-[1fr_260px]">

                                        {/* Información principal */}

                                        <div className="px-6 py-6">

                                            <div className="mb-4 flex flex-wrap items-center gap-2">

                                                <span className="text-lg font-bold text-primary">
                                                    {formatearFechaRestriccion(r.fecha)}
                                                </span>

                                                <Badge
                                                    variant="outline"
                                                    className="
                                                        rounded-full
                                                        border-border
                                                        bg-background
                                                        px-3
                                                        font-normal
                                                    "
                                                >
                                                    {r.tipoRestriccion?.nombre}
                                                </Badge>

                                                {!r.activo && (
                                                    <Badge
                                                        variant="destructive"
                                                        className="rounded-full"
                                                    >
                                                        Inactiva
                                                    </Badge>
                                                )}

                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                    Motivo
                                                </p>

                                                <p className="text-sm leading-7 text-foreground">
                                                    {r.motivo}
                                                </p>
                                            </div>

                                        </div>


                                        {/* Información de horario y alcance */}

                                        <div
                                            className="
                                                flex
                                                min-w-[230px]
                                                flex-col
                                                justify-center
                                                border-t
                                                border-border
                                                bg-muted/30
                                                px-6
                                                py-6
                                                text-left
                                                md:border-l
                                                md:border-t-0
                                                md:text-right
                                            "
                                        >

                                            <div className="mb-4">
                                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                    Horario afectado
                                                </p>

                                                <p className="text-sm font-semibold text-primary">
                                                    {textoHorarioRestriccion(r)}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                    Alcance
                                                </p>

                                                <p className="text-sm text-foreground">
                                                    {textoAlcanceRestriccion(r)}
                                                </p>
                                            </div>

                                        </div>

                                    </div>

                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

        </div>
    )
}