import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import { useAuth } from "@/auth/useAuth"
import { useFetch } from "@/lib/useFetch"
import { empleadosService } from "@/services/empleadosService"
import { especialidadesService } from "@/services/especialidadesService"
import { getImagenLocalGuia } from "@/lib/imagenLocal"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const TODAS = "todas"
const IMAGEN_POR_DEFECTO =
    "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=400&auto=format&fit=crop"

export default function GuiasPage() {
    const { rol } = useAuth()
    const esAdmin = rol === "Administrador"
    const [refrescarClave, setRefrescarClave] = useState(0)

    const [busqueda, setBusqueda] = useState("")
    const [especialidadId, setEspecialidadId] = useState(TODAS)

    const { data: guias, loading, error } = useFetch(
        () => empleadosService.listar(),
        [refrescarClave]
    )
    const { data: especialidades } = useFetch(() => especialidadesService.listar(), [])

    const guiasFiltrados = useMemo(() => {
        if (!guias) return []

        const texto = busqueda.trim().toLowerCase()

        return guias.filter((guia) => {
            const nombreCompleto =
                `${guia.usuario?.nombre} ${guia.usuario?.primerApellido}`.toLowerCase()

            const coincideTexto =
                !texto ||
                nombreCompleto.includes(texto) ||
                guia.codigoEmpleado.toLowerCase().includes(texto)

            const coincideEspecialidad =
                especialidadId === TODAS || guia.especialidadId === Number(especialidadId)

            return coincideTexto && coincideEspecialidad
        })
    }, [guias, busqueda, especialidadId])

    const hayFiltrosActivos = busqueda !== "" || especialidadId !== TODAS

    function limpiarFiltros() {
        setBusqueda("")
        setEspecialidadId(TODAS)
    }

    async function handleCambiarEstado(guia) {
        try {
            await empleadosService.cambiarEstado(guia.id, !guia.activo)
            toast.success(guia.activo ? "Guía desactivado" : "Guía activado")
            setRefrescarClave((c) => c + 1)
        } catch (err) {
            toast.error(err.message || "No se pudo cambiar el estado del guía")
        }
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-10">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold">Guías turísticos</h1>
                    <p className="text-muted-foreground">
                        Conoce a los guías que llevan las experiencias de Tuanis Trip
                    </p>
                </div>
                {esAdmin && (
                    <Button asChild>
                        <Link to="/guias/nuevo">Nuevo guía</Link>
                    </Button>
                )}
            </div>

            <div className="mb-8 flex flex-col gap-3 sm:flex-row">
                <Input
                    placeholder="Buscar por nombre o código..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="sm:max-w-xs"
                />

                <Select value={especialidadId} onValueChange={setEspecialidadId}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Especialidad">
                            {(value) =>
                                value === TODAS
                                    ? "Todas las especialidades"
                                    : especialidades?.find((e) => String(e.id) === value)?.nombre
                            }
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={TODAS}>Todas las especialidades</SelectItem>
                        {especialidades?.map((e) => (
                            <SelectItem key={e.id} value={String(e.id)}>
                                {e.nombre}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {!loading && !error && guias && (
                <p className="mb-4 text-sm text-muted-foreground">
                    {guiasFiltrados.length}{" "}
                    {guiasFiltrados.length === 1 ? "guía encontrado" : "guías encontrados"}
                </p>
            )}

            {loading && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-56 w-full rounded-xl" />
                    ))}
                </div>
            )}

            {error && (
                <p className="text-center text-destructive">
                    No se pudieron cargar los guías: {error.message}
                </p>
            )}

            {!loading && !error && guiasFiltrados.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <p className="text-muted-foreground">
                        {hayFiltrosActivos
                            ? "No encontramos guías con esos filtros."
                            : "Todavía no hay guías registrados."}
                    </p>
                    {hayFiltrosActivos && (
                        <Button variant="outline" size="sm" onClick={limpiarFiltros}>
                            Quitar filtros
                        </Button>
                    )}
                </div>
            )}

            {!loading && !error && guiasFiltrados.length > 0 && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {guiasFiltrados.map((guia) => (
                        <Card key={guia.id} className="overflow-hidden pt-0">
                            <img
                                src={getImagenLocalGuia(guia.id) || IMAGEN_POR_DEFECTO}
                                alt={`${guia.usuario?.nombre} ${guia.usuario?.primerApellido}`}
                                className="h-40 w-full object-cover"
                            />
                            <CardHeader>
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="text-lg">
                                        {guia.usuario?.nombre} {guia.usuario?.primerApellido}
                                    </CardTitle>
                                    <Badge variant={guia.activo ? "default" : "secondary"}>
                                        {guia.activo ? "Activo" : "Inactivo"}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {guia.especialidad?.nombre} · {guia.codigoEmpleado}
                                </p>
                            </CardHeader>

                            <CardContent className="space-y-1 text-sm text-muted-foreground">
                                <p>{guia.servicios?.length ?? 0} tours asignados</p>
                                <p>{guia._count?.citas ?? 0} reservas totales</p>
                            </CardContent>

                            <CardFooter className="flex flex-wrap gap-2">
                                <Button asChild variant="outline" size="sm" className="flex-1">
                                    <Link to={`/guias/${guia.id}`}>Ver perfil</Link>
                                </Button>

                                {esAdmin && (
                                    <>
                                        <Button asChild variant="outline" size="sm">
                                            <Link to={`/guias/${guia.id}/editar`}>Editar</Link>
                                        </Button>
                                        <Button
                                            variant={guia.activo ? "destructive" : "default"}
                                            size="sm"
                                            onClick={() => handleCambiarEstado(guia)}
                                        >
                                            {guia.activo ? "Desactivar" : "Activar"}
                                        </Button>
                                    </>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}