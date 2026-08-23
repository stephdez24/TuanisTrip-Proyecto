// seed-demo-data.mjs
//
// Script de un solo uso: crea los 12 tours y los 9 guías del mini-proyecto
// original, llamando al API REAL (no toca la base de datos directamente).
// Como pasa por las mismas validaciones de Zod que usa el FrontEnd, si el
// script termina sin errores, los datos son 100% válidos para el sistema.
//
// REQUISITOS ANTES DE CORRERLO:
//   1. El backend debe estar corriendo (npm run server en la carpeta api/).
//   2. Debes haber corrido `npx prisma db seed` con el seed.ts actualizado
//      (que ya trae las especialidades Playa/Montaña/Ciudad y los 9
//      usuarios Empleado con los correos que usa este script).
//   3. Copia este archivo en la RAÍZ de tu proyecto de React (junto a
//      package.json), para que "./public/data/..." apunte al lugar correcto.
//
// CÓMO CORRERLO:
//   node seed-demo-data.mjs
//
// (Usa fetch nativo de Node 18+, no necesita ninguna dependencia extra.)

import { writeFile, mkdir } from "node:fs/promises";

const API_URL = process.env.VITE_API_URL || "http://localhost:3000";
const ADMIN_CORREO = "admin@citas.com";
const ADMIN_PASSWORD = "Admin12345";

// ------------------------------------------------------------------
// Datos: los 12 tours del mini-proyecto original, con duraciones
// ajustadas para respetar el máximo de 480 minutos del API.
// ------------------------------------------------------------------
const TOURS = [
    {
        nombre: "Catarata La Fortuna",
        descripcion: "Camina hasta una imponente catarata escondida en el bosque y refréscate en sus pozas naturales.",
        precioBase: 35000,
        duracionMinutos: 300,
        especialidad: "Montaña",
        imagen: "/images/tours/CatarataFortunaTour.png",
    },
    {
        nombre: "Volcán Arenal + Termales",
        descripcion: "Observa el volcán Arenal de cerca y relájate en aguas termales naturales al atardecer.",
        precioBase: 75000,
        duracionMinutos: 480, // original: 10h (600min) -> el API solo permite hasta 480
        especialidad: "Montaña",
        imagen: "/images/tours/VolcanArenalTour.png",
    },
    {
        nombre: "Snorkel en Isla Tortuga",
        descripcion: "Navega hasta Isla Tortuga, haz snorkel en aguas cristalinas y disfruta de un almuerzo en la playa.",
        precioBase: 60000,
        duracionMinutos: 480,
        especialidad: "Playa",
        imagen: "/images/tours/SnorkelTour2.png",
    },
    {
        nombre: "Catamarán Bahía Ballena",
        descripcion: "Disfruta de una travesía en catamarán con avistamiento de delfines y atardecer en el Pacífico.",
        precioBase: 65000,
        duracionMinutos: 360,
        especialidad: "Playa",
        imagen: "/images/tours/CatamaranBahiaBallenaTour.jpg",
    },
    {
        nombre: "Canopy en Monteverde",
        descripcion: "Vuela entre cables y puentes colgantes sobre el bosque nuboso de Monteverde.",
        precioBase: 55000,
        duracionMinutos: 360,
        especialidad: "Montaña",
        imagen: "/images/tours/CanopyMonteverdeTour.png",
    },
    {
        nombre: "Cabalgata en Guanacaste",
        descripcion: "Recorre a caballo las llanuras de Guanacaste rodeado de fauna silvestre.",
        precioBase: 40000,
        duracionMinutos: 180,
        especialidad: "Montaña",
        imagen: "/images/tours/MontarCaballoTour.png",
    },
    {
        nombre: "City Tour San José",
        descripcion: "Conoce el Teatro Nacional, el Mercado Central y los principales museos de la capital.",
        precioBase: 25000,
        duracionMinutos: 240,
        especialidad: "Ciudad",
        imagen: "/images/tours/SanJoseTour.jpg",
    },
    {
        nombre: "Tour Gastronómico en Cartago",
        descripcion: "Saborea platillos típicos costarricenses en mercados y sodas tradicionales de Cartago.",
        precioBase: 30000,
        duracionMinutos: 180,
        especialidad: "Ciudad",
        imagen: "/images/tours/TourGastronomico.png",
    },
    {
        nombre: "Tour Histórico y Cultural en Heredia",
        descripcion: "Recorre el casco histórico de Heredia y aprende sobre la tradición cafetalera del Valle Central.",
        precioBase: 28000,
        duracionMinutos: 240,
        especialidad: "Ciudad",
        imagen: "/images/tours/FortinHerediaTour.jpg",
    },
    {
        nombre: "Kayak en los Manglares de Limón",
        descripcion: "Rema entre los manglares del Caribe y observa monos, aves y caimanes en su hábitat natural.",
        precioBase: 42000,
        duracionMinutos: 240,
        especialidad: "Playa",
        imagen: "/images/tours/ManglarTour.jpg",
    },
    {
        nombre: "Snorkel en Playa Blanca, Limón",
        descripcion: "Explora los arrecifes del Caribe sur en una salida de snorkel guiada por expertos locales.",
        precioBase: 50000,
        duracionMinutos: 300,
        especialidad: "Playa",
        imagen: "/images/tours/SnorkelTour.jpg",
    },
    {
        nombre: "Atardecer a Caballo en Guanacaste",
        descripcion: "Cabalga frente al mar mientras el sol se oculta en una de las playas más famosas de Guanacaste.",
        precioBase: 45000,
        duracionMinutos: 120,
        especialidad: "Playa",
        imagen: "/images/tours/AtardecerTamarindoTour.jpg",
    },
];

