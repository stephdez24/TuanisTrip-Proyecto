import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { useAuth } from "@/auth/useAuth"
import { registroSchema } from "@/schemas/usuarioSchemas"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card"

// Registro público de CLIENTES únicamente. El API fuerza ese rol del lado
// del servidor sin importar qué mandemos aquí — no hay forma de crear un
// Administrador o Empleado desde este formulario (por diseño del backend,
// coincide con lo que pide el enunciado).
export default function RegistroPage() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [enviando, setEnviando] = useState(false)

    const form = useForm({
        resolver: zodResolver(registroSchema),
        defaultValues: {
            nombre: "",
            primerApellido: "",
            segundoApellido: "",
            correo: "",
            telefono: "",
            password: "",
        },
    })

    async function onSubmit(valores) {
        setEnviando(true)
        try {
            await register(valores)
            toast.success("Cuenta creada correctamente. Ahora puedes iniciar sesión.")
            navigate("/login")
        } catch (error) {
            // 409 = correo duplicado, 400 = datos inválidos que Zod no haya
            // atrapado del lado del cliente; cualquiera de los dos cae aquí.
            toast.error(error.message || "No se pudo completar el registro.")
        } finally {
            setEnviando(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl">Crear cuenta</CardTitle>
                    <CardDescription>
                        Regístrate para reservar tus tours en Tuanis Trip
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="nombre"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre</FormLabel>
                                        <FormControl>
                                            <Input placeholder="María" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Los dos apellidos en la misma fila para ahorrar espacio
                                vertical; segundoApellido es opcional según el DTO del API. */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="primerApellido"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Primer apellido</FormLabel>
                                            <FormControl>
                                                <Input placeholder="López" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="segundoApellido"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Segundo apellido</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Mora (opcional)" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="correo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Correo electrónico</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="correo@example.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="telefono"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Teléfono</FormLabel>
                                        <FormControl>
                                            <Input placeholder="8888-8888 (opcional)" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contraseña</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full" disabled={enviando}>
                                {enviando ? "Creando cuenta..." : "Crear cuenta"}
                            </Button>
                        </form>
                    </Form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        ¿Ya tienes una cuenta?{" "}
                        <Link to="/login" className="font-semibold underline">
                            Inicia sesión
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}