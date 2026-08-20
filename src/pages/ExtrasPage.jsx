import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import { useAuth } from "@/auth/useAuth"
import { useFetch } from "@/lib/useFetch"
import { extrasService } from "@/services/extrasService"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default function ExtrasPage() {
    const { rol } = useAuth()
    // El backend NO valida roles en este endpoint (ver referencia técnica del
    // API) — todo el control de "quién ve qué botón" vive aquí, en el FrontEnd.
    const esAdmin = rol === "Administrador"

    // Truco simple para forzar un refetch después de cambiar un estado:
    // useFetch vuelve a correr cuando cambia cualquier valor de su array de
    // dependencias, así que solo incrementamos un contador que no se usa
    // para nada más que "avisarle" al hook que hay que recargar.
    const [refrescarClave, setRefrescarClave] = useState(0)

    const { data: extras, loading, error } = useFetch(
        () => extrasService.listar(),
        [refrescarClave]
    )

    async function handleCambiarEstado(extra) {
        try {
            // Mandamos el valor OPUESTO al actual: si está activo, lo desactivamos y viceversa.
            await extrasService.cambiarEstado(extra.id, !extra.activo)
            toast.success(extra.activo ? "Extra desactivado" : "Extra activado")
            setRefrescarClave((c) => c + 1) // dispara el refetch de la tabla
        } catch (err) {
            // err.message viene de ApiError (lib/api-client.js), ya trae el
            // mensaje que devolvió el backend (ej. "El extra no existe").
            toast.error(err.message || "No se pudo cambiar el estado")
        }
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold">Extras del tour</h1>
                    <p className="text-muted-foreground">
                        Complementos opcionales que se pueden sumar a una reserva
                    </p>
                </div>
                {esAdmin && (
                    <Button asChild>
                        <Link to="/extras/nuevo">Nuevo extra</Link>
                    </Button>
                )}
            </div>

            {/* Los tres estados posibles de cualquier pantalla que consulta el
                API: cargando, error, o vacío. Cubrir los tres es requisito del
                enunciado (sección "Consumo del API": loading, manejo de
                errores, estados vacíos). */}
            {loading && <Skeleton className="h-64 w-full rounded-xl" />}

            {error && (
                <p className="text-center text-destructive">
                    No se pudieron cargar los extras: {error.message}
                </p>
            )}

            {!loading && !error && extras?.length === 0 && (
                <p className="text-center text-muted-foreground">
                    Todavía no hay extras registrados.
                </p>
            )}

            {!loading && !error && extras?.length > 0 && (
                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Precio</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {extras.map((extra) => (
                                <TableRow key={extra.id}>
                                    <TableCell className="font-medium">{extra.nombre}</TableCell>
                                    <TableCell>
                                        {/* toLocaleString("es-CR") da formato "25 000" en vez de
                                            "25000" — así lo pide el enunciado: nada de valores
                                            crudos sin formatear en la interfaz. */}
                                        ₡{Number(extra.precio).toLocaleString("es-CR")}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={extra.activo ? "default" : "secondary"}>
                                            {extra.activo ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="flex flex-wrap justify-end gap-2">
                                        <Button asChild variant="outline" size="sm">
                                            <Link to={`/extras/${extra.id}`}>Ver detalle</Link>
                                        </Button>

                                        {/* Editar y Activar/Desactivar solo para Administrador,
                                            igual que en Tours. Un Cliente o Empleado ni siquiera
                                            ve estos botones renderizados en el DOM. */}
                                        {esAdmin && (
                                            <>
                                                <Button asChild variant="outline" size="sm">
                                                    <Link to={`/extras/${extra.id}/editar`}>Editar</Link>
                                                </Button>
                                                <Button
                                                    variant={extra.activo ? "destructive" : "default"}
                                                    size="sm"
                                                    onClick={() => handleCambiarEstado(extra)}
                                                >
                                                    {extra.activo ? "Desactivar" : "Activar"}
                                                </Button>
                                            </>
                                        )}
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