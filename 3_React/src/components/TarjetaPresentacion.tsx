/*
 * Proyecto 2 - Tarjeta de presentación
 *
 * Este componente representa una tarjeta personal.
 *
 * Los datos de la persona se reciben mediante Props.
 *
 * No se utilizan alertas. Los mensajes de interacción
 * se muestran directamente dentro de la interfaz.
 */

import { useState } from "react";

/*
 * Props que recibe la tarjeta.
 */
interface TarjetaPresentacionProps {
    nombre: string;
    apellido: string;
    profesion: string;
    imagen: string;
}

/*
 * Componente de tarjeta de presentación.
 */
function TarjetaPresentacion({
    nombre,
    apellido,
    profesion,
    imagen
}: TarjetaPresentacionProps) {

    /*
     * Estado utilizado para mostrar mensajes
     * dentro de la tarjeta.
     */
    const [mensaje, setMensaje] = useState(
        "Hacé click o doble click para interactuar."
    );

    /*
     * Se ejecuta al presionar el botón.
     */
    const manejarClick = () => {

        setMensaje(
            `Esta tarjeta pertenece a ${nombre} ${apellido}.`
        );
    };

    /*
     * Se ejecuta al realizar doble click
     * sobre la tarjeta.
     */
    const manejarDobleClick = () => {

        setMensaje(
            `¡Hola! Soy ${nombre} ${apellido}.`
        );
    };

    return (
        <article
            className="tarjeta-presentacion row g-0"
            onDoubleClick={manejarDobleClick}
        >

            {/* Imagen */}

            <div className="tarjeta-imagen col-12 col-lg-5">

                <img
                    src={imagen}
                    alt={`Foto de ${nombre} ${apellido}`}
                />

            </div>


            {/* Información */}

            <div className="tarjeta-contenido col-12 col-lg-7">

                <span className="tarjeta-etiqueta">
                    PRESENTACIÓN
                </span>

                <h1>
                    {nombre} {apellido}
                </h1>

                <p className="profesion">
                    {profesion}
                </p>

                <button
                    type="button"
                    className="btn btn-light px-4 py-3"
                    onClick={manejarClick}
                >
                    Ver información
                </button>

                {/* Mensaje dinámico */}

                <p className="mensaje mt-4 mb-0">
                    {mensaje}
                </p>

            </div>

        </article>
    );
}

export default TarjetaPresentacion;