// src/lib/solicitudes.js
//
// Cola de solicitudes generadas por "Mi selección" (CarritoPage.jsx) —
// capa de UX en localStorage, NO son citas reales (el Cliente no puede
// crear citas). Un Admin/Empleado las revisa acá y, si corresponde,
// crea la reserva de verdad desde el formulario normal.
//
// LIMITACIÓN A PROPÓSITO: al ser localStorage, esto solo es visible si
// Cliente y Admin/Empleado prueban desde el MISMO navegador — no hay
// backend real detrás que sincronice entre dispositivos distintos.

const CLAVE = "tuanisTripSolicitudes";

function leer() {
    try {
        const datos = JSON.parse(localStorage.getItem(CLAVE));
        return Array.isArray(datos) ? datos : [];
    } catch {
        return [];
    }
}

function guardar(solicitudes) {
    localStorage.setItem(CLAVE, JSON.stringify(solicitudes));
}

export function obtenerSolicitudes() {
    return leer();
}

// solicitud: { clienteNombre, clienteCorreo, items: [{servicioId, nombreTour, fecha, precio}] }
export function agregarSolicitud(solicitud) {
    const nueva = {
        id: Date.now(),
        creadoEn: new Date().toISOString(),
        atendida: false,
        ...solicitud,
    };
    const actualizado = [nueva, ...leer()];
    guardar(actualizado);
    return actualizado;
}

export function marcarSolicitudAtendida(id) {
    const actualizado = leer().map((s) =>
        s.id === id ? { ...s, atendida: true } : s
    );
    guardar(actualizado);
    return actualizado;
}

export function eliminarSolicitud(id) {
    const actualizado = leer().filter((s) => s.id !== id);
    guardar(actualizado);
    return actualizado;
}