import { useParams, useNavigate } from "react-router-dom"
import { restriccionesHorarioService } from "@/services/restriccionesHorarioService"
import { useFetch } from "@/lib/useFetch"
import {
    textoHorarioRestriccion,
    textoAlcanceRestriccion,
    formatearFechaRestriccion,
} from "@/lib/restriccionTexto"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function RestriccionDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data, loading, error } = useFetch(
        () => restriccionesHorarioService.obtenerPorId(id),
        [id]
    )

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <p className="text-muted-foreground">Cargando restricción...</p>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="max-w-2xl mx-auto p-6 space-y-4">
                <p className="text-destructive">
                    No se pudo cargar esta restricción.
                    {error ? ` (${error.message})` : ""}
                </p>
                <Button variant="outline" onClick={() => navigate("/restricciones")}>
                    Volver
                </Button>
            </div>
        )
    }

    const r = data

    return (
        <div className="max-w-2xl mx-auto p-6">
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl">
                                {formatearFechaRestriccion(r.fecha)}
                            </CardTitle>
                            <p className="text-muted-foreground text-sm mt-1">
                                {r.tipoRestriccion?.nombre}
                            </p>
                        </div>
                        <Badge variant={r.activo ? "default" : "destructive"}>
                            {r.activo ? "Vigente" : "Inactiva"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Horario afectado</p>
                            <p className="font-medium">{textoHorarioRestriccion(r)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Alcance</p>
                            <p className="font-medium">{textoAlcanceRestriccion(r)}</p>
                        </div>
                    </div>

                    {r.empleado && (
                        <div>
                            <p className="text-sm text-muted-foreground">Correo del guía</p>
                            <p className="font-medium">{r.empleado.usuario.correo}</p>
                        </div>
                    )}

                    <div>
                        <p className="text-sm text-muted-foreground">Motivo</p>
                        <p>{r.motivo}</p>
                    </div>

                    <Button variant="outline" onClick={() => navigate("/restricciones")}>
                        Volver
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}