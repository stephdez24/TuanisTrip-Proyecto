
// Funciones puras para trabajar con horas en formato "HH:mm" (el que
// usa el API). No dependen de date-fns porque solo necesitamos sumar
// minutos dentro del mismo día — una librería completa sería excesiva
// para esto.

// "09:00" + 90 minutos -> "10:30"
export function sumarMinutos(horaHHmm, minutos) {
    const [horas, mins] = horaHHmm.split(":").map(Number)
    const totalMinutos = horas * 60 + mins + minutos
    const horasFinal = Math.floor(totalMinutos / 60) % 24
    const minsFinal = totalMinutos % 60
    return `${String(horasFinal).padStart(2, "0")}:${String(minsFinal).padStart(2, "0")}`
}

// Convierte "HH:mm" a minutos desde medianoche, útil para comparar/ordenar.
export function minutosDesdeMedianoche(horaHHmm) {
    const [horas, mins] = horaHHmm.split(":").map(Number)
    return horas * 60 + mins
}