// ------------------------------------------------------------------
// Datos: los 9 guías, agrupados por especialidad (correo debe coincidir
// EXACTO con lo que crea prisma/seed.ts).
// ------------------------------------------------------------------
const GUIAS = [
    { correo: "sofia.vargas@tuanistrip.com", codigo: "GUIA-001", especialidad: "Playa", descripcion: "Especialista en Snorkel. Idiomas: Español, Inglés. 6 años de experiencia. Apasionada por la vida marina del Pacífico, lleva a sus grupos a los mejores arrecifes poco visitados de la zona.", imagen: "/images/guias/sofia-vargas.png" },
    { correo: "diego.rojas@tuanistrip.com", codigo: "GUIA-002", especialidad: "Playa", descripcion: "Especialista en Kayak. Idiomas: Español, Portugués. 8 años de experiencia. Guía certificado en rescate acuático, conoce los manglares y esteros más tranquilos para principiantes.", imagen: "/images/guias/diego-rojas.png" },
    { correo: "mariana.lopez@tuanistrip.com", codigo: "GUIA-003", especialidad: "Playa", descripcion: "Especialista en Paseo en Catamarán. Idiomas: Español, Inglés, Francés. 10 años de experiencia. Guía paseos en catamarán y procura que cada recorrido sea cómodo y seguro para todos.", imagen: "/images/guias/mariana-lopez.png" },
    { correo: "carlos.jimenez@tuanistrip.com", codigo: "GUIA-004", especialidad: "Montaña", descripcion: "Especialista en Senderismo. Idiomas: Español, Inglés. 9 años de experiencia. Biólogo de formación, hace énfasis en flora y fauna durante las caminatas por bosque nuboso y volcanes.", imagen: "/images/guias/carlos-jimenez.png" },
    { correo: "andrea.solano@tuanistrip.com", codigo: "GUIA-005", especialidad: "Montaña", descripcion: "Especialista en Canopy. Idiomas: Español, Francés. 7 años de experiencia. Instructora certificada en rappel y tirolesa, prioriza la seguridad sin quitarle la adrenalina al recorrido.", imagen: "/images/guias/andrea-solano.png" },
    { correo: "luis.mora@tuanistrip.com", codigo: "GUIA-006", especialidad: "Montaña", descripcion: "Especialista en Montar a caballo. Idiomas: Español, Inglés, Portugués. 12 años de experiencia. Cuenta con amplia experiencia guiando cabalgatas por diferentes rutas y paisajes naturales.", imagen: "/images/guias/luis-mora.png" },
    { correo: "valeria.castro@tuanistrip.com", codigo: "GUIA-007", especialidad: "Ciudad", descripcion: "Especialista en City Tour. Idiomas: Español, Inglés. 5 años de experiencia. Historiadora local, conecta cada parada del recorrido urbano con anécdotas reales de la San José de antes.", imagen: "/images/guias/valeria-castro.png" },
    { correo: "pablo.herrera@tuanistrip.com", codigo: "GUIA-008", especialidad: "Ciudad", descripcion: "Especialista en Tour Gastronómico. Idiomas: Español, Francés. 11 años de experiencia. Ex chef de restaurante, selecciona personalmente cada parada del tour según la temporada de ingredientes.", imagen: "/images/guias/pablo-herrera.png" },
    { correo: "fernanda.ruiz@tuanistrip.com", codigo: "GUIA-009", especialidad: "Ciudad", descripcion: "Especialista en Tour Histórico y Cultural. Idiomas: Español, Inglés, Portugués. 8 años de experiencia. Egresada de Patrimonio Cultural, profundiza en los museos y barrios históricos menos visitados por turistas.", imagen: "/images/guias/fernanda-ruiz.png" },
];

