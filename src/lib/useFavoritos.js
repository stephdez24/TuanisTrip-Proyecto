// src/lib/useFavoritos.js
//
// localStorage no avisa a React cuando cambia dentro de la misma pestaña
// (el evento "storage" nativo solo dispara en OTRAS pestañas) — por eso
// se usa un evento propio, para que el corazón de una tarjeta y el
// contador de la página de Favoritos se mantengan sincronizados sin
// necesitar recargar la página.

import { useCallback, useEffect, useState } from "react";
import { obtenerFavoritos, alternarFavoritoGuardado } from "@/lib/favoritos";

const EVENTO = "tuanisTripFavoritosActualizados";

export function useFavoritos() {
    const [favoritos, setFavoritos] = useState(obtenerFavoritos);

    useEffect(() => {
        function actualizar() {
            setFavoritos(obtenerFavoritos());
        }
        window.addEventListener(EVENTO, actualizar);
        return () => window.removeEventListener(EVENTO, actualizar);
    }, []);

    const alternar = useCallback((tipo, id) => {
        const actualizado = alternarFavoritoGuardado(tipo, id);
        setFavoritos(actualizado);
        window.dispatchEvent(new Event(EVENTO));
    }, []);

    const esFavorito = useCallback(
        (tipo, id) => favoritos.some((f) => f.tipo === tipo && f.id === id),
        [favoritos]
    );

    return { favoritos, alternar, esFavorito };
}