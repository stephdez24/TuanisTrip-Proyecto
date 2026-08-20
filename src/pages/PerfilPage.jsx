import { useAuth } from "@/auth/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function PerfilPage() {
    const { user } = useAuth()

    if (!user) return null // RoleRoute ya garantiza sesión activa antes de llegar aquí

    return (
        <div className="mx-auto max-w-xl px-4 py-12">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Mi perfil
                        <Badge variant="secondary">{user.rol?.nombre}</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <p>
                        <span className="font-medium">Nombre: </span>
                        {user.nombre} {user.primerApellido} {user.segundoApellido ?? ""}
                    </p>
                    <p>
                        <span className="font-medium">Correo: </span>
                        {user.correo}
                    </p>
                    <p>
                        <span className="font-medium">Teléfono: </span>
                        {user.telefono ?? "No registrado"}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}