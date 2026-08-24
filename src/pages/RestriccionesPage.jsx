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
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-primary">
                    Bloqueos y temporadas especiales
                </h1>
                <p className="text-muted-foreground">
                    Fechas y horarios en los que el establecimiento o un guía en
                    particular no está disponible para reservas.
                </p>
            </div>

            <div className="flex gap-2">
                {FILTROS.map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setFiltro(f.id)}
                        className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                            filtro === f.id
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background text-foreground border-input hover:bg-secondary/50"
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {loading && (
                <p className="text-muted-foreground">Cargando restricciones...</p>
            )}
            {error && (
                <p className="text-destructive">
                    No se pudieron cargar las restricciones: {error.message}
                </p>
            )}

            {!loading && !error && restriccionesFiltradas.length === 0 && (
                <p className="text-muted-foreground">
                    No hay restricciones registradas para este filtro.
                </p>
            )}

            <div className="space-y-3">
                {restriccionesFiltradas.map((r) => (
                    <Link key={r.id} to={`/restricciones/${r.id}`}>
                        <Card className="hover:border-primary/50 transition-colors">
                            <CardContent className="p-4 flex items-center justify-between gap-4">
                                <div className="space-y-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-primary">
                                            {formatearFechaRestriccion(r.fecha)}
                                        </span>
                                        <Badge variant="outline">
                                            {r.tipoRestriccion?.nombre}
                                        </Badge>
                                        {!r.activo && (
                                            <Badge variant="destructive">Inactiva</Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {r.motivo}
                                    </p>
                                </div>
                                <div className="text-right shrink-0 text-sm">
                                    <p className="font-medium">
                                        {textoHorarioRestriccion(r)}
                                    </p>
                                    <p className="text-muted-foreground">
                                        {textoAlcanceRestriccion(r)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}