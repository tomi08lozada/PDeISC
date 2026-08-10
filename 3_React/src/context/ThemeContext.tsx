/*
 * CONTEXTO DEL TEMA
 *
 * Permite cambiar entre:
 *
 * - Modo día
 * - Modo noche
 */

import {
    createContext,
    useContext,
    useState,
    type ReactNode
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext =
    createContext<ThemeContextType | undefined>(
        undefined
    );

interface ThemeProviderProps {
    children: ReactNode;
}

/*
 * Proveedor del tema.
 */
export function ThemeProvider({
    children
}: ThemeProviderProps) {

    const [theme, setTheme] =
        useState<Theme>("light");

    /*
     * Cambia entre modo día y noche.
     */
    const toggleTheme = (): void => {

        setTheme((temaActual) =>
            temaActual === "light"
                ? "dark"
                : "light"
        );
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                toggleTheme
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

/*
 * Permite utilizar el contexto
 * desde otros componentes.
 */
export function useTheme(): ThemeContextType {

    const context =
        useContext(ThemeContext);

    if (context === undefined) {

        throw new Error(
            "useTheme debe utilizarse dentro de ThemeProvider"
        );
    }

    return context;
}