// src/lib/restriccionTexto.js
//
// Pequeño helper compartido entre el listado y el detalle de Restricciones,
// para no repetir la misma lógica de "todoElDia ? ... : horaInicio-horaFin"
// en dos componentes distintos.

export function textoHorarioRestriccion(restriccion) {
    if (restriccion.todoElDia) return "Todo el día";
    if (restriccion.horaInicio && restriccion.horaFin) {
        return `${restriccion.horaInicio} – ${restriccion.horaFin}`;
    }
    return "—";
}

export function textoAlcanceRestriccion(restriccion) {
    if (!restriccion.empleado) return "General (todo el establecimiento)";
    const { nombre, primerApellido } = restriccion.empleado.usuario;
    return `Solo guía: ${nombre} ${primerApellido}`;
}

// Formatea "2026-09-15" (string plano del API) a "15 de septiembre de 2026"
// sin pasar por new Date(), que interpretaría la fecha en la zona horaria
// local y podría correrla un día.
export function formatearFechaRestriccion(fechaIso) {
    const [anio, mes, dia] = fechaIso.split("-").map(Number);
    const meses = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
    ];
    return `${dia} de ${meses[mes - 1]} de ${anio}`;
}