/*
 * PROYECTO 4 - LISTA DE TAREAS
 *
 * Este componente permite:
 *
 * - Ver tareas.
 * - Agregar tareas.
 * - Marcar tareas como completadas.
 * - Desmarcar tareas.
 * - Eliminar tareas.
 *
 * Las tareas se almacenan en un arreglo
 * utilizando el estado de React.
 */

import { useState } from "react";

/*
 * Define la estructura de una tarea.
 */
interface Tarea {
    id: number;
    texto: string;
    completada: boolean;
}

function ListaTareas() {

    /*
     * Estado que almacena todas las tareas.
     */
    const [tareas, setTareas] = useState<Tarea[]>([
        {
            id: 1,
            texto: "Aprender React",
            completada: false
        },
        {
            id: 2,
            texto: "Practicar TypeScript",
            completada: false
        }
    ]);

    /*
     * Estado que almacena lo escrito
     * en el campo de texto.
     */
    const [nuevaTarea, setNuevaTarea] =
        useState<string>("");

    /*
     * Mensaje mostrado en la interfaz.
     *
     * No utilizamos alert().
     */
    const [mensaje, setMensaje] =
        useState<string>(
            "Agregá una tarea para comenzar."
        );

    /*
     * Agrega una nueva tarea.
     */
    const agregarTarea = (): void => {

        const texto =
            nuevaTarea.trim();

        /*
         * Evitamos agregar tareas vacías.
         */
        if (texto === "") {

            setMensaje(
                "Escribí una tarea antes de agregarla."
            );

            return;
        }

        /*
         * Creamos la nueva tarea.
         */
        const tarea: Tarea = {
            id: Date.now(),
            texto: texto,
            completada: false
        };

        /*
         * Agregamos la tarea al arreglo.
         */
        setTareas((tareasActuales) => [
            ...tareasActuales,
            tarea
        ]);

        /*
         * Limpiamos el input.
         */
        setNuevaTarea("");

        setMensaje(
            "Tarea agregada correctamente."
        );
    };

    /*
     * Cambia una tarea entre pendiente
     * y completada.
     */
    const cambiarEstado = (
        id: number
    ): void => {

        setTareas((tareasActuales) =>
            tareasActuales.map((tarea) => {

                if (tarea.id === id) {

                    return {
                        ...tarea,
                        completada:
                            !tarea.completada
                    };
                }

                return tarea;
            })
        );

        setMensaje(
            "Estado de la tarea actualizado."
        );
    };

    /*
     * Elimina una tarea del arreglo.
     */
    const eliminarTarea = (
        id: number
    ): void => {

        setTareas((tareasActuales) =>
            tareasActuales.filter(
                (tarea) =>
                    tarea.id !== id
            )
        );

        setMensaje(
            "Tarea eliminada."
        );
    };

    /*
     * Permite agregar una tarea
     * presionando Enter.
     */
    const manejarTecla = (
        evento: React.KeyboardEvent<HTMLInputElement>
    ): void => {

        if (evento.key === "Enter") {
            agregarTarea();
        }
    };

    /*
     * El doble click también cambia
     * el estado de la tarea.
     */
    const manejarDobleClick = (
        id: number
    ): void => {

        cambiarEstado(id);
    };

    /*
     * Calculamos cuántas tareas
     * están completadas.
     */
    const completadas =
        tareas.filter(
            (tarea) => tarea.completada
        ).length;

    return (
        <section className="lista-tareas p-4 p-md-5">

            <div className="row g-5">

                {/* INFORMACIÓN */}

                <div className="col-12 col-lg-5">

                    <span className="etiqueta">
                        PROYECTO 04
                    </span>

                    <h1>
                        Lista de tareas
                    </h1>

                    <p className="descripcion">
                        Organizá tus tareas,
                        completalas y llevá
                        un seguimiento de
                        tu progreso.
                    </p>

                    <div className="progreso mt-4">

                        <strong>
                            {completadas}
                        </strong>

                        <span>
                            tareas completadas
                        </span>

                    </div>

                </div>


                {/* LISTA */}

                <div className="col-12 col-lg-7">

                    {/* INPUT */}

                    <div className="input-group mb-3">

                        <input
                            type="text"
                            className="form-control"
                            placeholder="Escribí una tarea..."
                            value={nuevaTarea}
                            onChange={(evento) =>
                                setNuevaTarea(
                                    evento.target.value
                                )
                            }
                            onKeyDown={
                                manejarTecla
                            }
                        />

                        <button
                            type="button"
                            className="btn btn-light"
                            onClick={
                                agregarTarea
                            }
                        >
                            Agregar
                        </button>

                    </div>


                    {/* MENSAJE */}

                    <p className="mensaje mb-4">
                        {mensaje}
                    </p>


                    {/* LISTA DE TAREAS */}

                    {tareas.length === 0 ? (

                        <div className="
                            tarea-vacia
                            p-5
                            text-center
                        ">

                            <h3>
                                No hay tareas
                            </h3>

                            <p className="mb-0">
                                Agregá una tarea
                                para comenzar.
                            </p>

                        </div>

                    ) : (

                        tareas.map((tarea) => (

                            <div
                                key={tarea.id}
                                className={`
                                    tarea
                                    d-flex
                                    align-items-center
                                    gap-3
                                    p-3
                                    mb-3
                                    ${
                                        tarea.completada
                                            ? "completada"
                                            : ""
                                    }
                                `}
                                onDoubleClick={() =>
                                    manejarDobleClick(
                                        tarea.id
                                    )
                                }
                            >

                                {/* CHECKBOX */}

                                <input
                                    type="checkbox"
                                    className="
                                        form-check-input
                                        flex-shrink-0
                                    "
                                    checked={
                                        tarea.completada
                                    }
                                    onChange={() =>
                                        cambiarEstado(
                                            tarea.id
                                        )
                                    }
                                />


                                {/* TEXTO */}

                                <span className="
                                    texto-tarea
                                    flex-grow-1
                                ">
                                    {tarea.texto}
                                </span>


                                {/* BOTÓN ELIMINAR */}

                                <button
                                    type="button"
                                    className="
                                        btn
                                        btn-sm
                                        btn-outline-light
                                    "
                                    onClick={() =>
                                        eliminarTarea(
                                            tarea.id
                                        )
                                    }
                                >
                                    Eliminar
                                </button>

                            </div>

                        ))

                    )}

                </div>

            </div>

        </section>
    );
}

export default ListaTareas;