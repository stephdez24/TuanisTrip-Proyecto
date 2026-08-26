import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ImagePlus, Loader2 } from "lucide-react"

import { tourSchema } from "@/schemas/tourSchemas"
import { serviciosService } from "@/services/serviciosService"
import { especialidadesService } from "@/services/especialidadesService"
import { imagenesService } from "@/services/imagenesService"
import { useFetch } from "@/lib/useFetch"

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

const TIPOS_VALIDOS = ["image/jpeg", "image/png", "image/webp"]
const TAMANO_MAXIMO = 2 * 1024 * 1024 // 2 MB, igual al límite real del backend

// Un solo componente para crear y editar tours: el modo se decide con la
// presencia de :id en la URL (mismo patrón que ExtraFormPage.jsx).
export default function TourFormPage() {
    const { id } = useParams()
    const esEdicion = Boolean(id)
    const navigate = useNavigate()
    const [enviando, setEnviando] = useState(false)
    const [cargandoTour, setCargandoTour] = useState(esEdicion)

    // Vista previa de la imagen — separada del valor real del formulario
    // (que solo guarda el NOMBRE del archivo, no la URL) para poder
    // mostrar algo de inmediato al elegir un archivo nuevo.

    //Recordar la foto que se está previsualizando antes de guardar
    const [previewUrl, setPreviewUrl] = useState(null)
    const [subiendoImagen, setSubiendoImagen] = useState(false)

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
            imagen: "",
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
                    imagen: tour.imagen ?? "",
                })
                // tour.imagen ya viene del API real — se arma la URL de
                // descarga directa para mostrar la foto actual.
                setPreviewUrl(imagenesService.urlDescarga(tour.imagen))
            })
            .catch((err) => {
                toast.error(err.message || "No se pudo cargar el tour")
                navigate("/tours")
            })
            .finally(() => setCargandoTour(false))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, esEdicion])

    // Se sube la imagen EN CUANTO se elige el archivo (no se espera al
    // envío del formulario) — así el usuario ve de inmediato si falló por
    // formato/tamaño, sin perder el resto de los datos ya llenados.
    async function handleArchivoChange(e) {
        const archivo = e.target.files?.[0]
        if (!archivo) return

        // Validación proactiva en el FrontEnd — mismo criterio que el resto
        // del proyecto: no depender solo del error que devuelva el backend.
        if (!TIPOS_VALIDOS.includes(archivo.type)) {
            toast.error("Solo se permiten imágenes JPG, PNG o WEBP")
            e.target.value = ""
            return
        }
        if (archivo.size > TAMANO_MAXIMO) {
            toast.error("La imagen no debe superar los 2 MB")
            e.target.value = ""
            return
        }

        setPreviewUrl(URL.createObjectURL(archivo))
        setSubiendoImagen(true)
        try {
            // Si ya había una imagen (edición o reintento), se manda como
            // previousFileName para que el backend la borre al reemplazarla
            // y no queden archivos huérfanos en el servidor.
            const nombreAnterior = form.getValues("imagen") || undefined
            const fileName = await imagenesService.subir(archivo, nombreAnterior)
            form.setValue("imagen", fileName, { shouldValidate: true })
            toast.success("Imagen subida correctamente")
        } catch (err) {
            toast.error(err.message || "No se pudo subir la imagen")
        } finally {
            setSubiendoImagen(false)
        }
    }

    async function onSubmit(valores) {
        // Ya no hay que separar nada: "imagen" es un campo real del API
        // (el nombre del archivo ya subido), se manda tal cual con el resto.
        setEnviando(true)
        try {
            if (esEdicion) {
                await serviciosService.actualizar(id, valores)
                toast.success("Tour actualizado correctamente")
            } else {
                await serviciosService.crear(valores)
                toast.success("Tour creado correctamente")
            }
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

                            {/* Imagen real: selección de archivo + vista previa,
                                subida de inmediato al endpoint real del API. */}
                            <FormField
                                control={form.control}
                                name="imagen"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Imagen del tour</FormLabel>
                                        <FormControl>
                                            <div className="space-y-3">
                                                {previewUrl && (
                                                    <img
                                                        src={previewUrl}
                                                        alt="Vista previa"
                                                        className="h-40 w-full rounded-lg border object-cover"
                                                    />
                                                )}
                                                <label
                                                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground transition-colors hover:bg-secondary/50 ${
                                                        subiendoImagen ? "pointer-events-none opacity-60" : ""
                                                    }`}
                                                >
                                                    {subiendoImagen ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                            Subiendo imagen...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ImagePlus className="h-4 w-4" />
                                                            {previewUrl
                                                                ? "Cambiar imagen"
                                                                : "Seleccionar imagen (JPG, PNG o WEBP, máx. 2MB)"}
                                                        </>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/webp"
                                                        className="hidden"
                                                        onChange={handleArchivoChange}
                                                        disabled={subiendoImagen}
                                                    />
                                                </label>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="submit"
                                    disabled={enviando || subiendoImagen}
                                    className="flex-1"
                                >
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