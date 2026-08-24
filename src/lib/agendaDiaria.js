// Convierte la respuesta de GET /citas/agenda-diaria (horarios del día +
// empleados con sus citas/restricciones + restricciones generales) en una
// grilla hora × empleado, calculando el estado de cada celda.

function minutosDesde(hhmm) {
    const [h, m] = hhmm.split(":").map(Number)
    return h * 60 + m
}

// Genera bloques de 1 hora entre horaInicio y horaFin de cada horario del
// día (normalmente un solo horario por día, pero se soporta más de uno
// por si el establecimiento tuviera, por ejemplo, mañana y tarde separadas).
export function generarSlots(horarios) {
    const slots = []
    for (const horario of horarios) {
        let actual = minutosDesde(horario.horaInicio)
        const fin = minutosDesde(horario.horaFin)
        while (actual < fin) {
            const siguiente = Math.min(actual + 60, fin)
            slots.push({
                inicio: actual,
                fin: siguiente,
                etiqueta: `${formatearMinutos(actual)} - ${formatearMinutos(siguiente)}`,
            })
            actual = siguiente
        }
    }
    return slots
}

function formatearMinutos(totalMinutos) {
    const h = String(Math.floor(totalMinutos / 60)).padStart(2, "0")
    const m = String(totalMinutos % 60).padStart(2, "0")
    return `${h}:${m}`
}

function seSolapan(inicioA, finA, inicioB, finB) {
    return inicioA < finB && finA > inicioB
}

// Restricción general o del empleado que cubre completa o parcialmente
// el slot dado. todoElDia cubre cualquier slot; si no, se compara el rango.
function restriccionQueAfecta(slot, restricciones) {
    return restricciones.find((r) => {
        if (r.todoElDia) return true
        if (!r.horaInicio || !r.horaFin) return false
        return seSolapan(slot.inicio, slot.fin, minutosDesde(r.horaInicio), minutosDesde(r.horaFin))
    })
}

function citaQueAfecta(slot, citas) {
    return citas.find((c) =>
        seSolapan(slot.inicio, slot.fin, minutosDesde(c.horaInicio), minutosDesde(c.horaFin))
    )
}

// Calcula el contenido de una celda (empleado × slot). Prioridad:
// restricción general > restricción del empleado > cita > disponible.
// En la práctica el backend nunca deja crear una cita durante una
// restricción, así que el primer caso real siempre gana; el orden es
// solo una salvaguarda defensiva.
export function estadoCelda(slot, empleado, restriccionesGenerales) {
    const restriccionGeneral = restriccionQueAfecta(slot, restriccionesGenerales)
    if (restriccionGeneral) {
        return { tipo: "restriccion", motivo: restriccionGeneral.motivo }
    }

    const restriccionEmpleado = restriccionQueAfecta(slot, empleado.restricciones)
    if (restriccionEmpleado) {
        return { tipo: "restriccion", motivo: restriccionEmpleado.motivo }
    }

    const cita = citaQueAfecta(slot, empleado.citas)
    if (cita) {
        return { tipo: "cita", cita }
    }

    return { tipo: "disponible" }
}