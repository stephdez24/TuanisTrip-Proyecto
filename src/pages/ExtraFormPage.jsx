import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { extraSchema } from "@/schemas/extraSchemas"
import { extrasService } from "@/services/extrasService"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Un solo componente para crear Y editar: el "modo" se decide con la
// presencia de :id en la URL. Evita duplicar el JSX del formulario en dos
// archivos distintos que tendríamos que mantener sincronizados a mano.
export default function ExtraFormPage() {
    const { id } = useParams()
    const esEdicion = Boolean(id) // sin id en la URL -> estamos creando uno nuevo

    const navigate = useNavigate()
    const [enviando, setEnviando] = useState(false) // deshabilita el botón mientras se guarda (evita doble envío)
    const [cargando, setCargando] = useState(esEdicion) // solo hay que "cargar" datos previos en modo edición

    const form = useForm({
        resolver: zodResolver(extraSchema), // conecta react-hook-form con nuestro schema de Zod
        defaultValues: { nombre: "", descripcion: "", precio: "" },
    })

    // Si estamos editando, traemos el extra existente del API y precargamos
    // el formulario con form.reset(). Si estamos creando, este efecto no hace nada.
    useEffect(() => {
        if (!esEdicion) return

        extrasService
            .obtenerPorId(id)
            .then((response) => form.reset(response.data))
            .catch((err) => {
                toast.error(err.message || "No se pudo cargar el extra")
                navigate("/extras")
            })
            .finally(() => setCargando(false))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, esEdicion])

    async function onSubmit(valores) {
        setEnviando(true)
        try {
            if (esEdicion) {
                await extrasService.actualizar(id, valores)
                toast.success("Extra actualizado correctamente")
            } else {
                await extrasService.crear(valores)
                toast.success("Extra creado correctamente")
            }
            navigate("/extras")
        } catch (err) {
            // Si el backend devuelve validationErrors (400), react-hook-form ya
            // marcó los campos individuales por su cuenta vía zodResolver;
            // este toast cubre errores generales (ej. 409 nombre duplicado).
            toast.error(err.message || "No se pudo guardar el extra")
        } finally {
            setEnviando(false)
        }
    }

    if (cargando) {
        return <p className="mx-auto max-w-xl px-4 py-12 text-center">Cargando extra...</p>
    }

    return (
        <div className="mx-auto max-w-xl px-4 py-10">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">
                        {esEdicion ? "Editar extra" : "Nuevo extra"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* <Form {...form}> le pasa el control de react-hook-form a todos
                        los <FormField> de adentro vía Context, así no hay que repetir
                        "control={form.control}" en cada uno manualmente aquí arriba. */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="nombre"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre</FormLabel>
                                        <FormControl>
                                            {/* {...field} inyecta value, onChange, onBlur, name, ref
                                                automáticamente — así el <Input> queda controlado
                                                por react-hook-form sin escribir cada handler a mano. */}
                                            <Input placeholder="Transporte desde hotel" {...field} />
                                        </FormControl>
                                        <FormMessage /> {/* muestra el error de Zod si lo hay */}
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
                                            <Textarea rows={3} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="precio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Precio (₡)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" step="1" {...field} />
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
                                            : "Crear extra"}
                                </Button>
                                <Button
                                    type="button" // MUY importante: sin esto, este botón también
                                    // dispararía el submit del formulario al hacer click.
                                    variant="outline"
                                    onClick={() => navigate("/extras")}
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