import { Link, useParams } from "react-router-dom"
import { MessageCircle, AtSign, Compass, ShieldAlert, CalendarCheck } from "lucide-react"

import { useAuth } from "@/auth/useAuth"
import { useFetch } from "@/lib/useFetch"
import { empleadosService } from "@/services/empleadosService"
import { getImagenLocalGuia, getInstagramGuia } from "@/lib/imagenLocal"
import { formatearFechaCortaDesdeISO, horaDesdeISO } from "@/lib/fecha"

const IMAGEN_POR_DEFECTO =
    "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop"

// Formatea "87777777" -> "+506 8777 7777". Si el número no viene en el
// formato de 8 dígitos esperado en Costa Rica, se muestra tal cual llegó
// en vez de forzar un formato que podría quedar mal.
function formatearTelefonoCR(telefono) {
    const digitos = telefono.replace(/\D/g, "")
    if (digitos.length !== 8) return telefono
    return `+506 ${digitos.slice(0, 4)} ${digitos.slice(4)}`
}

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function GuiaDetailPage() {
    const { id } = useParams()
    const { rol } = useAuth()
    const esAdmin = rol === "Administrador"

    // obtenerPorId trae, además de los datos básicos: servicios asignados,
    // restricciones registradas, y el historial completo de citas — todo
    // lo que pide el enunciado mostrar en el detalle de un empleado.
    const { data: guia, loading, error } = useFetch(
        () => empleadosService.obtenerPorId(id),
        [id]
    )

    if (loading) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-10">
                <Skeleton className="h-96 w-full rounded-xl" />
            </div>
        )
    }

    if (error || !guia) {
        return (
            <div className="mx-auto max-w-md px-4 py-16 text-center">
                <p className="text-destructive">No se pudo cargar este guía.</p>
                <Button asChild variant="outline" className="mt-4">
                    <Link to="/guias">Volver a Guías</Link>
                </Button>
            </div>
        )
    }

    const instagram = getInstagramGuia(guia.id)

    return (
        <div className="mx-auto max-w-2xl px-4 py-10">
            <Card className="overflow-hidden pt-0">
                {/* Foto más baja que antes (56 en vez de 72) — menos protagonismo,
                    más espacio para que el contenido de abajo respire. */}
                <div className="relative">
                    <img
                        src={getImagenLocalGuia(guia.id) || IMAGEN_POR_DEFECTO}
                        alt={`${guia.usuario?.nombre} ${guia.usuario?.primerApellido}`}
                        className="h-64 w-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

                    <Badge
                        className={`absolute right-3 top-3 ${
                            guia.activo ? "bg-primary text-primary-foreground" : ""
                        }`}
                        variant={guia.activo ? "default" : "secondary"}
                    >
                        {guia.activo ? "Activo" : "Inactivo"}
                    </Badge>

                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                        <h1 className="text-xl font-bold">
                            {guia.usuario?.nombre} {guia.usuario?.primerApellido}
                        </h1>
                        <p className="text-sm text-white/85">
                            {guia.especialidad?.nombre} · Código: {guia.codigoEmpleado}
                        </p>
                    </div>
                </div>

                {/* divide-y en vez de space-y: cada sección queda separada por
                    una línea sutil, no solo por espacio en blanco — se lee
                    más ordenado, como bloques de información distintos. */}
                <CardContent className="divide-y divide-border p-0">
                    {guia.descripcion && (
                        <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                            {guia.descripcion}
                        </p>
                    )}

                    {/* Contacto: WhatsApp usa el teléfono REAL del usuario (ya
                        existe en el sistema, 506 = código de país de Costa
                        Rica). Instagram es bypass local — no existe ese campo
                        en el backend, ver lib/imagenLocal.js. */}
                    <div className="flex flex-wrap gap-2 px-5 py-4">
                        {guia.usuario?.telefono && (
                            <a
                                href={`https://wa.me/506${guia.usuario.telefono.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-100"
                            >
                                <MessageCircle className="h-3.5 w-3.5" />
                                {formatearTelefonoCR(guia.usuario.telefono)}
                            </a>
                        )}
                        {instagram && (
                            <a
                                href={`https://instagram.com/${instagram}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs font-medium text-pink-700 transition-colors hover:bg-pink-100"
                            >
                                <AtSign className="h-3.5 w-3.5" />
                                {instagram}
                            </a>
                        )}
                    </div>

                    {/* Tours que puede atender — chips más chicos, en grid de 2
                        columnas parejas en vez de flex-wrap con anchos dispares. */}
                    <div className="px-5 py-4">
                        <p className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold text-primary">
                            <Compass className="h-4 w-4" />
                            Tours que puede atender
                        </p>
                        {guia.servicios?.length > 0 ? (
                            <div className="grid grid-cols-2 gap-1.5">
                                {guia.servicios.map((s) => (
                                    <span
                                        key={s.id}
                                        className="truncate rounded-md border border-primary/20 bg-secondary px-2.5 py-1.5 text-xs text-secondary-foreground"
                                        title={s.nombre}
                                    >
                                        {s.nombre}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No tiene tours asignados
                            </p>
                        )}
                    </div>

                    {/* Restricciones registradas */}
                    <div className="px-5 py-4">
                        <p className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold text-primary">
                            <ShieldAlert className="h-4 w-4" />
                            Restricciones registradas ({guia.restricciones?.length ?? 0})
                        </p>
                        {guia.restricciones?.length > 0 ? (
                            <div className="space-y-1.5">
                                {guia.restricciones.map((r) => (
                                    <div
                                        key={r.id}
                                        className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-1.5 text-xs"
                                    >
                                        <span className="font-medium">
                                            {formatearFechaCortaDesdeISO(r.fecha)}
                                        </span>{" "}
                                        <span className="text-muted-foreground">
                                            —{" "}
                                            {r.todoElDia
                                                ? "Todo el día"
                                                : `${horaDesdeISO(r.horaInicio)}–${horaDesdeISO(r.horaFin)}`}{" "}
                                            ({r.motivo})
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Sin restricciones registradas
                            </p>
                        )}
                    </div>

                    {/* Reservas totales + botones, en la última franja */}
                    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                        <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
                            <CalendarCheck className="h-4 w-4 text-primary" />
                            <p className="text-sm">
                                <span className="font-semibold text-primary">
                                    {guia.citas?.length ?? 0}
                                </span>{" "}
                                reservas totales
                            </p>
                        </div>

                        <div className="flex gap-2">
                            {esAdmin && (
                                <Button asChild size="sm">
                                    <Link to={`/guias/${guia.id}/editar`}>Editar</Link>
                                </Button>
                            )}
                            <Button asChild variant="outline" size="sm">
                                <Link to="/guias">Volver a Guías</Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}