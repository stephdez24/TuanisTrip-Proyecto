// src/lib/api-client.js
//
// Wrapper central sobre fetch() para hablar con el API de api-citas.
// - Agrega automáticamente el header Authorization cuando hay token.
// - Normaliza los errores del backend ({ success:false, message, validationErrors? })
//   en una única clase ApiError, para que el resto de la app no tenga que
//   parsear la forma de la respuesta en cada lugar.

const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  // Aviso solo en consola: mejor detectarlo temprano que tener un 404 silencioso.
    console.warn(
    "VITE_API_URL no está definida. Agrega VITE_API_URL=http://localhost:3000 en tu .env"
    );
}

const TOKEN_KEY = "tuanisTripToken";

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
    constructor(message, { status, validationErrors } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.validationErrors = validationErrors ?? null;
    }
}

/**
 * @param {string} path - ej. "/servicios" o "/citas/5"
 * @param {object} options
 * @param {string} [options.method]
 * @param {object} [options.body] - se serializa a JSON automáticamente
 * @param {boolean} [options.auth] - si es false, no manda el header Authorization aunque haya token
 */
export async function apiFetch(path, { method = "GET", body, auth = true } = {}) {
    const headers = { "Content-Type": "application/json" };

    if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    }

    let response;
    try {
        response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new ApiError("No se pudo conectar con el servidor. Verifica tu conexión.");
    }

    // 204 No Content u otras respuestas sin cuerpo
    const hasBody = response.status !== 204;
    const data = hasBody ? await response.json().catch(() => null) : null;

    if (!response.ok) {
        const message = data?.message || "Ocurrió un error inesperado";
        throw new ApiError(message, {
        status: response.status,
        validationErrors: data?.validationErrors,
        });
    }

    return data;
    }

    export const apiClient = {
    get: (path, options) => apiFetch(path, { ...options, method: "GET" }),
    post: (path, body, options) => apiFetch(path, { ...options, method: "POST", body }),
    put: (path, body, options) => apiFetch(path, { ...options, method: "PUT", body }),
    patch: (path, body, options) => apiFetch(path, { ...options, method: "PATCH", body }),
    };