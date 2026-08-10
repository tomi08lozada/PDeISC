/*
 * PROYECTO 5 - FORMULARIO SIMPLE
 *
 * Este componente permite:
 *
 * - Escribir el nombre de un usuario.
 * - Enviar el formulario.
 * - Mostrar un mensaje de bienvenida.
 *
 * El nombre se almacena utilizando
 * el estado de React.
 */

import { useState } from "react";

function FormularioUsuario() {

    /*
     * Estado que almacena el nombre
     * escrito por el usuario.
     */
    const [nombre, setNombre] =
        useState<string>("");

    /*
     * Estado utilizado para mostrar
     * el mensaje de bienvenida.
     */
    const [mensaje, setMensaje] =
        useState<string>(
            "Completá el formulario para comenzar."
        );

    /*
     * Estado que indica si el formulario
     * fue enviado correctamente.
     */
    const [enviado, setEnviado] =
        useState<boolean>(false);

    /*
     * Se ejecuta cuando el usuario
     * envía el formulario.
     */
    const manejarEnvio = (
        evento: React.FormEvent<HTMLFormElement>
    ): void => {

        /*
         * Evita que la página se recargue.
         */
        evento.preventDefault();

        const nombreLimpio =
            nombre.trim();

        /*
         * Verificamos que el usuario
         * haya escrito un nombre.
         */
        if (nombreLimpio === "") {

            setMensaje(
                "Por favor, escribí tu nombre."
            );

            setEnviado(false);

            return;
        }

        /*
         * Mostramos el mensaje
         * de bienvenida.
         */
        setMensaje(
            `¡Bienvenido/a, ${nombreLimpio}!`
        );

        setEnviado(true);
    };

    /*
     * Permite limpiar el formulario.
     */
    const limpiarFormulario = (): void => {

        setNombre("");

        setMensaje(
            "El formulario fue limpiado."
        );

        setEnviado(false);
    };

    /*
     * El doble click sobre el mensaje
     * también permite limpiarlo.
     */
    const manejarDobleClick = (): void => {

        limpiarFormulario();
    };

    return (
        <section className="
            formulario-usuario
            p-4
            p-md-5
        ">

            <div className="row g-5 align-items-center">

                {/* INFORMACIÓN */}

                <div className="
                    col-12
                    col-lg-5
                ">

                    <span className="etiqueta">
                        PROYECTO 05
                    </span>

                    <h1>
                        Hola.
                    </h1>

                    <p className="descripcion">
                        Escribí tu nombre y recibí
                        un mensaje de bienvenida.
                    </p>

                    <div className="
                        dato-formulario
                        mt-4
                    ">

                        <span>
                            Usuario
                        </span>

                        <strong>
                            {nombre || "Sin ingresar"}
                        </strong>

                    </div>

                </div>


                {/* FORMULARIO */}

                <div className="
                    col-12
                    col-lg-7
                ">

                    <form
                        onSubmit={manejarEnvio}
                    >

                        <div className="mb-4">

                            <label
                                htmlFor="nombre"
                                className="
                                    form-label
                                "
                            >
                                Nombre
                            </label>

                            <input
                                id="nombre"
                                type="text"
                                className="
                                    form-control
                                    form-control-lg
                                "
                                placeholder="
                                    Escribí tu nombre...
                                "
                                value={nombre}
                                onChange={(evento) =>
                                    setNombre(
                                        evento.target.value
                                    )
                                }
                            />

                        </div>


                        {/* BOTONES */}

                        <div className="
                            d-flex
                            flex-wrap
                            gap-3
                        ">

                            <button
                                type="submit"
                                className="
                                    btn
                                    btn-light
                                    btn-lg
                                "
                            >
                                Saludar
                            </button>

                            <button
                                type="button"
                                className="
                                    btn
                                    btn-outline-light
                                    btn-lg
                                "
                                onClick={
                                    limpiarFormulario
                                }
                            >
                                Limpiar
                            </button>

                        </div>

                    </form>


                    {/* MENSAJE */}

                    <div
                        className={`
                            mensaje-bienvenida
                            mt-4
                            p-4
                            ${
                                enviado
                                    ? "mensaje-exitoso"
                                    : ""
                            }
                        `}
                        onDoubleClick={
                            manejarDobleClick
                        }
                    >

                        <span>
                            MENSAJE
                        </span>

                        <h2>
                            {mensaje}
                        </h2>

                        <small>
                            Doble click para limpiar.
                        </small>

                    </div>

                </div>

            </div>

        </section>
    );
}

export default FormularioUsuario;