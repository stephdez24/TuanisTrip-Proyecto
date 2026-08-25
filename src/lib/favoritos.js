// src/lib/favoritos.js
//
// Favoritos es pura capa de UX en localStorage — no existe como concepto
// en el API (no hay tabla ni endpoint de favoritos). Guarda referencias a
// tours o guías ya reales del sistema, nunca datos inventados.

const CLAVE = "tuanisTripFavoritos";

function leer() {
    try {
        const datos = JSON.parse(localStorage.getItem(CLAVE));
        return Array.isArray(datos) ? datos : [];
    } catch {
        return [];
    }
}

function guardar(favoritos) {
    localStorage.setItem(CLAVE, JSON.stringify(favoritos));
}

export function obtenerFavoritos() {
    return leer();
}

export function esFavoritoGuardado(tipo, id) {
    return leer().some((f) => f.tipo === tipo && f.id === id);
}

// Agrega o quita según corresponda, y devuelve la lista ya actualizada.
export function alternarFavoritoGuardado(tipo, id) {
    const favoritos = leer();
    const existe = favoritos.some((f) => f.tipo === tipo && f.id === id);
    const actualizado = existe
        ? favoritos.filter((f) => !(f.tipo === tipo && f.id === id))
        : [...favoritos, { tipo, id }];
    guardar(actualizado);
    return actualizado;
}