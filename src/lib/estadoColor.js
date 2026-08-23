// src/lib/estadoColor.js
//
// El API devuelve el color de cada estado de cita como texto libre
// ("amarillo", "azul", etc. — ver seed.ts del backend). Este helper lo
// traduce a clases de Tailwind, para no hardcodear la paleta en cada
// componente que muestra un estado.

const MAPA_COLORES = {
    amarillo: "bg-yellow-100 text-yellow-800 border-yellow-300",
    azul: "bg-blue-100 text-blue-800 border-blue-300",
    morado: "bg-purple-100 text-purple-800 border-purple-300",
    verde: "bg-green-100 text-green-800 border-green-300",
    rojo: "bg-red-100 text-red-800 border-red-300",
    };

export function clasesEstadoColor(colorTexto) {
    return MAPA_COLORES[colorTexto] ?? "bg-secondary text-secondary-foreground";
}