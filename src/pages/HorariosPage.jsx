import { horariosService } from "@/services/horariosService"
import { useFetch } from "@/lib/useFetch"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Solo lectura: el enunciado no permite crear/editar/eliminar horarios
// desde el FrontEnd. Visible para los 3 roles (a diferencia de
// Restricciones, que es solo Admin/Empleado) — por eso esta pantalla vive
// como ruta pública en App.jsx, igual que Tours/Extras/Guías.

export default function HorariosPage() {
    const { data, loading, error } = useFetch(() => horariosService.listar())

    const horarios = data ?? []

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <div className="border-l-4 border-ring pl-4">
                <h1 className="text-2xl font-bold text-primary">
                    Temporada de atención
                </h1>
                <p className="text-muted-foreground">
                    Días y horarios en los que el establecimiento recibe reservas.
                </p>
            </div>

            {loading && (
                <p className="text-muted-foreground">Cargando horarios...</p>
            )}
            {error && (
                <p className="text-destructive">
                    No se pudieron cargar los horarios: {error.message}
                </p>
            )}

            {!loading && !error && horarios.length === 0 && (
                <p className="text-muted-foreground">
                    Todavía no hay horarios registrados.
                </p>
            )}

            <div className="space-y-3">
                {horarios.map((h) => (
                    <Card key={h.id}>
                        <CardContent className="flex items-center justify-between gap-4 p-4">
                            <div className="flex items-center gap-3">
                                <span className="font-semibold text-primary">
                                    {h.diaSemana?.nombre}
                                </span>
                                {!h.activo && (
                                    <Badge variant="destructive">Inactivo</Badge>
                                )}
                            </div>
                            <span className="font-medium">
                                {h.activo ? `${h.horaInicio} – ${h.horaFin}` : "Cerrado"}
                            </span>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}