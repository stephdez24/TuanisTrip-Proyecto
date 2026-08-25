import { Link } from "react-router-dom"
import { Inbox, CheckCircle2, Trash2 } from "lucide-react"

import { useSolicitudes } from "@/lib/useSolicitudes"
import { formatearFechaCorta } from "@/lib/fecha"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export default function SolicitudesPage() {
    const { solicitudes, marcarAtendida, eliminar } = useSolicitudes()

    const pendientes = solicitudes.filter((s) => !s.atendida)
    const atendidas = solicitudes.filter((s) => s.atendida)

    return (
        <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
            <div className="border-l-4 border-ring pl-4">
                <h1 className="flex items-center gap-2 text-3xl font-semibold text-primary">
                    <Inbox className="h-7 w-7" />
                    Solicitudes de clientes
                </h1>
                <p className="text-muted-foreground">
                    Selecciones que los turistas armaron desde "Mi selección" — no son
                    reservas reales todavía. Créalas desde{" "}
                    <Link to="/reservas/nueva" className="text-primary underline">
                        Nueva reserva
                    </Link>{" "}
                    verificando disponibilidad, y marca la solicitud como atendida.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    Nota: esta cola vive en el navegador (localStorage), no en el
                    servidor — solo es visible si el Cliente y tú prueban desde el
                    mismo navegador/computador.
                </p>
            </div>

            {solicitudes.length === 0 && (
                <p className="text-center text-muted-foreground py-10">
                    No hay solicitudes todavía.
                </p>
            )}

            {pendientes.length > 0 && (
                <section className="space-y-3">
                    <h2 className="text-lg font-semibold text-primary">
                        Pendientes ({pendientes.length})
                    </h2>
                    {pendientes.map((s) => (
                        <Card key={s.id} className="border-ring/30">
                            <CardContent className="space-y-3 p-4">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div>
                                        <p className="font-semibold text-primary">
                                            {s.clienteNombre || "Cliente"}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {s.clienteCorreo}
                                        </p>
                                    </div>
                                    <Badge variant="secondary">
                                        {new Date(s.creadoEn).toLocaleString("es-CR")}
                                    </Badge>
                                </div>

                                <div className="space-y-1.5">
                                    {s.items.map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between rounded-md bg-secondary px-3 py-1.5 text-sm"
                                        >
                                            <span>
                                                {item.nombreTour} —{" "}
                                                {formatearFechaCorta(item.fecha)}
                                            </span>
                                            <span className="font-medium">
                                                ₡{Number(item.precio).toLocaleString("es-CR")}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-2 pt-1">
                                    <Button asChild size="sm">
                                        <Link to="/reservas/nueva">Crear reserva</Link>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => marcarAtendida(s.id)}
                                    >
                                        <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                        Marcar como atendida
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:bg-destructive/10"
                                        onClick={() => eliminar(s.id)}
                                    >
                                        <Trash2 className="mr-1.5 h-4 w-4" />
                                        Eliminar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </section>
            )}

            {atendidas.length > 0 && (
                <section className="space-y-3">
                    <h2 className="text-lg font-semibold text-muted-foreground">
                        Atendidas ({atendidas.length})
                    </h2>
                    {atendidas.map((s) => (
                        <Card key={s.id} className="opacity-60">
                            <CardContent className="flex items-center justify-between gap-2 p-4">
                                <div>
                                    <p className="font-medium">{s.clienteNombre || "Cliente"}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {s.items.length}{" "}
                                        {s.items.length === 1 ? "tour" : "tours"} solicitados
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:bg-destructive/10"
                                    onClick={() => eliminar(s.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </section>
            )}
        </div>
    )
}