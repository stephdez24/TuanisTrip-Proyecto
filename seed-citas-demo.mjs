// seed-citas-demo.mjs
//
// Crea las citas mínimas variadas por estado que pide el enunciado:
// 4 Pendientes, 4 Confirmadas, 3 Finalizadas, 2 Canceladas — distribuidas
// entre los guías activos, cada una con un tour realmente asignado a ese
// guía (respeta la regla de "servicios que puede realizar el empleado").
//
// Cómo se logra cada estado:
//   - Pendiente / Confirmada / Finalizada: se crean directo con ese estado
//     final vía POST /citas (el backend lo permite: solo exige que el
//     estado exista y esté activo, sin importar cuál sea).
//   - Cancelada: el endpoint PATCH /citas/:id/cancelar SOLO funciona sobre
//     citas en estado Pendiente (así lo valida permiteCancelacionCliente
//     en el seed.ts del backend). Por eso estas 2 se crean como Pendiente
//     y de inmediato se cancelan de verdad, con motivo — así quedan
//     realistas en el detalle, no un registro "Cancelada" sin motivo.
//
// Todas las fechas deben ser HOY o futuras (el API rechaza fechas
// pasadas sin excepción, incluso para datos de demo).
//
// REQUISITOS: backend corriendo, y ya haber corrido seed-demo-data.mjs
// (necesita guías y tours reales) — los clientes Angel/Kata ya deben
// existir también.
//
// CÓMO CORRERLO: node seed-citas-demo.mjs (en la raíz de TuanisTrip-Proyecto)

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

// Fechas fijas, todas después de hoy (24/ago/2026) y evitando a propósito
// las fechas ya usadas por las restricciones sembradas (10/09, 15/09,
// 18/09, 22/09, 05/10, 12/10, 01/11, 25/12), para no chocar con un 409.
const FECHAS = [
    "2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04",
    "2026-09-05", "2026-09-06", "2026-09-07", "2026-09-08",
    "2026-09-09", "2026-09-11", "2026-09-12", "2026-09-13",
    "2026-09-14",
];

function sumarMinutos(horaHHmm, minutos) {
    const [h, m] = horaHHmm.split(":").map(Number);
    const total = h * 60 + m + minutos;
    const hh = String(Math.floor(total / 60)).padStart(2, "0");
    const mm = String(total % 60).padStart(2, "0");
    return `${hh}:${mm}`;
}

// 4 Pendientes, 4 Confirmadas, 3 Finalizadas, 2 Canceladas = 13 citas.
const PLAN_ESTADOS = [
    "Pendiente", "Pendiente", "Pendiente", "Pendiente",
    "Confirmada", "Confirmada", "Confirmada", "Confirmada",
    "Finalizada", "Finalizada", "Finalizada",
    "Cancelada", "Cancelada",
];

const MOTIVOS_CANCELACION = [
    "El cliente tuvo un imprevisto de última hora y no podrá asistir.",
    "Cambio de planes de viaje, se reprogramará más adelante.",
];

async function main() {
    console.log(`Conectando a ${API_URL} ...`);

    const estadosResp = await apiFetch("/estados-cita");
    const idPorEstado = Object.fromEntries(
        estadosResp.data.map((e) => [e.nombre, e.id])
    );

    const adminResp = await apiFetch("/usuarios?rol=Administrador");
    const adminId = adminResp.data[0]?.id;
    if (!adminId) throw new Error("No se encontró el usuario Administrador.");

    const clientesResp = await apiFetch("/usuarios?rol=Cliente");
    const clientes = clientesResp.data;
    if (clientes.length === 0) {
        throw new Error("No hay usuarios con rol Cliente. Registra al menos uno primero.");
    }

    const empleadosResp = await apiFetch("/empleados/activos");
    const empleados = empleadosResp.data.filter((e) => e.servicios?.length > 0);
    if (empleados.length === 0) {
        throw new Error("No hay guías activos con tours asignados. Corre seed-demo-data.mjs primero.");
    }

    console.log(`Usando ${empleados.length} guías, ${clientes.length} clientes.`);

    let cancelacionesPendientes = 0;

    for (let i = 0; i < PLAN_ESTADOS.length; i++) {
        const estadoObjetivo = PLAN_ESTADOS[i];
        const empleado = empleados[i % empleados.length];
        const servicio = empleado.servicios[i % empleado.servicios.length];
        const cliente = clientes[i % clientes.length];
        const fecha = FECHAS[i];

        const horaInicio = "09:00";
        const horaFin = sumarMinutos(horaInicio, servicio.duracionMinutos);
        const precioServicio = Number(servicio.precioBase);

        // Cancelada empieza como Pendiente, y se cancela después vía
        // /cancelar (ver nota arriba sobre por qué).
        const estadoCitaId =
            estadoObjetivo === "Cancelada" ? idPorEstado["Pendiente"] : idPorEstado[estadoObjetivo];

        const creada = await apiFetch("/citas", {
            method: "POST",
            body: {
                clienteId: cliente.id,
                empleadoId: empleado.id,
                servicioId: servicio.id,
                fecha,
                horaInicio,
                horaFin,
                duracionMinutos: servicio.duracionMinutos,
                precioServicio,
                costoAdicionales: 0,
                costoTotal: precioServicio,
                observaciones: null,
                adicionalIds: [],
                estadoCitaId,
                creadoPorUsuarioId: adminId,
            },
        });

        const citaId = creada.data.id;
        console.log(
            `Cita creada (${estadoObjetivo}): ${servicio.nombre} — ${empleado.usuario.nombre} ${empleado.usuario.primerApellido} — ${fecha} (id ${citaId})`
        );

        if (estadoObjetivo === "Cancelada") {
            const motivo = MOTIVOS_CANCELACION[cancelacionesPendientes];
            cancelacionesPendientes++;
            await apiFetch(`/citas/${citaId}/cancelar`, {
                method: "PATCH",
                body: { motivoCancelacion: motivo },
            });
            console.log(`  -> cancelada con motivo: "${motivo}"`);
        }
    }

    console.log("\n¡Listo! 13 citas creadas (4 pendientes, 4 confirmadas, 3 finalizadas, 2 canceladas).");
}

main().catch((error) => {
    console.error("\nError durante el seed de citas:");
    console.error(error.message);
    process.exit(1);
});