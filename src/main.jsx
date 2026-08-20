import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import App from "./App"
import "./index.css"

// AuthProvider vive fuera de <App/> (y no dentro) para que TODA la app,
// incluyendo el propio router, pueda leer el estado de sesión si hace falta.
import { AuthProvider } from "./auth/AuthProvider"

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </StrictMode>
)