async function apiFetch(path, { method = "GET", body, token } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

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

    // 1. Login como Administrador
    const login = await apiFetch("/usuarios/login", {
        method: "POST",
        body: { correo: ADMIN_CORREO, password: ADMIN_PASSWORD },
    });
    const token = login.data.token;
    console.log("Sesión de administrador iniciada.");

    // 2. Mapear especialidades por nombre -> id
    const especialidadesResp = await apiFetch("/especialidades", { token });
    const especialidadPorNombre = Object.fromEntries(
        especialidadesResp.data.map((e) => [e.nombre, e.id])
    );
    for (const nombre of ["Playa", "Montaña", "Ciudad"]) {
        if (!especialidadPorNombre[nombre]) {
            throw new Error(
                `No existe la especialidad "${nombre}". ¿Corriste el seed.ts actualizado?`
            );
        }
    }

    // 3. Mapear usuarios Empleado por correo -> id
    const usuariosResp = await apiFetch("/usuarios?rol=Empleado", { token });
    const usuarioPorCorreo = Object.fromEntries(
        usuariosResp.data.map((u) => [u.correo, u])
    );
    for (const guia of GUIAS) {
        if (!usuarioPorCorreo[guia.correo]) {
            throw new Error(
                `No existe el usuario "${guia.correo}". ¿Corriste el seed.ts actualizado?`
            );
        }
    }

    // 4. Crear los 12 tours
    const imagenesTours = {};
    const toursPorEspecialidad = { Playa: [], Montaña: [], Ciudad: [] };

    for (const tour of TOURS) {
        const creado = await apiFetch("/servicios", {
            method: "POST",
            token,
            body: {
                nombre: tour.nombre,
                descripcion: tour.descripcion,
                precioBase: tour.precioBase,
                duracionMinutos: tour.duracionMinutos,
                especialidadId: especialidadPorNombre[tour.especialidad],
                imagen: null, // el bypass de imagen se resuelve aparte (ver imagenes-seed.json)
            },
        });

        const id = creado.data.id;
        imagenesTours[id] = tour.imagen;
        toursPorEspecialidad[tour.especialidad].push(id);
        console.log(`Tour creado: ${tour.nombre} (id ${id})`);
    }

    // 5. Crear los 9 guías, asignando TODOS los tours de su especialidad
    const imagenesGuias = {};

    for (const guia of GUIAS) {
        const usuario = usuarioPorCorreo[guia.correo];
        const especialidadId = especialidadPorNombre[guia.especialidad];
        const servicioIds = toursPorEspecialidad[guia.especialidad];

        const creado = await apiFetch("/empleados", {
            method: "POST",
            token,
            body: {
                usuarioId: usuario.id,
                especialidadId,
                codigoEmpleado: guia.codigo,
                descripcion: guia.descripcion,
                servicioIds,
            },
        });

        const id = creado.data.id;
        imagenesGuias[id] = guia.imagen;
        console.log(`Guía creado: ${usuario.nombre} ${usuario.primerApellido} (id ${id})`);
    }

    // 6. Escribir el archivo semilla de imágenes para el FrontEnd
    await mkdir("./public/data", { recursive: true });
    await writeFile(
        "./public/data/imagenes-seed.json",
        JSON.stringify({ tours: imagenesTours, guias: imagenesGuias }, null, 2)
    );
    console.log("Archivo public/data/imagenes-seed.json generado.");

    console.log("\n¡Listo! 12 tours y 9 guías creados con sus imágenes asociadas.");
}

main().catch((error) => {
    console.error("\nError durante el seed de datos demo:");
    console.error(error.message);
    process.exit(1);
});