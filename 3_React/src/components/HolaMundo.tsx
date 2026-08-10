/*
 * Proyecto 1 - Hola Mundo
 *
 * Componente principal del ejercicio.
 *
 * Muestra el mensaje "¡Hola, mundo!"
 * y permite interactuar mediante click
 * y double click.
 */

import { useState } from "react";

function HolaMundo() {

    /*
     * Estado utilizado para mostrar
     * mensajes dentro de la interfaz.
     *
     * No utilizamos alert().
     */
    const [mensaje, setMensaje] = useState(
        "Interactuá con la tarjeta"
    );

    /*
     * Se ejecuta cuando el usuario
     * hace click en el botón.
     */
    const manejarClick = () => {
        setMensaje(
            "¡Hola! Hiciste click en el botón."
        );
    };

    /*
     * Se ejecuta cuando el usuario
     * realiza doble click sobre la tarjeta.
     */
    const manejarDobleClick = () => {
        setMensaje(
            "¡Hiciste doble click en Hola, mundo!"
        );
    };

    return (
        <section
            className="hola-mundo container-fluid d-flex justify-content-center align-items-center"
            onDoubleClick={manejarDobleClick}
        >
            <div className="contenido text-center">

                <span className="etiqueta">
                    PROYECTO 01
                </span>

                <h1>
                    ¡Hola, mundo!
                </h1>

                <p>
                    Mi primer componente desarrollado
                    con React.
                </p>

                <button
                    type="button"
                    className="btn btn-light px-4 py-3"
                    onClick={manejarClick}
                >
                    Hacer click
                </button>

                <p className="mensaje mt-4 mb-0">
                    {mensaje}
                </p>

            </div>
        </section>
    );
}

export default HolaMundo;