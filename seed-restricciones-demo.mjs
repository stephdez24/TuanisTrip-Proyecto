// seed-restricciones-demo.mjs
//
// Crea las 8 restricciones de horario mínimas requeridas por el enunciado
// (2 generales, 3 específicas de empleado, 2 parciales por horas, 1 día
// completo), llamando al API REAL — mismo patrón que seed-demo-data.mjs.
//
// REQUISITOS ANTES DE CORRERLO:
//   1. El backend debe estar corriendo (npm run server en la carpeta api/).
//   2. Debes haber corrido seed-demo-data.mjs ya (necesita al menos 3 guías
//      reales creados vía POST /empleados, no solo las cuentas de Usuario).
//   3. Colócalo en la RAÍZ de tu proyecto de React (junto a package.json).
//
// CÓMO CORRERLO:
//   node seed-restricciones-demo.mjs

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

async function main() {
    console.log(`Conectando a ${API_URL} ...`);

    const tiposResp = await apiFetch("/tipos-restriccion-horario");
    const tipoPorNombre = Object.fromEntries(
        tiposResp.data.map((t) => [t.nombre, t.id])
    );
    for (const nombre of [
        "General del establecimiento",
        "Específica de empleado",
        "Parcial por horas",
        "Día completo",
    ]) {
        if (!tipoPorNombre[nombre]) {
            throw new Error(
                `No existe el tipo de restricción "${nombre}". ¿Corriste el seed.ts actualizado?`
            );
        }
    }

    const empleadosResp = await apiFetch("/empleados/activos");
    const empleados = empleadosResp.data;
    if (empleados.length < 3) {
        throw new Error(
            `Se necesitan al menos 3 guías ya creados antes de sembrar restricciones. Encontrados: ${empleados.length}. Corre seed-demo-data.mjs primero.`
        );
    }
    const [guia1, guia2, guia3] = empleados;
    console.log(
        `Usando guías: ${guia1.usuario.nombre} ${guia1.usuario.primerApellido}, ${guia2.usuario.nombre} ${guia2.usuario.primerApellido}, ${guia3.usuario.nombre} ${guia3.usuario.primerApellido}`
    );

    const RESTRICCIONES = [
        {
            tipoRestriccionId: tipoPorNombre["General del establecimiento"],
            empleadoId: null,
            fecha: "2026-09-15",
            horaInicio: "08:00",
            horaFin: "10:00",
            todoElDia: false,
            motivo: "Mantenimiento de equipo de transporte.",
        },
        {
            tipoRestriccionId: tipoPorNombre["General del establecimiento"],
            empleadoId: null,
            fecha: "2026-12-25",
            horaInicio: null,
            horaFin: null,
            todoElDia: true,
            motivo: "Feriado nacional — establecimiento cerrado.",
        },
        {
            tipoRestriccionId: tipoPorNombre["Específica de empleado"],
            empleadoId: guia1.id,
            fecha: "2026-09-10",
            horaInicio: "09:00",
            horaFin: "12:00",
            todoElDia: false,
            motivo: "Guía en capacitación de primeros auxilios.",
        },
        {
            tipoRestriccionId: tipoPorNombre["Específica de empleado"],
            empleadoId: guia2.id,
            fecha: "2026-09-18",
            horaInicio: "14:00",
            horaFin: "17:00",
            todoElDia: false,
            motivo: "Guía con cita médica programada.",
        },
        {
            tipoRestriccionId: tipoPorNombre["Específica de empleado"],
            empleadoId: guia3.id,
            fecha: "2026-09-22",
            horaInicio: null,
            horaFin: null,
            todoElDia: true,
            motivo: "Guía en vacaciones.",
        },
        {
            tipoRestriccionId: tipoPorNombre["Parcial por horas"],
            empleadoId: null,
            fecha: "2026-10-05",
            horaInicio: "15:00",
            horaFin: "17:00",
            todoElDia: false,
            motivo: "Cierre anticipado por evento comunitario en La Fortuna.",
        },
        {
            tipoRestriccionId: tipoPorNombre["Parcial por horas"],
            empleadoId: guia1.id,
            fecha: "2026-10-12",
            horaInicio: "08:00",
            horaFin: "09:30",
            todoElDia: false,
            motivo: "Guía atendiendo trámite personal en la mañana.",
        },
        {
            tipoRestriccionId: tipoPorNombre["Día completo"],
            empleadoId: null,
            fecha: "2026-11-01",
            horaInicio: null,
            horaFin: null,
            todoElDia: true,
            motivo: "Cierre por inventario anual de equipo de tours.",
        },
    ];

    for (const restriccion of RESTRICCIONES) {
        const creado = await apiFetch("/restricciones-horario", {
            method: "POST",
            body: restriccion,
        });
        console.log(`Restricción creada: ${restriccion.motivo} (id ${creado.data.id})`);
    }

    console.log("\n¡Listo! 8 restricciones de horario creadas.");
}

main().catch((error) => {
    console.error("\nError durante el seed de restricciones:");
    console.error(error.message);
    process.exit(1);
});