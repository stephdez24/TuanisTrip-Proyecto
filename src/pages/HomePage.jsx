// Placeholder de la página de inicio. El enunciado pide una sección de
// "tours destacados" cargada dinámicamente aquí — se completa cuando
// lleguemos a esa parte del checklist (por ahora solo texto fijo).
export default function HomePage() {
    return (
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
            <h1 className="text-4xl font-semibold">Tuanis Trip</h1>
            <p className="mt-4 text-muted-foreground">
                Explora tours turísticos por Costa Rica. (Sección de tours destacados —
                próximo paso del checklist.)
            </p>
        </div>
    )
}