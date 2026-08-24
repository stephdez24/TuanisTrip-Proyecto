import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { guiaSchema } from "@/schemas/guiaSchemas"
import { empleadosService } from "@/services/empleadosService"
import { usuariosService } from "@/services/usuariosService"
import { especialidadesService } from "@/services/especialidadesService"
import { serviciosService } from "@/services/serviciosService"
import { useFetch } from "@/lib/useFetch"
import { getImagenLocalGuia, setImagenLocalGuia } from "@/lib/imagenLocal"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function GuiaFormPage() {
    const { id } = useParams()
    const esEdicion = Boolean(id)
    const navigate = useNavigate()
    const [enviando, setEnviando] = useState(false)
    const [cargandoGuia, setCargandoGuia] = useState(esEdicion)

    // Catálogos que alimentan los selects/checkboxes del formulario.
    const { data: usuariosEmpleado, loading: cargandoUsuarios } = useFetch(
        () => usuariosService.listar("Empleado"),
        []
    )
    const { data: especialidades, loading: cargandoEspecialidades } = useFetch(
        () => especialidadesService.listar(),
        []
    )
    const { data: tours, loading: cargandoTours } = useFetch(
        () => serviciosService.listarActivos(),
        []
    )

    const form = useForm({
        resolver: zodResolver(guiaSchema),
        defaultValues: {
            usuarioId: "",
            especialidadId: "",
            codigoEmpleado: "",
            descripcion: "",
            servicioIds: [],
            imagenUrl: "",
        },
    })

    useEffect(() => {
        if (!esEdicion) return

        empleadosService
            .obtenerPorId(id)
            .then((response) => {
                const guia = response.data
                form.reset({
                    usuarioId: guia.usuarioId,
                    especialidadId: guia.especialidadId,
                    codigoEmpleado: guia.codigoEmpleado,
                    descripcion: guia.descripcion ?? "",
                    servicioIds: guia.servicios?.map((s) => s.id) ?? [],
                    imagenUrl: getImagenLocalGuia(guia.id) ?? "",
                })
            })
            .catch((err) => {
                toast.error(err.message || "No se pudo cargar el guía")
                navigate("/guias")
            })
            .finally(() => setCargandoGuia(false))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, esEdicion])

    // Solo mostramos, en modo creación, usuarios con rol Empleado que TODAVÍA
    // no tienen un registro de guía asociado (relación 1:1 usuario<->empleado
    // en el backend). En modo edición no hace falta esta lista: el usuario ya
    // está fijo y no se puede reasignar desde este formulario.
    const usuariosDisponibles = usuariosEmpleado?.filter((u) => !u.empleado) ?? []

    async function onSubmit(valores) {
        // Igual que en TourFormPage: imagenUrl NO se manda al API, se
        // guarda aparte en el bypass local.
        const { imagenUrl, ...datosGuia } = valores
        setEnviando(true)
        try {
            let guiaId = id

            if (esEdicion) {
                await empleadosService.actualizar(id, datosGuia)
                toast.success("Guía actualizado correctamente")
            } else {
                const response = await empleadosService.crear(datosGuia)
                guiaId = response.data.id
                toast.success("Guía creado correctamente")
            }

            setImagenLocalGuia(guiaId, imagenUrl || null)
            navigate("/guias")
        } catch (err) {
            toast.error(err.message || "No se pudo guardar el guía")
        } finally {
            setEnviando(false)
        }
    }

    if (cargandoGuia) {
        return <p className="mx-auto max-w-xl px-4 py-12 text-center">Cargando guía...</p>
    }

    return (
        <div className="mx-auto max-w-xl px-4 py-10">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">
                        {esEdicion ? "Editar guía" : "Nuevo guía"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="usuarioId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Usuario (cuenta con rol Empleado)</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value ? String(field.value) : ""}
                                            // En edición no se puede reasignar el usuario: ya
                                            // quedó ligado permanentemente a este guía.
                                            disabled={esEdicion || cargandoUsuarios}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    {/* Mismo caso que en TourFormPage: Base UI necesita
                                                        esta función para mostrar la etiqueta en vez del id. */}
                                                    <SelectValue placeholder="Selecciona un usuario">
                                                        {(value) => {
                                                            if (!value) return "Selecciona un usuario"
                                                            const lista = esEdicion
                                                                ? usuariosEmpleado
                                                                : usuariosDisponibles
                                                            const u = lista?.find(
                                                                (u) => String(u.id) === value
                                                            )
                                                            return u ? `${u.nombre} ${u.primerApellido} — ${u.correo}` : null
                                                        }}
                                                    </SelectValue>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {(esEdicion ? usuariosEmpleado : usuariosDisponibles)?.map(
                                                    (u) => (
                                                        <SelectItem key={u.id} value={String(u.id)}>
                                                            {u.nombre} {u.primerApellido} — {u.correo}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {!esEdicion && usuariosDisponibles.length === 0 && !cargandoUsuarios && (
                                            <p className="text-sm text-muted-foreground">
                                                No hay usuarios con rol Empleado disponibles. Deben
                                                existir en los datos iniciales del sistema.
                                            </p>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="codigoEmpleado"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Código de guía</FormLabel>
                                        <FormControl>
                                            <Input placeholder="GUIA-001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="especialidadId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Especialidad</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value ? String(field.value) : ""}
                                            disabled={cargandoEspecialidades}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Selecciona una especialidad">
                                                        {(value) =>
                                                            !value
                                                                ? "Selecciona una especialidad"
                                                                : especialidades?.find(
                                                                      (e) => String(e.id) === value
                                                                  )?.nombre
                                                        }
                                                    </SelectValue>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {especialidades?.map((e) => (
                                                    <SelectItem key={e.id} value={String(e.id)}>
                                                        {e.nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="descripcion"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descripción (opcional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                rows={3}
                                                placeholder="Idiomas, experiencia, especialidades adicionales..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Grupo de checkboxes para asignar tours — una de las opciones
                                que permite el enunciado (lista de selección múltiple,
                                checkboxes, o dual list). Cada checkbox agrega/quita el id
                                del array servicioIds a mano, porque el Checkbox de shadcn
                                no funciona con {...field} como un <input> normal. */}
                            <FormField
                                control={form.control}
                                name="servicioIds"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tours que puede atender</FormLabel>
                                        <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
                                            {cargandoTours && (
                                                <p className="text-sm text-muted-foreground">Cargando tours...</p>
                                            )}
                                            {!cargandoTours && tours?.length === 0 && (
                                                <p className="text-sm text-muted-foreground">
                                                    No hay tours activos todavía.
                                                </p>
                                            )}
                                            {tours?.map((tour) => {
                                                const seleccionado = field.value.includes(tour.id)
                                                return (
                                                    <label
                                                        key={tour.id}
                                                        className="flex cursor-pointer items-center gap-2 text-sm"
                                                    >
                                                        <Checkbox
                                                            checked={seleccionado}
                                                            onCheckedChange={(marcado) => {
                                                                field.onChange(
                                                                    marcado
                                                                        ? [...field.value, tour.id]
                                                                        : field.value.filter((id) => id !== tour.id)
                                                                )
                                                            }}
                                                        />
                                                        {tour.nombre}
                                                    </label>
                                                )
                                            })}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="imagenUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>URL de imagen (temporal)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="url"
                                                placeholder="https://ejemplo.com/foto.jpg o /images/guias/archivo.jpg"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-3 pt-2">
                                <Button type="submit" disabled={enviando} className="flex-1">
                                    {enviando
                                        ? "Guardando..."
                                        : esEdicion
                                            ? "Guardar cambios"
                                            : "Crear guía"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate("/guias")}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}