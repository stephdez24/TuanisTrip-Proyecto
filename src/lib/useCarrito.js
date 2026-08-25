import { useCallback, useEffect, useState } from "react";
import {
    obtenerCarrito,
    agregarAlCarrito,
    quitarDelCarrito,
    vaciarCarrito,
} from "@/lib/carrito";

const EVENTO = "tuanisTripCarritoActualizado";

export function useCarrito() {
    const [carrito, setCarrito] = useState(obtenerCarrito);

    useEffect(() => {
        function actualizar() {
            setCarrito(obtenerCarrito());
        }
        window.addEventListener(EVENTO, actualizar);
        return () => window.removeEventListener(EVENTO, actualizar);
    }, []);

    const agregar = useCallback((item) => {
        setCarrito(agregarAlCarrito(item));
        window.dispatchEvent(new Event(EVENTO));
    }, []);

    const quitar = useCallback((indice) => {
        setCarrito(quitarDelCarrito(indice));
        window.dispatchEvent(new Event(EVENTO));
    }, []);

    const vaciar = useCallback(() => {
        setCarrito(vaciarCarrito());
        window.dispatchEvent(new Event(EVENTO));
    }, []);

    return { carrito, agregar, quitar, vaciar };
}