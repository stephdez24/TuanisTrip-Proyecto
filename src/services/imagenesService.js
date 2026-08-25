// src/services/imagenesService.js
//
// A diferencia del resto de servicios, esta llamada NO puede pasar por
// apiFetch (lib/api-client.js): esa función siempre serializa el body a
// JSON y fija Content-Type: application/json — pero subir un archivo
// necesita mandar FormData con Content-Type: multipart/form-data (que el
// navegador arma solo, con el boundary correcto, SOLO si uno no fija ese
// header a mano). Por eso este servicio hace su propio fetch() directo,
// reutilizando el token y la clase ApiError del cliente central.

import { getToken, ApiError } from "@/lib/api-client";

const BASE_URL = import.meta.env.VITE_API_URL;

export const imagenesService = {
    // archivo: File del <input type="file">.
    // nombreAnterior: opcional — el fileName ya guardado, para que el
    // backend borre la imagen vieja al reemplazarla (evita huérfanos).
    // Devuelve el fileName nuevo (string) que hay que guardar en el
    // campo `imagen` del servicio.
    async subir(archivo, nombreAnterior) {
        const formData = new FormData();
        formData.append("image", archivo);
        if (nombreAnterior) {
            formData.append("previousFileName", nombreAnterior);
        }

        const headers = {};
        const token = getToken();
        if (token) headers.Authorization = `Bearer ${token}`;
        // OJO: a propósito NO se fija "Content-Type" acá — si se fija a
        // mano, el navegador ya no arma el boundary del multipart y el
        // backend no puede leer el archivo.

        let response;
        try {
            response = await fetch(`${BASE_URL}/images/upload`, {
                method: "POST",
                headers,
                body: formData,
            });
        } catch {
            throw new ApiError("No se pudo conectar con el servidor. Verifica tu conexión.");
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new ApiError(data?.message || "No se pudo subir la imagen", {
                status: response.status,
            });
        }

        return data.fileName;
    },

    // Arma la URL directa para usar en un <img src="...">.
    urlDescarga(nombreArchivo) {
        if (!nombreArchivo) return null;
        return `${BASE_URL}/images/download/${nombreArchivo}`;
    },
};