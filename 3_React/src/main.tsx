/*
 * PUNTO DE ENTRADA
 * DEL PROYECTO 5
 */

import { StrictMode } from "react";

import {
    createRoot
} from "react-dom/client";

/*
 * Bootstrap.
 */
import "bootstrap/dist/css/bootstrap.min.css";

/*
 * CSS global.
 */
import "./index.css";

import App from "./App";

import {
    ThemeProvider
} from "./context/ThemeContext";

createRoot(
    document.getElementById("root")!
).render(

    <StrictMode>

        <ThemeProvider>

            <App />

        </ThemeProvider>

    </StrictMode>
);