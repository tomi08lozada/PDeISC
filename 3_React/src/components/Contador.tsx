/*
 * Proyecto 3 - Contador
 *
 * Este componente permite incrementar
 * y decrementar un número.
 *
 * El valor del contador se almacena
 * utilizando el estado de React.
 */

import { useState } from "react";

function Contador() {

    /*
     * Estado principal del contador.
     *
     * Comienza en 0.
     */
    const [contador, setContador] =
        useState(0);

    /*
     * Mensaje que se muestra dentro
     * de la interfaz.
     *
     * No utilizamos alert().
     */
    const [mensaje, setMensaje] =
        useState(
            "El contador comienza en cero."
        );

    /*
     * Incrementa el contador en 1.
     */
    const incrementar = () => {

        setContador(
            (valorActual) =>
                valorActual + 1
        );

        setMensaje(
            "El contador aumentó."
        );
    };

    /*
     * Decrementa el contador en 1.
     */
    const decrementar = () => {

        setContador(
            (valorActual) =>
                valorActual - 1
        );

        setMensaje(
            "El contador disminuyó."
        );
    };

    /*
     * Reinicia el contador.
     */
    const reiniciar = () => {

        setContador(0);

        setMensaje(
            "El contador volvió a cero."
        );
    };

    /*
     * Se ejecuta cuando se hace
     * doble click sobre el número.
     *
     * En este caso también reinicia
     * el contador.
     */
    const manejarDobleClick = () => {

        reiniciar();
    };

    return (
        <section
            className="
                contador
                p-4
                p-md-5
                text-center
            "
        >

            <div className="contador-contenido">

                <span className="etiqueta">
                    PROYECTO 03
                </span>

                <h1>
                    Contador
                </h1>

                <p>
                    Utilizá los botones para
                    modificar el valor.
                </p>


                {/* VALOR */}

                <div
                    className="
                        numero-contador
                        my-5
                    "
                    onDoubleClick={
                        manejarDobleClick
                    }
                >
                    {contador}
                </div>


                {/* BOTONES */}

                <div className="
                    d-flex
                    flex-wrap
                    justify-content-center
                    gap-3
                ">

                    <button
                        type="button"
                        className="
                            btn
                            btn-light
                            btn-lg
                            boton-contador
                        "
                        onClick={
                            decrementar
                        }
                    >
                        −
                    </button>

                    <button
                        type="button"
                        className="
                            btn
                            btn-outline-light
                            btn-lg
                        "
                        onClick={
                            reiniciar
                        }
                    >
                        Reiniciar
                    </button>

                    <button
                        type="button"
                        className="
                            btn
                            btn-light
                            btn-lg
                            boton-contador
                        "
                        onClick={
                            incrementar
                        }
                    >
                        +
                    </button>

                </div>


                {/* MENSAJE */}

                <p className="
                    mensaje-contador
                    mt-4
                    mb-0
                ">
                    {mensaje}
                </p>

            </div>

        </section>
    );
}

export default Contador;