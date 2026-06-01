(function () {
  'use strict';

  /*seccion 1 - configuracion y datos de niveles */

  let COLS = 14; /* el tamaño del tablero */
  let ROWS = 10; 
  const INITIAL_SNAKE_LENGTH = 3; 

  const LEVELS = window.GUSACAT_LEVELS || []; 

  /* seccion 2 - datos de dialogos */

  const DIALOGS_1P = window.GUSACAT_DIALOGOS_1P || []; 
  const DIALOGS_2P = window.GUSACAT_DIALOGOS_2P || []; 

  /* seccion 3 - estado del juego */

  let state = 'loading'; 
  let gameMode = '1p'; 
  let currentLevel = 1; 
  let currentPlayer = 1; 

  /* score = puntaje del nivel actual, totalScore = suma de todos los niveles */
  let player1 = { name: 'Michi', score: 0, totalScore: 0, alive: true, levelReached: 0, levelScores: [] };
  let player2 = { name: 'Luna', score: 0, totalScore: 0, alive: true, levelReached: 0, levelScores: [] };

  // posicion en la que arranca la serpiente
  let snake = []; 
  let direction = 'right'; 
  let nextDirection = 'right'; 
  let fishes = []; 
  let obstacles = []; 
  let bossHazards = []; 
  let decorations = []; 
  let fishEaten = 0; 
  let gameLoopTimer = null; /* el timer que mueve la serpiente cada X ms */
  let gamePaused = false; /* si el juego esta pausado */
  let gameRunning = false; 
  let lastMoveTime = 0; 
  let previousSnake = []; 

  // canvas
  let canvas, ctx;
  let cellSize = 32; 
  let contentScale = 1;  /* Escala visual (mapa mas grande en celu). */

  // Images
  const images = {}; 
  let floorTilesByLevel = {}; 
  let obstacleSpriteVariants = []; 
  let decorationSpritePool = []; 
  let fishSpriteVariants = [];

  // particulas
  let particles = [];
  let scorePopups = []; 

  // audio
  let audioCtx = null; 
  let musicPlaying = false; 
  // confetti
  let confetti = []; 
  let confettiAnimId = null; 

  /* seccion 4 - carga de imagenes
     loadImage carga una imagen. si no existe devuelve null.  */

  function setImageElementSource(elementOrId, imgKey) {  /**   elementOrId: el id del elemento o el elemento directamente */
    const el = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
    if (!el) return;
    const img = images[imgKey];  /** imgKey: la clave de la imagen en el objeto images, ej: michi_portrait_normal */
    if (img) {
      if (img instanceof HTMLCanvasElement) {
        el.src = img.toDataURL();
      } else {
        el.src = img.src;
      }
    }
  }

  function loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  function loadImageOptional(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  /* carga TODAS las imagenes del juego en orden.
     progressCb se llama despues de cada imagen para actualizar la barra de carga */
  async function loadAllImages(progressCb) {
    const catNames = ['michi', 'luna'];
    const dirs = ['up', 'down', 'left', 'right'];
    const toLoad = [];

    for (const cat of catNames) {
      for (const d of dirs) {
        toLoad.push({ key: `${cat}_head_${d}`, src: `assets/images/${cat}_head_${d}.png` });
        toLoad.push({ key: `${cat}_body_${d}`, src: `assets/images/${cat}_body_${d}.png` });
        toLoad.push({ key: `${cat}_tail_${d}`, src: `assets/images/${cat}_tail_${d}.png` });
      }
      toLoad.push({ key: `${cat}_dead`, src: `assets/images/${cat}_dead.png` });
      toLoad.push({ key: `${cat}_portrait_normal`, src: `assets/images/${cat}_portrait_normal.png` });
      toLoad.push({ key: `${cat}_portrait_happy`, src: `assets/images/${cat}_portrait_happy.png` });
      toLoad.push({ key: `${cat}_portrait_sad`, src: `assets/images/${cat}_portrait_sad.png` });
    }
    toLoad.push({ key: 'malo_head_right', src: 'assets/images/gato_malo.png' });

    let loaded = 0;
    for (const item of toLoad) {
      images[item.key] = await loadImage(item.src);
      loaded++;
      if (progressCb) progressCb(loaded / toLoad.length);
    }

    // pescaditos 
    const optionalFishFiles = [
      'assets/images/pescado.png',
      'assets/images/pescado2.png',
      'assets/images/pescado3.png'
    ];
    fishSpriteVariants = [];
    for (const src of optionalFishFiles) {
      const img = await loadImageOptional(src);
      if (img) fishSpriteVariants.push(img);
    }

    // pisos por nivel con patron.
    const floorFilesByLevel = {
      1: 'assets/images/floor_jardin.svg',
      2: 'assets/images/floor_rio.svg',
      3: 'assets/images/floor_bosque.svg',
      4: 'assets/images/floor_torre.svg',
      5: 'assets/images/floor_cueva.svg',
      6: 'assets/images/floor_palacio.svg'
    };
    floorTilesByLevel = {};
    for (const [levelKey, src] of Object.entries(floorFilesByLevel)) {
      const img = await loadImageOptional(src);
      if (img) floorTilesByLevel[Number(levelKey)] = img;
    }

    const optionalObstacleFiles = [
      'assets/images/arbusto-removebg-preview.png',
      'assets/images/arbustoacostado-removebg-preview.png',
      'assets/images/bola-de-lana.png',
      'assets/images/bola-de-lana2.png',
      'assets/images/cercas-obstaculo.png',
      'assets/images/cuadrado-arbusto-removebg-preview.png',
      'assets/images/obsatuclo-roca.png',
      'assets/images/obstaculo-cerca-grande.png',
      'assets/images/obstaculo-maceta-grande.png',
      'assets/images/obstaculo-maceta.png',
      'assets/images/obstaculo-tronco.png',
      'assets/images/pelotita-arbusto-obstaculo.png'
    ];
    obstacleSpriteVariants = [];
    decorationSpritePool = [];
    for (const src of optionalObstacleFiles) {
      const img = await loadImageOptional(src);
      if (img) {
        obstacleSpriteVariants.push(img);
        decorationSpritePool.push({ img, src });
      }
    }

  }

  /* seccion 5 - sistema de sonido */

  /* crea el contexto de audio. */
  function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  /* a veces el navegador suspende el audio automaticamente. esta funcion lo reactiva */
  function ensureAudioResumed() {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }
  /* funcion base de todo el sistema de sonido.
     type: tipo de onda - sine (suave), square (retro 8bit), sawtooth (aspero), triangle (intermedio)
     rampEnd: si se pone, la frecuencia va cambiando hasta este valor (para sonidos descendentes) */

  function playTone(freq, duration, type, volume, rampEnd) {
    if (!audioCtx) return;
    ensureAudioResumed();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    if (rampEnd) osc.frequency.exponentialRampToValueAtTime(rampEnd, audioCtx.currentTime + duration);
    gain.gain.setValueAtTime(volume || 0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }

  /* tres tonos ascendentes rapidos: suena como un mew de gato */
  function playEatSound() {
    // mew
    playTone(600, 0.08, 'sine', 0.15);
    setTimeout(() => playTone(900, 0.08, 'sine', 0.12), 60);
    setTimeout(() => playTone(1200, 0.15, 'triangle', 0.1), 120);
  }

  /* tres tonos descendentes: sonido triste cuando muere la serpiente */
  function playDieSound() {
    // triste
    playTone(500, 0.15, 'square', 0.12, 200);
    setTimeout(() => playTone(300, 0.2, 'square', 0.1, 80), 150);
    setTimeout(() => playTone(150, 0.4, 'sawtooth', 0.08, 50), 350);
  }

  /* fanfarria al completar nivel: toca Do, Mi, Sol, Do en secuencia */
  function playLevelUpSound() {
    // fanfare arpeggio
    const notes = [523, 659, 784, 1047];
    notes.forEach((n, i) => {
      setTimeout(() => playTone(n, 0.2, 'triangle', 0.12), i * 120);
    });
    setTimeout(() => playTone(1047, 0.5, 'sine', 0.1), 500);
  }

  function playClickSound() {
    playTone(800, 0.05, 'sine', 0.08);
  }

  function playVictorySound() {
    const notes = [523, 659, 784, 1047, 784, 1047, 1319, 1568];
    notes.forEach((n, i) => {
      setTimeout(() => playTone(n, 0.25, 'triangle', 0.1), i * 150);
    });
  }

  function playMoveSound() {
    playTone(200, 0.03, 'sine', 0.03);
  }

  // musica de fondo en loop
  let bgMusicInterval = null;

  /* arranca la musica de fondo. cada nivel tiene su propia melodia */
  function startBGMusic(levelNum) {
    stopBGMusic();
    if (!audioCtx) return;
    ensureAudioResumed();

    const melodies = [
      [523, 587, 659, 587, 523, 494, 440, 494],      // Level 1 - gentil
      [659, 698, 784, 698, 659, 587, 523, 587],      // Level 2 - flowing
      [440, 523, 587, 523, 440, 392, 349, 392],      // Level 3 - misterioso
      [392, 440, 523, 659, 523, 440, 392, 349],      // Level 4 - tenso
      [349, 392, 440, 523, 587, 523, 440, 392],      // Level 5 - oscuro
      [523, 659, 784, 1047, 784, 659, 523, 659],     // Level 6 - epico
    ];

    const melody = melodies[(levelNum - 1) % melodies.length];
    let noteIndex = 0;

    musicPlaying = true;
    bgMusicInterval = setInterval(() => {
      if (!musicPlaying || gamePaused) return;
      playTone(melody[noteIndex], 0.3, 'sine', 0.04);
      playTone(melody[noteIndex] / 2, 0.3, 'triangle', 0.02);
      noteIndex = (noteIndex + 1) % melody.length;
    }, 500);
  }

  function stopBGMusic() {
    musicPlaying = false;
    if (bgMusicInterval) {
      clearInterval(bgMusicInterval);
      bgMusicInterval = null;
    }
  }

  /* seccion 6 - manejo de pantallas */

  /* saca la clase active de todas las pantallas y se la pone solo a la indicada.
     asi se cambia de pantalla sin recargar la pagina */
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(id);
    if (screen) screen.classList.add('active');
    checkMobileControls();
  }

  function showTitle() {
    state = 'title';
    stopBGMusic();
    stopGameLoop();
    stopConfetti();
    showScreen('screen-title');
  }

  function showModeSelect() {
    state = 'mode_select';
    showScreen('screen-mode');
  }

/* muestra u oculta el campo del segundo jugador según el modo */

  function showNameInput() {
    state = 'name_input';
    const nameField2 = document.getElementById('name-field-2');
    const labelName1 = document.getElementById('label-name-1');

    if (gameMode === '2p') {
      nameField2.style.display = 'block';
      labelName1.textContent = 'Nombre Jugador 1 (Michi)';
      document.getElementById('label-name-2').textContent = 'Nombre Jugador 2 (Luna)';
    } else {
      nameField2.style.display = 'none';
      labelName1.textContent = 'Tu nombre';
    }
    document.getElementById('input-name-1').value = '';
    document.getElementById('input-name-2').value = '';
    showScreen('screen-name');
    setTimeout(() => document.getElementById('input-name-1').focus(), 100);
  }

  /* seccion 7 - sistema de dialogos */

  let dialogCallback = null;
  let dialogLines = [];
  let dialogLineIndex = 0;
  let typewriterTimer = null;
  let typewriterDone = false;
  let fullDialogText = '';

  /* busca los dialogos del nivel indicado en DIALOGS_1P o DIALOGS_2P. */
  function showDialog(levelNum, onComplete) {
    state = 'dialog';
    dialogCallback = onComplete;
    dialogLineIndex = 0;

    if (gameMode === '1p') {
      const dData = DIALOGS_1P.find(d => d.num === undefined ? d.level === levelNum : d.num === levelNum)
        || DIALOGS_1P[levelNum - 1];
      dialogLines = dData ? dData.lines.map(text => ({
        character: dData.character || 'michi',
        text
      })) : [];
    } else {
      const dData = DIALOGS_2P.find(d => d.level === levelNum) || DIALOGS_2P[levelNum - 1];
      dialogLines = dData ? dData.lines : [];
    }

    if (dialogLines.length === 0) {
      if (onComplete) onComplete();
      return;
    }

    showScreen('screen-dialog');
    showDialogLine();
  }
 
  /* muestra la linea actual del dialogo con efecto maquina de escribir */
  function showDialogLine() {
    if (dialogLineIndex >= dialogLines.length) {
      showScreen('');
      if (dialogCallback) dialogCallback();
      return;
    }

    const line = dialogLines[dialogLineIndex];
    const cat = line.character || 'michi';

    setImageElementSource('dialog-portrait', `${cat}_portrait_normal`);
    document.getElementById('dialog-name').textContent = cat === 'michi' ? (player1.name || 'Michi') : (player2.name || 'Luna');
    document.getElementById('dialog-text').textContent = '';
    document.getElementById('btn-dialog-continue').style.display = 'none';

    fullDialogText = line.text;
    typewriterDone = false;
    let charIndex = 0;

    if (typewriterTimer) clearInterval(typewriterTimer);

    typewriterTimer = setInterval(() => {
      if (charIndex < fullDialogText.length) {
        document.getElementById('dialog-text').textContent += fullDialogText[charIndex];
        charIndex++;
        // click de sonido 
        if (charIndex % 3 === 0) playTone(600 + Math.random() * 200, 0.02, 'sine', 0.02);
      } else {
        clearInterval(typewriterTimer);
        typewriterTimer = null;
        typewriterDone = true;
        document.getElementById('btn-dialog-continue').style.display = 'inline-block';
      }
    }, 35);
  }

  /** dialogo corto al cambiar turno en 2 jugadores */
  function show2PTurnHandoff(playerNum, onComplete) {
    state = 'dialog';
    dialogCallback = onComplete;
    dialogLineIndex = 0;
    dialogLines = [];

    const cat = playerNum === 1 ? 'michi' : 'luna';
    const name = playerNum === 1 ? (player1.name || 'Michi') : (player2.name || 'Luna');
    const config = getLevelConfig();

    if (typewriterTimer) clearInterval(typewriterTimer);
    typewriterTimer = null;
    typewriterDone = true;

    showScreen('screen-dialog');
    setImageElementSource('dialog-portrait', `${cat}_portrait_normal`);
    document.getElementById('dialog-name').textContent = name;
    document.getElementById('dialog-text').textContent =
      `Turno de ${name}\nNivel ${currentLevel}: ${config.name}\n¡A jugar!`;
    document.getElementById('btn-dialog-continue').style.display = 'inline-block';
  }

  function advanceDialog() {
    if (!typewriterDone) {
      // skipear con tecla
      if (typewriterTimer) clearInterval(typewriterTimer);
      typewriterTimer = null;
      document.getElementById('dialog-text').textContent = fullDialogText;
      typewriterDone = true;
      document.getElementById('btn-dialog-continue').style.display = 'inline-block';
      return;
    }
    if (dialogLines.length === 0) {
      showScreen('');
      if (dialogCallback) dialogCallback();
      return;
    }
    dialogLineIndex++;
    showDialogLine();
  }

  /* seccion 8 - logica del juego snake */

  /* resetea todo para empezar un nivel desde cero */
  function initSnake() {
    const startX = Math.floor(COLS / 2);
    const startY = Math.floor(ROWS / 2);
    snake = [];
    for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
      snake.push({ x: startX - i, y: startY, dir: 'right' });
    }
    direction = 'right';
    nextDirection = 'right';
    fishEaten = 0;
    fishes = [];
    obstacles = [];
    bossHazards = [];
    decorations = [];
    particles = [];
    scorePopups = [];
    previousSnake = snake.map(seg => ({ ...seg }));

    getCurrentPlayer().score = 0;
  }

  /* devuelven el jugador/personaje que está jugando ahora */
  function getCurrentPlayer() {
    if (gameMode === '1p') return player1;
    return currentPlayer === 1 ? player1 : player2;
  }

  function getCurrentCharacter() {
    if (gameMode === '1p') return 'michi';
    return currentPlayer === 1 ? 'michi' : 'luna';
  }
  /* devuelve el objeto de configuracion del nivel actual desde el array LEVELS.
     si currentLevel es 1 devuelve LEVELS[0], si es 2 devuelve LEVELS[1], etc */
  function getLevelConfig() {
    return LEVELS[currentLevel - 1] || LEVELS[0];
  }
  /* prepara todo para arrancar un nivel */
  function initLevel(levelNum) {
    currentLevel = levelNum;
    const config = getLevelConfig();

    initSnake();
    spawnObstacles(config.obstacleCount);
    spawnDecorations(Math.max(6, Math.floor((COLS * ROWS) / 24)));
    spawnBossHazards(config.bossCount || 0);

    // spawnea el pez inicial 
    for (let i = 0; i < config.fishOnMap; i++) {
      spawnFish();
    }
  }
  
  /* genera count obstaculos en posiciones al azar */
  function spawnObstacles(count) {
    obstacles = [];
    const snakeHead = snake[0];
    const safeRadius = 4; // para que aparezca lejos del snake
    let attempts = 0;
    while (obstacles.length < count && attempts < 500) {
      const x = Math.floor(Math.random() * (COLS - 4)) + 2;
      const y = Math.floor(Math.random() * (ROWS - 4)) + 2;

      // lejos de la serpiente
      const dx = Math.abs(x - snakeHead.x);
      const dy = Math.abs(y - snakeHead.y);
      if (dx + dy < safeRadius) { attempts++; continue; }

      // donde no existan obstaculos
      if (obstacles.some(o => o.x === x && o.y === y)) { attempts++; continue; }

      // no arriba de la serpiente 
      if (snake.some(s => s.x === x && s.y === y)) { attempts++; continue; }

      obstacles.push({ x, y });
      attempts++;
    }
  }
  /* genera un pez en una posicion valida */
  function spawnFish() {
    let attempts = 0;
    while (attempts < 500) {
      const x = Math.floor(Math.random() * (COLS - 2)) + 1;
      const y = Math.floor(Math.random() * (ROWS - 2)) + 1;

      // no en el snake
      if (snake.some(s => s.x === x && s.y === y)) { attempts++; continue; }
      // no en obstaculos
      if (obstacles.some(o => o.x === x && o.y === y)) { attempts++; continue; }
      // no donde hay peces ya
      if (fishes.some(f => f.x === x && f.y === y)) { attempts++; continue; }

      const neighbors = [
        { x: x - 1, y }, { x: x + 1, y }, { x, y: y - 1 }, { x, y: y + 1 }
      ];
      const hasOpen = neighbors.some(n =>
        n.x > 0 && n.x < COLS - 1 && n.y > 0 && n.y < ROWS - 1 &&
        !obstacles.some(o => o.x === n.x && o.y === n.y)
      );
      if (!hasOpen) { attempts++; continue; }

      fishes.push({
        x, y, spawnTime: Date.now(), flashing: false,
        spriteIdx: fishSpriteVariants.length ? Math.floor(Math.random() * fishSpriteVariants.length) : -1
      });
      return;
    }
  }
  /* genera decoraciones visuales en los bordes del mapa */
  function getDecorationSpritesForLevel(levelNum) {
    const tema = window.GUSACAT_DECORACIONES?.porNivel?.[levelNum];
    if (!tema || !tema.archivos?.length) return [];
    return decorationSpritePool.filter((entry) =>
      tema.archivos.some((fragmento) => entry.src.toLowerCase().includes(fragmento.toLowerCase()))
    );
  }

  function spawnDecorations(count) {
    const levelSprites = getDecorationSpritesForLevel(currentLevel);
    if (!levelSprites.length) return;

    let attempts = 0;
    while (decorations.length < count && attempts < 800) {
      const useHorizontalWall = Math.random() < 0.5;
      const x = useHorizontalWall
        ? Math.floor(Math.random() * COLS)
        : (Math.random() < 0.5 ? 0 : COLS - 1);
      const y = useHorizontalWall
        ? (Math.random() < 0.5 ? 0 : ROWS - 1)
        : Math.floor(Math.random() * ROWS);
      const occupied = decorations.some(d => d.x === x && d.y === y);
      if (!occupied) {
        const pick = levelSprites[Math.floor(Math.random() * levelSprites.length)];
        decorations.push({ x, y, img: pick.img, alpha: 0.65 });
      }
      attempts++;
    }
  }
  /* genera count jefes en posiciones al azar alejadas de todo. */
  function spawnBossHazards(count) {
    bossHazards = [];
    if (!count || count <= 0) return;
    let attempts = 0;
    while (bossHazards.length < count && attempts < 400) {
      const x = Math.floor(Math.random() * (COLS - 4)) + 2;
      const y = Math.floor(Math.random() * (ROWS - 4)) + 2;
      const occupied =
        snake.some(s => s.x === x && s.y === y) ||
        obstacles.some(o => o.x === x && o.y === y) ||
        fishes.some(f => f.x === x && f.y === y) ||
        bossHazards.some(b => b.x === x && b.y === y);
      if (occupied) {
        attempts++;
        continue;
      }
      bossHazards.push({
        x,
        y,
        prevX: x,
        prevY: y,
        dir: 'left',
        hp: 3,
        stolenFish: 0,
        stepCooldown: 0
      });
      attempts++;
    }
  }

  /* mueve cada jefe una vez por tick de la serpiente.
     con 70% de probabilidad persigue a la cabeza, con 30% se mueve al azar.
     si pisa un pez lo roba (lo saca del mapa y genera uno nuevo) */
  function updateBossHazards() {
    if (!bossHazards.length) return;
    const head = snake[0];
    for (const boss of bossHazards) { 
      boss.prevX = boss.x;
      boss.prevY = boss.y;
      if (boss.stepCooldown > 0) {  /* si stepCooldown > 0, resta 1 y no hace nada  */
        boss.stepCooldown--;
        continue;
      }
      const chaseX = head.x > boss.x ? 1 : head.x < boss.x ? -1 : 0;
      const chaseY = head.y > boss.y ? 1 : head.y < boss.y ? -1 : 0;
      let nx = boss.x + (Math.random() < 0.7 ? chaseX : 0);
      let ny = boss.y + (Math.random() < 0.7 ? chaseY : 0);
      if (nx === boss.x && ny === boss.y) {
        nx = boss.x + (Math.random() < 0.5 ? (Math.random() < 0.5 ? -1 : 1) : 0);
        ny = boss.y + (Math.random() >= 0.5 ? (Math.random() < 0.5 ? -1 : 1) : 0);
      }
      const blocked = nx <= 0 || nx >= COLS - 1 || ny <= 0 || ny >= ROWS - 1 || obstacles.some(o => o.x === nx && o.y === ny);
      if (!blocked) {
        boss.x = nx;
        boss.y = ny;
        const fishIdx = fishes.findIndex(f => f.x === boss.x && f.y === boss.y);
        if (fishIdx !== -1) {
          fishes.splice(fishIdx, 1);
          boss.stolenFish++;
          if (fishEaten > 0) fishEaten--;
          spawnFish();
        }
      }
      boss.stepCooldown = 1; // jefe facil: se mueve cada 2 ticks
    }
  }
  /* funcion principal del juego. corre cada X milisegundos segun config.speed.
     en orden: guarda posicion anterior, calcula nueva cabeza, revisa colisiones, agrega la nueva cabeza, revisa si comio un pez,
     si no comio saca la cola (asi se mueve), actualiza el jefe */
  function moveSnake() {
    if (!gameRunning || gamePaused) return;

    previousSnake = snake.map(seg => ({ ...seg }));
    direction = nextDirection;

    const head = snake[0];
    const newHead = { x: head.x, y: head.y, dir: direction };

    switch (direction) {
      case 'up': newHead.y--; break;
      case 'down': newHead.y++; break;
      case 'left': newHead.x--; break;
      case 'right': newHead.x++; break;
    }

    // la cabeza choco con un borde
    if (newHead.x <= 0 || newHead.x >= COLS - 1 || newHead.y <= 0 || newHead.y >= ROWS - 1) {
      onDeath();
      return;
    }

    // con su propio cuerpo
    for (let i = 0; i < snake.length - 1; i++) {
      if (snake[i].x === newHead.x && snake[i].y === newHead.y) {
        onDeath();
        return;
      }
    }

    // con un obstaculo 
    if (obstacles.some(o => o.x === newHead.x && o.y === newHead.y)) {
      onDeath();
      return;
    }
    /* la cabeza choco con un jefe */
    const bossAtHead = bossHazards.find(b => b.x === newHead.x && b.y === newHead.y);
    if (bossAtHead) {
      if (fishEaten > 0) { /* si comio peces suficientes  */
        bossAtHead.hp--;
        fishEaten = Math.max(0, fishEaten - 1);
        spawnParticles(newHead.x, newHead.y, 10, '#EF4444');
        if (bossAtHead.hp <= 0) {
          const reward = bossAtHead.stolenFish + 2;
          bossHazards = bossHazards.filter(b => b !== bossAtHead);
          for (let i = 0; i < reward; i++) spawnFish();
          fishEaten += 1;
        } else {
          // Boss empujado hacia atras (Knockback)
          let kbX = bossAtHead.x + (newHead.x - head.x);
          let kbY = bossAtHead.y + (newHead.y - head.y);
          let blocked = kbX <= 0 || kbX >= COLS - 1 || kbY <= 0 || kbY >= ROWS - 1 || obstacles.some(o => o.x === kbX && o.y === kbY);
          
          if (!blocked) {
            bossAtHead.prevX = bossAtHead.x;
            bossAtHead.prevY = bossAtHead.y;
            bossAtHead.x = kbX;
            bossAtHead.y = kbY;
            bossAtHead.stepCooldown = 2; // Lo aturde 2 turnos
          } else {
            // Si el boss choca contra la pared, la serpiente rebota y no avanza este turno
            updateHUD();
            playMoveSound();
            lastMoveTime = performance.now();
            return;
          }
        }
      } else {
        onDeath();
        return;
      }
    }

    // añade una nueva cabeza
    snake.unshift(newHead);

    // revisa si comio un pez
    const fishIdx = fishes.findIndex(f => f.x === newHead.x && f.y === newHead.y);
    if (fishIdx !== -1) {
      fishes.splice(fishIdx, 1);
      fishEaten++;
      const config = getLevelConfig();
      const player = getCurrentPlayer();
      player.score += config.scorePerFish;

      playEatSound();
      spawnParticles(newHead.x, newHead.y, 8, '#FBBF24');
      spawnScorePopup(newHead.x, newHead.y, `+${config.scorePerFish}`);

      updateHUD();

      // chequea si se puede completar el nivel 
      if (fishEaten >= config.fishRequired) {
        onLevelComplete();
        return;
      }

      while (fishes.length < config.fishOnMap) {
        spawnFish();
      }
    } else {
      //se lleva la cola
      snake.pop();
    }

    updateBossHazards();
    if (bossHazards.some(b => b.x === snake[0].x && b.y === snake[0].y)) {
      onDeath();
      return;
    }
    updateHUD();

    playMoveSound();
    lastMoveTime = performance.now();
  }

  /* se ejecuta cuando la serpiente muere.
     para el juego, toca el sonido de muerte, hace shake en el canvas. */
  function onDeath() {
    gameRunning = false;
    stopGameLoop();
    stopBGMusic();
    playDieSound();

    const player = getCurrentPlayer();
    player.alive = false;
    player.levelReached = currentLevel;
    player.totalScore += player.score;

    // Screen shake effect
    const container = document.querySelector('.canvas-container');
    container.style.animation = 'shake 0.4s ease';
    setTimeout(() => container.style.animation = '', 400);

    if (gameMode === '2p') {
      // en modo 2p cambia de jugador 
      setTimeout(() => handle2PPlayerDeath(), 1000);
    } else {
      // 1P modo termina el juego
      setTimeout(() => showGameOver(), 800);
    }
  }

  /* se ejecuta cuando se comen todos los peces requeridos.*/
  function onLevelComplete() {
    gameRunning = false;
    stopGameLoop();
    stopBGMusic();
    playLevelUpSound();

    const player = getCurrentPlayer();
    player.levelReached = currentLevel;
    player.totalScore += player.score;
    player.levelScores[currentLevel - 1] = player.score;

    if (gameMode === '2p') { /** ve si cambiar el turno */
      setTimeout(() => handle2PLevelComplete(), 1000);
    } else {
      // 1P — chequea si es el ultimo nivel
      if (currentLevel >= 6) {
        setTimeout(() => showVictory1P(), 1000);
      } else {
        setTimeout(() => showLevelComplete(), 800);
      }
    }
  }

  /* seccion 9 - seccion de los peces */

  /* solo actua en niveles con fishDisappear: true (niveles 5 y 6).*/
  function updateFishTimers() {
    const config = getLevelConfig();
    if (!config.fishDisappear) return;

    const now = Date.now();
    let changed = false;

    for (let i = fishes.length - 1; i >= 0; i--) {
      const fish = fishes[i];
      const elapsed = now - fish.spawnTime;

      if (elapsed > config.fishDisappearTime * 0.7) { /** al 70% del tiempo limite activa el parpadeo del pez */
        fish.flashing = true;
      }

      if (elapsed > config.fishDisappearTime) {
        fishes.splice(i, 1); /** al 100% del tiempo limite elimina el pez y genera uno nuevo  */
        changed = true;
      }
    }

    if (changed) {
      while (fishes.length < config.fishOnMap) {
        spawnFish();
      }
    }
  }

  /* seccion 10 - game loop */

  /* estan separados para que el movimiento se vea fluido aunque la logica sea lenta */
  function startGameLoop() {
    stopGameLoop();
    const config = getLevelConfig();
    gameRunning = true;
    gamePaused = false;
    lastMoveTime = performance.now();
    previousSnake = snake.map(seg => ({ ...seg }));

    gameLoopTimer = setInterval(() => {   /** setInterval con config.speed ms: corre la logica */
      if (gamePaused || !gameRunning) return;
      moveSnake();
      updateFishTimers();
    }, config.speed);

    startRenderLoop();
    startBGMusic(currentLevel);
  }

  function stopGameLoop() {
    gameRunning = false;
    gamePaused = false;
    if (gameLoopTimer) {
      clearInterval(gameLoopTimer);
      gameLoopTimer = null;
    }
    stopRenderLoop();
  }

  function pauseGameLoopTimer() {
    if (gameLoopTimer) {
      clearInterval(gameLoopTimer);
      gameLoopTimer = null;
    }
  }

  function resumeGameLoopTimer() {
    if (gameLoopTimer || !gameRunning || gamePaused) return;
    const config = getLevelConfig();
    gameLoopTimer = setInterval(() => {
      if (gamePaused || !gameRunning) return;
      moveSnake();
      updateFishTimers();
    }, config.speed);
  }

  let renderAnimId = null;

  function startRenderLoop() {
    if (renderAnimId) cancelAnimationFrame(renderAnimId);

    function renderFrame() {
      renderGame();
      if (state === 'playing') {
        renderAnimId = requestAnimationFrame(renderFrame); /** requestAnimationFrame: dibuja la pantalla a ~60fps */
      }
    }
    renderAnimId = requestAnimationFrame(renderFrame);
  }

  function stopRenderLoop() {
    if (renderAnimId) {
      cancelAnimationFrame(renderAnimId);
      renderAnimId = null;
    }
  }

  function syncCanvasContainerBg(config) {
    const el = document.querySelector('.canvas-container');
    if (el && config) {
      el.style.background = config.bgColor2 || config.bgColor1;
    }
  }

  /* dibuja todo el juego en el canvas en este orden */
  function renderGame() {
    if (!ctx) return;

    const config = getLevelConfig();
    syncCanvasContainerBg(config);

    // Fondo del nivel en todo el canvas.
    ctx.fillStyle = config.bgColor1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawBackground(config);

    // obstaculos
    drawObstacles();

    // movimientos del jefe
    drawBossHazards();

    drawFishes();

    drawSnake();

    drawParticles();
  }

  /* dibuja una celda de pared del borde con un diseno unico por nivel.*/
  function drawWallTile(x, y, levelNum) {
    const px = x * cellSize;
    const py = y * cellSize;
    
    ctx.save();
    
    switch (levelNum) {
      case 1: // Jardin Somnoliento 
        ctx.fillStyle = '#4ADE80'; // verde
        ctx.fillRect(px, py, cellSize, cellSize);
        // Leaf details
        ctx.fillStyle = '#16A34A'; // verde oscuro
        ctx.fillRect(px + 4, py + 4, 6, 6);
        ctx.fillRect(px + 16, py + 12, 6, 6);
        ctx.fillRect(px + 8, py + 20, 6, 6);
        // flores
        if ((x + y) % 3 === 0) {
          ctx.fillStyle = '#FF8FAB'; // rosa
          ctx.fillRect(px + 12, py + 6, 4, 4);
          ctx.fillStyle = '#FFF';
          ctx.fillRect(px + 13, py + 7, 2, 2);
        }
        break;
      case 2: // Rio de Suenos
        ctx.fillStyle = '#6A7B8B'; // azul grsaceo
        ctx.fillRect(px, py, cellSize, cellSize);
        // Pebble border/shading
        ctx.fillStyle = '#4B5866'; // gris oscuro
        ctx.fillRect(px, py + cellSize - 4, cellSize, 4);
        ctx.fillRect(px + cellSize - 4, py, 4, cellSize);
        // Highlights
        ctx.fillStyle = '#8FA3B5'; // celeste 
        ctx.fillRect(px + 4, py + 4, 8, 4);
        ctx.fillRect(px + 4, py + 8, 4, 4);
        break;
      case 3: // Bosque Encantado 
        ctx.fillStyle = '#8B5A2B'; // maron
        ctx.fillRect(px, py, cellSize, cellSize);
        // Wood grains
        ctx.fillStyle = '#5C3A21'; // marron oscuro
        ctx.fillRect(px, py + 6, cellSize, 3);
        ctx.fillRect(px, py + 18, cellSize, 3);
        // pedazos mas oscuros
        if ((x + y) % 4 === 0) {
          ctx.fillRect(px + 10, py + 10, 6, 6);
        }
        break;
      case 4: // Torre de la Luna 
        ctx.fillStyle = '#5A4A7A'; // violeta
        ctx.fillRect(px, py, cellSize, cellSize);
        // lineas
        ctx.fillStyle = '#3A2E54'; // violeta oscuro
        ctx.fillRect(px, py + cellSize - 3, cellSize, 3);
        ctx.fillRect(px + cellSize - 3, py, 3, cellSize);
        // las estrellitas
        if ((x + y) % 5 === 0) {
          ctx.fillStyle = '#FBBF24'; // Gold star
          ctx.fillRect(px + 14, py + 14, 4, 4);
          ctx.fillRect(px + 15, py + 11, 2, 10);
          ctx.fillRect(px + 11, py + 15, 10, 2);
        }
        break;
      case 5: // Cueva Estrellada 
        ctx.fillStyle = '#374151'; // oscuro
        ctx.fillRect(px, py, cellSize, cellSize);
        // Cristales
        ctx.strokeStyle = '#1F2937';
        ctx.lineWidth = 2;
        ctx.strokeRect(px, py, cellSize, cellSize);
        // Gemas
        if ((x + y) % 4 === 0) {
          ctx.fillStyle = '#22D3EE'; // Cyan 
          ctx.beginPath();
          ctx.moveTo(px + 16, py + 6);
          ctx.lineTo(px + 26, py + 16);
          ctx.lineTo(px + 16, py + 26);
          ctx.lineTo(px + 6, py + 16);
          ctx.closePath();
          ctx.fill();
          // brillos
          ctx.fillStyle = '#FFF';
          ctx.fillRect(px + 14, py + 12, 3, 3);
        }
        break;
      case 6: // Palacio Michi - 
        ctx.fillStyle = '#D97706'; // naranja doraod
        ctx.fillRect(px, py, cellSize, cellSize);
        // billos
        ctx.fillStyle = '#F59E0B'; // oro
        ctx.fillRect(px + 2, py + 2, cellSize - 4, 4);
        ctx.fillRect(px + 2, py + 2, 4, cellSize - 4);
        ctx.fillStyle = '#78350F'; // oro oscuro
        ctx.fillRect(px + 2, py + cellSize - 6, cellSize - 4, 4);
        ctx.fillRect(px + cellSize - 6, py + 2, 4, cellSize - 4);
        // ruby rojo
        if ((x + y) % 3 === 0) {
          ctx.fillStyle = '#EF4444'; // Rojo 
          ctx.fillRect(px + 12, py + 12, 8, 8);
          ctx.fillStyle = '#FFF';
          ctx.fillRect(px + 14, py + 14, 2, 2);
        }
        break;
    }
    
    ctx.restore();
  }

  /* dibuja el interior del tablero */
  function drawBackground(config) {
    // Piso interno: textura repetida alineada al tamano de celda.
    const floorTexture = floorTilesByLevel[currentLevel];
    const innerW = (COLS - 2) * cellSize;
    const innerH = (ROWS - 2) * cellSize;
    if (floorTexture) {
      const pattern = ctx.createPattern(floorTexture, 'repeat');
      ctx.fillStyle = pattern || config.bgColor1;
      ctx.save();
      ctx.translate(cellSize, cellSize);
      ctx.fillRect(0, 0, innerW, innerH);
      ctx.restore();
    } else {
      // Fallback a baldosa de color si falta la imagen.
      for (let y = 1; y < ROWS - 1; y++) {
        for (let x = 1; x < COLS - 1; x++) {
          ctx.fillStyle = (x + y) % 2 === 0 ? config.bgColor1 : config.bgColor2;
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }

    // azulejos de la pared exterior
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (x === 0 || x === COLS - 1 || y === 0 || y === ROWS - 1) {
          drawWallTile(x, y, currentLevel);
        }
      }
    }

    // Decoraciones en bordes (no bloquean); tema segun nivel en js/decoraciones.js
    for (const deco of decorations) {
      const img = deco.img;
      if (!img) continue;
      ctx.save();
      ctx.globalAlpha = deco.alpha;
      drawImageContain(img, deco.x * cellSize, deco.y * cellSize, cellSize, cellSize);
      ctx.restore();
    }
  }

  /* dibuja cada obstaculo. */
  function drawObstacles() {
    for (const obs of obstacles) {
      if (!obstacleSpriteVariants.length) continue;
      const obsSprite = obstacleSpriteVariants[(obs.x + obs.y) % obstacleSpriteVariants.length]; /**elige que imagen usar segun (obs.x + obs.y) % cantidad_variantes */
      drawImageCover(obsSprite, obs.x * cellSize, obs.y * cellSize, cellSize, cellSize);
    }
  }

  /* dibuja cada jefe con gato_malo.png escalado a 1.9x el tamano de una celda.
     encima dibuja la etiqueta HP con fondo blanco y borde morado */
  function drawBossHazards() {
    const bossVisualScale = 3.0 * contentScale;
    const drawSize = cellSize * bossVisualScale;
    const moveMs = Math.max(getLevelConfig().speed, 1);
    const progress = Math.min((performance.now() - lastMoveTime) / moveMs, 1);

    for (const boss of bossHazards) {
      const currentX = boss.prevX !== undefined ? boss.prevX + (boss.x - boss.prevX) * progress : boss.x;
      const currentY = boss.prevY !== undefined ? boss.prevY + (boss.y - boss.prevY) * progress : boss.y;

      const cx = currentX * cellSize + cellSize / 2;
      const cy = currentY * cellSize + cellSize / 2;
      const bx = cx - drawSize / 2;
      const by = cy - drawSize / 2;
      if (images.malo_head_right) {
        drawImageContain(images.malo_head_right, bx, by, drawSize, drawSize);
      }
      
      const hpFont = Math.max(14, Math.floor(cellSize * 0.5));
      const hpY = by - hpFont / 2;
      ctx.save();
      ctx.font = `${hpFont}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      let heartsStr = '';
      for (let i = 0; i < boss.hp; i++) heartsStr += '❤️';
      for (let i = boss.hp; i < 3; i++) heartsStr += '🖤';
      ctx.fillText(heartsStr, cx, hpY);
      ctx.restore();
    }
  }

  /* dibuja cada pez. si esta en modo flashing y el timer dice off, no lo dibuja (parpadeo).  */
  function drawFishes() {
    for (const fish of fishes) {
      // Flashing effect
      if (fish.flashing && Math.floor(Date.now() / 200) % 2 === 0) continue;

      // animación 
      const wiggle = Math.sin(Date.now() / 300 + fish.x * 2) * 2;  /**le agrega un wiggle con Math.sin para que parezca que nada */
      const fishImg = fish.spriteIdx >= 0 ? fishSpriteVariants[fish.spriteIdx] : fishSpriteVariants[0]; 
      if (!fishImg) continue;
      const fishScale = window.GUSACAT_PERSONAJES?.peces?.escala || 1.48;
      drawImageContain(fishImg, fish.x * cellSize + wiggle, fish.y * cellSize, cellSize, cellSize, fishScale);
    }
  }

  /* dibuja una imagen ajustada para que quepa en el area sin deformarse (como object-fit: contain).
     calcula la escala maxima que hace que el lado mas grande quepa y centra la imagen */
  function drawImageContain(img, x, y, w, h, extraScale = 1) {
    const iw = img.width || w;
    const ih = img.height || h;
    const scale = Math.min(w / iw, h / ih) * contentScale * extraScale;
    const dw = Math.max(1, iw * scale);
    const dh = Math.max(1, ih * scale);
    const dx = x + (w - dw) / 2;
    const dy = y + (h - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  /* dibuja una imagen que cubre todo el area (como object-fit: cover). se usa para obstaculos */
  function drawImageCover(img, x, y, w, h) {
    const iw = img.width || w;
    const ih = img.height || h;
    const scale = Math.max(w / iw, h / ih) * contentScale;
    const dw = Math.max(1, iw * scale);
    const dh = Math.max(1, ih * scale);
    const dx = x + (w - dw) / 2;
    const dy = y + (h - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  /* dibuja la serpiente con interpolacion suave entre posiciones. */
  function drawSnake() {
    const cat = getCurrentCharacter();
    const moveMs = Math.max(getLevelConfig().speed, 1);
    const progress = Math.min((performance.now() - lastMoveTime) / moveMs, 1);

    for (let i = snake.length - 1; i >= 0; i--) {
      const seg = snake[i];
      const prevSeg = previousSnake[Math.min(i, Math.max(previousSnake.length - 1, 0))] || seg;
      const drawX = (prevSeg.x + (seg.x - prevSeg.x) * progress) * cellSize; /**progress = que porcentaje del tiempo entre movimientos ya paso (0 a 1) */
      const drawY = (prevSeg.y + (seg.y - prevSeg.y) * progress) * cellSize;
      let imgKey;
      /**  elige la imagen correcta para cabeza, cuerpo o cola segun la posicion y direccion  elige la imagen correcta para cabeza, cuerpo o cola segun la posicion y direccion */
      if (i === 0) {
        // cabeza
        imgKey = `${cat}_head_${direction}`;
      } else if (i === snake.length - 1) {
        // cola
        const prev = snake[i - 1];
        let tailDir;
        if (prev.x > seg.x) tailDir = 'right';
        else if (prev.x < seg.x) tailDir = 'left';
        else if (prev.y > seg.y) tailDir = 'down';
        else tailDir = 'up';
        imgKey = `${cat}_tail_${tailDir}`;
      } else {
        // cuerpo
        imgKey = `${cat}_body_${seg.dir}`;
      }

      const img = images[imgKey];
      if (img) {
        drawSpriteContained(img, drawX, drawY, cellSize, cellSize, i !== 0);
      } else {
        ctx.fillStyle = cat === 'michi' ? '#F4A460' : '#E0E0E0';
        ctx.fillRect(drawX + 1, drawY + 1, cellSize - 2, cellSize - 2);
      }
    }
  }

  /**  la posicion visual se calcula interpolando entre la posicion anterior y la actual. */
  function drawSpriteContained(img, x, y, w, h) {
    const cat = getCurrentCharacter();
    const charScale = (window.GUSACAT_PERSONAJES?.[cat]?.escala || 1.12) * contentScale;
    const visualScale = charScale;
    const iw = img.width || w;
    const ih = img.height || h;
    const scale = Math.min(w / iw, h / ih);
    const dw = Math.max(1, iw * scale * visualScale);
    const dh = Math.max(1, ih * scale * visualScale);
    const dx = x + (w - dw) / 2;
    const dy = y + (h - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  /* seccion 11 - particulas */

  /* crea count particulas en la posicion dada
     cada particula tiene velocidad y tamano aleatorios, y life que va de 1.0 a 0 */
  function spawnParticles(gridX, gridY, count, color) {
    const cx = gridX * cellSize + cellSize / 2;
    const cy = gridY * cellSize + cellSize / 2;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * (2 + Math.random() * 3),
        vy: Math.sin(angle) * (2 + Math.random() * 3),
        life: 1.0,
        decay: 0.02 + Math.random() * 0.02,
        size: 3 + Math.random() * 4,
        color: color
      });
    }
  }

  /* crea un texto flotante que aparece donde comiste el pez */
  function spawnScorePopup(gridX, gridY, text) {
    scorePopups.push({
      x: gridX * cellSize + cellSize / 2,
      y: gridY * cellSize,
      text,
      life: 1.0,
      decay: 0.025
    });
  }

  /* actualiza y dibuja particulas y popups cada frame. */
  function drawParticles() {
    // dibuja las particulas 
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // gravity
      p.life -= p.decay;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.globalAlpha = p.life;  /** se vuelven transparentes con globalAlpha = life. */
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    // los popus con los frames
    for (let i = scorePopups.length - 1; i >= 0; i--) {
      const sp = scorePopups[i];
      sp.y -= 1.5;
      sp.life -= sp.decay;

      if (sp.life <= 0) {
        scorePopups.splice(i, 1);
        continue;
      }

      ctx.globalAlpha = sp.life;
      ctx.font = `${Math.floor(cellSize * 0.5)}px 'Press Start 2P', monospace`;
      ctx.fillStyle = '#FBBF24';
      ctx.textAlign = 'center';
      ctx.fillText(sp.text, sp.x, sp.y);
    }
    ctx.globalAlpha = 1;
  }

  /* seccion 12 - HUD UPDATE */

  /* actualiza los textos de la barra superior: nivel, nombre del nivel, puntaje, contador de peces */
  function updateHUD() {
    const config = getLevelConfig();
    const player = getCurrentPlayer();

    document.getElementById('hud-level').textContent = currentLevel;
    document.getElementById('hud-level-name').textContent = config.name;
    document.getElementById('hud-score').textContent = player.score;
    document.getElementById('hud-fish').textContent = `${fishEaten}/${config.fishRequired}`;

    if (gameMode === '2p') {   /** en modo 2p tambien muestra de quien es el turno */
      const turnEl = document.getElementById('hud-turn');
      turnEl.style.display = 'inline-block';
      turnEl.textContent = `Turno: ${getCurrentPlayer().name}`;
    } else {
      document.getElementById('hud-turn').style.display = 'none';
    }

  }

  /* seccion 13 - pantalla de juego */

  /* muestra la pantalla de nivel completado con el puntaje y los peces comidos */
  function showLevelComplete() {
    state = 'level_complete';
    const config = getLevelConfig();
    const player = getCurrentPlayer();

    document.getElementById('lc-stats').innerHTML =
      `<strong>Nivel ${currentLevel}: ${config.name}</strong><br><br>` +
      `Puntaje: ${player.score}<br>` +
      `Peces comidos: ${fishEaten}<br>` +
      `Objetivo total: ${config.fishRequired}`;

    showScreen('screen-level-complete');
  }

  /* muestra la pantalla de game over con la imagen del gato muerto y las estadisticas.
     guarda el puntaje en el ranking */
  function showGameOver() {
    state = 'game_over';
    const player = getCurrentPlayer();
    const cat = getCurrentCharacter();

    const deadImg = document.getElementById('gameover-img');
    setImageElementSource(deadImg, `${cat}_dead`);

    document.getElementById('go-stats').innerHTML =
      `Nivel alcanzado: ${currentLevel}<br>` +
      `Puntaje: ${player.score}<br>` +
      `Total acumulado: ${player.totalScore}`;

    // score 
    saveScore(player.name, player.totalScore, currentLevel, gameMode);

    showScreen('screen-game-over');
  }

  /* muestra la pantalla de victoria con el retrato feliz de michi, el puntaje total,
     guarda en el ranking, lanza el confetti y toca la musica de victoria */
  function showVictory1P() {
    state = 'victory';
    const player = player1;

    setImageElementSource('victory-portrait', 'michi_portrait_happy');
    document.getElementById('victory-stats').innerHTML =
      `${player.name} completo los 6 niveles!<br>` +
      `Puntaje total: ${player.totalScore}`;

    saveScore(player.name, player.totalScore, 6, '1p');

    showScreen('screen-victory');
    startConfetti('confetti-canvas');
    playVictorySound();
  }

  /*seccion 14 - logica de dos jugadores  */

  /*   p1LevelAlive: si P1 sobrevivio el nivel */
  let twoPlayerState = {   /** guarda el estado entre turnos del modo 2 jugadores */
    levelResults: [],
    p1LevelScore: 0,
    p1LevelAlive: false
  };

  /* resetea todo y arranca el nivel 1 con P1 */
  function start2PGame() {
    player1.totalScore = 0; player1.score = 0; player1.alive = true;
    player1.levelReached = 0; player1.levelScores = [];
    player2.totalScore = 0; player2.score = 0; player2.alive = true;
    player2.levelReached = 0; player2.levelScores = [];
    twoPlayerState = { levelResults: [], p1LevelScore: 0, p1LevelAlive: false };  /** levelResults: historial de resultados por nivel */
    currentLevel = 1;
    currentPlayer = 1;

    showDialog(1, () => {
      startLevelForCurrentPlayer();
    });
  }

  /* arranca el nivel para el jugador activo */
  function startLevelForCurrentPlayer() {
    state = 'playing';
    showScreen('screen-game');
    checkMobileControls();
    scheduleResizeCanvas();
    initLevel(currentLevel);
    updateHUD();
    renderGame();

    // contando despues de iniciar
    showCountdown(() => {
      scheduleResizeCanvas();
      startGameLoop();
    });
  }

  /* cuando un jugador completa el nivel en modo 2p: */
  function handle2PLevelComplete() {
    const player = getCurrentPlayer();

    if (currentPlayer === 1) {
      // P1 termina el nivel — guarda resultados, pasa al P2
      twoPlayerState.p1LevelScore = player.score;
      twoPlayerState.p1LevelAlive = true;
      player.levelScores[currentLevel - 1] = player.score;

      // muestra transiciones al p2
      currentPlayer = 2;
      player2.score = 0;
      player2.alive = true;

      show2PTurnHandoff(2, () => {
        startLevelForCurrentPlayer();
      });
    } else {
      // P2 termina el nivel 
      player.levelScores[currentLevel - 1] = player.score;

      // se fija si completa el nivel
      twoPlayerState.levelResults.push({
        level: currentLevel,
        p1: { score: twoPlayerState.p1LevelScore, alive: twoPlayerState.p1LevelAlive },
        p2: { score: player.score, alive: true }
      });

      // se fija si es el nivel 6 
      if (currentLevel >= 6) {
        determine2PWinner();
        return;
      }

      // va al siguiente nivel y pasa al p1
      currentLevel++;
      currentPlayer = 1;
      player1.score = 0;
      player1.alive = true;

      startLevelForCurrentPlayer();
    }
  }

  /* cuando un jugador muere en modo 2p: */
  function handle2PPlayerDeath() {
    const player = getCurrentPlayer();

    if (currentPlayer === 1) {
      // si era P1: guarda su puntaje (con p1LevelAlive = false) y pasa el turno a P2
      twoPlayerState.p1LevelScore = player.score;
      twoPlayerState.p1LevelAlive = false;

      currentPlayer = 2;
      player2.score = 0;
      player2.alive = true;

      show2PTurnHandoff(2, () => {
        startLevelForCurrentPlayer();
      });
    } else {
      // P2 muere tamien
      const p2Alive = false;

      twoPlayerState.levelResults.push({
        level: currentLevel,
        p1: { score: twoPlayerState.p1LevelScore, alive: twoPlayerState.p1LevelAlive },
        p2: { score: player.score, alive: p2Alive }
      });

      if (!twoPlayerState.p1LevelAlive && !p2Alive) {
        // mueren en el mismo nivel (por puntos)
        determine2PWinner();
        return;
      }
      if (twoPlayerState.p1LevelAlive && !p2Alive) {
        // P1 pasa el nivel y p2 muere, gana 
        show2PResult('p1');
        return;
      }
      if (!twoPlayerState.p1LevelAlive && p2Alive) {
        // P2 psa el nivel y p1 muere ,gana 
        show2PResult('p2');
        return;
      }
    }
  }

  /* compara los resultados del ultimo nivel y los puntajes totales para decidir quien gana */
  function determine2PWinner() {
    const p1Total = player1.totalScore;
    const p2Total = player2.totalScore;

    // resultados del ultimo nivel
    const lastResult = twoPlayerState.levelResults[twoPlayerState.levelResults.length - 1];

    if (lastResult) {
      // uno pasa, el otro muere
      if (lastResult.p1.alive && !lastResult.p2.alive) {
        show2PResult('p1');
        return;
      }
      if (!lastResult.p1.alive && lastResult.p2.alive) {
        show2PResult('p2');
        return;
      }
    }

    // comparar scores
    if (p1Total > p2Total) {
      show2PResult('p1');
    } else if (p2Total > p1Total) {
      show2PResult('p2');
    } else {
      show2PResult('tie');
    }
  }

  /* muestra la pantalla final de 2 jugadores:
     retrato feliz del ganador, triste del perdedor, puntajes y confetti */
  function show2PResult(winner) {
    state = '2p_result';

    setImageElementSource('result-p1-img', 'michi_portrait_normal');
    document.getElementById('result-p1-name').textContent = player1.name;
    document.getElementById('result-p1-score').textContent = player1.totalScore;

    setImageElementSource('result-p2-img', 'luna_portrait_normal');
    document.getElementById('result-p2-name').textContent = player2.name;
    document.getElementById('result-p2-score').textContent = player2.totalScore;

    const p1Div = document.getElementById('result-p1');
    const p2Div = document.getElementById('result-p2');
    const tieDv = document.getElementById('result-tie');
    const titleEl = document.getElementById('result-title');

    p1Div.classList.remove('winner');
    p2Div.classList.remove('winner');
    tieDv.style.display = 'none';

    if (winner === 'p1') {
      titleEl.textContent = `${player1.name} GANA!`;
      p1Div.classList.add('winner');
      setImageElementSource('result-p1-img', 'michi_portrait_happy');
      setImageElementSource('result-p2-img', 'luna_portrait_sad');
      saveScore(player1.name, player1.totalScore, player1.levelReached || currentLevel, '2p');
    } else if (winner === 'p2') {
      titleEl.textContent = `${player2.name} GANA!`;
      p2Div.classList.add('winner');
      setImageElementSource('result-p2-img', 'luna_portrait_happy');
      setImageElementSource('result-p1-img', 'michi_portrait_sad');
      saveScore(player2.name, player2.totalScore, player2.levelReached || currentLevel, '2p');
    } else {
      titleEl.textContent = 'RESULTADO';
      tieDv.style.display = 'block';
    }

    showScreen('screen-2p-result');
    const resultScreen = document.getElementById('screen-2p-result');
    if (resultScreen) {
      resultScreen.scrollTop = 0;
    }
    requestAnimationFrame(() => {
      if (winner !== 'tie') {
        startConfetti('confetti-canvas-2p');
        playVictorySound();
      }
    });
  }

  /* seccion 15 - countdown */

  /* muestra el 3, 2, 1 antes de arrancar el nivel, cuando llega a 0 llama a callback (startGameLoop) */
  function showCountdown(callback) {
    const overlay = document.getElementById('countdown-overlay');
    const numEl = document.getElementById('countdown-number');
    overlay.classList.add('active');

    let count = 3;
    numEl.textContent = count;
    numEl.style.animation = 'none';
    void numEl.offsetHeight;
    numEl.style.animation = 'countdown-pop 0.8s ease-out';

    const countInterval = setInterval(() => {
      count--;
      if (count > 0) {
        numEl.textContent = count;
        numEl.style.animation = 'none';
        void numEl.offsetHeight;
        numEl.style.animation = 'countdown-pop 0.8s ease-out';
        playClickSound();
      } else {
        clearInterval(countInterval);
        overlay.classList.remove('active');
        if (callback) callback();
      }
    }, 900);

    playClickSound();
  }

  /* seccion 16 - confetti */

  /* crea 150 papelitos de colores en un canvas separado y los anima:
     caen, se mueven a los lados, rotan. cuando salen por abajo vuelven a aparecer arriba */
  function startConfetti(canvasId) {
    stopConfetti();

    const confCanvas = document.getElementById(canvasId);
    if (!confCanvas) return;

    const host = confCanvas.closest('.screen-result-frame') || confCanvas.closest('.screen');
    const w = Math.max(1, host?.clientWidth || window.innerWidth);
    const h = Math.max(1, host?.clientHeight || window.innerHeight);
    confCanvas.width = w;
    confCanvas.height = h;
    const cctx = confCanvas.getContext('2d');

    confetti = [];
    const colors = ['#FF6B8A', '#FBBF24', '#86EFAC', '#D8B4FE', '#FF8A80', '#67E8F9', '#FCA5A5'];

    for (let i = 0; i < 150; i++) {
      confetti.push({
        x: Math.random() * confCanvas.width,
        y: Math.random() * confCanvas.height - confCanvas.height,
        w: 6 + Math.random() * 8,
        h: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 4,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2
      });
    }

    function animateConfetti() {
      cctx.clearRect(0, 0, confCanvas.width, confCanvas.height);

      for (const c of confetti) {
        c.x += c.vx;
        c.y += c.vy;
        c.rotation += c.rotSpeed;

        if (c.y > confCanvas.height + 20) {
          c.y = -20;
          c.x = Math.random() * confCanvas.width;
        }

        cctx.save();
        cctx.translate(c.x, c.y);
        cctx.rotate(c.rotation);
        cctx.fillStyle = c.color;
        cctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
        cctx.restore();
      }

      confettiAnimId = requestAnimationFrame(animateConfetti);
    }

    confettiAnimId = requestAnimationFrame(animateConfetti);
  }

  function stopConfetti() {
    if (confettiAnimId) {
      cancelAnimationFrame(confettiAnimId);
      confettiAnimId = null;
    }
  }

  /* seccion 17 - ranking  */

  const RANKING_TOP = 5;

  /* guarda el puntaje en localStorage.
     lee la lista existente, agrega el nuevo, ordena de mayor a menor
     y guarda solo los 5 mejores (RANKING_TOP = 5) */
  function saveScore(name, score, level, mode) {
    let scores = JSON.parse(localStorage.getItem('gusacat_scores') || '[]');
    scores.push({
      name: name || 'Anonimo',
      score,
      level,
      mode,
      date: new Date().toLocaleDateString('es-AR')
    });
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, RANKING_TOP);
    localStorage.setItem('gusacat_scores', JSON.stringify(scores));
  }

  /* lee los puntajes de localStorage y crea las filas de la tabla HTML dinamicamente */
  function showRanking() {
    state = 'ranking';
    const scores = JSON.parse(localStorage.getItem('gusacat_scores') || '[]').slice(0, RANKING_TOP);
    const tbody = document.getElementById('ranking-body');
    const emptyMsg = document.getElementById('ranking-empty');

    tbody.innerHTML = '';

    if (scores.length === 0) {
      emptyMsg.style.display = 'block';
    } else {
      emptyMsg.style.display = 'none';
      scores.forEach((s, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${i + 1}</td><td>${s.name}</td><td>${s.score}</td><td>${s.level}</td>`;
        tbody.appendChild(tr);
      });
    }

    showScreen('screen-ranking');
  }

  /* seccion 18 - CANVAS SIZING */

  /* devuelve true si la pantalla es angosta (menos de 700px) o el dispositivo tiene pantalla tactil */
  function isMobileLayout() {
    return window.matchMedia('(max-width: 700px)').matches ||
      window.matchMedia('(pointer: coarse)').matches;
  }

  /* calcula cuanto espacio hay disponible para el canvas */
  function getPlayAreaSize() {
    const container = document.querySelector('.canvas-container');
    if (container) {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return { cw: Math.floor(rect.width), ch: Math.floor(rect.height) };
      }
    }
    const hud = document.querySelector('.hud');  /** descontando el alto del HUD y los controles tactiles si estan visibles */
    const controls = document.getElementById('mobile-controls');
    const hudH = hud ? hud.getBoundingClientRect().height : 0;
    let controlsH = 0;
    if (isMobileLayout() && controls) {
      const style = window.getComputedStyle(controls);
      if (style.display !== 'none') {
        controlsH = controls.getBoundingClientRect().height;
      }
    }
    const cw = Math.floor(window.innerWidth);
    const ch = Math.floor(window.innerHeight - hudH - controlsH);
    return { cw, ch: Math.max(80, ch) };
  }

  /* adapta el juego a cualquier pantalla */
  function resizeCanvas() {
    canvas = document.getElementById('game-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    const { cw, ch } = getPlayAreaSize();
    const mobile = isMobileLayout();

    contentScale = 1;

    if (!gameRunning) {  /**  recalcula COLS y ROWS segun el espacio disponible, */
      const cellTarget = mobile ? 36 : 48;
      COLS = Math.max(10, Math.floor(cw / cellTarget));
      ROWS = Math.max(10, Math.floor(ch / cellTarget));
    }

    cellSize = Math.max(8, Math.floor(Math.min(cw / COLS, ch / ROWS)));

    canvas.width = COLS * cellSize;
    canvas.height = ROWS * cellSize;

    /* Ocupa todo el contenedor: sin bandas negras alrededor del mapa. */
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    ctx.imageSmoothingEnabled = false;

    if (state === 'playing' || state === 'paused') {
      syncCanvasContainerBg(getLevelConfig());
      renderGame();
    }
  }

  /* llama a resizeCanvas dos veces con requestAnimationFrame para asegurarse
     de que el DOM ya proceso los cambios de CSS  */
  function scheduleResizeCanvas() {
    requestAnimationFrame(() => {
      resizeCanvas();
      requestAnimationFrame(resizeCanvas);
    });
  }

  /* seccion 19 - manejo de entrada */

  /* cambia la direccion de la serpiente.*/
  function setDirection(newDir) {
    if (!gameRunning || gamePaused) return;

    // no puede girar 180 grados (si vas a la derecha no podes ir a la izquierda)
    const opposites = { up: 'down', down: 'up', left: 'right', right: 'left' };
    if (newDir === opposites[direction]) return;

    nextDirection = newDir;
  }

  // teclado
  document.addEventListener('keydown', (e) => {
    initAudio();

    if (state === 'dialog') {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        advanceDialog();
      }
      return;
    }
    
    /**  teclas - guarda en nextDirection y se aplica en el proximo tick */
    if (state === 'playing') {
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W':
          e.preventDefault(); setDirection('up'); break;
        case 'ArrowDown': case 's': case 'S':
          e.preventDefault(); setDirection('down'); break;
        case 'ArrowLeft': case 'a': case 'A':
          e.preventDefault(); setDirection('left'); break;
        case 'ArrowRight': case 'd': case 'D':
          e.preventDefault(); setDirection('right'); break;
        case 'Escape': case 'p': case 'P':
          e.preventDefault(); togglePause(); break;
      }
    }

    if (state === 'paused') {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        resumeGame();
      }
    }
  });

  // Controles de botones para celular
  document.querySelectorAll('.mobile-dir[data-dir]').forEach((btn) => {
    const onPress = (e) => {
      e.preventDefault();
      initAudio();
      setDirection(btn.dataset.dir);
    };
    btn.addEventListener('touchstart', onPress, { passive: false });
    btn.addEventListener('mousedown', onPress);
  });

  // Joystick tactil para celular
  const joystickBase = document.getElementById('mobile-joystick');
  const joystickStick = document.getElementById('mobile-joystick-stick');
  let joystickTouchId = null;
  let joystickCenter = { x: 0, y: 0 };
  function getJoystickRadius() {
    if (!joystickBase) return 40;
    return Math.max(22, joystickBase.clientWidth * 0.38);
  }

  function resetJoystick() {
    if (joystickStick) {
      joystickStick.style.transform = 'translate(-50%, -50%)';
    }
    joystickTouchId = null;
  }

  function handleJoystickMove(clientX, clientY) {
    if (!joystickBase || !joystickStick) return;
    const dxRaw = clientX - joystickCenter.x;
    const dyRaw = clientY - joystickCenter.y;
    const dist = Math.hypot(dxRaw, dyRaw) || 1;
    const clamped = Math.min(dist, getJoystickRadius());
    const dx = (dxRaw / dist) * clamped;
    const dy = (dyRaw / dist) * clamped;
    joystickStick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

    if (Math.abs(dxRaw) < 14 && Math.abs(dyRaw) < 14) return;
    if (Math.abs(dxRaw) > Math.abs(dyRaw)) {
      setDirection(dxRaw > 0 ? 'right' : 'left');
    } else {
      setDirection(dyRaw > 0 ? 'down' : 'up');
    }
  }

  joystickBase?.addEventListener('touchstart', (e) => {
    if (state !== 'playing' || !gameRunning || gamePaused) return;
    initAudio();
    const t = e.changedTouches[0];
    const rect = joystickBase.getBoundingClientRect();
    joystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    joystickTouchId = t.identifier;
    handleJoystickMove(t.clientX, t.clientY);
    e.preventDefault();
  }, { passive: false });

  joystickBase?.addEventListener('touchmove', (e) => {
    if (joystickTouchId === null || gamePaused) return;
    for (const t of e.changedTouches) {
      if (t.identifier === joystickTouchId) {
        handleJoystickMove(t.clientX, t.clientY);
        e.preventDefault();
        break;
      }
    }
  }, { passive: false });

  joystickBase?.addEventListener('touchend', (e) => {
    for (const t of e.changedTouches) {
      if (t.identifier === joystickTouchId) {
        resetJoystick();
        break;
      }
    }
  }, { passive: true });

  joystickBase?.addEventListener('touchcancel', resetJoystick, { passive: true });

  /* seccion 20 - pausa y seguir */

  /* alterna entre pausar y reanudar el juego */
  function togglePause() {
    if (!gameRunning && !gamePaused) return;

    if (gamePaused) {
      resumeGame();
    } else {
      pauseGame();
    }
  }

  /* pausa el juego: para el timer de logica, el render y la musica */
  function pauseGame() {
    if (!gameRunning || gamePaused) return;
    gamePaused = true;
    state = 'paused';
    pauseGameLoopTimer();
    stopRenderLoop();
    stopBGMusic();
    playClickSound();
    document.getElementById('screen-pause').classList.add('active');
  }

  /* reanuda el juego: reactiva el timer de logica, el render y la musica */
  function resumeGame() {
    if (!gameRunning || !gamePaused) return;
    gamePaused = false;
    state = 'playing';
    document.getElementById('screen-pause').classList.remove('active');
    resumeGameLoopTimer();
    startRenderLoop();
    startBGMusic(currentLevel);
    playClickSound();
    renderGame();
  }

  function showExitConfirm() {
    pauseGame();
    document.getElementById('screen-exit-confirm').classList.add('active');
  }

  function hideExitConfirm() {
    document.getElementById('screen-exit-confirm').classList.remove('active');
  }

  /* seccion 21 - start - restart */

  /* arranca una partida nueva: resetea todos los puntajes y vidas */
  function startGame() {
    // resetea a los jugadores
    player1.totalScore = 0; player1.score = 0; player1.alive = true;
    player1.levelReached = 0; player1.levelScores = [];
    player2.totalScore = 0; player2.score = 0; player2.alive = true;
    player2.levelReached = 0; player2.levelScores = [];

    currentLevel = 1;
    currentPlayer = 1;

    if (gameMode === '2p') { /** 2p llama a start2PGame */
      start2PGame();
    } else {
      // en 1p muestra el dialogo del nivel 1 y arranca
      showDialog(1, () => {
        startLevelForCurrentPlayer();
      });
    }
  }

  /* incrementa currentLevel, resetea el puntaje del nivel, muestra el dialogo y arranca */
  function nextLevel() {
    currentLevel++;
    const player = getCurrentPlayer();
    player.score = 0;

    showDialog(currentLevel, () => {
      startLevelForCurrentPlayer();
    });
  }

  /* reinicia el juego desde el principio */
  function retryGame() {
    playClickSound();
    stopConfetti();
    startGame();
  }

  /* para todo (loops, musica, confetti) y vuelve a la pantalla de titulo */
  function goToMenu() {
    playClickSound();
    stopConfetti();
    stopGameLoop();
    stopBGMusic();
    stopRenderLoop();
    showTitle();
  }

  /* seccion 22 - botones */

  /* conecta todos los botones del HTML con sus funciones.
     se llama una sola vez al inicio en init() */
  function setupButtons() {
    // titulo 
    document.getElementById('btn-play').addEventListener('click', () => {
      initAudio();
      playClickSound();
      showModeSelect();
    });
    document.getElementById('btn-ranking').addEventListener('click', () => {
      initAudio();
      playClickSound();
      showRanking();
    });

    // modo select
    document.getElementById('btn-1p').addEventListener('click', () => {
      playClickSound();
      gameMode = '1p';
      showNameInput();
    });
    document.getElementById('btn-2p').addEventListener('click', () => {
      playClickSound();
      gameMode = '2p';
      showNameInput();
    });
    document.getElementById('btn-mode-back').addEventListener('click', () => {
      playClickSound();
      showTitle();
    });

    // poner el nombre
    document.getElementById('btn-name-back').addEventListener('click', () => {
      playClickSound();
      showModeSelect();
    });
    document.getElementById('btn-start-game').addEventListener('click', () => {
      playClickSound();
      const name1 = document.getElementById('input-name-1').value.trim() || 'Michi';
      const name2 = document.getElementById('input-name-2').value.trim() || 'Luna';
      player1.name = name1;
      player2.name = name2;
      startGame();
    });
    // enter para arrancar 
    document.getElementById('input-name-1').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('btn-start-game').click();
      }
    });
    document.getElementById('input-name-2').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('btn-start-game').click();
      }
    });

    // dialogo 
    document.getElementById('btn-dialog-continue').addEventListener('click', () => {
      playClickSound();
      advanceDialog();
    });
    // clickear la caja de dialogo para avanzar 
    document.getElementById('screen-dialog').addEventListener('click', (e) => {
      if (e.target.id !== 'btn-dialog-continue') {
        advanceDialog();
      }
    });

    // Pausa
    document.getElementById('btn-pause').addEventListener('click', () => togglePause());
    document.getElementById('btn-pause-continue').addEventListener('click', () => resumeGame());
    document.getElementById('btn-pause-restart').addEventListener('click', () => {
      playClickSound();
      gamePaused = false;
      document.getElementById('screen-pause').classList.remove('active');
      scheduleResizeCanvas();
      initLevel(currentLevel);
      updateHUD();
      renderGame();
      state = 'playing';
      showCountdown(() => startGameLoop());
    });
    document.getElementById('btn-pause-quit').addEventListener('click', () => {
      document.getElementById('screen-pause').classList.remove('active');
      goToMenu();
    });

    // salir
    document.getElementById('btn-exit').addEventListener('click', () => showExitConfirm());
    document.getElementById('btn-exit-no').addEventListener('click', () => {
      playClickSound();
      hideExitConfirm();
      resumeGame();
    });
    document.getElementById('btn-exit-yes').addEventListener('click', () => {
      hideExitConfirm();
      goToMenu();
    });

    // nivel completo
    document.getElementById('btn-next-level').addEventListener('click', () => {
      playClickSound();
      nextLevel();
    });

    // juego terminado
    document.getElementById('btn-retry').addEventListener('click', () => retryGame());
    document.getElementById('btn-go-menu').addEventListener('click', () => goToMenu());

    // Victoria
    document.getElementById('btn-victory-menu').addEventListener('click', () => goToMenu());

    // 2P resultado
    document.getElementById('btn-result-menu').addEventListener('click', () => goToMenu());

    // Ranking
    document.getElementById('btn-ranking-back').addEventListener('click', () => {
      playClickSound();
      showTitle();
    });
  }

  /* seccion 23 - responsivo */

  window.addEventListener('resize', () => {
    if (state === 'playing' || state === 'paused') {
      scheduleResizeCanvas();
    }
  });
  window.addEventListener('orientationchange', () => {
    if (state === 'playing' || state === 'paused') {
      setTimeout(scheduleResizeCanvas, 120);
    }
  });

  /* muestra u oculta el joystick tactil segun si el dispositivo tiene pantalla tactil
     y si estamos en una pantalla donde tiene sentido mostrarlo */
  function checkMobileControls() {
    const mc = document.getElementById('mobile-controls');
    if (mc) {
      const touchDevice = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
      const showForState = state === 'playing' || state === 'paused' || state === 'dialog';
      if (touchDevice && showForState) {
        mc.style.display = 'flex';
      } else {
        mc.style.display = 'none';
      }
    }
  }

  window.addEventListener('resize', checkMobileControls);

  /* seccion 24 - inicialización */

  /* funcion de arranque. se ejecuta una sola vez cuando carga la pagina: */
  async function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');

    setupButtons();
    checkMobileControls();

    // carga las imagenes  mientras muestra barra de progreso 
    const loadingBar = document.getElementById('loading-bar');

    await loadAllImages((progress) => {
      loadingBar.style.width = `${Math.floor(progress * 100)}%`;
    });

    // Intento de bloqueo a horizontal en celulares 
    const touchDevice = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    if (touchDevice && screen.orientation?.lock) {
      screen.orientation.lock('landscape').catch(() => {});
    }

    // Pone los retratos en la pantalla de selección de modo
    setImageElementSource('mode1p-img', 'michi_portrait_normal');
    setImageElementSource('mode2p-img', 'luna_portrait_normal');

    // muestra el titulo
    setTimeout(() => showTitle(), 500);
  }

  /* si el HTML todavia esta cargando espera el evento DOMContentLoaded.
     si ya cargo llama a init() directamente */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();