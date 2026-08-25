import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import { Compass, CalendarCheck } from "lucide-react"

import { useAuth } from "@/auth/useAuth"
import { useFetch } from "@/lib/useFetch"
import { useOrdenamiento } from "@/lib/useOrdenamiento"
import { empleadosService } from "@/services/empleadosService"
import { especialidadesService } from "@/services/especialidadesService"
import { getImagenLocalGuia } from "@/lib/imagenLocal"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import SelectorOrden from "@/components/SelectorOrden"
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

const OPCIONES_ORDEN = [
    { value: "nombre:asc", label: "Nombre (A-Z)" },
    { value: "nombre:desc", label: "Nombre (Z-A)" },
    { value: "tours:desc", label: "Más tours asignados" },
    { value: "tours:asc", label: "Menos tours asignados" },
    { value: "reservas:desc", label: "Más reservas totales" },
    { value: "reservas:asc", label: "Menos reservas totales" },
]

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

    // El ordenamiento se aplica DESPUÉS del filtro de búsqueda/especialidad
    // — son dos pasos independientes: primero se decide QUIÉNES entran a
    // la lista, luego en QUÉ ORDEN se muestran.
    const { datosOrdenados: guiasOrdenados, criterios, establecerOrden } = useOrdenamiento(
        guiasFiltrados,
        {
            nombre: (g) => `${g.usuario?.nombre} ${g.usuario?.primerApellido}`.toLowerCase(),
            tours: (g) => g.servicios?.length ?? 0,
            reservas: (g) => g._count?.citas ?? 0,
        },
        null
    )

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

            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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

                <SelectorOrden
                    opciones={OPCIONES_ORDEN}
                    criterios={criterios}
                    onCambiar={establecerOrden}
                    className="w-full sm:w-56"
                />
            </div>

            {!loading && !error && guias && (
                <p className="mb-4 text-sm text-muted-foreground">
                    {guiasOrdenados.length}{" "}
                    {guiasOrdenados.length === 1 ? "guía encontrado" : "guías encontrados"}
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

            {!loading && !error && guiasOrdenados.length === 0 && (
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

            {!loading && !error && guiasOrdenados.length > 0 && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {guiasOrdenados.map((guia) => (
                        <Card
                            key={guia.id}
                            className="group overflow-hidden pt-0 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                        >
                            <div className="relative">
                                <img
                                    src={getImagenLocalGuia(guia.id) || IMAGEN_POR_DEFECTO}
                                    alt={`${guia.usuario?.nombre} ${guia.usuario?.primerApellido}`}
                                    className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                {/* Degradado oscuro fijo (no depende del contenido de la
                                    foto) para que las insignias se lean bien incluso sobre
                                    fotos claras o con texto de fondo (letreros, etc.). */}
                                <div className="absolute inset-x-0 top-0 h-20 bg-linear-to-b from-black/60 to-transparent" />
                                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
                                    <Badge className="bg-primary text-primary-foreground">
                                        {guia.especialidad?.nombre}
                                    </Badge>
                                    <Badge
                                        variant={guia.activo ? "default" : "secondary"}
                                        className={guia.activo ? "bg-primary text-primary-foreground" : ""}
                                    >
                                        {guia.activo ? "Activo" : "Inactivo"}
                                    </Badge>
                                </div>
                            </div>

                            <CardHeader>
                                <CardTitle className="text-lg text-primary">
                                    {guia.usuario?.nombre} {guia.usuario?.primerApellido}
                                </CardTitle>
                                <p className="font-mono text-xs text-muted-foreground">
                                    {guia.codigoEmpleado}
                                </p>
                            </CardHeader>

                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                                        <Compass className="h-3.5 w-3.5" />
                                        {guia.servicios?.length ?? 0} tours
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                                        <CalendarCheck className="h-3.5 w-3.5" />
                                        {guia._count?.citas ?? 0} reservas
                                    </span>
                                </div>
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