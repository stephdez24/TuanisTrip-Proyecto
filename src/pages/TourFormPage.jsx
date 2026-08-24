import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { tourSchema } from "@/schemas/tourSchemas"
import { serviciosService } from "@/services/serviciosService"
import { especialidadesService } from "@/services/especialidadesService"
import { useFetch } from "@/lib/useFetch"
import { getImagenLocal, setImagenLocal } from "@/lib/imagenLocal"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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

// Un solo componente para crear y editar tours: el modo se decide con la
// presencia de :id en la URL (mismo patrón que ExtraFormPage.jsx).
export default function TourFormPage() {
    const { id } = useParams()
    const esEdicion = Boolean(id)
    const navigate = useNavigate()
    const [enviando, setEnviando] = useState(false)
    const [cargandoTour, setCargandoTour] = useState(esEdicion)

    // Alimenta el <Select> de categoría. Se pide siempre (tanto en crear
    // como en editar), por eso está fuera del if de modo edición.
    const { data: especialidades, loading: cargandoEspecialidades } = useFetch(
        () => especialidadesService.listar(),
        []
    )

    const form = useForm({
        resolver: zodResolver(tourSchema),
        defaultValues: {
            nombre: "",
            descripcion: "",
            precioBase: "",
            duracionMinutos: "",
            especialidadId: "",
            imagenUrl: "",
        },
    })

    // En modo edición, cargamos el tour existente y llenamos el formulario
    // con form.reset(). En modo creación este efecto no hace nada (return
    // temprano) y el formulario se queda con sus defaultValues vacíos.
    useEffect(() => {
        if (!esEdicion) return

        serviciosService
            .obtenerPorId(id)
            .then((response) => {
                const tour = response.data
                form.reset({
                    nombre: tour.nombre,
                    descripcion: tour.descripcion,
                    precioBase: tour.precioBase,
                    duracionMinutos: tour.duracionMinutos,
                    especialidadId: tour.especialidadId,
                    // La imagen real del tour vive en localStorage, no en la
                    // respuesta del API (ver lib/imagenLocal.js).
                    imagenUrl: getImagenLocal(tour.id) ?? "",
                })
            })
            .catch((err) => {
                toast.error(err.message || "No se pudo cargar el tour")
                navigate("/tours")
            })
            .finally(() => setCargandoTour(false))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, esEdicion])

    async function onSubmit(valores) {
        // Separamos imagenUrl del resto: NO se manda al API (rompería la
        // validación del campo "imagen", que espera un nombre de archivo).
        const { imagenUrl, ...datosTour } = valores
        setEnviando(true)

        try {
            let tourId = id

            if (esEdicion) {
                await serviciosService.actualizar(id, datosTour)
                toast.success("Tour actualizado correctamente")
            } else {
                const response = await serviciosService.crear(datosTour)
                // En modo creación todavía no teníamos el id (lo genera el
                // backend), lo sacamos de la respuesta para poder guardar la
                // imagen asociada a ESE tour específico.
                tourId = response.data.id
                toast.success("Tour creado correctamente")
            }

            // Bypass temporal de imagen: se guarda aparte, del lado del cliente.
            setImagenLocal(tourId, imagenUrl || null)

            navigate("/tours")
        } catch (err) {
            toast.error(err.message || "No se pudo guardar el tour")
        } finally {
            setEnviando(false)
        }
    }

    if (cargandoTour) {
        return <p className="mx-auto max-w-xl px-4 py-12 text-center">Cargando tour...</p>
    }

    return (
        <div className="mx-auto max-w-xl px-4 py-10">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">
                        {esEdicion ? "Editar tour" : "Nuevo tour"}
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="nombre"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre del tour</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Tour Volcán Arenal — La Fortuna" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="descripcion"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descripción</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                rows={4}
                                                placeholder="Incluye ubicación, qué incluye, nivel de dificultad..."
                                                {...field}
                                            />
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
                                        <FormLabel>Categoría</FormLabel>
                                        {/* Select de shadcn no es un <select> nativo: no acepta
                                            {...field} directo, por eso conectamos value/onValueChange
                                            a mano en vez de spreadear field como en los <Input>. */}
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value ? String(field.value) : ""}
                                            disabled={cargandoEspecialidades}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    {/* Base UI (a diferencia de Radix) no traduce
                                                        automáticamente el value seleccionado a su
                                                        etiqueta — hay que decirle cómo hacerlo con
                                                        esta función. Sin esto, muestra el id crudo. */}
                                                    <SelectValue placeholder="Selecciona una categoría">
                                                        {(value) =>
                                                            !value
                                                                ? "Selecciona una categoría"
                                                                : especialidades?.find(
                                                                      (e) => String(e.id) === value
                                                                  )?.nombre
                                                        }
                                                    </SelectValue>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {especialidades?.map((especialidad) => (
                                                    <SelectItem
                                                        key={especialidad.id}
                                                        value={String(especialidad.id)}
                                                    >
                                                        {especialidad.nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="precioBase"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Precio por persona (₡)</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="0" step="1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="duracionMinutos"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Duración (minutos)</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="15" max="480" step="1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="imagenUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        {/* "(temporal)" a propósito en la etiqueta: recordatorio
                                            visual de que este campo es un bypass, no el flujo real. */}
                                        <FormLabel>URL de imagen (temporal)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="url"
                                                placeholder="https://ejemplo.com/foto.jpg"
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
                                            : "Crear tour"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate("/tours")}
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