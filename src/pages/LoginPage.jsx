import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { useAuth } from "../auth/useAuth"

function LoginPage() {

    const [correo, setCorreo] = useState("")
    const [password, setPassword] = useState("")

    const [error, setError] = useState("")
    const [cargando, setCargando] = useState(false)

    const { login } = useAuth()

    const navigate = useNavigate()

    async function handleSubmit(event) {

        event.preventDefault()

        setError("")
        setCargando(true)

        try {

            await login(correo, password)

            navigate("/")

        } catch (error) {

            setError(
                error.message ||
                "No se pudo iniciar sesión."
            )

        } finally {

            setCargando(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">

            <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">

                <h1 className="mb-8 text-center text-4xl font-semibold">
                    Iniciar sesión
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >

                    <div>

                        <label
                            htmlFor="correo"
                            className="mb-2 block text-sm font-medium"
                        >
                            Correo
                        </label>

                        <input
                            id="correo"
                            type="email"
                            value={correo}
                            onChange={(event) =>
                                setCorreo(event.target.value)
                            }
                            placeholder="correo@example.com"
                            required
                            className="w-full rounded-lg border bg-background px-4 py-3 outline-none focus:ring-2"
                        />

                    </div>

                    <div>

                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-medium"
                        >
                            Contraseña
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="Contraseña"
                            required
                            className="w-full rounded-lg border bg-background px-4 py-3 outline-none focus:ring-2"
                        />

                    </div>

                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                        {cargando
                            ? "Iniciando sesión..."
                            : "Iniciar sesión"
                        }
                    </button>

                </form>

                <p className="mt-6 text-center text-sm">

                    ¿No tienes una cuenta?{" "}

                    <Link
                        to="/registro"
                        className="font-semibold underline"
                    >
                        Crear cuenta
                    </Link>

                </p>

            </div>

        </div>
    )
}

export default LoginPage