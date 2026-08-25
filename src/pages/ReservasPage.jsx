import { Link } from "react-router-dom"

import { CalendarRange } from "lucide-react"

import { useAuth } from "@/auth/useAuth"
import { useFetch } from "@/lib/useFetch"
import { useOrdenamiento } from "@/lib/useOrdenamiento"
import { citasService } from "@/services/citasService"
import { clasesEstadoColor } from "@/lib/estadoColor"
import { formatearFechaCorta } from "@/lib/fecha"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import EncabezadoOrdenable from "@/components/EncabezadoOrdenable"
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
    const esStaff = esAdmin || esEmpleado

    // Cada rol consulta un endpoint distinto: el filtrado real ya lo hace
    // el backend (no traemos TODAS las citas para luego filtrar acá, sería
    // innecesario y además un Cliente no debería ni poder pedir la lista
    // completa).
    const { data: citas, loading, error } = useFetch(() => {
        if (esAdmin) return citasService.listar()
        if (esEmpleado) return citasService.listarPorEmpleado(empleadoId)
        return citasService.listarPorCliente(user.id)
    }, [rol])

    // Ordenamiento client-side: los datos ya están completos en memoria
    // (el filtrado por rol lo hizo el backend arriba), así que ordenar acá
    // es instantáneo sin ida y vuelta al API.
    const { datosOrdenados: citasOrdenadas, criterios, alternarOrden, limpiarOrden } =
        useOrdenamiento(
            citas,
            {
                fecha: (c) => `${c.fecha} ${c.horaInicio}`,
                tour: (c) => c.servicio?.nombre?.toLowerCase() ?? "",
                cliente: (c) =>
                    `${c.cliente?.nombre ?? ""} ${c.cliente?.primerApellido ?? ""}`.toLowerCase(),
                guia: (c) =>
                    `${c.empleado?.usuario?.nombre ?? ""} ${c.empleado?.usuario?.primerApellido ?? ""}`.toLowerCase(),
                // "orden" ya viene del catálogo de estados (Pendiente=1 ... Cancelada=5),
                // así que ordenar por estado sigue el ciclo de vida lógico de la cita.
                estado: (c) => c.estadoCita?.orden ?? 0,
                total: (c) => Number(c.costoTotal),
            },
            "fecha"
        )

    return (
        <div className="mx-auto max-w-6xl px-4 py-10">
            <div className="mb-8 flex items-center justify-between gap-4">
                <div className="border-l-4 border-ring pl-4">
                    <h1 className="flex items-center gap-2 text-3xl font-semibold">
                        <CalendarRange className="h-7 w-7 text-primary" />
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

            {!loading && !error && citasOrdenadas?.length === 0 && (
                <p className="text-center text-muted-foreground">
                    {esAdmin || esEmpleado
                        ? "Todavía no hay reservas registradas."
                        : "Todavía no tienes reservas. ¡Explora los tours y anímate a viajar!"}
                </p>
            )}

            {!loading && !error && citasOrdenadas?.length > 0 && (
                <>
                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                            Clic en un encabezado para ordenar por esa columna — puedes
                            combinar varias haciendo clic en más de una.
                        </p>
                        {criterios.length > 0 && (
                            <button
                                type="button"
                                onClick={limpiarOrden}
                                className="text-xs font-medium text-muted-foreground underline hover:text-foreground"
                            >
                                Quitar orden
                            </button>
                        )}
                    </div>
                    <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-secondary/40">
                                <EncabezadoOrdenable
                                    campo="fecha"
                                    criterios={criterios}
                                    onClick={alternarOrden}
                                >
                                    Fecha
                                </EncabezadoOrdenable>
                                <EncabezadoOrdenable
                                    campo="tour"
                                    criterios={criterios}
                                    onClick={alternarOrden}
                                >
                                    Tour
                                </EncabezadoOrdenable>
                                {esStaff && (
                                    <EncabezadoOrdenable
                                        campo="cliente"
                                        criterios={criterios}
                                        onClick={alternarOrden}
                                    >
                                        Cliente
                                    </EncabezadoOrdenable>
                                )}
                                <EncabezadoOrdenable
                                    campo="guia"
                                    criterios={criterios}
                                    onClick={alternarOrden}
                                >
                                    Guía
                                </EncabezadoOrdenable>
                                <EncabezadoOrdenable
                                    campo="estado"
                                    criterios={criterios}
                                    onClick={alternarOrden}
                                >
                                    Estado
                                </EncabezadoOrdenable>
                                <EncabezadoOrdenable
                                    campo="total"
                                    criterios={criterios}
                                    onClick={alternarOrden}
                                >
                                    Total
                                </EncabezadoOrdenable>
                                <TableHead className="text-right">
                                    <span className="flex items-center justify-end gap-1">
                                        Acciones
                                    </span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {citasOrdenadas.map((cita) => (
                                <TableRow key={cita.id}>
                                    <TableCell>
                                        {formatearFechaCorta(cita.fecha)}
                                        <span className="block text-xs text-muted-foreground">
                                            {cita.horaInicio} - {cita.horaFin}
                                        </span>
                                    </TableCell>
                                    <TableCell>{cita.servicio?.nombre}</TableCell>
                                    {esStaff && (
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
                </>
            )}
        </div>
    )
}