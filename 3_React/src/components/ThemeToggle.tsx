/*
 * Botón para cambiar entre
 * modo día y modo noche.
 */

import {
    useTheme
} from "../context/ThemeContext";

function ThemeToggle() {

    const {
        theme,
        toggleTheme
    } = useTheme();

    return (
        <button
            type="button"
            className="btn btn-light"
            onClick={toggleTheme}
        >
            {theme === "light"
                ? "🌙 Modo noche"
                : "☀️ Modo día"}
        </button>
    );
}

export default ThemeToggle;