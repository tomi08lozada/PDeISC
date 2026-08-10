/*
 * PROYECTO 5
 *
 * Componente principal.
 */

import "./App.css";

import FormularioUsuario
    from "./components/FormularioUsuario";

import ThemeToggle
    from "./components/ThemeToggle";

import {
    useTheme
} from "./context/ThemeContext";

import {
    obtenerFechaActual
} from "./utils/fecha";

function App() {

    const {
        theme
    } = useTheme();

    const fecha =
        obtenerFechaActual();

    return (
        <main
            className={
                theme === "light"
                    ? "modo-dia"
                    : "modo-noche"
            }
        >

            {/* HEADER */}

            <header className="
                container-fluid
                py-4
            ">

                <div className="container">

                    <div className="
                        row
                        align-items-center
                    ">

                        <div className="
                            col-12
                            col-md
                        ">

                            <span className="
                                numero-proyecto
                            ">
                                REACT / 05
                            </span>

                            <h2 className="mb-0">
                                Formulario simple
                            </h2>

                        </div>

                        <div className="
                            col-12
                            col-md-auto
                            mt-3
                            mt-md-0
                        ">

                            <ThemeToggle />

                        </div>

                    </div>

                </div>

            </header>


            {/* CONTENIDO */}

            <section className="
                container-fluid
                flex-grow-1
                d-flex
                align-items-center
                py-3
            ">

                <div className="container">

                    <FormularioUsuario />

                </div>

            </section>


            {/* FOOTER */}

            <footer className="
                container-fluid
                py-3
            ">

                <div className="
                    container
                    text-center
                ">

                    <p className="mb-1">
                        Fecha: {fecha}
                    </p>

                    <p className="mb-0">
                        React + TypeScript + Bootstrap
                    </p>

                </div>

            </footer>

        </main>
    );
}

export default App;