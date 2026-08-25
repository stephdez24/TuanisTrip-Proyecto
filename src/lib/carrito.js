// src/lib/carrito.js
//
// "Mi selección" es capa de UX en localStorage, igual que Favoritos — NO
// crea citas reales. El Cliente arma su selección de tours con fecha
// tentativa; según la matriz de permisos del enunciado, el Cliente no
// puede crear citas (eso lo hace Admin/Empleado), así que "confirmar" acá
// nunca llama a POST /citas — solo le indica a la persona que el equipo
// de Tuanis Trip completará la reserva por ella.

const CLAVE = "tuanisTripCarrito";

function leer() {
    try {
        const datos = JSON.parse(localStorage.getItem(CLAVE));
        return Array.isArray(datos) ? datos : [];
    } catch {
        return [];
    }
}

function guardar(items) {
    localStorage.setItem(CLAVE, JSON.stringify(items));
}

export function obtenerCarrito() {
    return leer();
}

// item: { servicioId, fecha }
export function agregarAlCarrito(item) {
    const actualizado = [...leer(), item];
    guardar(actualizado);
    return actualizado;
}

export function quitarDelCarrito(indice) {
    const actualizado = leer().filter((_, i) => i !== indice);
    guardar(actualizado);
    return actualizado;
}

export function vaciarCarrito() {
    guardar([]);
    return [];
}