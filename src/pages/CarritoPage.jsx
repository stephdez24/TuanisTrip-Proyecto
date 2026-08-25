import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { ShoppingBag, Trash2, Clock3, CheckCircle2 } from "lucide-react"

import { useAuth } from "@/auth/useAuth"
import { useCarrito } from "@/lib/useCarrito"
import { useSolicitudes } from "@/lib/useSolicitudes"
import { useFetch } from "@/lib/useFetch"
import { serviciosService } from "@/services/serviciosService"
import { imagenesService } from "@/services/imagenesService"
import { formatearFechaCorta } from "@/lib/fecha"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog"

const IMAGEN_POR_DEFECTO =
    "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&auto=format&fit=crop"

export default function CarritoPage() {
    const { user } = useAuth()
    const { carrito, quitar, vaciar } = useCarrito()
    const { agregar: agregarSolicitud, solicitudes } = useSolicitudes()
    const [dialogoAbierto, setDialogoAbierto] = useState(false)

    // El Cliente solo debe ver SUS PROPIAS solicitudes, filtrando por su
    // correo — la cola completa en localStorage es compartida (visible
    // también para Admin/Empleado en /solicitudes).
    const misSolicitudes = solicitudes
        .filter((s) => s.clienteCorreo === user?.correo)
        .sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn))

    const idsUnicos = [...new Set(carrito.map((item) => item.servicioId))]

    // El carrito solo guarda {servicioId, fecha} — se trae el detalle real
    // de cada tour para mostrar nombre, foto y precio.
    const { data: tours, loading } = useFetch(
        () =>
            Promise.all(
                idsUnicos.map((id) =>
                    serviciosService
                        .obtenerPorId(id)
                        .then((r) => r.data)
                        .catch(() => null)
                )
            ).then((resultados) => ({ data: resultados.filter(Boolean) })),
        [idsUnicos.join(",")]
    )

    function tourDe(servicioId) {
        return tours?.find((t) => t.id === servicioId)
    }

    const total = carrito.reduce((suma, item) => {
        const tour = tourDe(item.servicioId)
        return suma + (tour ? Number(tour.precioBase) : 0)
    }, 0)

    function handleSolicitar() {
        // A propósito, esto NO llama a POST /citas: según la matriz de
        // permisos del enunciado, el Cliente no puede crear citas — solo
        // Administrador o Empleado. En vez de eso, se guarda una
        // "solicitud" (otra capa de localStorage) que el staff revisa en
        // /solicitudes y usa para crear la reserva real desde el
        // formulario normal, verificando disponibilidad de verdad.
        agregarSolicitud({
            clienteNombre: `${user?.nombre ?? ""} ${user?.primerApellido ?? ""}`.trim(),
            clienteCorreo: user?.correo ?? "",
            items: carrito.map((item) => {
                const tour = tourDe(item.servicioId)
                return {
                    servicioId: item.servicioId,
                    nombreTour: tour?.nombre ?? "Tour eliminado",
                    fecha: item.fecha,
                    precio: tour ? Number(tour.precioBase) : 0,
                }
            }),
        })
        toast.success(
            "¡Listo! Guardamos tu selección. Nuestro equipo se pondrá en contacto para completar la reserva."
        )
        vaciar()
        setDialogoAbierto(false)
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
            <div className="border-l-4 border-ring pl-4">
                <h1 className="flex items-center gap-2 text-3xl font-semibold text-primary">
                    <ShoppingBag className="h-7 w-7" />
                    Mi selección
                </h1>
                <p className="text-muted-foreground">
                    Los tours que armaste para tu próximo viaje. Esto no es una reserva
                    todavía — al confirmar, el equipo de Tuanis Trip la completa por ti.
                </p>
            </div>

            {loading && <p className="text-muted-foreground">Cargando tu selección...</p>}

            {!loading && carrito.length === 0 && (
                <p className="text-center text-muted-foreground py-10">
                    Todavía no has agregado tours a tu selección. Ve a{" "}
                    <Link to="/tours" className="text-primary underline">
                        Tours
                    </Link>{" "}
                    y elige una fecha para empezar a armar tu viaje.
                </p>
            )}

            {!loading && carrito.length > 0 && (
                <>
                    <div className="space-y-3">
                        {carrito.map((item, indice) => {
                            const tour = tourDe(item.servicioId)
                            if (!tour) return null
                            return (
                                <Card key={`${item.servicioId}-${indice}`} className="overflow-hidden pt-0">
                                    <CardContent className="flex items-center gap-4 p-3">
                                        <img
                                            src={imagenesService.urlDescarga(tour.imagen) || IMAGEN_POR_DEFECTO}
                                            alt={tour.nombre}
                                            className="h-16 w-16 shrink-0 rounded-lg object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-primary truncate">
                                                {tour.nombre}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatearFechaCorta(item.fecha)}
                                            </p>
                                        </div>
                                        <p className="font-medium shrink-0">
                                            ₡{Number(tour.precioBase).toLocaleString("es-CR")}
                                        </p>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="shrink-0 text-destructive hover:bg-destructive/10"
                                            onClick={() => quitar(indice)}
                                            aria-label="Quitar de mi selección"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3">
                        <span className="text-sm text-secondary-foreground">
                            Total estimado ({carrito.length}{" "}
                            {carrito.length === 1 ? "tour" : "tours"})
                        </span>
                        <span className="text-lg font-semibold text-primary">
                            ₡{total.toLocaleString("es-CR")}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
                            <DialogTrigger render={<Button>Solicitar estas reservas</Button>} />
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Confirmar solicitud</DialogTitle>
                                </DialogHeader>
                                <p className="text-sm text-muted-foreground">
                                    Esto no crea la reserva de inmediato: guardamos tu selección y
                                    un guía o administrador de Tuanis Trip la completará contigo
                                    (verificando disponibilidad real antes de confirmarla).
                                </p>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setDialogoAbierto(false)}>
                                        Volver
                                    </Button>
                                    <Button onClick={handleSolicitar}>Sí, enviar mi selección</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Button variant="outline" onClick={vaciar}>
                            Vaciar selección
                        </Button>
                    </div>
                </>
            )}

            {/* Historial de solicitudes ya enviadas por este mismo Cliente
                (filtradas por correo) — así no desaparecen para siempre del
                radar del turista solo porque se vació el carrito al enviarlas. */}
            {misSolicitudes.length > 0 && (
                <section className="space-y-3 border-t pt-6">
                    <h2 className="text-lg font-semibold text-primary">
                        Mis solicitudes enviadas
                    </h2>
                    {misSolicitudes.map((s) => (
                        <Card key={s.id}>
                            <CardContent className="space-y-2 p-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(s.creadoEn).toLocaleString("es-CR")}
                                    </p>
                                    {s.atendida ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-primary">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            Atendida
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800">
                                            <Clock3 className="h-3.5 w-3.5" />
                                            Pendiente
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    {s.items.map((item, i) => (
                                        <p key={i} className="text-sm">
                                            {item.nombreTour} — {formatearFechaCorta(item.fecha)}
                                        </p>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </section>
            )}
        </div>
    )
}