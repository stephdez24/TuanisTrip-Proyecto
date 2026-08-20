// Hook chiquito para no repetir el mismo patrón "cargar al montar, mostrar
// loading, capturar error" en cada página que consulta un catálogo o listado.
//
// Uso:
//   const { data: especialidades, loading, error } = useFetch(
//     () => especialidadesService.listar(),
//     []
//   );

import { useEffect, useState } from "react";

export function useFetch(fetcher, deps = []) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelado = false;

        async function cargar() {
        setLoading(true);
        setError(null);
        try {
            const response = await fetcher();
            if (!cancelado) setData(response.data);
        } catch (err) {
            if (!cancelado) setError(err);
        } finally {
            if (!cancelado) setLoading(false);
        }
    }

    cargar();

    return () => {
      cancelado = true; // evita setState si el componente se desmonta antes de que responda el API
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return { data, loading, error };
}