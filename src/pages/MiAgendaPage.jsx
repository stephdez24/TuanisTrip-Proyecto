import { useState } from "react"
import { citasService } from "@/services/citasService"
import { useAuth } from "@/auth/useAuth"
import { useFetch } from "@/lib/useFetch"
import { textoHorarioRestriccion } from "@/lib/restriccionTexto"
import { clasesEstadoColor } from "@/lib/estadoColor"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// "Mi agenda" del Guía autenticado. El enunciado dice que la agenda del
// empleado va "integrada al registro y edición de citas" — ya la tenemos ahí
// (ReservaFormPage la consulta al elegir guía+fecha). Esta pantalla es un
// complemento: le da al Guía una forma directa de ver su propio día sin
// tener que fingir que va a crear una reserva nueva solo para consultarlo.

function hoyISO() {
    const hoy = new Date()
    const yyyy = hoy.getFullYear()
    const mm = String(hoy.getMonth() + 1).padStart(2, "0")
    const dd = String(hoy.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
}

export default function MiAgendaPage() {
    const { empleadoId } = useAuth()
    const [fecha, setFecha] = useState(hoyISO())

    const { data, loading, error } = useFetch(
        () => citasService.agendaEmpleado(empleadoId, fecha),
        [empleadoId, fecha]
    )

    if (!empleadoId) {
        return (
            <div className="max-w-3xl mx-auto p-6">
                <p className="text-muted-foreground">
                    Esta sección es solo para guías con perfil de empleado activo.
                </p>
            </div>
        )
    }

    const agenda = data

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <div className="flex items-end justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Mi agenda</h1>
                    <p className="text-muted-foreground">
                        Tu horario, bloqueos y tours asignados para el día seleccionado.
                    </p>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="fecha-agenda">Fecha</Label>
                    <Input
                        id="fecha-agenda"
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        className="w-48"
                    />
                </div>
            </div>

            {loading && <p className="text-muted-foreground">Cargando agenda...</p>}
            {error && (
                <p className="text-destructive">
                    No se pudo cargar la agenda: {error.message}
                </p>
            )}

            {agenda && (
                <>
                    {/* Horario general del establecimiento ese día */}
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground mb-1">
                                Horario de atención del establecimiento
                            </p>
                            {agenda.horarios.length === 0 ? (
                                <p className="font-medium text-destructive">
                                    El establecimiento no atiende este día.
                                </p>
                            ) : (
                                agenda.horarios.map((h) => (
                                    <p key={h.id} className="font-medium">
                                        {h.horaInicio} – {h.horaFin}
                                    </p>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Restricciones que te afectan ese día (generales o tuyas) */}
                    {agenda.restricciones.length > 0 && (
                        <div className="space-y-2">
                            <h2 className="font-semibold text-primary">
                                Bloqueos este día
                            </h2>
                            {agenda.restricciones.map((r) => (
                                <Card key={r.id} className="border-destructive/30">
                                    <CardContent className="p-3 flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-medium">{r.motivo}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {r.empleadoId
                                                    ? "Bloqueo específico para ti"
                                                    : "General (todo el establecimiento)"}
                                            </p>
                                        </div>
                                        <Badge variant="destructive">
                                            {textoHorarioRestriccion(r)}
                                        </Badge>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Tours asignados ese día */}
                    <div className="space-y-2">
                        <h2 className="font-semibold text-primary">
                            Tours asignados ({agenda.citas.length})
                        </h2>
                        {agenda.citas.length === 0 ? (
                            <p className="text-muted-foreground">
                                No tienes tours asignados para este día.
                            </p>
                        ) : (
                            agenda.citas.map((cita) => (
                                <Card key={cita.id}>
                                    <CardContent className="p-4 flex items-center justify-between gap-4">
                                        <div>
                                            <p className="font-semibold">{cita.servicio.nombre}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Cliente: {cita.cliente.nombre} {cita.cliente.primerApellido}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">
                                                {cita.horaInicio} – {cita.horaFin}
                                            </p>
                                            <Badge className={clasesEstadoColor(cita.estadoCita.color)}>
                                                {cita.estadoCita.nombre}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    )
}