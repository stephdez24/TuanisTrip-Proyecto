import { useCallback, useEffect, useState } from "react";
import {
    obtenerSolicitudes,
    agregarSolicitud,
    marcarSolicitudAtendida,
    eliminarSolicitud,
} from "@/lib/solicitudes";

const EVENTO = "tuanisTripSolicitudesActualizadas";

export function useSolicitudes() {
    const [solicitudes, setSolicitudes] = useState(obtenerSolicitudes);

    useEffect(() => {
        function actualizar() {
            setSolicitudes(obtenerSolicitudes());
        }
        window.addEventListener(EVENTO, actualizar);
        return () => window.removeEventListener(EVENTO, actualizar);
    }, []);

    const agregar = useCallback((solicitud) => {
        setSolicitudes(agregarSolicitud(solicitud));
        window.dispatchEvent(new Event(EVENTO));
    }, []);

    const marcarAtendida = useCallback((id) => {
        setSolicitudes(marcarSolicitudAtendida(id));
        window.dispatchEvent(new Event(EVENTO));
    }, []);

    const eliminar = useCallback((id) => {
        setSolicitudes(eliminarSolicitud(id));
        window.dispatchEvent(new Event(EVENTO));
    }, []);

    return { solicitudes, agregar, marcarAtendida, eliminar };
}