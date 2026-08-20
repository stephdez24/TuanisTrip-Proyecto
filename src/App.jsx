import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"

import Layout from "@/components/Layout"
import RoleRoute from "@/auth/RoleRoute"

import HomePage from "@/pages/HomePage"
import LoginPage from "@/pages/LoginPage"
import RegistroPage from "@/pages/RegistroPage"
import PerfilPage from "@/pages/PerfilPage"
import UnauthorizedPage from "@/pages/UnauthorizedPage"
import NotFoundPage from "@/pages/NotFoundPage"

function App() {
    return (
        <BrowserRouter>
            <Toaster richColors position="top-center" />

            <Routes>
                <Route element={<Layout />}>
                    {/* Públicas */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/registro" element={<RegistroPage />} />
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />

                    {/* Requieren solo estar logueado (cualquier rol) */}
                    <Route element={<RoleRoute />}>
                        <Route path="/perfil" element={<PerfilPage />} />
                    </Route>

                    {/*
                        A medida que avancemos en el checklist, cada módulo nuevo
                        entra aquí envuelto en <RoleRoute roles={[...]}>, ej.:

                        <Route element={<RoleRoute roles={["Administrador"]} />}>
                            <Route path="/extras" element={<ExtrasPage />} />
                        </Route>
                    */}

                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App