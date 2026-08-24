import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { useAuth } from "@/auth/useAuth"
import { useFetch } from "@/lib/useFetch"
import { sumarMinutos, minutosDesdeMedianoche } from "@/lib/horario"
import { reservaSchema } from "@/schemas/reservaSchemas"

import { citasService } from "@/services/citasService"
import { usuariosService } from "@/services/usuariosService"
import { serviciosService } from "@/services/serviciosService"
import { extrasService } from "@/services/extrasService"
import { empleadosService } from "@/services/empleadosService"
import { estadosCitaService } from "@/services/estadosCitaService"
import { horariosService } from "@/services/horariosService"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReservaFormPage() {
    const { id } = useParams()
    const esEdicion = Boolean(id)
    const { user } = useAuth()
    const navigate = useNavigate()

    const [enviando, setEnviando] = useState(false)
    const [cargandoCita, setCargandoCita] = useState(esEdicion)
    // null = todavía no se ha consultado; { disponible, motivo } = resultado real
    const [disponibilidad, setDisponibilidad] = useState(null)
    const [consultandoDisponibilidad, setConsultandoDisponibilidad] = useState(false)

    // ---- Catálogos ----
    const { data: clientes } = useFetch(() => usuariosService.listar("Cliente"), [])
    const { data: tours } = useFetch(() => serviciosService.listarActivos(), [])
    const { data: extras } = useFetch(() => extrasService.listarActivos(), [])
    const { data: estados } = useFetch(() => estadosCitaService.listar(), [])
    const { data: horarios } = useFetch(() => horariosService.listar(), [])

    const form = useForm({
        resolver: zodResolver(reservaSchema),
        defaultValues: {
            clienteId: "",
            servicioId: "",
            empleadoId: "",
            fecha: "",
            horaInicio: "",
            adicionalIds: [],
            observaciones: "",
            duracionMinutos: 0,
            horaFin: "",
            precioServicio: 0,
            costoAdicionales: 0,
            costoTotal: 0,
        },
    })

    const servicioId = useWatch({ control: form.control, name: "servicioId" })
    const empleadoId = useWatch({ control: form.control, name: "empleadoId" })
    const fecha = useWatch({ control: form.control, name: "fecha" })
    const horaInicio = useWatch({ control: form.control, name: "horaInicio" })
    const adicionalIds = useWatch({ control: form.control, name: "adicionalIds" })

    // Guías filtrados: solo los que SÍ pueden atender el tour seleccionado
    // (el API mismo hace este filtro con ?servicioId=, no lo hacemos a mano).
    const { data: empleadosDisponibles, loading: cargandoEmpleados } = useFetch(
        () => (servicioId ? empleadosService.listarActivos(servicioId) : Promise.resolve({ data: [] })),
        [servicioId]
    )

    // Agenda del guía en la fecha elegida — solo para MOSTRAR ocupación,
    // la validación real la hace igual el endpoint de disponibilidad.
    const { data: agenda } = useFetch(
        () =>
            empleadoId && fecha
                ? citasService.agendaEmpleado(empleadoId, fecha)
                : Promise.resolve({ data: null }),
        [empleadoId, fecha]
    )

    // --- En modo edición: cargar la cita existente ---
    useEffect(() => {
        if (!esEdicion) return

        citasService
            .obtenerPorId(id)
            .then((response) => {
                const cita = response.data
                form.reset({
                    clienteId: cita.clienteId,
                    servicioId: cita.servicioId,
                    empleadoId: cita.empleadoId,
                    fecha: cita.fecha.slice(0, 10),
                    horaInicio: cita.horaInicio,
                    adicionalIds: cita.adicionales?.map((a) => a.id) ?? [],
                    observaciones: cita.observaciones ?? "",
                    duracionMinutos: cita.duracionMinutos,
                    horaFin: cita.horaFin,
                    precioServicio: cita.precioServicio,
                    costoAdicionales: cita.costoAdicionales,
                    costoTotal: cita.costoTotal,
                })
            })
            .catch((err) => {
                toast.error(err.message || "No se pudo cargar la reserva")
                navigate("/reservas")
            })
            .finally(() => setCargandoCita(false))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, esEdicion])

    // --- Recalcular precio/duración cuando cambia el tour ---
    useEffect(() => {
        const tour = tours?.find((t) => t.id === Number(servicioId))
        if (!tour) return

        form.setValue("precioServicio", tour.precioBase)
        form.setValue("duracionMinutos", tour.duracionMinutos)
        // Si el guía que estaba elegido ya no puede atender el nuevo tour,
        // lo limpiamos para forzar a elegir uno válido.
        form.setValue("empleadoId", "")
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [servicioId, tours])

    // --- Recalcular costo de extras cuando cambia la selección ---
    useEffect(() => {
        const total = (adicionalIds ?? []).reduce((suma, extraId) => {
            const extra = extras?.find((e) => e.id === extraId)
            return suma + (extra ? Number(extra.precio) : 0)
        }, 0)
        form.setValue("costoAdicionales", total)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [adicionalIds, extras])

    // --- Recalcular hora de fin cuando cambia hora de inicio o duración ---
    const duracionMinutos = useWatch({ control: form.control, name: "duracionMinutos" })
    useEffect(() => {
        if (!horaInicio || !duracionMinutos) return
        form.setValue("horaFin", sumarMinutos(horaInicio, duracionMinutos))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [horaInicio, duracionMinutos])

    // --- Costo total = precio del tour + extras ---
    const precioServicio = useWatch({ control: form.control, name: "precioServicio" })
    const costoAdicionales = useWatch({ control: form.control, name: "costoAdicionales" })
    useEffect(() => {
        form.setValue("costoTotal", Number(precioServicio) + Number(costoAdicionales))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [precioServicio, costoAdicionales])

    // --- Consultar disponibilidad real cada vez que cambian los datos clave ---
    const horaFin = useWatch({ control: form.control, name: "horaFin" })
    useEffect(() => {
        // Limpiamos el resultado anterior ANTES de la consulta nueva (patrón
        // estándar de "descartar resultado obsoleto mientras se recarga").
        // El setState es síncrono a propósito — la regla del compiler no
        // puede distinguir este caso legítimo del problemático.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDisponibilidad(null)
        if (!empleadoId || !servicioId || !fecha || !horaInicio || !horaFin) return

        // Chequeo proactivo ANTES de llamar al API: si la hora de fin quedó
        // "antes" que la de inicio (en minutos desde medianoche), significa
        // que el tour cruzaría a la madrugada del día siguiente — algo que
        // el modelo de citas no soporta (fecha/hora son de un solo día). Es
        // justo lo que el backend rechaza con el mensaje genérico de
        // "Datos de entrada inválidos"; lo detectamos antes para dar un
        // mensaje que sí explique qué pasó.
        if (minutosDesdeMedianoche(horaFin) <= minutosDesdeMedianoche(horaInicio)) {
            setDisponibilidad({
                disponible: false,
                motivo:
                    "Con esa hora de inicio, el tour terminaría después de medianoche. Elige una hora más temprana.",
            })
            return
        }

        setConsultandoDisponibilidad(true)
        citasService
            .disponibilidad({
                empleadoId: Number(empleadoId),
                servicioId: Number(servicioId),
                fecha,
                horaInicio,
                horaFin,
                // Solo se manda si aplica: en creación no existe cita que
                // excluir, y algunos schemas de Zod rechazan "null" cuando
                // el campo es .optional() sin .nullable().
                ...(esEdicion ? { citaIdExcluir: Number(id) } : {}),
            })
            .then((response) => setDisponibilidad(response.data))
            .catch((err) => {
                // Traducimos el mensaje genérico de validación a algo que
                // la persona pueda entender sin saber qué es un "schema".
                const esGenerico = /datos de entrada inv[aá]lidos/i.test(err.message)
                setDisponibilidad({
                    disponible: false,
                    motivo: esGenerico
                        ? "El horario elegido no es válido para este tour. Revisa la hora y la fecha."
                        : err.message,
                })
            })
            .finally(() => setConsultandoDisponibilidad(false))
    }, [empleadoId, servicioId, fecha, horaInicio, horaFin, esEdicion, id])

    const tourSeleccionado = useMemo(
        () => tours?.find((t) => t.id === Number(servicioId)),
        [tours, servicioId]
    )

    const costoTotal = useWatch({ control: form.control, name: "costoTotal" })

    // Traduce la fecha elegida a nombre de día en español, y busca el
    // horario de atención de ESE día específico en el catálogo del API
    // (no asumimos nada fijo, cada día puede tener su propio rango u
    // estar inactivo).
    const DIAS_SEMANA = [
        "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado",
    ]
    const horarioDelDia = useMemo(() => {
        if (!fecha || !horarios) return null
        const diaSemana = DIAS_SEMANA[new Date(fecha + "T00:00:00").getDay()]
        return horarios.find((h) => h.diaSemana?.nombre === diaSemana) ?? null
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fecha, horarios])

    async function onSubmit(valores) {
        if (disponibilidad && !disponibilidad.disponible) {
            toast.error("No se puede guardar: el horario elegido no está disponible.")
            return
        }

        setEnviando(true)
        try {
            if (esEdicion) {
                // El API NO permite tocar estadoCitaId/creadoPorUsuarioId en un PUT.
                await citasService.actualizar(id, valores)
                toast.success("Reserva actualizada correctamente")
            } else {
                const pendiente = estados?.find((e) => e.nombre === "Pendiente")
                if (!pendiente) {
                    toast.error("No se encontró el estado 'Pendiente' en el sistema.")
                    return
                }
                await citasService.crear({
                    ...valores,
                    estadoCitaId: pendiente.id,
                    creadoPorUsuarioId: user.id,
                })
                toast.success("Reserva creada correctamente")
            }
            navigate("/reservas")
        } catch (err) {
            toast.error(err.message || "No se pudo guardar la reserva")
        } finally {
            setEnviando(false)
        }
    }

    if (cargandoCita) {
        return <p className="mx-auto max-w-2xl px-4 py-12 text-center">Cargando reserva...</p>
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-10">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">
                        {esEdicion ? "Editar reserva" : "Nueva reserva"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <FormField
                                control={form.control}
                                name="clienteId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cliente</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value ? String(field.value) : ""}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Selecciona un cliente">
                                                        {(value) => {
                                                            if (!value) return "Selecciona un cliente"
                                                            const c = clientes?.find((c) => String(c.id) === value)
                                                            return c ? `${c.nombre} ${c.primerApellido}` : null
                                                        }}
                                                    </SelectValue>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {clientes?.map((c) => (
                                                    <SelectItem key={c.id} value={String(c.id)}>
                                                        {c.nombre} {c.primerApellido} — {c.correo}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="servicioId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tour</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value ? String(field.value) : ""}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Selecciona un tour">
                                                        {(value) =>
                                                            !value
                                                                ? "Selecciona un tour"
                                                                : tours?.find((t) => String(t.id) === value)?.nombre
                                                        }
                                                    </SelectValue>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {tours?.map((t) => (
                                                    <SelectItem key={t.id} value={String(t.id)}>
                                                        {t.nombre} — {t.duracionMinutos} min
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Extras: checkboxes, igual patrón que servicioIds en GuiaFormPage */}
                            <FormField
                                control={form.control}
                                name="adicionalIds"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Extras (opcional)</FormLabel>
                                        <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
                                            {extras?.length === 0 && (
                                                <p className="text-sm text-muted-foreground">
                                                    No hay extras activos todavía.
                                                </p>
                                            )}
                                            {extras?.map((extra) => {
                                                const seleccionado = field.value.includes(extra.id)
                                                return (
                                                    <label
                                                        key={extra.id}
                                                        className="flex cursor-pointer items-center justify-between gap-2 text-sm"
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <Checkbox
                                                                checked={seleccionado}
                                                                onCheckedChange={(marcado) => {
                                                                    field.onChange(
                                                                        marcado
                                                                            ? [...field.value, extra.id]
                                                                            : field.value.filter((v) => v !== extra.id)
                                                                    )
                                                                }}
                                                            />
                                                            {extra.nombre}
                                                        </span>
                                                        <span className="text-muted-foreground">
                                                            ₡{Number(extra.precio).toLocaleString("es-CR")}
                                                        </span>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="empleadoId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Guía</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value ? String(field.value) : ""}
                                            disabled={!servicioId || cargandoEmpleados}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue
                                                        placeholder={
                                                            servicioId
                                                                ? "Selecciona un guía"
                                                                : "Primero elige un tour"
                                                        }
                                                    >
                                                        {(value) => {
                                                            if (!value) {
                                                                return servicioId
                                                                    ? "Selecciona un guía"
                                                                    : "Primero elige un tour"
                                                            }
                                                            const e = empleadosDisponibles?.find(
                                                                (e) => String(e.id) === value
                                                            )
                                                            return e
                                                                ? `${e.usuario?.nombre} ${e.usuario?.primerApellido}`
                                                                : null
                                                        }}
                                                    </SelectValue>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {empleadosDisponibles?.map((e) => (
                                                    <SelectItem key={e.id} value={String(e.id)}>
                                                        {e.usuario?.nombre} {e.usuario?.primerApellido}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {servicioId && !cargandoEmpleados && empleadosDisponibles?.length === 0 && (
                                            <p className="text-sm text-muted-foreground">
                                                Ningún guía activo puede atender este tour todavía.
                                            </p>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="fecha"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    min={new Date().toISOString().slice(0, 10)}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="horaInicio"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Hora de inicio</FormLabel>
                                            <FormControl>
                                                <Input type="time" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Horario del establecimiento para el día elegido — aviso
                                PROACTIVO, antes de que la persona intente una hora inválida. */}
                            {fecha && (
                                <p className="text-sm text-muted-foreground">
                                    {horarioDelDia?.activo
                                        ? `Horario de atención ese día: ${horarioDelDia.horaInicio} – ${horarioDelDia.horaFin}`
                                        : "El establecimiento no atiende en la fecha seleccionada."}
                                </p>
                            )}

                            {/* Agenda del guía ese día — solo informativa */}
                            {empleadoId && fecha && agenda && (
                                <div className="rounded-lg border p-3 text-sm">
                                    <p className="mb-2 font-medium">
                                        Agenda de {agenda.empleado?.usuario?.nombre} el{" "}
                                        {new Date(fecha + "T00:00:00").toLocaleDateString("es-CR")}
                                    </p>
                                    {agenda.citas?.length > 0 ? (
                                        <ul className="space-y-1 text-muted-foreground">
                                            {agenda.citas.map((c) => (
                                                <li key={c.id}>
                                                    {c.horaInicio}–{c.horaFin}: ocupado ({c.servicio?.nombre})
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-muted-foreground">Sin citas registradas ese día.</p>
                                    )}
                                    {agenda.restricciones?.length > 0 && (
                                        <ul className="mt-1 space-y-1 text-destructive">
                                            {agenda.restricciones.map((r) => (
                                                <li key={r.id}>
                                                    Restricción: {r.todoElDia ? "Todo el día" : `${r.horaInicio}–${r.horaFin}`}{" "}
                                                    ({r.motivo})
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            {/* Resultado de disponibilidad en tiempo real */}
                            {consultandoDisponibilidad && (
                                <p className="text-sm text-muted-foreground">Verificando disponibilidad...</p>
                            )}
                            {!consultandoDisponibilidad && disponibilidad && (
                                <p
                                    className={
                                        disponibilidad.disponible
                                            ? "text-sm font-medium text-green-600"
                                            : "text-sm font-medium text-destructive"
                                    }
                                >
                                    {disponibilidad.disponible
                                        ? "Horario disponible."
                                        : `No disponible: ${disponibilidad.motivo}`}
                                </p>
                            )}

                            <FormField
                                control={form.control}
                                name="observaciones"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Observaciones (opcional)</FormLabel>
                                        <FormControl>
                                            <Textarea rows={3} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Resumen de costo y duración — recalculado en cada cambio */}
                            {tourSeleccionado && (
                                <div className="rounded-lg border p-3 text-sm">
                                    <div className="flex justify-between">
                                        <span>Precio del tour</span>
                                        <span>₡{Number(precioServicio).toLocaleString("es-CR")}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Extras</span>
                                        <span>₡{Number(costoAdicionales).toLocaleString("es-CR")}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Duración</span>
                                        <span>{duracionMinutos} minutos</span>
                                    </div>
                                    {horaInicio && horaFin && (
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Horario</span>
                                            <span>{horaInicio} – {horaFin}</span>
                                        </div>
                                    )}
                                    <div className="mt-1 flex justify-between border-t pt-1 text-base font-semibold">
                                        <span>Total</span>
                                        <span>₡{Number(costoTotal).toLocaleString("es-CR")}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="submit"
                                    disabled={enviando || (disponibilidad && !disponibilidad.disponible)}
                                    className="flex-1"
                                >
                                    {enviando
                                        ? "Guardando..."
                                        : esEdicion
                                            ? "Guardar cambios"
                                            : "Crear reserva"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate("/reservas")}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}