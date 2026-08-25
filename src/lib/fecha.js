// src/lib/fecha.js
//
// Formatea un string plano "YYYY-MM-DD" del API a "D/M/YYYY" sin pasar por
// new Date(), que interpreta la fecha como medianoche UTC y puede correrla
// un día hacia atrás al mostrarla en una zona horaria negativa (como Costa
// Rica, UTC-6) — el mismo bug que ya corregimos en restriccionTexto.js.

export function formatearFechaCorta(fechaIso) {
    const [anio, mes, dia] = fechaIso.split("-").map(Number)
    return `${dia}/${mes}/${anio}`
}

// Formato largo tipo "domingo, 6 de septiembre de 2026". Ancla la fecha con
// hora LOCAL explícita ("T00:00:00", sin "Z") en vez de dejar que new Date()
// la interprete como UTC — así toLocaleDateString no la corre un día para
// atrás en zonas horarias negativas.
export function formatearFechaLarga(fechaIso) {
    const fecha = new Date(`${fechaIso}T00:00:00`)
    return fecha.toLocaleDateString("es-CR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    })
}

// GET /empleados/:id devuelve las restricciones SIN pasar por el
// formateador del backend (a diferencia de /restricciones-horario) — la
// fecha llega como ISO completo ("2026-10-01T00:00:00.000Z") y las horas
// como timestamps de 1970 ("1970-01-01T08:00:00.000Z"). Se extrae la parte
// útil con slice() en vez de new Date(), para no depender de ninguna
// conversión de zona horaria (el offset "Z" ya nos dice que es UTC).
export function formatearFechaCortaDesdeISO(fechaIsoCompleta) {
    return formatearFechaCorta(fechaIsoCompleta.slice(0, 10))
}

export function horaDesdeISO(horaIsoCompleta) {
    return horaIsoCompleta.slice(11, 16)
}