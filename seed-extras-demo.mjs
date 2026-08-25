// seed-extras-demo.mjs
//
// Crea los 8 servicios adicionales mínimos requeridos por el enunciado,
// llamando al API REAL — mismo patrón que seed-demo-data.mjs y
// seed-restricciones-demo.mjs.
//
// REQUISITOS: backend corriendo (npm run server en api/).
// CÓMO CORRERLO: node seed-extras-demo.mjs (en la raíz de TuanisTrip-Proyecto)

const API_URL = process.env.VITE_API_URL || "http://localhost:3000";

async function apiFetch(path, { method = "GET", body } = {}) {
    const headers = { "Content-Type": "application/json" };

    const response = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(
            `${method} ${path} -> ${response.status}: ${data?.message ?? "error desconocido"}`
        );
    }

    return data;
}

const EXTRAS = [
    {
        nombre: "Transporte desde el hotel",
        descripcion: "Recogida y regreso a tu hotel en La Fortuna, Guanacaste o San José, según la zona del tour.",
        precio: 8000,
    },
    {
        nombre: "Almuerzo tradicional",
        descripcion: "Comida típica costarricense incluida durante el recorrido, con opción vegetariana disponible.",
        precio: 6000,
    },
    {
        nombre: "Equipo de snorkel",
        descripcion: "Alquiler de máscara, snorkel y aletas para los tours acuáticos, desinfectado antes de cada uso.",
        precio: 5000,
    },
    {
        nombre: "Seguro de viaje",
        descripcion: "Cobertura médica básica durante la actividad, recomendada para tours de aventura o altura.",
        precio: 4000,
    },
    {
        nombre: "Fotografías profesionales",
        descripcion: "Un fotógrafo del equipo documenta tu experiencia y te entrega las fotos digitales al finalizar.",
        precio: 15000,
    },
    {
        nombre: "Bebidas y refrigerio",
        descripcion: "Agua, frutas y snacks para mantenerte hidratado y con energía durante el recorrido.",
        precio: 3500,
    },
    {
        nombre: "Casco y chaleco de seguridad",
        descripcion: "Equipo de protección adicional recomendado para canopy, cabalgatas y actividades de riesgo.",
        precio: 4500,
    },
    {
        nombre: "Guía privado exclusivo",
        descripcion: "Acompañamiento personalizado solo para tu grupo, sin compartir el recorrido con otros turistas.",
        precio: 20000,
    },
];

async function main() {
    console.log(`Conectando a ${API_URL} ...`);

    for (const extra of EXTRAS) {
        const creado = await apiFetch("/servicios-adicionales", {
            method: "POST",
            body: extra,
        });
        console.log(`Extra creado: ${extra.nombre} (id ${creado.data.id})`);
    }

    console.log("\n¡Listo! 8 servicios adicionales creados.");
}

main().catch((error) => {
    console.error("\nError durante el seed de extras:");
    console.error(error.message);
    process.exit(1);
});