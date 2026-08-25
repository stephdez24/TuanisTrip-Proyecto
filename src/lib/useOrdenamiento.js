// Hook genérico para ordenar cualquier listado ya cargado en memoria (el
// filtrado real de datos lo sigue haciendo el backend — esto es solo el
// ORDEN en que se muestran, que la rúbrica pide explícitamente: "Los
// listados permiten ordenar la información mostrada").
//
// Ordenamiento por VARIAS columnas a la vez, con clic normal (sin
// necesitar Shift ni ninguna tecla especial): cada clic en un encabezado
// agrega o alterna ESE campo dentro de la lista de criterios, sin tocar
// los demás. La prioridad de desempate sigue el orden en que se hizo
// clic en cada columna (la primera que tocaste manda primero).
//
// Convención de flechas (a propósito, decisión del equipo): ↑ = "mayor/
// más reciente primero" (orden descendente de los datos), no la
// convención matemática de Excel — por eso el primer clic en un
// encabezado empieza en "desc".
//
// Uso:
//   const { datosOrdenados, criterios, alternarOrden, limpiarOrden } =
//     useOrdenamiento(citas, { fecha: (c) => c.fecha }, "fecha")

import { useMemo, useState } from "react"

export function useOrdenamiento(datos, extractores, campoInicial) {
    const [criterios, setCriterios] = useState(
        campoInicial ? [{ campo: campoInicial, direccion: "desc" }] : []
    )

    function alternarOrden(nuevoCampo) {
        setCriterios((actuales) => {
            const existente = actuales.find((c) => c.campo === nuevoCampo)

            if (!existente) {
                // No estaba en la lista: se agrega al final (menor prioridad).
                return [...actuales, { campo: nuevoCampo, direccion: "desc" }]
            }
            if (existente.direccion === "desc") {
                // Segundo clic en esta columna: invierte su dirección, sin
                // tocar su posición en la lista de prioridad.
                return actuales.map((c) =>
                    c.campo === nuevoCampo ? { ...c, direccion: "asc" } : c
                )
            }
            // Tercer clic en esta columna: la quita de la lista.
            return actuales.filter((c) => c.campo !== nuevoCampo)
        })
    }

    function limpiarOrden() {
        setCriterios([])
    }

    // Para páginas en grid de tarjetas (sin encabezados de columna donde
    // hacer clic): un selector tipo "Ordenar por" fija directamente UN
    // criterio exacto, sin el ciclo de alternar/agregar de alternarOrden.
    function establecerOrden(campo, direccion) {
        setCriterios(campo ? [{ campo, direccion }] : [])
    }

    const datosOrdenados = useMemo(() => {
        if (!datos || criterios.length === 0) return datos
        const copia = [...datos]
        copia.sort((a, b) => {
            for (const { campo, direccion } of criterios) {
                const extraer = extractores[campo]
                if (!extraer) continue
                const va = extraer(a)
                const vb = extraer(b)
                if (va < vb) return direccion === "asc" ? -1 : 1
                if (va > vb) return direccion === "asc" ? 1 : -1
                // Empate en este criterio: sigue al siguiente de la lista.
            }
            return 0
        })
        return copia
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [datos, criterios])

    return { datosOrdenados, criterios, alternarOrden, limpiarOrden, establecerOrden }
}