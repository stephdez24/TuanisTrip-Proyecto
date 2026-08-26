import { useState } from "react"
import { CalendarDays, Clock3, AlertTriangle, MapPin, UserRound } from "lucide-react"

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
    //Recordar qué fecha eligió el usuario en el selector
    const [fecha, setFecha] = useState(hoyISO())

    const { data, loading, error } = useFetch(
        () => citasService.agendaEmpleado(empleadoId, fecha),
        [empleadoId, fecha]
    )

    // El endpoint de agenda excluye a propósito las citas Canceladas y
    // Finalizadas (bloqueaDisponibilidad: false en el seed del backend) —
    // tiene sentido para "qué horarios están ocupados", pero como guía
    // también interesa ver que ALGO existió ese día aunque se haya
    // cancelado. Usamos listarPorEmpleado (trae todo, sin filtrar estado)
    // y filtramos por fecha acá, del lado del FrontEnd.
    const { data: todasMisCitas } = useFetch(
        () => citasService.listarPorEmpleado(empleadoId),
        [empleadoId]
    )

    const citasNoActivasEseDia = (todasMisCitas ?? []).filter(
        (c) => c.fecha === fecha && !c.estadoCita?.bloqueaDisponibilidad
    )

    if (!empleadoId) {
        return (
            <div className="mx-auto max-w-4xl px-5 py-10 sm:px-6 lg:px-8">
                <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
                    <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-destructive" />

                    <p className="font-medium text-foreground">
                        Esta sección es solo para guías con perfil de empleado activo.
                    </p>
                </div>
            </div>
        )
    }

    const agenda = data

    return (
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8">

            {/* =========================================================
                ENCABEZADO
            ========================================================= */}

            <div className="mb-8 flex flex-col gap-5 border-l-4 border-ring pl-5 md:flex-row md:items-end md:justify-between">

                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                        Mi agenda
                    </h1>

                    <p className="mt-1 max-w-2xl text-base leading-relaxed text-muted-foreground">
                        Tu horario, bloqueos y tours asignados para el día seleccionado.
                    </p>
                </div>

                <div className="w-full md:w-auto">
                    <Label
                        htmlFor="fecha-agenda"
                        className="mb-2 block text-sm font-medium text-foreground"
                    >
                        Fecha
                    </Label>

                    <div className="relative">
                        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <Input
                            id="fecha-agenda"
                            type="date"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            className="h-11 w-full rounded-xl border-border bg-card pl-10 md:w-52"
                        />
                    </div>
                </div>
            </div>


            {/* =========================================================
                ESTADOS DE CARGA Y ERROR
            ========================================================= */}

            {loading && (
                <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
                    <p className="text-muted-foreground">
                        Cargando agenda...
                    </p>
                </div>
            )}

            {error && (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
                    <AlertTriangle className="mx-auto mb-3 h-7 w-7 text-destructive" />

                    <p className="text-destructive">
                        No se pudo cargar la agenda: {error.message}
                    </p>
                </div>
            )}


            {agenda && (
                <div className="space-y-8">

                    {/* =========================================================
                        RESUMEN DEL DÍA
                    ========================================================= */}

                    <div className="grid gap-4 sm:grid-cols-2">

                        {/* Horario general */}

                        <Card className="overflow-hidden border-border bg-card shadow-sm">
                            <CardContent className="p-0">

                                <div className="border-b border-border bg-secondary/40 px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                                            <Clock3 className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <p className="font-semibold text-primary">
                                                Horario de atención
                                            </p>

                                            <p className="text-sm text-muted-foreground">
                                                Horario general del establecimiento
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-5 py-5">

                                    {agenda.horarios.length === 0 ? (
                                        <div className="rounded-xl bg-destructive/5 p-4">
                                            <p className="font-medium text-destructive">
                                                El establecimiento no atiende este día.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {agenda.horarios.map((h) => (
                                                <div
                                                    key={h.id}
                                                    className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3"
                                                >
                                                    <span className="text-sm text-muted-foreground">
                                                        Atención
                                                    </span>

                                                    <span className="font-semibold text-primary">
                                                        {h.horaInicio} – {h.horaFin}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                </div>
                            </CardContent>
                        </Card>


                        {/* Resumen de tours */}

                        <Card className="overflow-hidden border-border bg-card shadow-sm">
                            <CardContent className="p-0">

                                <div className="border-b border-border bg-secondary/40 px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                                            <CalendarDays className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <p className="font-semibold text-primary">
                                                Tours asignados
                                            </p>

                                            <p className="text-sm text-muted-foreground">
                                                Reservas activas para este día
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-5 py-5">
                                    <div className="flex items-center gap-3">
                                        <span className="text-4xl font-bold text-primary">
                                            {agenda.citas.length}
                                        </span>

                                        <span className="text-sm text-muted-foreground">
                                            {agenda.citas.length === 1
                                                ? "tour asignado"
                                                : "tours asignados"}
                                        </span>
                                    </div>
                                </div>

                            </CardContent>
                        </Card>

                    </div>


                    {/* =========================================================
                        RESTRICCIONES QUE AFECTAN AL GUÍA
                    ========================================================= */}

                    {agenda.restricciones.length > 0 && (
                        <section>

                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-primary">
                                    Bloqueos este día
                                </h2>

                                <p className="text-sm text-muted-foreground">
                                    Restricciones que afectan tu disponibilidad.
                                </p>
                            </div>

                            <div className="space-y-3">

                                {agenda.restricciones.map((r) => (
                                    <Card
                                        key={r.id}
                                        className="overflow-hidden border-destructive/25 bg-card shadow-sm"
                                    >
                                        <CardContent className="p-0">

                                            <div className="flex flex-col gap-4 border-l-4 border-destructive px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                                                <div className="flex items-start gap-3">

                                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                                                        <AlertTriangle className="h-4 w-4 text-destructive" />
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-foreground">
                                                            {r.motivo}
                                                        </p>

                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                            {r.empleadoId
                                                                ? "Bloqueo específico para ti"
                                                                : "General (todo el establecimiento)"}
                                                        </p>
                                                    </div>

                                                </div>

                                                <Badge
                                                    variant="destructive"
                                                    className="w-fit shrink-0 rounded-full px-3 py-1"
                                                >
                                                    {textoHorarioRestriccion(r)}
                                                </Badge>

                                            </div>

                                        </CardContent>
                                    </Card>
                                ))}

                            </div>

                        </section>
                    )}


                    {/* =========================================================
                        TOURS ASIGNADOS
                    ========================================================= */}

                    <section>

                        <div className="mb-5">
                            <h2 className="text-xl font-bold text-primary">
                                Tours asignados
                                <span className="ml-2 text-base font-medium text-muted-foreground">
                                    ({agenda.citas.length})
                                </span>
                            </h2>

                            <p className="text-sm text-muted-foreground">
                                Reservas que ocupan tu horario durante el día.
                            </p>
                        </div>


                        {agenda.citas.length === 0 ? (

                            <Card className="border-border bg-card shadow-sm">
                                <CardContent className="p-10 text-center">

                                    <CalendarDays className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />

                                    <p className="font-medium text-foreground">
                                        No tienes tours asignados para este día.
                                    </p>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Puedes seleccionar otra fecha para consultar tu agenda.
                                    </p>

                                </CardContent>
                            </Card>

                        ) : (

                            <div className="space-y-4">

                                {agenda.citas.map((cita) => (

                                    <Card
                                        key={cita.id}
                                        className="overflow-hidden border-border bg-card shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md"
                                    >
                                        <CardContent className="p-0">

                                            <div className="flex flex-col md:flex-row">

                                                {/* Hora */}

                                                <div className="flex min-w-[150px] items-center border-b border-border bg-secondary/40 px-5 py-5 md:border-b-0 md:border-r">

                                                    <div>
                                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                            Horario
                                                        </p>

                                                        <p className="mt-1 text-lg font-bold text-primary">
                                                            {cita.horaInicio}
                                                        </p>

                                                        <p className="text-sm text-muted-foreground">
                                                            hasta {cita.horaFin}
                                                        </p>
                                                    </div>

                                                </div>


                                                {/* Información del tour */}

                                                <div className="flex flex-1 flex-col justify-between gap-4 px-5 py-5 sm:flex-row sm:items-center">

                                                    <div className="min-w-0">

                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 shrink-0 text-ring" />

                                                            <h3 className="font-bold text-foreground">
                                                                {cita.servicio.nombre}
                                                            </h3>
                                                        </div>

                                                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                                            <UserRound className="h-4 w-4" />

                                                            <span>
                                                                Cliente:{" "}
                                                                <span className="font-medium text-foreground">
                                                                    {cita.cliente.nombre}{" "}
                                                                    {cita.cliente.primerApellido}
                                                                </span>
                                                            </span>
                                                        </div>

                                                    </div>


                                                    {/* Estado */}

                                                    <Badge
                                                        className={`w-fit shrink-0 rounded-full px-3 py-1 ${clasesEstadoColor(
                                                            cita.estadoCita.color
                                                        )}`}
                                                    >
                                                        {cita.estadoCita.nombre}
                                                    </Badge>

                                                </div>

                                            </div>

                                        </CardContent>
                                    </Card>

                                ))}

                            </div>

                        )}

                    </section>


                    {/* =========================================================
                        CITAS QUE YA NO OCUPAN HORARIO
                    ========================================================= */}

                    {citasNoActivasEseDia.length > 0 && (
                        <section>

                            <div className="mb-5">
                                <h2 className="text-xl font-bold text-muted-foreground">
                                    Otras citas de este día
                                </h2>

                                <p className="text-sm text-muted-foreground">
                                    Citas canceladas o finalizadas que ya no ocupan horario.
                                </p>
                            </div>

                            <div className="space-y-3">

                                {citasNoActivasEseDia.map((cita) => (

                                    <Card
                                        key={cita.id}
                                        className="border-border bg-muted/20 opacity-80"
                                    >
                                        <CardContent className="p-0">

                                            <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                                                <div>

                                                    <p className="font-semibold text-foreground">
                                                        {cita.servicio?.nombre}
                                                    </p>

                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Cliente:{" "}
                                                        {cita.cliente?.nombre}{" "}
                                                        {cita.cliente?.primerApellido}
                                                    </p>

                                                </div>

                                                <div className="flex items-center gap-3 sm:text-right">

                                                    <p className="text-sm font-medium text-muted-foreground">
                                                        {cita.horaInicio} – {cita.horaFin}
                                                    </p>

                                                    <Badge
                                                        className={clasesEstadoColor(
                                                            cita.estadoCita?.color
                                                        )}
                                                    >
                                                        {cita.estadoCita?.nombre}
                                                    </Badge>

                                                </div>

                                            </div>

                                        </CardContent>
                                    </Card>

                                ))}

                            </div>

                        </section>
                    )}

                </div>
            )}

        </div>
    )
}