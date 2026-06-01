class GameEngine {

    constructor() {   // Inicializa todo: canvas, jugadores, fantasmas, timers, y arranca el DOM.

        this.canvas = document.getElementById('game-canvas'); // Es la "pantalla" donde se dibuja todo el juego cada frame.

        this.ctx = this.canvas.getContext('2d');

        // --- Canvas oculto (offscreen) ---
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');

        // --- Tamaño de la grilla ---
        this.cols = 19;
        this.rows = 22;

        this.tileSize = 20;

        // --- Estado de las pantallas ---
        this.currentScreen = 'main-menu';

        // Modo de juego: '1p' o '2p' 
        this.mode = '1p';

        // Indica si el juego está pausado.
        this.paused = false;

        // --- Progreso de la partida ---
        this.levelIndex = 0;

        // Lee el highscore guardado en el navegador de sesiones anteriores.
        this.highScore = parseInt(localStorage.getItem('breaking_pacman_highscore')) || 0;

        // --- Jugadores ---
        this.players = {
            p1: new Player('p1', 'Dr. White', 9, 16, {
                up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight'
            }, 'assets/images/walter_closed.png', 'assets/images/walter_open.png'),

            p2: new Player('p2', 'Jesse', 9, 18, {
                up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD'
            }, 'assets/images/jesse_closed.png', 'assets/images/jesse_open.png')
        };

        // --- Fantasmas e ítems ---
        this.ghosts = [];       // Instancias de Ghost, una por cada fantasma del nivel
        this.movingItems = [];  // Objetos literales: billetes (money) y tubos (flask)

        // --- Timers y control del loop ---
        this.gameLoopId = null;

        // El cartel que dice el nombre del nivel
        this.levelBannerTimer = 0;

        this.levelBannerActive = false;

        this.sirenTimer = 0;

        // --- Estado del Modo Historia ---
        this.storyActive = false;

        // iniciar ese nivel correctamente al terminar los diálogos.
        this.storyLevelIndex = 0;

        this.storyDialogIndex = 0;

        this.storyLines = [];

        // --- Imagen del billete ---
        this.moneyImage = new Image();
        this.moneyImage.src = 'assets/images/money.png';

        this.initDOM();

        this.resizeCanvas();

        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.cacheMaze();
        });
    }

    // Conecta cada botón del HTML con su acción correspondiente.
    initDOM() {

        // --- Botón de inicio ---
        document.getElementById('btn-start').addEventListener('click', () => {
            sound.init();
            this.switchScreen('mode-menu');
        });

        // Botón "Volver" en la pantalla de selección de modo: regresa al menú principal.
        document.getElementById('btn-back-mode').addEventListener('click', () => {
            this.switchScreen('main-menu');
        });

        // --- Botones de modo de juego ---
        document.getElementById('mode-1p').addEventListener('click', () => {
            this.mode = '1p';
            this.startNewGame();
        });

        document.getElementById('mode-2p').addEventListener('click', () => {
            this.mode = '2p';
            this.startNewGame();
        });

        // --- Botones de pausa y salida (dentro del juego) ---
        document.getElementById('btn-pause').addEventListener('click', () => {
            this.togglePause();
        });
        document.getElementById('btn-exit').addEventListener('click', () => {
            this.confirmExit();
        });

        // --- Botón de sonido ---
        const soundBtn = document.getElementById('btn-sound-toggle');
        soundBtn.textContent = sound.isMuted() ? "🔇 Mudo" : "🔊 Sonido";

        soundBtn.addEventListener('click', () => {
            // toggleMute() alterna el estado y devuelve true si quedó mudo.
            const isMuted = sound.toggleMute();
            soundBtn.textContent = isMuted ? "🔇 Mudo" : "🔊 Sonido";
            soundBtn.blur();
        });

        // --- Botones de la pantalla de resultados ---
        // "Jugar de nuevo" arranca una partida nueva desde nivel 0.
        document.getElementById('btn-restart').addEventListener('click', () => {
            this.startNewGame();
        });
        // "Menú principal" vuelve al inicio.
        document.getElementById('btn-menu-principal').addEventListener('click', () => {
            this.switchScreen('main-menu');
        });

        // --- Botones del modo historia ---
        document.getElementById('btn-story-next').addEventListener('click', () => {
            this.nextStoryLine();
        });
        // "Saltar" 
        document.getElementById('btn-story-skip').addEventListener('click', () => {
            this.skipStory();
        });

        // --- Teclado --
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));

        this.setupMobileControls();

        // Muestra el highscore guardado en el HUD del menú principal.
        document.getElementById('high-score').textContent = this.formatScore(this.highScore);
    }


    // resizeCanvas
    // Ajusta el tamaño del canvas para que ocupe el máximo espacio posible
    resizeCanvas() {
        const wrapper = this.canvas.parentElement;
        const width = wrapper.clientWidth;
        const height = wrapper.clientHeight;

        // Relación de aspecto objetivo
        const targetRatio = this.cols / this.rows;

        let canvasWidth = width;
        let canvasHeight = width / targetRatio;

        if (canvasHeight > height) {
            canvasHeight = height;
            canvasWidth = height * targetRatio;
        }

        // Asigna las dimensiones definitivas al canvas.
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;

        // Recalcula cuántos píxeles mide cada celda del mapa.
        this.tileSize = canvasWidth / this.cols;

        // Resincroniza las posiciones en píxeles de todos los elementos del juego.
        this.players.p1.syncPixels(this.tileSize);
        this.players.p2.syncPixels(this.tileSize);
        this.ghosts.forEach(g => g.syncPixels(this.tileSize));
        this.movingItems.forEach(item => item.syncPixels(this.tileSize));
    }


    // switchScreen
    // Cambia la pantalla visible. El HTML tiene varios divs con clase .screen;
    switchScreen(screenId) {
        document.querySelectorAll('.screen').forEach(scr => {
            scr.classList.remove('active');
        });

        // Le pone 'active' solo a la pantalla solicitada para hacerla visible.
        document.getElementById(screenId).classList.add('active');

        this.currentScreen = screenId;

        if (screenId !== 'game-screen' && this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
        }
    }

    // startNewGame
    // Arranca una partida nueva desde cero: nivel 0, vidas y puntaje iniciales.
    startNewGame() {
        this.levelIndex = 0;

        this.players.p1.resetGame();
        this.players.p1.resetPosition();

        this.players.p2.resetGame();
        this.players.p2.resetPosition();

        const p2hud = document.querySelector('.p2-hud');
        const p2Dpad = document.getElementById('p2-dpad');

        if (this.mode === '2p') {
            p2hud.classList.remove('disabled');
            p2Dpad.classList.remove('disabled');
            this.players.p2.isDead = false;
        } else {
            // En modo 1 jugador: oculta todo lo de P2 y lo marca como muerto.
            p2hud.classList.add('disabled');
            p2Dpad.classList.add('disabled');
            this.players.p2.isDead = true;
        }

        this.loadLevel(this.levelIndex);
    }

    // loadLevel
    // Punto de entrada para cargar cualquier nivel.
    loadLevel(index) {
        this.levelIndex = index;
        const levelData = LEVELS[index]; 

        // Si el nivel tiene diálogos y no están vacíos, inicia el modo historia.
        if (levelData.storyDialogs && levelData.storyDialogs.length > 0) {
            this.startStoryMode(index, levelData.storyDialogs);
        } else {
            this.runLevelStart(index);
        }
    }

    // runLevelStart
    // Configura y arranca el juego físico de un nivel. 
    runLevelStart(index) {
        this.switchScreen('game-screen');
        this.resizeCanvas(); // Recalcula el canvas por si cambió el tamaño de ventana

        const levelData = LEVELS[index];

        document.getElementById('current-level').textContent = index + 1;

        // Al cambiar de nivel, los jugadores se reviven aunque hayan muerto en el anterior.
        this.players.p1.isDead = false;
        if (this.players.p1.lives <= 0) {
            this.players.p1.lives = 1;
        }
        // Actualiza el punto de spawn con las coordenadas del nuevo nivel.
        this.players.p1.startGridX = levelData.player1Spawn.gridX;
        this.players.p1.startGridY = levelData.player1Spawn.gridY;
        this.players.p1.resetPosition();
        this.players.p1.syncPixels(this.tileSize);

        // --- Preparar a P2 (solo en modo 2 jugadores) ---
        if (this.mode === '2p') {
            this.players.p2.isDead = false;
            if (this.players.p2.lives <= 0) {
                this.players.p2.lives = 1;
            }
            this.players.p2.startGridX = levelData.player2Spawn.gridX;
            this.players.p2.startGridY = levelData.player2Spawn.gridY;
            this.players.p2.resetPosition();
            this.players.p2.syncPixels(this.tileSize);
        }

        // --- Crear los fantasmas del nivel ---
        this.ghosts = levelData.ghostSpawns.map((spawn, i) => {
            // Las 4 esquinas del mapa son los destinos SCATTER de cada fantasma.
            const corners = [
                { x: this.cols - 1, y: 0 },          // Blinky: esquina superior derecha
                { x: 0, y: 0 },                        // Pinky: esquina superior izquierda
                { x: 0, y: this.rows - 1 },            // Clyde: esquina inferior izquierda
                { x: this.cols - 1, y: this.rows - 1 } // Inky: esquina inferior derecha
            ];

            // Colores de cada fantasma en el mismo orden que las esquinas.
            const colors = ['#ff3333', '#00e5ff', '#ff9900', '#ff66b2'];

            const g = new Ghost(
                spawn.name,
                spawn.gridX,
                spawn.gridY,
                colors[i],
                corners[i].x,
                corners[i].y,
                levelData.ghostSpeedFactor
            );
            g.syncPixels(this.tileSize);
            return g;
        });

        // --- Generar billetes y tubos ---
        this.spawnMovingItems(levelData);

        this.cacheMaze();

        this.drawLivesHUD();
        this.updateScoresHUD();

        // Muestra el banner con el nombre y subtítulo del nivel durante unos segundos.
        this.showLevelBanner(levelData.name, levelData.subtitle);

        sound.playStartGame();

        // Arranca el loop solo si no estaba corriendo ya.
        if (!this.gameLoopId) {
            this.paused = false;
            this.gameLoop();
        }
    }

    // cacheMaze
    // Dibuja todas las paredes y la puerta de la jaula en el offscreen canvas.

    cacheMaze() {
        const levelData = LEVELS[this.levelIndex];
        const neonColor = levelData.color;

        this.offscreenCanvas.width = this.canvas.width;
        this.offscreenCanvas.height = this.canvas.height;

        const ctx = this.offscreenCtx;
        const ts = this.tileSize;
        const map = levelData.map; 

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // ctx.save() guarda el estado actual del contexto (estilos, transformaciones).
        ctx.save();
        ctx.strokeStyle = neonColor;
        ctx.lineWidth = Math.max(2, ts * 0.18); 
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.shadowBlur = 8;
        ctx.shadowColor = neonColor;

        // Recorre cada celda de la matriz del mapa.
        for (let r = 0; r < map.length; r++) {
            for (let c = 0; c < map[r].length; c++) {
                const cell = map[r][c];

                if (cell === 1) {
                    // Valor 1 = pared.
                    // Calcula la posición en píxeles de la celda.
                    const x = c * ts;
                    const y = r * ts;

                    // Dibuja el interior de la pared
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                    ctx.fillRect(x + 2, y + 2, ts - 4, ts - 4);

                    // Dibuja el borde con el color neón del nivel
                    ctx.strokeRect(x + 2, y + 2, ts - 4, ts - 4);

                } else if (cell === 4) {
                    // Valor 4 = puerta de la jaula de los fantasmas.
                    ctx.save();
                    ctx.shadowBlur = 0;         // Sin neón para la puerta
                    ctx.strokeStyle = '#94a3b8'; // Gris azulado
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.moveTo(c * ts, r * ts + ts / 2);       // Extremo izquierdo de la celda
                    ctx.lineTo((c + 1) * ts, r * ts + ts / 2); // Extremo derecho de la celda
                    ctx.stroke();
                    ctx.restore();
                }

            }
        }

        ctx.restore();
    }

    // spawnMovingItems
    // Genera los billetes y tubos que se mueven por el mapa al inicio de un nivel.
    spawnMovingItems(levelData) {
        this.movingItems = []; // Limpia los ítems del nivel anterior
        let idCounter = 0;

        for (let r = 0; r < levelData.map.length; r++) {
            for (let c = 0; c < levelData.map[r].length; c++) {
                const cell = levelData.map[r][c];

                if (cell === 0) {
                    // Celda 0 = billete (money).
                    this.movingItems.push({
                        id: `money-${idCounter++}`,  // ID único para identificarlo
                        type: 'money',
                        gridX: c,   // Posición actual en la grilla
                        gridY: r, 

                        // Posición en píxeles: el centro de la celda
                        x: c * this.tileSize + this.tileSize / 2,
                        y: r * this.tileSize + this.tileSize / 2,

                        dirX: 0,    // Dirección de movimiento horizontal 
                        dirY: 0,    // Dirección de movimiento 

                        // speedMultiplier se multiplica por tileSize para obtener la velocidad
                        speedMultiplier: 0.035,
                        speed: 0.7,

                        // Recalcula la posición en píxeles y la velocidad al nuevo tamaño.
                        syncPixels: function(ts) {
                            this.x = this.gridX * ts + ts / 2;
                            this.y = this.gridY * ts + ts / 2;
                            this.speed = Math.max(0.4, ts * this.speedMultiplier);
                        }
                    });

                } else if (cell === 3) {
                    // Tubo de quimica
                    // al recogerlo asusta a los fantasmas en lugar de solo sumar puntos.
                    this.movingItems.push({
                        id: `flask-${idCounter++}`,
                        type: 'flask',
                        gridX: c,
                        gridY: r,
                        x: c * this.tileSize + this.tileSize / 2,
                        y: r * this.tileSize + this.tileSize / 2,
                        dirX: 0,
                        dirY: 0,
                        speedMultiplier: 0.045, // Más rápido que el billete
                        speed: 0.9,
                        syncPixels: function(ts) {
                            this.x = this.gridX * ts + ts / 2;
                            this.y = this.gridY * ts + ts / 2;
                            this.speed = Math.max(0.6, ts * this.speedMultiplier);
                        }
                    });
                }
            }
        }
        this.movingItems.forEach(item => item.syncPixels(this.tileSize));
    }

    // MÉTODOS DEL MODO HISTORIA

    // Inicia la secuencia de diálogos para un nivel o para el final del juego.
    startStoryMode(levelIndex, dialogs) {
        this.storyActive = true;
        this.storyLevelIndex = levelIndex; // Guardamos a qué nivel volver al terminar
        this.storyDialogIndex = 0;         // Empezamos desde el primer diálogo
        this.storyLines = dialogs;

        // para el caso win (la pantalla de victoria no muestra este título).
        document.getElementById('story-level-title').textContent = `HISTORIA: NIVEL ${levelIndex + 1}`;

        this.switchScreen('story-screen');
        this.renderStoryLine(); 
    }

    // Renderiza el diálogo actual en pantalla.

    renderStoryLine() {
        const line = this.storyLines[this.storyDialogIndex];

        const charWalter = document.getElementById('story-char-walter');
        const charJesse = document.getElementById('story-char-jesse');
        const textElement = document.getElementById('story-text');
        const bubble = document.querySelector('.story-bubble');

        // Pone el texto del diálogo actual en el elemento HTML.
        textElement.textContent = line.text;

        // Dependiendo de quién habla, activa visualmente ese personaje
        if (line.char === 'walter') {
            charWalter.classList.remove('inactive');
            charJesse.classList.add('inactive');
            bubble.className = "story-bubble speak-left"; 
        } else {
            charJesse.classList.remove('inactive');
            charWalter.classList.add('inactive');
            bubble.className = "story-bubble speak-right"; 
        }
    }

    // Avanza al siguiente diálogo. Si ya era el último, termina el modo historia.
    nextStoryLine() {
        this.storyDialogIndex++;
        if (this.storyDialogIndex < this.storyLines.length) {
            this.renderStoryLine(); 
        } else {
            this.endStoryMode(); 
        }
    }

    skipStory() {
        this.endStoryMode();
    }
    endStoryMode() {
        this.storyActive = false;

        if (this.storyLevelIndex === 'win') {
            this.showEndGameScreen(true);
        } else {
            this.runLevelStart(this.storyLevelIndex);
        }
    }


    // showLevelBanner
    // Muestra el banner con el nombre y subtítulo del nivel durante 180 frames
    showLevelBanner(title, subtitle) {
        const banner = document.getElementById('level-banner');
        document.getElementById('level-banner-title').textContent = title;
        document.getElementById('level-banner-subtitle').textContent = subtitle;

        banner.classList.remove('hidden');
        this.levelBannerActive = true;
        this.levelBannerTimer = 180; 
    }


    // togglePause
    togglePause() {
        this.paused = !this.paused; // Invierte el estado: true→false, false→true

        const btn = document.getElementById('btn-pause');
        btn.textContent = this.paused ? "Reanudar" : "Pausar";

        if (!this.paused && this.currentScreen === 'game-screen') {
            this.gameLoop();
        }
    }
    confirmExit() {
        this.paused = false;
        this.switchScreen('main-menu'); 
    }


    // drawLivesHUD
    // Actualiza los iconos de vida en el HUD. Borra todos los iconos actuales

    drawLivesHUD() {
        const containerP1 = document.getElementById('lives-p1');
        containerP1.innerHTML = ''; // Borra los iconos actuales
        for (let i = 0; i < this.players.p1.lives; i++) {
            const life = document.createElement('div');
            life.className = 'life-icon walter';
            containerP1.appendChild(life);
        }

        const containerP2 = document.getElementById('lives-p2');
        containerP2.innerHTML = '';
        if (this.mode === '2p') {
            // Solo dibuja las vidas de P2 si estamos en modo 2 jugadores.
            for (let i = 0; i < this.players.p2.lives; i++) {
                const life = document.createElement('div');
                life.className = 'life-icon jesse';
                containerP2.appendChild(life);
            }
        }
    }


    // handleKeyDown
    handleKeyDown(e) {

        if (this.currentScreen === 'story-screen') {
            if (e.code === 'Enter' || e.code === 'Space') {
                e.preventDefault(); // Evita que el espacio haga scroll en la página
                this.nextStoryLine();
            }
            return; 
        }

        if (this.currentScreen !== 'game-screen' || this.paused) return;

        // Evita que las flechas y el espacio hagan scroll en la página del navegador.
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
            e.preventDefault();
        }

        // --- Controles de P1  ---
        // El jugador no cambia de dirección instantáneamente: guarda el input como
        // "próxima dirección" y la aplica cuando sea posible
        if (!this.players.p1.isDead) {
            switch (e.code) {
                case 'ArrowUp':    this.players.p1.setNextDirection(0, -1); break;
                case 'ArrowDown':  this.players.p1.setNextDirection(0, 1);  break;
                case 'ArrowLeft':  this.players.p1.setNextDirection(-1, 0); break;
                case 'ArrowRight': this.players.p1.setNextDirection(1, 0);  break;
            }
        }

        // --- Controles de P2 (WASD) ---
        if (this.mode === '2p' && !this.players.p2.isDead) {
            switch (e.code) {
                case 'KeyW': this.players.p2.setNextDirection(0, -1); break;
                case 'KeyS': this.players.p2.setNextDirection(0, 1);  break;
                case 'KeyA': this.players.p2.setNextDirection(-1, 0); break;
                case 'KeyD': this.players.p2.setNextDirection(1, 0);  break;
            }
        }
    }

    // setupMobileControls
    // Conecta los botones del D-pad táctil en pantalla para dispositivos móviles.

    setupMobileControls() {
        // D-pad de P1
        document.querySelectorAll('#p1-dpad .dpad-btn').forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault(); // Evita el comportamiento de scroll en móvil
                if (this.players.p1.isDead) return;
                const dir = btn.getAttribute('data-dir');
                this.setMobileDirection(this.players.p1, dir);
            });
            btn.addEventListener('mousedown', () => {
                if (this.players.p1.isDead) return;
                const dir = btn.getAttribute('data-dir');
                this.setMobileDirection(this.players.p1, dir);
            });
        });

        // D-pad de P2
        document.querySelectorAll('#p2-dpad .dpad-btn').forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (this.mode !== '2p' || this.players.p2.isDead) return;
                const dir = btn.getAttribute('data-dir');
                this.setMobileDirection(this.players.p2, dir);
            });
            btn.addEventListener('mousedown', () => {
                if (this.mode !== '2p' || this.players.p2.isDead) return;
                const dir = btn.getAttribute('data-dir');
                this.setMobileDirection(this.players.p2, dir);
            });
        });
    }

    // Traduce el string de dirección del D-pad a coordenadas (dx, dy) 
    setMobileDirection(player, dir) {
        switch (dir) {
            case 'up':    player.setNextDirection(0, -1); break;
            case 'down':  player.setNextDirection(0, 1);  break;
            case 'left':  player.setNextDirection(-1, 0); break;
            case 'right': player.setNextDirection(1, 0);  break;
        }
    }

    // gameLoop
    // Cada "frame" hace dos cosas: actualizar la lógica (update) y dibujar (draw).

    gameLoop() {
        if (this.paused || this.currentScreen !== 'game-screen') return;

        this.update(); // Lógica: mover jugadores, fantasmas, ítems, detectar colisiones
        this.draw();   // Dibujo: pintar el frame actual en el canvas

        this.gameLoopId = requestAnimationFrame(() => this.gameLoop());
    }

    // update

    update() {

        // --- Gestión del banner de nivel ---
        // Mientras el banner esté activo, el juego está "congelado"
        if (this.levelBannerActive) {
            this.levelBannerTimer--;
            if (this.levelBannerTimer <= 0) {
                document.getElementById('level-banner').classList.add('hidden');
                this.levelBannerActive = false;
            }
            return; 
        }

        const map = LEVELS[this.levelIndex].map;

        // --- 1. Actualizar jugadores ---
        // Cada jugador activo calcula su movimiento para este frame.
        if (!this.players.p1.isDead) this.players.p1.update(map, this.tileSize);
        if (this.mode === '2p' && !this.players.p2.isDead) this.players.p2.update(map, this.tileSize);

        // --- 2. Actualizar ítems móviles (billetes y tubos) ---
        this.updateMovingItems(map);

        // --- 3. Actualizar fantasmas ---
        const activePlayers = { p1: this.players.p1, p2: this.players.p2 };
        const door = LEVELS[this.levelIndex].ghostHouseDoor; // Posición de la puerta de la jaula

        let anyoneFrightened = false;
        this.ghosts.forEach(ghost => {
            // ghost.update() ejecuta la IA del fantasma: pathfinding, cambio de estado, etc.
            ghost.update(map, activePlayers, this.mode === '2p', this.tileSize, door, this.ghosts);

            if (ghost.state === GHOST_STATES.FRIGHTENED) {
                anyoneFrightened = true;
            }
        });

        // Si algún fantasma está asustado, dispara el beep de alarma cada 20 frames.
        if (anyoneFrightened) {
            this.sirenTimer++;
            if (this.sirenTimer % 20 === 0) {
                sound.playFrightenedBeep();
            }
        }

        // --- 4. Detectar colisiones ---
        this.checkCollisions();
    }

    // updateMovingItems
    // Mueve cada billete y tubo por el laberinto de forma autónoma.


    updateMovingItems(map) {
        this.movingItems.forEach(item => {

            // Centro en píxeles de la celda destino actual del ítem.
            const targetPixelX = item.gridX * this.tileSize + this.tileSize / 2;
            const targetPixelY = item.gridY * this.tileSize + this.tileSize / 2;

            // Distancia euclidiana entre la posición actual del ítem y el centro de su celda destino.
            const dist = Math.sqrt(
                Math.pow(targetPixelX - item.x, 2) +
                Math.pow(targetPixelY - item.y, 2)
            );

            if (dist < item.speed) {
                item.x = targetPixelX;
                item.y = targetPixelY;

                // Las 4 direcciones posibles: arriba, abajo, izquierda, derecha.
                const directions = [
                    { dx: 0,  dy: -1 }, // arriba
                    { dx: 0,  dy: 1  }, // abajo
                    { dx: -1, dy: 0  }, // izquierda
                    { dx: 1,  dy: 0  }  // derecha
                ];

                // la celda destino debe existir y no ser una pared (1) ni la puerta (4).
                let validChoices = [];
                directions.forEach(dir => {
                    // Excluye la dirección opuesta a la que venía para no rebotar innecesariamente.
                    if (dir.dx === -item.dirX && dir.dy === -item.dirY) return;

                    const nx = item.gridX + dir.dx; // Columna de la celda en esa dirección
                    const ny = item.gridY + dir.dy; // Fila de la celda en esa dirección

                    // Verifica que la celda esté dentro de los límites del mapa y sea transitable.
                    if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
                        const cell = map[ny][nx];
                        if (cell !== 1 && cell !== 4) {
                            validChoices.push(dir);
                        }
                    }
                });

                // Si no hay ninguna dirección válida (callejón sin salida), permite dar media vuelta.
                if (validChoices.length === 0) {
                    const reverseDir = { dx: -item.dirX, dy: -item.dirY };
                    const nx = item.gridX + reverseDir.dx;
                    const ny = item.gridY + reverseDir.dy;
                    if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows && map[ny][nx] !== 1) {
                        validChoices.push(reverseDir);
                    }
                }

                if (validChoices.length > 0) {
                    // Elige aleatoriamente una de las direcciones válidas.
                    const chosen = validChoices[Math.floor(Math.random() * validChoices.length)];
                    item.dirX = chosen.dx;
                    item.dirY = chosen.dy;
                    // Avanza la posición en la grilla a la celda destino.
                    item.gridX += item.dirX;
                    item.gridY += item.dirY;
                } else {
                    // No hay ninguna opción: el ítem se queda quieto.
                    item.dirX = 0;
                    item.dirY = 0;
                }
            }

            // --- Movimiento físico en píxeles ---
            // Math.min y Math.max evitan que "se pase" del centro exacto.
            const dx = item.gridX * this.tileSize + this.tileSize / 2;
            const dy = item.gridY * this.tileSize + this.tileSize / 2;

            if (item.x < dx) item.x = Math.min(item.x + item.speed, dx);
            else if (item.x > dx) item.x = Math.max(item.x - item.speed, dx);

            if (item.y < dy) item.y = Math.min(item.y + item.speed, dy);
            else if (item.y > dy) item.y = Math.max(item.y - item.speed, dy);
        });
    }


    // checkCollisions
    // Detecta y resuelve dos tipos de colisión cada frame:
    checkCollisions() {
        const levelData = LEVELS[this.levelIndex];

        // --- 1. Colisión jugador-ítem ---
        const checkItemCollection = (player) => {
            if (player.isDead) return;

            // Se recorre el array de atrás para adelante porque se van a eliminar
            for (let i = this.movingItems.length - 1; i >= 0; i--) {
                const item = this.movingItems[i];

                // Distancia euclidiana entre el centro del jugador y el centro del ítem.
                const dist = Math.sqrt(
                    Math.pow(player.x - item.x, 2) +
                    Math.pow(player.y - item.y, 2)
                );

                // Si están suficientemente cerca (dentro del 70% de una celda), se recoge el ítem.
                if (dist < this.tileSize * 0.7) {
                    this.movingItems.splice(i, 1); // Elimina el ítem del array

                    if (item.type === 'money') {
                        player.score += 10;
                        sound.playEatMoney();

                    } else if (item.type === 'flask') {
                        player.score += 50;
                        sound.playEatFlask();

                        // Al recoger el tubo, TODOS los fantasmas entran en estado FRIGHTENED
                        this.ghosts.forEach(ghost => {
                            ghost.changeState(GHOST_STATES.FRIGHTENED, levelData.frightenedDuration);
                        });
                    }

                    this.updateScoresHUD();
                }
            }
        };

        checkItemCollection(this.players.p1);
        if (this.mode === '2p') {
            checkItemCollection(this.players.p2);
        }

        // --- Condición de victoria del nivel ---
        if (this.movingItems.length === 0 && !this.levelBannerActive) {
            this.handleLevelComplete();
            return; // No sigue evaluando colisiones con fantasmas
        }

        // --- 2. Colisión jugador-fantasma ---
        const checkGhostCollision = (player) => {
            if (player.isDead) return;

            for (let i = 0; i < this.ghosts.length; i++) {
                const ghost = this.ghosts[i];

                // Si el fantasma está dentro de su jaula y NO está asustado, se ignora.
                if (ghost.isInHouse && ghost.state !== GHOST_STATES.FRIGHTENED) continue;

                const dist = Math.sqrt(
                    Math.pow(player.x - ghost.x, 2) +
                    Math.pow(player.y - ghost.y, 2)
                );

                if (dist < this.tileSize * 0.75) {

                    if (ghost.state === GHOST_STATES.FRIGHTENED) {
                        // El jugador come al fantasma: lo pone en estado EATEN y suma 200 puntos.
                        ghost.changeState(GHOST_STATES.EATEN);
                        player.score += 200;
                        sound.playEatGhost();
                        this.updateScoresHUD();

                    } else if (ghost.state !== GHOST_STATES.EATEN) {
                        this.handlePlayerDeath(player);
                        break; 
                    }
                }
            }
        };

        checkGhostCollision(this.players.p1);
        if (this.mode === '2p') {
            checkGhostCollision(this.players.p2);
        }
    }

    // handlePlayerDeath
    handlePlayerDeath(player) {
        player.lives--;           // Resta una vida al jugador que murió
        sound.playDeath();       
        this.drawLivesHUD();      // Actualiza los iconos de vida en pantalla
        player.isDead = true;     

        // Evalúa si la "ronda" terminó.
        let roundOver = false;

        if (this.mode === '1p') {
            roundOver = true;
        } else {
            // En 2 jugadores, la ronda termina si ambos jugadores están muertos
            const bothZeroLives = this.players.p1.lives <= 0 && this.players.p2.lives <= 0;
            const bothDeadThisRound = this.players.p1.isDead && this.players.p2.isDead;
            if (bothZeroLives || bothDeadThisRound) {
                roundOver = true;
            }
        }

        if (roundOver) {
            const p1HasLives = this.players.p1.lives > 0;
            const p2HasLives = this.mode === '2p' && this.players.p2.lives > 0;

            if (p1HasLives || p2HasLives) {
                this.levelBannerActive = true;
                this.levelBannerTimer = 120;
                setTimeout(() => {
                    this.resetEntityPositions();
                }, 1000); // 1000 ms = 1 segundo real (no frames)

            } else {
                this.handleGameOver();
            }

        } else {
            // En modo 2P, si solo uno murió pero el otro sigue vivo,
            this.showMiniNotification(`${player.name} CAÍDO`);
        }
    }

    // resetEntityPositions
    // Reposiciona a jugadores y fantasmas en sus puntos de spawn sin recargar
    resetEntityPositions() {
        const levelData = LEVELS[this.levelIndex];

        // Revive y reposiciona a P1 solo si tiene vidas restantes.
        if (this.players.p1.lives > 0) {
            this.players.p1.isDead = false;
            this.players.p1.resetPosition();
            this.players.p1.syncPixels(this.tileSize);
        }

        // Revive y reposiciona a P2 solo en modo 2P y si tiene vidas.
        if (this.mode === '2p' && this.players.p2.lives > 0) {
            this.players.p2.isDead = false;
            this.players.p2.resetPosition();
            this.players.p2.syncPixels(this.tileSize);
        }

        // Reinicia a todos los fantasmas: los devuelve a su posición de spawn
        this.ghosts.forEach(ghost => {
            ghost.reset();
            ghost.syncPixels(this.tileSize);
        });
    }

    // showMiniNotification
    // Se usa en modo 2P cuando un jugador cae pero el otro sigue vivo.
    showMiniNotification(message) {
        const banner = document.getElementById('level-banner');
        document.getElementById('level-banner-title').textContent = message;
        document.getElementById('level-banner-subtitle').textContent = "¡CUIDADO!";

        banner.classList.remove('hidden');
        this.levelBannerActive = true;
        this.levelBannerTimer = 90;
    }

    // handleLevelComplete
    handleLevelComplete() {
        this.levelBannerActive = true;
        this.levelBannerTimer = 180;

        sound.playLevelComplete();

        setTimeout(() => {
            const nextLevel = this.levelIndex + 1;
            if (nextLevel < LEVELS.length) {
                this.loadLevel(nextLevel); // Hay más niveles: carga el siguiente
            } else {
                // Era el último nivel: muestra la historia de victoria final.
                this.startStoryMode('win', WIN_GAME_STORY);
            }
        }, 1500);
    }

    // updateScoresHUD
    // Actualiza los números de puntaje en el HUD y gestiona el highscore.
    updateScoresHUD() {
        document.getElementById('score-p1').textContent = this.formatScore(this.players.p1.score);
        if (this.mode === '2p') {
            document.getElementById('score-p2').textContent = this.formatScore(this.players.p2.score);
        }

        // Obtiene el puntaje más alto entre los jugadores activos.
        const highestCurrent = Math.max(
            this.players.p1.score,
            this.mode === '2p' ? this.players.p2.score : 0
        );

        if (highestCurrent > this.highScore) {
            this.highScore = highestCurrent;
            // Guarda el nuevo récord en el almacenamiento del navegador.
            localStorage.setItem('breaking_pacman_highscore', this.highScore);
            document.getElementById('high-score').textContent = this.formatScore(this.highScore);
        }
    }

    // formatScore
    // Convierte un número a string con ceros a la izquierda hasta 6 dígitos.
    formatScore(num) {
        return num.toString().padStart(6, '0');
    }

    // handleGameOver / handleGameWin
    // Atajos simples que llaman a showEndGameScreen con el parámetro correcto.
    // se llaman (queda claro qué situación desencadenó el fin de la partida).
    handleGameOver() {
        this.showEndGameScreen(false); // false = el jugador perdió
    }

    handleGameWin() {
        this.showEndGameScreen(true); // true = el jugador ganó
    }

    // showEndGameScreen
    // Cambia a la pantalla de resultados y la personaliza según
    showEndGameScreen(isWin) {
        this.switchScreen('game-over-screen');

        const title = document.getElementById('game-over-title');
        const quote = document.getElementById('game-over-quote');
        const winnerBanner = document.getElementById('winner-banner');

        // --- Título y cita según resultado ---
        if (isWin) {
            title.textContent = "¡NEGOCIO REDONDO!";
            title.style.color = "var(--green-chem)";
            title.style.textShadow = "0 0 15px var(--green-chem-glow)";
            quote.textContent = '"I did it for me. I liked it. I was good at it." - Walter White';
        } else {
            title.textContent = "FIN DEL JUEGO";
            title.style.color = "var(--red-alert)";
            title.style.textShadow = "0 0 15px var(--red-glow)";
            quote.textContent = '"We are done when I say we are done." - Heisenberg';
        }

        // Siempre muestra el puntaje y nivel final de P1.
        document.getElementById('final-score-p1').textContent = this.players.p1.score;
        document.getElementById('final-level-p1').textContent = this.levelIndex + 1;

        const statP1 = document.getElementById('status-p1');

        if (this.mode === '1p') {
            // En modo 1 jugador: oculta la caja de P2 y el banner de ganador.
            document.getElementById('result-p2-box').classList.add('hidden');
            winnerBanner.classList.add('hidden');

            statP1.textContent = isWin ? "¡VICTORIA!" : "PERDIÓ";
            statP1.className = `result-status ${isWin ? 'winner' : 'loser'}`;

        } else {
            // En modo 2 jugadores: muestra los datos de P2 y compara puntajes.
            document.getElementById('result-p2-box').classList.remove('hidden');
            document.getElementById('final-score-p2').textContent = this.players.p2.score;
            document.getElementById('final-level-p2').textContent = this.levelIndex + 1;

            const statP2 = document.getElementById('status-p2');
            winnerBanner.classList.remove('hidden');

            const p1S = this.players.p1.score;
            const p2S = this.players.p2.score;

            if (p1S > p2S) {
                // P1 ganó
                statP1.textContent = "GANADOR P1";
                statP1.className = "result-status winner";
                statP2.textContent = "PERDEDOR P2";
                statP2.className = "result-status loser";
                winnerBanner.textContent = "¡EL GANADOR ES EL DR. WHITE!";
                winnerBanner.style.color = "var(--green-chem)";
                winnerBanner.style.borderColor = "var(--green-chem)";

            } else if (p2S > p1S) {
                // P2 ganó
                statP1.textContent = "PERDEDOR P1";
                statP1.className = "result-status loser";
                statP2.textContent = "GANADOR P2";
                statP2.className = "result-status winner";
                winnerBanner.textContent = "¡EL GANADOR ES JESSE PINKMAN!";
                winnerBanner.style.color = "var(--yellow-chem)";
                winnerBanner.style.borderColor = "var(--yellow-chem)";

            } else {
                // Empate
                statP1.textContent = "EMPATE";
                statP1.className = "result-status tie";
                statP2.textContent = "EMPATE";
                statP2.className = "result-status tie";
                winnerBanner.textContent = "¡EMPATE ABSOLUTO EN LA OPERACIÓN!";
                winnerBanner.style.color = "var(--blue-ch)";
                winnerBanner.style.borderColor = "var(--blue-ch)";
            }
        }
    }


    // draw
    draw() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        // 1. Borra el frame anterior pintando todo de negro oscuro.
        ctx.fillStyle = '#05070a';
        ctx.fillRect(0, 0, width, height);

        // 2. Copia el laberinto pre-renderizado desde el offscreen canvas.
        ctx.drawImage(this.offscreenCanvas, 0, 0);

        // 3. Dibuja los ítems móviles (billetes y tubos).
        this.drawItems(ctx);

        // 4. Dibuja los fantasmas.
        this.ghosts.forEach(ghost => ghost.draw(ctx, this.tileSize));

        // 5. Dibuja los jugadores
        this.players.p1.draw(ctx, this.tileSize);
        if (this.mode === '2p') {
            this.players.p2.draw(ctx, this.tileSize);
        }
    }

    // drawItems
    // Dibuja cada billete y tubo del array movingItems en el canvas.
    drawItems(ctx) {
        const ts = this.tileSize;

        this.movingItems.forEach(item => {

            if (item.type === 'money') {
                // --- Billete ---
                if (this.moneyImage.complete && this.moneyImage.naturalWidth !== 0) {
                    const size = ts * 1.0; // El billete ocupa exactamente una celda
                    // Dibuja centrado en la posición del ítem (item.x e item.y son el centro).
                    ctx.drawImage(this.moneyImage, item.x - size / 2, item.y - size / 2, size, size);
                } else {
                    // Fallback mientras carga la imagen: un rectángulo verde simple.
                    ctx.fillStyle = '#22c55e';
                    ctx.fillRect(item.x - ts/4, item.y - ts/6, ts/2, ts/3);
                }

            } else if (item.type === 'flask') {
                // --- Tubo de química ---
                ctx.save();

                // Resplandor azul neón alrededor de todo el tubo.
                ctx.shadowBlur = 8;
                ctx.shadowColor = 'var(--blue-ch)';

                // Cuello del tubo: un rectángulo estrecho en la parte superior.
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(item.x - ts * 0.1, item.y - ts * 0.35); // Esquina superior izquierda
                ctx.lineTo(item.x - ts * 0.1, item.y - ts * 0.1);  // Esquina inferior izquierda
                ctx.lineTo(item.x + ts * 0.1, item.y - ts * 0.1);  // Esquina inferior derecha
                ctx.lineTo(item.x + ts * 0.1, item.y - ts * 0.35); // Esquina superior derecha
                ctx.stroke();

                // Bulbo del tubo: un círculo azul con borde blanco en la parte inferior.
                ctx.fillStyle = 'var(--blue-ch)';
                ctx.beginPath();
                ctx.arc(item.x, item.y + ts * 0.1, ts * 0.26, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Math.floor(Date.now() / 150) % 2 devuelve 0 o 1 alternando cada 150 milisegundos,
                // creando la ilusión de que el líquido dentro del tubo está burbujeando.
                ctx.fillStyle = '#ffffff';
                const pulse = Math.floor(Date.now() / 150) % 2 === 0;
                if (pulse) {
                    ctx.fillRect(item.x - ts * 0.08, item.y + ts * 0.05, 2, 2);
                    ctx.fillRect(item.x + ts * 0.08, item.y + ts * 0.15, 2, 2);
                } else {
                    ctx.fillRect(item.x + ts * 0.05, item.y + ts * 0.03, 2, 2);
                    ctx.fillRect(item.x - ts * 0.08, item.y + ts * 0.18, 2, 2);
                }
                ctx.restore();
            }
        });
    }
}

// ARRANQUE DEL JUEGO
// DOMContentLoaded se dispara cuando el HTML está completamente cargado y
// parseado
window.addEventListener('DOMContentLoaded', () => {
    window.game = new GameEngine();
});