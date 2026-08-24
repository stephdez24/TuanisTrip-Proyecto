import { Sun, Moon } from "lucide-react"
import { useTheme } from "@/lib/ThemeContext"
import { Button } from "@/components/ui/button"

export default function ThemeToggle() {
    const { tema, alternarTema } = useTheme()

    return (
        <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            onClick={alternarTema}
            aria-label={tema === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
            {tema === "dark" ? (
                <Sun className="h-5 w-5" />
            ) : (
                <Moon className="h-5 w-5" />
            )}
        </Button>
    )
}