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
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">

            {/* ENCABEZADO */}

            <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                <div className="border-l-4 border-ring pl-5">

                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-ring">
                        Gestión
                    </p>

                    <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                        <CalendarRange className="h-8 w-8 text-primary" />
                        {esAdmin
                            ? "Reservas"
                            : esEmpleado
                                ? "Mis reservas asignadas"
                                : "Mis reservas"}
                    </h1>

                    <p className="mt-2 text-base text-muted-foreground">
                        {esAdmin
                            ? "Todas las reservas del sistema"
                            : esEmpleado
                                ? "Tours que tienes que atender"
                                : "Tus reservas en Tuanis Trip"}
                    </p>

                </div>

                {(esAdmin || esEmpleado) && (

                                <Button
                                    asChild
                                    className="
                                        bg-primary
                                        !text-white
                                        hover:bg-primary/90
                                        hover:!text-white
                                    "
                                >
                        <Link to="/reservas/nueva">
                            Nueva reserva
                        </Link>
                    </Button>
                )}

            </div>

            {loading && (
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <Skeleton className="h-72 w-full rounded-xl" />
                </div>
            )}

            {error && (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
                    <p className="text-destructive">
                        No se pudieron cargar las reservas: {error.message}
                    </p>
                </div>
            )}

            {!loading && !error && citasOrdenadas?.length === 0 && (
                <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-sm">

                    <CalendarRange className="mx-auto mb-4 h-10 w-10 text-ring" />

                    <p className="text-lg font-semibold text-primary">
                        No hay reservas
                    </p>

                    <p className="mt-1 text-muted-foreground">
                        {esAdmin || esEmpleado
                            ? "Todavía no hay reservas registradas."
                            : "Todavía no tienes reservas. ¡Explora los tours y anímate a viajar!"}
                    </p>

                </div>
            )}

            {!loading && !error && citasOrdenadas?.length > 0 && (
                <>

                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                        <p className="text-sm text-muted-foreground">
                            Clic en un encabezado para ordenar por esa columna — puedes
                            combinar varias haciendo clic en más de una.
                        </p>

                        {criterios.length > 0 && (
                            <button
                                type="button"
                                onClick={limpiarOrden}
                                className="
                                    w-fit
                                    text-sm
                                    font-medium
                                    text-primary
                                    underline
                                    underline-offset-4
                                    transition-colors
                                    hover:text-ring
                                "
                            >
                                Quitar orden
                            </button>
                        )}

                    </div>

                    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">

                        <div className="overflow-x-auto">

                            <Table>

                                <TableHeader>

                                    <TableRow className="border-b border-border bg-secondary/50 hover:bg-secondary/50">

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

                                        <TableHead className="px-5 text-right font-semibold text-primary">
                                            Acciones
                                        </TableHead>

                                    </TableRow>

                                </TableHeader>

                                <TableBody>

                                    {citasOrdenadas.map((cita) => (

                                        <TableRow
                                            key={cita.id}
                                            className="
                                                border-b border-border
                                                transition-colors
                                                hover:bg-muted/40
                                            "
                                        >

                                            <TableCell className="px-5 py-4">

                                                <div className="font-medium text-primary">
                                                    {formatearFechaCorta(cita.fecha)}
                                                </div>

                                                <span className="mt-1 block text-xs text-muted-foreground">
                                                    {cita.horaInicio} - {cita.horaFin}
                                                </span>

                                            </TableCell>

                                            <TableCell className="max-w-xs px-5 py-4">

                                                <span className="font-medium text-foreground">
                                                    {cita.servicio?.nombre}
                                                </span>

                                            </TableCell>

                                            {esStaff && (
                                                <TableCell className="px-5 py-4">

                                                    <span className="text-foreground">
                                                        {cita.cliente?.nombre}{" "}
                                                        {cita.cliente?.primerApellido}
                                                    </span>

                                                </TableCell>
                                            )}

                                            <TableCell className="px-5 py-4">

                                                <span className="text-foreground">
                                                    {cita.empleado?.usuario?.nombre}{" "}
                                                    {cita.empleado?.usuario?.primerApellido}
                                                </span>

                                            </TableCell>

                                            <TableCell className="px-5 py-4">

                                                <span
                                                    className={`
                                                        inline-flex
                                                        items-center
                                                        rounded-full
                                                        border
                                                        px-3
                                                        py-1.5
                                                        text-xs
                                                        font-semibold
                                                        ${clasesEstadoColor(cita.estadoCita?.color)}
                                                    `}
                                                >
                                                    {cita.estadoCita?.nombre}
                                                </span>

                                            </TableCell>

                                            <TableCell className="px-5 py-4">

                                                <span className="font-semibold text-primary">
                                                    ₡{Number(cita.costoTotal).toLocaleString("es-CR")}
                                                </span>

                                            </TableCell>

                                            <TableCell className="px-5 py-4 text-right">

                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                    className="
                                                        rounded-full
                                                        border-border
                                                        px-4
                                                        font-medium
                                                        transition-all
                                                        hover:text-white
                                                    "
                                                >
                                                    <Link to={`/reservas/${cita.id}`}>
                                                        Ver detalle
                                                    </Link>
                                                </Button>

                                            </TableCell>

                                        </TableRow>

                                    ))}

                                </TableBody>

                            </Table>

                        </div>

                    </div>

                </>
            )}

        </div>
    )
}