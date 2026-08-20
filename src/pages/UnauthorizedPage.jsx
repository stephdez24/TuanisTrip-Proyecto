import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function UnauthorizedPage() {
    return (
        <div className="mx-auto max-w-md px-4 py-24 text-center">
            <h1 className="text-2xl font-semibold">No tienes acceso a esta sección</h1>
            <p className="mt-2 text-muted-foreground">
                Tu rol actual no tiene permiso para ver esta página.
            </p>
            <Button asChild className="mt-6">
                <Link to="/">Volver al inicio</Link>
            </Button>
        </div>
    )
}