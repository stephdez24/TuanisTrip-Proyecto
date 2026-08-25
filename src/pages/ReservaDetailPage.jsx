import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { Wallet, Tag } from "lucide-react"

import { useAuth } from "@/auth/useAuth"
import { useFetch } from "@/lib/useFetch"
import { citasService } from "@/services/citasService"
import { estadosCitaService } from "@/services/estadosCitaService"
import { clasesEstadoColor } from "@/lib/estadoColor"
import { formatearFechaLarga } from "@/lib/fecha"
import { imagenesService } from "@/services/imagenesService"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog"

const IMAGEN_POR_DEFECTO =
    "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200&auto=format&fit=crop"

export default function ReservaDetailPage() {
    const { id } = useParams()
    const { rol } = useAuth()
    const esAdmin = rol === "Administrador"
    const esEmpleado = rol === "Empleado"
    const esStaff = esAdmin || esEmpleado
    const navigate = useNavigate()

    const [motivoCancelacion, setMotivoCancelacion] = useState("")
    const [cancelando, setCancelando] = useState(false)
    const [dialogoAbierto, setDialogoAbierto] = useState(false)

    const {
        data: cita,
        loading,
        error,
    } = useFetch(() => citasService.obtenerPorId(id), [id])

    // Solo el staff necesita el catálogo completo de estados para el
    // selector de "cambiar estado" — un Cliente nunca ve ese control.
    const { data: estados } = useFetch(
        () => (esStaff ? estadosCitaService.listar() : Promise.resolve({ data: [] })),
        [esStaff]
    )

    async function handleCancelar() {
        if (motivoCancelacion.trim().length < 5) {
            toast.error("El motivo debe tener al menos 5 caracteres")
            return
        }
        setCancelando(true)
        try {
            await citasService.cancelar(id, motivoCancelacion.trim())
            toast.success("Reserva cancelada")
            setDialogoAbierto(false)
            navigate(0) // recarga para reflejar el nuevo estado
        } catch (err) {
            toast.error(err.message || "No se pudo cancelar la reserva")
        } finally {
            setCancelando(false)
        }
    }

    async function handleCambiarEstado(nuevoEstadoId) {
        try {
            await citasService.cambiarEstado(id, Number(nuevoEstadoId))
            toast.success("Estado actualizado")
            navigate(0)
        } catch (err) {
            toast.error(err.message || "No se pudo cambiar el estado")
        }
    }

    if (loading) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-10">
                <Skeleton className="h-96 w-full rounded-xl" />
            </div>
        )
    }

    if (error || !cita) {
        return (
            <div className="mx-auto max-w-md px-4 py-16 text-center">
                <p className="text-destructive">No se pudo cargar esta reserva.</p>
                <Button asChild variant="outline" className="mt-4">
                    <Link to="/reservas">Volver a Reservas</Link>
                </Button>
            </div>
        )
    }

    // Estos tres flags vienen directo del estado actual de la cita (el API
    // ya los trae listos desde el seed) — no hardcodeamos reglas aquí.
    const puedeCancelarCliente = !esStaff && cita.estadoCita?.permiteCancelacionCliente
    const puedeCancelarStaff = esStaff && cita.estadoCita?.bloqueaDisponibilidad
    const puedeCancelar = puedeCancelarCliente || puedeCancelarStaff
    const puedeEditar = esStaff && cita.estadoCita?.permiteEdicion

    return (
        <div className="mx-auto max-w-2xl px-4 py-10">
            <Card className="overflow-hidden pt-0">
                {/* La cita ya trae el servicio completo — reutilizamos la
                    misma foto del tour que usa TourDetailPage.jsx, así la
                    reserva se siente conectada visualmente con lo que en
                    verdad se va a hacer, no solo un banner genérico. */}
                <div className="relative">
                    <img
                        src={imagenesService.urlDescarga(cita.servicio?.imagen) || IMAGEN_POR_DEFECTO}
                        alt={cita.servicio?.nombre}
                        className="h-56 w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

                    <Badge className={`absolute right-3 top-3 ${clasesEstadoColor(cita.estadoCita?.color)}`}>
                        {cita.estadoCita?.nombre}
                    </Badge>

                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                        <h1 className="text-xl font-bold">{cita.servicio?.nombre}</h1>
                        <p className="text-sm text-white/85">
                            {formatearFechaLarga(cita.fecha)} · {cita.horaInicio} - {cita.horaFin}
                        </p>
                    </div>
                </div>

                <CardContent className="divide-y divide-border p-0">
                    <div className="grid grid-cols-2 gap-4 px-5 py-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Cliente</p>
                            <p className="font-medium">
                                {cita.cliente?.nombre} {cita.cliente?.primerApellido}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Guía</p>
                            <p className="font-medium">
                                {cita.empleado?.usuario?.nombre} {cita.empleado?.usuario?.primerApellido}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Duración</p>
                            <p className="font-medium">{cita.duracionMinutos} minutos</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Precio del tour</p>
                            <p className="font-medium">
                                ₡{Number(cita.precioServicio).toLocaleString("es-CR")}
                            </p>
                        </div>
                    </div>

                    {cita.adicionales?.length > 0 && (
                        <div className="px-5 py-4">
                            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-primary">
                                <Tag className="h-4 w-4" />
                                Extras seleccionados
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {cita.adicionales.map((extra) => (
                                    <span
                                        key={extra.id}
                                        className="rounded-full border border-primary/20 bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                                    >
                                        {extra.nombre}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {cita.observaciones && (
                        <div className="px-5 py-4">
                            <p className="text-sm text-muted-foreground">Observaciones</p>
                            <p className="text-sm">{cita.observaciones}</p>
                        </div>
                    )}

                    {cita.motivoCancelacion && (
                        <div className="px-5 py-4">
                            <p className="text-sm text-muted-foreground">Motivo de cancelación</p>
                            <p className="text-sm">{cita.motivoCancelacion}</p>
                        </div>
                    )}

                    <div className="px-5 py-4">
                        <div className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3">
                            <span className="flex items-center gap-2 text-sm text-secondary-foreground">
                                <Wallet className="h-4 w-4 text-primary" />
                                Extras: ₡{Number(cita.costoAdicionales).toLocaleString("es-CR")}
                            </span>
                            <span className="text-lg font-semibold text-primary">
                                Total: ₡{Number(cita.costoTotal).toLocaleString("es-CR")}
                            </span>
                        </div>
                    </div>

                    {/* Cambiar estado: solo staff, y solo si el estado actual lo permite */}
                    {esStaff && puedeEditar && estados?.length > 0 && (
                        <div className="px-5 py-4">
                            <p className="mb-2 text-sm font-medium">Cambiar estado</p>
                            <Select
                                value={String(cita.estadoCitaId)}
                                onValueChange={handleCambiarEstado}
                            >
                                <SelectTrigger className="w-full sm:w-64">
                                    <SelectValue>
                                        {(value) =>
                                            estados.find((e) => String(e.id) === value)?.nombre
                                        }
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {estados.map((e) => (
                                        <SelectItem key={e.id} value={String(e.id)}>
                                            {e.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2 px-5 py-4">
                        {puedeEditar && (
                            <Button asChild size="sm">
                                <Link to={`/reservas/${cita.id}/editar`}>Editar</Link>
                            </Button>
                        )}

                        {puedeCancelar && (
                            <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
                                <DialogTrigger
                                    render={
                                        <Button variant="destructive" size="sm">
                                            Cancelar reserva
                                        </Button>
                                    }
                                />
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Cancelar reserva</DialogTitle>
                                    </DialogHeader>
                                    <p className="text-sm text-muted-foreground">
                                        Indica el motivo de la cancelación (mínimo 5 caracteres).
                                    </p>
                                    <Textarea
                                        rows={3}
                                        value={motivoCancelacion}
                                        onChange={(e) => setMotivoCancelacion(e.target.value)}
                                        placeholder="Ej. El cliente ya no puede asistir en esa fecha."
                                    />
                                    <DialogFooter>
                                        <Button
                                            variant="outline"
                                            onClick={() => setDialogoAbierto(false)}
                                        >
                                            Volver
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={handleCancelar}
                                            disabled={cancelando}
                                        >
                                            {cancelando ? "Cancelando..." : "Sí, cancelar"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}

                        <Button asChild variant="outline" size="sm">
                            <Link to="/reservas">Volver</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}