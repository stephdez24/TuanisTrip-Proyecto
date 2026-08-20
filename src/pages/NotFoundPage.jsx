import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

// Ruta comodín: en App.jsx está registrada como <Route path="*" .../>,
// así que cualquier URL que no coincida con ninguna ruta cae aquí
// (requisito del enunciado: "Página 404 (No encontrada)").
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