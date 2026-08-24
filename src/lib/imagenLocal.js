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

// ------------------------------------------------------------------
// Hidratación desde datos "semilla" (public/data/imagenes-seed.json)
// ------------------------------------------------------------------
// El script de Node que crea los tours/guías demo no puede escribir en
// localStorage (corre fuera del navegador). En su lugar, genera ese
// archivo JSON con { tours: {id: url}, guias: {id: url} }. Esta función
// lo carga UNA VEZ, y solo completa las entradas que todavía no existen
// en localStorage — así no pisa una imagen que alguien ya cambió a mano
// desde el formulario.
const STORAGE_KEY_GUIAS = "tuanisTripImagenesGuias";

function leerMapaGuias() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_GUIAS)) ?? {};
  } catch {
    return {};
  }
}

function guardarMapaGuias(mapa) {
  localStorage.setItem(STORAGE_KEY_GUIAS, JSON.stringify(mapa));
}

export function getImagenLocalGuia(empleadoId) {
  return leerMapaGuias()[empleadoId] ?? null;
}

export function setImagenLocalGuia(empleadoId, url) {
  const mapa = leerMapaGuias();
  if (url) {
    mapa[empleadoId] = url;
  } else {
    delete mapa[empleadoId];
  }
  guardarMapaGuias(mapa);
}

export async function hidratarImagenesSemilla() {
  try {
    const respuesta = await fetch("/data/imagenes-seed.json");
    if (!respuesta.ok) return; // el archivo no existe todavía, no pasa nada

    const semilla = await respuesta.json();

    const mapaTours = leerMapa();
    let cambioTours = false;
    for (const [id, url] of Object.entries(semilla.tours ?? {})) {
      if (!mapaTours[id]) {
        mapaTours[id] = url;
        cambioTours = true;
      }
    }
    if (cambioTours) guardarMapa(mapaTours);

    const mapaGuias = leerMapaGuias();
    let cambioGuias = false;
    for (const [id, url] of Object.entries(semilla.guias ?? {})) {
      if (!mapaGuias[id]) {
        mapaGuias[id] = url;
        cambioGuias = true;
      }
    }
    if (cambioGuias) guardarMapaGuias(mapaGuias);

    // Mismo patrón para el handle de Instagram de cada guía: no existe
    // ese campo en el modelo de Empleado/Usuario, así que también vive
    // como bypass local, sembrado por seed-demo-data.mjs.
    const mapaInstagram = leerMapaInstagram();
    let cambioInstagram = false;
    for (const [id, handle] of Object.entries(semilla.instagramGuias ?? {})) {
      if (!mapaInstagram[id]) {
        mapaInstagram[id] = handle;
        cambioInstagram = true;
      }
    }
    if (cambioInstagram) guardarMapaInstagram(mapaInstagram);
  } catch {
    // Sin conexión o archivo ausente: no es crítico, la app sigue
    // funcionando con las imágenes de relleno por defecto.
  }
}

// ------------------------------------------------------------------
// Instagram del guía (bypass local, mismo motivo que las imágenes: no
// existe ese campo en el modelo del backend).
// ------------------------------------------------------------------
const STORAGE_KEY_INSTAGRAM = "tuanisTripInstagramGuias";

function leerMapaInstagram() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_INSTAGRAM)) ?? {};
    } catch {
        return {};
    }
}

function guardarMapaInstagram(mapa) {
    localStorage.setItem(STORAGE_KEY_INSTAGRAM, JSON.stringify(mapa));
}

export function getInstagramGuia(empleadoId) {
    return leerMapaInstagram()[empleadoId] ?? null;
}