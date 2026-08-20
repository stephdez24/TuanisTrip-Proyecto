import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
    return (
        <div className="mx-auto max-w-md px-4 py-24 text-center">
            <h1 className="text-2xl font-semibold">404 — Página no encontrada</h1>
            <p className="mt-2 text-muted-foreground">
                La página que buscas no existe.
            </p>
            <Button asChild className="mt-6">
                <Link to="/">Volver al inicio</Link>
            </Button>
        </div>
    )
}