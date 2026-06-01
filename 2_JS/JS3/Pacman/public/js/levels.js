/*Las funciones de lis numeros: 
 * 1: Pared del laberinto (Renderizado en neón)
 * 2: Pasillo libre de spawn (Sin billetes)
 * 0: Pasillo donde spawneará un Billete móvil
 * 3: Pasillo donde spawneará un Tubo de ensayo redondo móvil (Energizador)
 * 4: Puerta de la guarida de fantasmas
 */

const LEVELS = [
    // NIVEL 1: THE RV LAB (El laboratorio móvil en la casa rodante)
    {
        name: "Nivel 1",
        subtitle: "LABORATORIO RV",
        color: "#00ff66", // Verde químico neón
        ghostSpeedFactor: 0.045,
        frightenedDuration: 12000, // 12 segundos de vulnerabilidad (Fácil)
        player1Spawn: { gridX: 9, gridY: 16 },
        player2Spawn: { gridX: 9, gridY: 18 },
        ghostSpawns: [
            { gridX: 9, gridY: 10, name: "Gus" },
            { gridX: 8, gridY: 11, name: "Hank" },
            { gridX: 9, gridY: 11, name: "Tuco" },
            { gridX: 10, gridY: 11, name: "Hector" }
        ],
        ghostHouseDoor: { gridX: 9, gridY: 9 },
        storyDialogs: [
            { char: 'walter', text: "Jesse, tenemos que cocinar. Ya tengo lista la casa rodante." },
            { char: 'jesse', text: "¡¿Cocinar en el desierto, señor White?! Yo... no lo sé, ¡la DEA está muy cerca!" },
            { char: 'walter', text: "No hay alternativa, Jesse. Consigue los billetes y no toques los tubos a menos que sea necesario." },
            { char: 'jesse', text: "¡De acuerdo! Pero si Hank nos atrapa, es su culpa..." }
        ],
        map: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,3,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,3,1],
            [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
            [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
            [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
            [1,1,1,1,0,1,1,1,2,1,2,1,1,1,0,1,1,1,1],
            [2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2],
            [1,1,1,1,0,1,2,1,1,4,1,1,2,1,0,1,1,1,1],
            [2,2,2,2,0,2,2,1,2,2,2,1,2,2,0,2,2,2,2],
            [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
            [2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2],
            [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
            [1,3,0,1,0,2,2,2,2,2,2,2,2,2,0,1,0,3,1],
            [1,1,0,1,0,1,2,1,1,1,1,1,2,1,0,1,0,1,1],
            [1,0,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,0,1],
            [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ]
    },
    // NIVEL 2: LOS POLLOS HERMANOS
    {
        name: "Nivel 2",
        subtitle: "LOS POLLOS HERMANOS",
        color: "#ffcc00", // Amarillo mostaza
        ghostSpeedFactor: 0.055,
        frightenedDuration: 10000, // 10 segundos
        player1Spawn: { gridX: 9, gridY: 16 },
        player2Spawn: { gridX: 9, gridY: 18 },
        ghostSpawns: [
            { gridX: 9, gridY: 10, name: "Gus" },
            { gridX: 8, gridY: 11, name: "Hank" },
            { gridX: 9, gridY: 11, name: "Tuco" },
            { gridX: 10, gridY: 11, name: "Hector" }
        ],
        ghostHouseDoor: { gridX: 9, gridY: 9 },
        storyDialogs: [
            { char: 'walter', text: "Necesitamos un distribuidor grande. He concertado una cita en un restaurante local." },
            { char: 'jesse', text: "¡¿Los Pollos Hermanos?! ¡Señor White, el dueño de este lugar me da escalofríos!" },
            { char: 'walter', text: "Se llama Gustavo Fring. Sé profesional, Jesse. Mantén la calma y recolecta el pago." },
            { char: 'jesse', text: "Ese sujeto oculta algo... ¡míralo a los ojos!" }
        ],
        map: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,3,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,3,1],
            [1,0,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
            [1,0,1,1,0,0,0,0,0,1,0,0,0,0,0,1,1,0,1],
            [1,0,0,0,0,1,1,1,0,1,0,1,1,1,0,0,0,0,1],
            [1,1,1,1,0,1,2,2,2,2,2,2,2,1,0,1,1,1,1],
            [2,2,2,1,0,1,2,1,1,4,1,1,2,1,0,1,2,2,2],
            [1,1,1,1,0,1,2,1,2,2,2,1,2,1,0,1,1,1,1],
            [2,2,2,2,0,2,2,1,2,2,2,1,2,2,0,2,2,2,2],
            [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
            [2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2],
            [1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,0,1],
            [1,3,0,0,0,1,0,1,0,2,0,1,0,1,0,0,0,3,1],
            [1,1,1,0,0,1,0,1,0,1,0,1,0,1,0,0,1,1,1],
            [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ]
    },
    // NIVEL 3: EL SUPERLABORATORIO
    {
        name: "Nivel 3",
        subtitle: "EL SUPERLABORATORIO",
        color: "#00e5ff", // Celeste neón
        ghostSpeedFactor: 0.065,
        frightenedDuration: 8000, // 8 segundos
        player1Spawn: { gridX: 9, gridY: 16 },
        player2Spawn: { gridX: 9, gridY: 18 },
        ghostSpawns: [
            { gridX: 9, gridY: 10, name: "Gus" },
            { gridX: 8, gridY: 11, name: "Hank" },
            { gridX: 9, gridY: 11, name: "Tuco" },
            { gridX: 10, gridY: 11, name: "Hector" }
        ],
        ghostHouseDoor: { gridX: 9, gridY: 9 },
        storyDialogs: [
            { char: 'walter', text: "Fring nos ha construido un laboratorio de última generación bajo una lavandería." },
            { char: 'jesse', text: "¡Guau, esto es gigante! ¡Es reluciente, señor White! ¡Mire las campanas de flujo!" },
            { char: 'walter', text: "Pero la pureza debe ser del 99.1%. Cualquier error y Gus se deshará de nosotros." },
            { char: 'jesse', text: "Sí, señor White... Además, tiene cámaras vigilándonos. No me agrada esto." }
        ],
        map: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,3,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,3,1],
            [1,0,1,1,1,0,0,1,0,1,0,1,0,0,1,1,1,0,1],
            [1,0,1,1,1,0,0,0,0,1,0,0,0,0,1,1,1,0,1],
            [1,0,0,0,0,0,1,1,0,1,0,1,1,0,0,0,0,0,1],
            [1,1,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1],
            [2,2,1,0,1,0,0,0,0,0,0,0,0,0,1,0,1,2,2],
            [1,1,1,0,1,1,1,1,2,0,2,1,1,1,1,0,1,1,1],
            [2,2,2,0,1,2,2,2,2,2,2,2,2,1,0,2,2,2,2],
            [1,1,1,0,1,2,1,1,1,4,1,1,1,2,1,0,1,1,1],
            [2,2,2,0,2,2,1,2,2,2,2,2,1,2,2,0,2,2,2],
            [1,1,1,0,1,2,1,1,1,1,1,1,1,2,1,0,1,1,1],
            [2,2,2,0,1,2,2,2,2,2,2,2,2,1,0,2,2,2,2],
            [1,1,1,0,1,1,1,1,0,1,0,1,1,1,1,0,1,1,1],
            [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
            [1,3,0,1,0,0,0,0,0,2,0,0,0,0,0,1,0,3,1],
            [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
            [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
            [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ]
    },
    // NIVEL 4: ALMACÉN MADRIGAL
    {
        name: "Nivel 4",
        subtitle: "ALMACÉN MADRIGAL",
        color: "#94a3b8", // Gris acero
        ghostSpeedFactor: 0.075,
        frightenedDuration: 6000, // 6 segundos
        player1Spawn: { gridX: 9, gridY: 16 },
        player2Spawn: { gridX: 9, gridY: 18 },
        ghostSpawns: [
            { gridX: 9, gridY: 10, name: "Gus" },
            { gridX: 8, gridY: 11, name: "Hank" },
            { gridX: 9, gridY: 11, name: "Tuco" },
            { gridX: 10, gridY: 11, name: "Hector" }
        ],
        ghostHouseDoor: { gridX: 9, gridY: 9 },
        storyDialogs: [
            { char: 'walter', text: "Nos estamos quedando sin metilamina. Debemos asaltar el almacén químico de Madrigal Electromotive." },
            { char: 'jesse', text: "¡Señor White, eso es cruzar el límite! ¡Tienen seguridad armada!" },
            { char: 'walter', text: "Es física y química básica, Jesse. Entramos rápidos, recolectamos los barriles y salimos." },
            { char: 'jesse', text: "¡Oh, sí! ¡Ciencia! Espero que esta sustancia sea pura." }
        ],
        map: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,3,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,3,1],
            [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
            [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
            [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
            [1,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1],
            [1,1,1,1,0,1,1,1,2,2,2,1,1,1,0,1,1,1,1],
            [2,2,2,1,0,1,2,1,1,4,1,1,2,1,0,1,2,2,2],
            [1,1,1,1,0,1,2,1,2,2,2,1,2,1,0,1,1,1,1],
            [2,2,2,2,0,2,2,1,2,2,2,1,2,2,0,2,2,2,2],
            [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
            [2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2],
            [1,0,0,0,0,1,1,1,0,1,0,1,1,1,0,0,0,0,1],
            [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
            [1,3,0,1,0,0,0,0,0,2,0,0,0,0,0,1,0,3,1],
            [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
            [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
            [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ]
    },
    // NIVEL 5: EMBOSCADA DESIERTO
    {
        name: "Nivel 5",
        subtitle: "EMBOSCADA DESIERTO",
        color: "#f97316", // Naranja arena
        ghostSpeedFactor: 0.085,
        frightenedDuration: 4500, // 4.5 segundos
        player1Spawn: { gridX: 9, gridY: 16 },
        player2Spawn: { gridX: 9, gridY: 18 },
        ghostSpawns: [
            { gridX: 9, gridY: 10, name: "Gus" },
            { gridX: 8, gridY: 11, name: "Hank" },
            { gridX: 9, gridY: 11, name: "Tuco" },
            { gridX: 10, gridY: 11, name: "Hector" }
        ],
        ghostHouseDoor: { gridX: 9, gridY: 9 },
        storyDialogs: [
            { char: 'walter', text: "El cártel mexicano interfiere. Tuco Salamanca nos ha citado en el desierto y Hector no para de sonar su campana." },
            { char: 'jesse', text: "¡Tuco está completamente loco! ¡Oí que golpeó a uno de sus propios hombres sin razón, yo!" },
            { char: 'walter', text: "No podemos flaquear ahora. Muéstrales nuestro producto de cristal azul." },
            { char: 'jesse', text: "¡Oh dios! ¡Ahí viene Hank también! ¡Nos rodea la DEA y el cártel!" }
        ],
        map: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,3,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,3,1],
            [1,0,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1],
            [1,0,1,1,0,0,0,1,0,0,0,1,0,0,0,1,1,0,1],
            [1,0,0,0,0,1,1,1,1,0,1,1,1,1,0,0,0,0,1],
            [1,0,1,1,0,1,0,0,0,0,0,0,0,1,0,1,1,0,1],
            [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,0,1,1,1,2,2,2,1,1,1,0,1,1,1,1],
            [2,2,2,1,0,1,2,1,1,4,1,1,2,1,0,1,2,2,2],
            [1,1,1,1,0,1,2,1,2,2,2,1,2,1,0,1,1,1,1],
            [2,2,2,2,0,2,2,1,2,2,2,1,2,2,0,2,2,2,2],
            [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
            [2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2],
            [1,0,0,0,0,1,1,1,0,1,0,1,1,1,0,0,0,0,1],
            [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
            [1,3,0,1,0,0,0,0,0,2,0,0,0,0,0,1,0,3,1],
            [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
            [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
            [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ]
    },
    // NIVEL 6: EL ENFRENTAMIENTO FINAL (
    {
        name: "Nivel 6",
        subtitle: "RESIDENCIA WHITE",
        color: "#ff3366", // Rojo neón vibrante
        ghostSpeedFactor: 0.095,
        frightenedDuration: 3000, // Solo 3 segundos
        player1Spawn: { gridX: 9, gridY: 16 },
        player2Spawn: { gridX: 9, gridY: 18 },
        ghostSpawns: [
            { gridX: 9, gridY: 10, name: "Gus" },
            { gridX: 8, gridY: 11, name: "Hank" },
            { gridX: 9, gridY: 11, name: "Tuco" },
            { gridX: 10, gridY: 11, name: "Hector" }
        ],
        ghostHouseDoor: { gridX: 9, gridY: 9 },
        storyDialogs: [
            { char: 'walter', text: "Este es el fin de la línea, Jesse. Gus y Hank están convergiendo en mi hogar." },
            { char: 'jesse', text: "¡Señor White! ¡¿Qué vamos a hacer?! ¡Hank es su cuñado! ¡Y Gus quiere matarnos!" },
            { char: 'walter', text: "Protégete detrás de mí. Yo me encargaré de Hank. Yo soy el que golpea a la puerta." },
            { char: 'jesse', text: "¡Hagámoslo, señor White! " }
        ],
        map: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,3,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,3,1],
            [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
            [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,0,1],
            [1,0,1,1,0,0,0,0,0,1,0,0,0,0,0,1,1,0,1],
            [1,0,0,0,0,1,1,1,0,1,0,1,1,1,0,0,0,0,1],
            [1,1,1,1,0,1,2,2,2,2,2,2,2,1,0,1,1,1,1],
            [2,2,2,1,0,1,2,1,1,4,1,1,2,1,0,1,2,2,2],
            [1,1,1,1,0,1,2,1,2,2,2,1,2,1,0,1,1,1,1],
            [2,2,2,2,0,2,2,1,2,2,2,1,2,2,0,2,2,2,2],
            [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
            [2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2],
            [1,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
            [1,3,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,3,1],
            [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1],
            [1,2,2,2,2,2,2,2,0,2,0,2,2,2,2,2,2,2,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ]
    }
];

// Diálogos de victoria absoluta al completar el Nivel 6
const WIN_GAME_STORY = [
    { char: 'walter', text: "Lo hemos logrado, Jesse. Hemos construido un imperio." },
    { char: 'jesse', text: "¡Sí, señor White! ¡Ganamos! " },
    { char: 'walter', text: "Recuerda nuestro trato... ahora gobernamos este desierto." }
];
