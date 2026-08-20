// src/lib/imagenLocal.js
//
// BYPASS TEMPORAL: el API espera que "imagen" sea el nombre de un archivo
// ya subido (ej. "tour-arenal.jpg"), pero no existe ningún endpoint conectado
// para subir ese archivo (ver referencia técnica del API). Mientras se
// resuelve con el profesor, guardamos aquí -del lado del cliente- la URL
// que la persona pega en el formulario, y la usamos solo para mostrarla.
//
// Esto NO sustituye el campo "imagen" real del backend: al crear/editar un
// servicio seguimos enviando imagen: null, que sí es válido para el API.

const STORAGE_KEY = "tuanisTripImagenesServicios";

function leerMapa() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
    } catch {
        return {};
    }
}

function guardarMapa(mapa) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mapa));
}

export function getImagenLocal(servicioId) {
    return leerMapa()[servicioId] ?? null;
}

export function setImagenLocal(servicioId, url) {
    const mapa = leerMapa();
    if (url) {
        mapa[servicioId] = url;
    } else {
    delete mapa[servicioId];
    }
    guardarMapa(mapa);
}