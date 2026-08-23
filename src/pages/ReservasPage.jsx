import { Link } from "react-router-dom"

import { useAuth } from "@/auth/useAuth"
import { useFetch } from "@/lib/useFetch"
import { citasService } from "@/services/citasService"
import { clasesEstadoColor } from "@/lib/estadoColor"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default function ReservasPage() {
    const { rol, user, empleadoId } = useAuth()
    const esAdmin = rol === "Administrador"
    const esEmpleado = rol === "Empleado"

    // Cada rol consulta un endpoint distinto: el filtrado real ya lo hace
    // el backend (no traemos TODAS las citas para luego filtrar acá, sería
    // innecesario y además un Cliente no debería ni poder pedir la lista
    // completa).
    const { data: citas, loading, error } = useFetch(() => {
        if (esAdmin) return citasService.listar()
        if (esEmpleado) return citasService.listarPorEmpleado(empleadoId)
        return citasService.listarPorCliente(user.id)
    }, [rol])

    return (
        <div className="mx-auto max-w-6xl px-4 py-10">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold">
                        {esAdmin ? "Reservas" : esEmpleado ? "Mis reservas asignadas" : "Mis reservas"}
                    </h1>
                    <p className="text-muted-foreground">
                        {esAdmin
                            ? "Todas las reservas del sistema"
                            : esEmpleado
                                ? "Tours que tienes que atender"
                                : "Tus reservas en Tuanis Trip"}
                    </p>
                </div>

                {(esAdmin || esEmpleado) && (
                    <Button asChild>
                        <Link to="/reservas/nueva">Nueva reserva</Link>
                    </Button>
                )}
            </div>

            {loading && <Skeleton className="h-64 w-full rounded-xl" />}

            {error && (
                <p className="text-center text-destructive">
                    No se pudieron cargar las reservas: {error.message}
                </p>
            )}

            {!loading && !error && citas?.length === 0 && (
                <p className="text-center text-muted-foreground">
                    {esAdmin || esEmpleado
                        ? "Todavía no hay reservas registradas."
                        : "Todavía no tienes reservas. ¡Explora los tours y anímate a viajar!"}
                </p>
            )}

            {!loading && !error && citas?.length > 0 && (
                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Tour</TableHead>
                                {!esAdmin && !esEmpleado ? null : (
                                    <TableHead>Cliente</TableHead>
                                )}
                                <TableHead>Guía</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {citas.map((cita) => (
                                <TableRow key={cita.id}>
                                    <TableCell>
                                        {new Date(cita.fecha).toLocaleDateString("es-CR")}
                                        <span className="block text-xs text-muted-foreground">
                                            {cita.horaInicio} - {cita.horaFin}
                                        </span>
                                    </TableCell>
                                    <TableCell>{cita.servicio?.nombre}</TableCell>
                                    {(esAdmin || esEmpleado) && (
                                        <TableCell>
                                            {cita.cliente?.nombre} {cita.cliente?.primerApellido}
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        {cita.empleado?.usuario?.nombre}{" "}
                                        {cita.empleado?.usuario?.primerApellido}
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`rounded-full border px-2 py-1 text-xs font-medium ${clasesEstadoColor(cita.estadoCita?.color)}`}
                                        >
                                            {cita.estadoCita?.nombre}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        ₡{Number(cita.costoTotal).toLocaleString("es-CR")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link to={`/reservas/${cita.id}`}>Ver detalle</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}