import { useState } from "react"
import { Link } from "react-router-dom"
import { citasService } from "@/services/citasService"
import { useFetch } from "@/lib/useFetch"
import { generarSlots, estadoCelda } from "@/lib/agendaDiaria"
import { clasesEstadoColor } from "@/lib/estadoColor"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

function hoyISO() {
    const hoy = new Date()
    const yyyy = hoy.getFullYear()
    const mm = String(hoy.getMonth() + 1).padStart(2, "0")
    const dd = String(hoy.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
}

export default function AgendaDiariaPage() {
    const [fecha, setFecha] = useState(hoyISO())
    const { data: agenda, loading, error } = useFetch(
        () => citasService.agendaDiaria(fecha),
        [fecha]
    )

    const slots = agenda ? generarSlots(agenda.horarios) : []

    return (
        <div className="mx-auto max-w-7xl space-y-6 p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="border-l-4 border-ring pl-4">
                    <h1 className="text-2xl font-bold text-primary">
                        Agenda del día
                    </h1>
                    <p className="text-muted-foreground">
                        Distribución de tours por guía para la fecha seleccionada.
                    </p>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="fecha-agenda-diaria">Fecha</Label>
                    <Input
                        id="fecha-agenda-diaria"
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        className="w-48"
                    />
                </div>
            </div>

            {/* Leyenda: mismos tonos exactos que usan las celdas reales de
                abajo, para que no haya desajuste visual entre ambos. */}
            <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm border border-border bg-secondary/50" /> Disponible
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm border border-green-300 bg-green-100 dark:border-green-700 dark:bg-green-950" /> Tour asignado
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm border border-destructive/30 bg-destructive/10" /> Restricción
                </span>
            </div>

            {loading && <p className="text-muted-foreground">Cargando agenda...</p>}
            {error && (
                <p className="text-destructive">
                    No se pudo cargar la agenda: {error.message}
                </p>
            )}

            {agenda && slots.length === 0 && (
                <p className="text-muted-foreground">
                    El establecimiento no atiende este día.
                </p>
            )}

            {agenda && slots.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-secondary">
                                <th className="sticky left-0 z-10 min-w-27.5 border-b border-r border-border bg-secondary p-2 text-left font-semibold text-secondary-foreground">
                                    Hora
                                </th>
                                {agenda.empleados.map((empleado) => (
                                    <th
                                        key={empleado.id}
                                        className="min-w-47.5 border-b border-border p-2 text-left font-semibold text-secondary-foreground"
                                    >
                                        {empleado.usuario.nombre} {empleado.usuario.primerApellido}
                                        <p className="text-xs font-normal text-secondary-foreground/70">
                                            {empleado.especialidad?.nombre}
                                        </p>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {slots.map((slot) => (
                                <tr key={slot.etiqueta}>
                                    <td className="sticky left-0 z-10 border-b border-r border-border bg-card p-2 font-medium">
                                        {slot.etiqueta}
                                    </td>
                                    {agenda.empleados.map((empleado) => {
                                        const celda = estadoCelda(
                                            slot,
                                            empleado,
                                            agenda.restriccionesGenerales
                                        )
                                        return (
                                            <td
                                                key={empleado.id}
                                                className="border-b border-border p-1.5 align-top"
                                            >
                                                {celda.tipo === "disponible" && (
                                                    <div className="rounded-md bg-secondary/50 px-2 py-1.5 text-xs text-muted-foreground">
                                                        Disponible
                                                    </div>
                                                )}

                                                {celda.tipo === "restriccion" && (
                                                    <div className="rounded-md bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
                                                        Restricción
                                                        <p className="truncate text-destructive/80">
                                                            {celda.motivo}
                                                        </p>
                                                    </div>
                                                )}

                                                {celda.tipo === "cita" && (
                                                    <Link
                                                        to={`/reservas/${celda.cita.id}`}
                                                        className="block rounded-md border border-green-300 bg-green-100 px-2 py-1.5 text-xs transition-colors hover:bg-green-200 dark:border-green-700 dark:bg-green-950 dark:hover:bg-green-900"
                                                    >
                                                        <p className="truncate font-semibold text-green-900 dark:text-green-300">
                                                            {celda.cita.servicio.nombre}
                                                        </p>
                                                        <p className="truncate text-green-800/70 dark:text-green-400/70">
                                                            {celda.cita.cliente.nombre}{" "}
                                                            {celda.cita.cliente.primerApellido}
                                                        </p>
                                                        <Badge
                                                            className={`mt-1 ${clasesEstadoColor(
                                                                celda.cita.estadoCita.color
                                                            )}`}
                                                        >
                                                            {celda.cita.estadoCita.nombre}
                                                        </Badge>
                                                    </Link>
                                                )}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}