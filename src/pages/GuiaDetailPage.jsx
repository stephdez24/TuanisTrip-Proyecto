import { Link, useParams } from "react-router-dom"

import { useAuth } from "@/auth/useAuth"
import { useFetch } from "@/lib/useFetch"
import { empleadosService } from "@/services/empleadosService"
import { getImagenLocalGuia } from "@/lib/imagenLocal"

const IMAGEN_POR_DEFECTO =
    "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
                <Skeleton className="h-64 w-full rounded-xl" />
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

    return (
        <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
            <img
                src={getImagenLocalGuia(guia.id) || IMAGEN_POR_DEFECTO}
                alt={`${guia.usuario?.nombre} ${guia.usuario?.primerApellido}`}
                className="h-64 w-full rounded-xl object-cover"
            />
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <CardTitle className="text-2xl">
                                {guia.usuario?.nombre} {guia.usuario?.primerApellido}
                            </CardTitle>
                            <p className="text-muted-foreground">
                                {guia.especialidad?.nombre} · Código: {guia.codigoEmpleado}
                            </p>
                        </div>
                        <Badge variant={guia.activo ? "default" : "secondary"}>
                            {guia.activo ? "Activo" : "Inactivo"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {guia.descripcion && (
                        <p className="text-muted-foreground">{guia.descripcion}</p>
                    )}

                    <div>
                        <p className="mb-2 text-sm font-medium">Tours que puede atender</p>
                        <div className="flex flex-wrap gap-2">
                            {guia.servicios?.length > 0 ? (
                                guia.servicios.map((s) => (
                                    <Badge key={s.id} variant="outline">
                                        {s.nombre}
                                    </Badge>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No tiene tours asignados
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-sm font-medium">
                            Restricciones registradas ({guia.restricciones?.length ?? 0})
                        </p>
                        {guia.restricciones?.length > 0 ? (
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                {guia.restricciones.map((r) => (
                                    <li key={r.id}>
                                        {new Date(r.fecha).toLocaleDateString("es-CR")} —{" "}
                                        {r.todoElDia ? "Todo el día" : `${r.horaInicio}–${r.horaFin}`}{" "}
                                        ({r.motivo})
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Sin restricciones registradas
                            </p>
                        )}
                    </div>

                    <div>
                        <p className="text-sm font-medium">
                            Reservas totales: {guia.citas?.length ?? 0}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                        <Button asChild>
                            <Link to="/guias">Volver a Guías</Link>
                        </Button>
                        {esAdmin && (
                            <Button asChild variant="outline">
                                <Link to={`/guias/${guia.id}/editar`}>Editar</Link>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}