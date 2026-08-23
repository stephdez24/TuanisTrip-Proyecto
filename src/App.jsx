import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useEffect } from "react"
import { Toaster } from "@/components/ui/sonner"
import { hidratarImagenesSemilla } from "@/lib/imagenLocal"

import Layout from "@/components/Layout"
import RoleRoute from "@/auth/RoleRoute"

import HomePage from "@/pages/HomePage"
import LoginPage from "@/pages/LoginPage"
import RegistroPage from "@/pages/RegistroPage"
import PerfilPage from "@/pages/PerfilPage"
import ToursPage from "@/pages/ToursPage"
import TourDetailPage from "@/pages/TourDetailPage"
import TourFormPage from "@/pages/TourFormPage"
import ExtrasPage from "@/pages/ExtrasPage"
import ExtraDetailPage from "@/pages/ExtraDetailPage"
import ExtraFormPage from "@/pages/ExtraFormPage"
import GuiasPage from "@/pages/GuiasPage"
import GuiaDetailPage from "@/pages/GuiaDetailPage"
import GuiaFormPage from "@/pages/GuiaFormPage"
import ReservasPage from "@/pages/ReservasPage"
import ReservaDetailPage from "@/pages/ReservaDetailPage"
import UnauthorizedPage from "@/pages/UnauthorizedPage"
import NotFoundPage from "@/pages/NotFoundPage"

function App() {
    // Se ejecuta una sola vez al abrir la app: completa localStorage con
    // las imágenes del script de datos demo, si todavía no están.
    useEffect(() => {
        hidratarImagenesSemilla()
    }, [])

    return (
        <BrowserRouter>
            {/* Toaster vive aquí, fuera de <Routes>, para que los toast.success()/
                toast.error() de CUALQUIER página se sigan viendo aunque cambien
                de ruta mientras el mensaje está en pantalla. */}
            <Toaster richColors position="top-center" />

            <Routes>
                {/* Todas las rutas comparten el mismo <Layout/> (navbar + <Outlet/>),
                    por eso están anidadas dentro de esta única ruta contenedora. */}
                <Route element={<Layout />}>
                    {/* ---------- Rutas públicas: no requieren sesión ---------- */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/registro" element={<RegistroPage />} />
                    <Route path="/tours" element={<ToursPage />} />
                    <Route path="/tours/:id" element={<TourDetailPage />} />
                    <Route path="/extras" element={<ExtrasPage />} />
                    <Route path="/extras/:id" element={<ExtraDetailPage />} />
                    <Route path="/guias" element={<GuiasPage />} />
                    <Route path="/guias/:id" element={<GuiaDetailPage />} />
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />

                    {/* ---------- Requieren solo estar logueado (cualquier rol) ---------- */}
                    <Route element={<RoleRoute />}>
                        <Route path="/perfil" element={<PerfilPage />} />
                        <Route path="/reservas" element={<ReservasPage />} />
                        <Route path="/reservas/:id" element={<ReservaDetailPage />} />
                    </Route>

                    {/* ---------- Solo Administrador ----------
                        RoleRoute como "layout route": protege TODAS las rutas
                        anidadas de una sola vez, no hay que repetir el chequeo
                        de rol en cada <Route> individual. */}
                    <Route element={<RoleRoute roles={["Administrador"]} />}>
                        <Route path="/tours/nuevo" element={<TourFormPage />} />
                        <Route path="/tours/:id/editar" element={<TourFormPage />} />
                        <Route path="/extras/nuevo" element={<ExtraFormPage />} />
                        <Route path="/extras/:id/editar" element={<ExtraFormPage />} />
                        <Route path="/guias/nuevo" element={<GuiaFormPage />} />
                        <Route path="/guias/:id/editar" element={<GuiaFormPage />} />
                    </Route>

                    {/*
                        A medida que avancemos en el checklist, cada módulo nuevo
                        entra aquí envuelto en <RoleRoute roles={[...]}>, ej.:

                        <Route element={<RoleRoute roles={["Administrador"]} />}>
                            <Route path="/guias/nuevo" element={<GuiaFormPage />} />
                        </Route>
                    */}

                    {/* Comodín: cualquier URL que no matcheó nada de arriba. */}
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App