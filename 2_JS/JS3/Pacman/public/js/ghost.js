/* Modela el comportamiento e inteligencia artificial de los 4 antagonistas:
 * Gus Fring (perseguidor directo), Hank Schrader (emboscador adelantado),
 * Tuco Salamanca (agresivo a corta distancia), Hector Salamanca (patrullero).
 *
 * Ciclo de estados:
 *   SCATTER (7s) → CHASE (20s) → SCATTER (5s) → CHASE (20s) → CHASE indefinido
 */

const GHOST_STATES = {
    CHASE: 'chase',
    SCATTER: 'scatter',
    FRIGHTENED: 'frightened',
    EATEN: 'eaten'
};

// Ciclo clásico: [duración_scatter_ms, duración_chase_ms, ...]
const STATE_CYCLE = [7000, 20000, 5000, 20000, 5000, 20000, 5000, Infinity];

class Ghost {
    constructor(name, startGridX, startGridY, color, cornerX, cornerY, speedMultiplier) {
        this.name = name;
        this.startGridX = startGridX;
        this.startGridY = startGridY;
        this.color = color;
        this.cornerX = cornerX;
        this.cornerY = cornerY;
        this.baseSpeedMultiplier = speedMultiplier;

        this.exitDelay = 0;

        this.reset();
    }

    reset() {
        this.gridX = this.startGridX;
        this.gridY = this.startGridY;
        this.x = 0;
        this.y = 0;

        this.dirX = 0;
        this.dirY = -1; // comienza mirando hacia arriba (hacia la salida)

        this.state = GHOST_STATES.SCATTER;
        this.speed = 1.0;

        this.targetX = this.cornerX;
        this.targetY = this.cornerY;

        this.pulseTimer = 0;
        this.frightenedTimer = 0;

        this.cycleIndex = 0;
        this.cycleTimer = STATE_CYCLE[0];
        this.isInHouse = true;         // dentro de la jaula de spawn
        this.exitTimer = this.exitDelay; // ms hasta salir
    }

    /** Sincroniza posición en píxeles y velocidad con el tileSize actual. */
    syncPixels(tileSize) {
        this.x = this.gridX * tileSize + tileSize / 2;
        this.y = this.gridY * tileSize + tileSize / 2;
        this.updateDynamicSpeed(tileSize);
    }

    updateDynamicSpeed(tileSize) {
        if (this.state === GHOST_STATES.FRIGHTENED) {
            this.speed = Math.max(0.6, tileSize * this.baseSpeedMultiplier * 0.5);
        } else if (this.state === GHOST_STATES.EATEN) {
            this.speed = Math.max(2.0, tileSize * 0.25);
        } else {
            this.speed = Math.max(0.8, tileSize * this.baseSpeedMultiplier);
        }
    }

    changeState(newState, duration = 0) {
        if (this.state === GHOST_STATES.EATEN &&
            newState !== GHOST_STATES.SCATTER &&
            newState !== GHOST_STATES.CHASE) {
            return;
        }

        const wasFrightened = this.state === GHOST_STATES.FRIGHTENED;
        this.state = newState;

        if (newState === GHOST_STATES.FRIGHTENED) {
            this.frightenedTimer = duration;
            if (!wasFrightened && (this.dirX !== 0 || this.dirY !== 0)) {
                this.dirX = -this.dirX;
                this.dirY = -this.dirY;
            }
        }
    }

    getDistance(x1, y1, x2, y2) {
        const dx = x2 - x1, dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /** Devuelve true si la celda (gx, gy) es transitable para un fantasma. */
    isWalkable(gx, gy, map) {
        if (gx < 0 || gx >= map[0].length) return true;  // túnel lateral
        if (gy < 0 || gy >= map.length)    return false;
        const cell = map[gy][gx];
        return cell !== 1; // muros = 1; todo lo demás (0,2,3,4) es transitable
    }

    //  ACTUALIZACIÓN PRINCIPAL (llamada cada frame)
    /** True mientras el fantasma sigue dentro de la zona de spawn (jaula). */
    _isInsideHouse(doorCoords) {
        return this.gridY > doorCoords.gridY &&
               this.gridY <= doorCoords.gridY + 3 &&
               this.gridX >= doorCoords.gridX - 2 &&
               this.gridX <= doorCoords.gridX + 2;
    }

    /** En la celda de la puerta, aún no ha salido al laberinto. */
    _isOnDoor(doorCoords) {
        return this.gridX === doorCoords.gridX && this.gridY === doorCoords.gridY;
    }

    /** Aún no salió de la jaula (para IA de escape y colisiones). */
    _needsHouseExit(doorCoords) {
        return this._isInsideHouse(doorCoords) || this._isOnDoor(doorCoords);
    }

    update(map, players, activeP2, tileSize, doorCoords, allGhosts) {
        const dt = 1000 / 60; // ~16.67 ms por frame

        // 1. Retardo de salida de la jaula (rebote antes de intentar salir)
        if (this.exitTimer > 0) {
            this.exitTimer -= dt;
            if (this.exitTimer > 0) {
                this.isInHouse = true;
                this.updateDynamicSpeed(tileSize);
                this._bounceInHouse(map, tileSize, doorCoords);
                this.pulseTimer += 0.08;
                return;
            }
        }

        // En casa hasta pasar la puerta (los asustados dentro SÍ chocan con el jugador)
        this.isInHouse = this._needsHouseExit(doorCoords);

        // 2. Cuenta regresiva del asustado
        if (this.state === GHOST_STATES.FRIGHTENED) {
            this.frightenedTimer -= dt;
            if (this.frightenedTimer <= 0) {
                this.state = GHOST_STATES.CHASE;
                // Reanudar el ciclo normal desde CHASE
                this.cycleIndex = 1; // índice 1 = primer CHASE
                this.cycleTimer = STATE_CYCLE[1];
            }
        }

        // 3. Ciclo SCATTER / CHASE (solo cuando no está asustado ni comido)
        if (this.state === GHOST_STATES.SCATTER || this.state === GHOST_STATES.CHASE) {
            this.cycleTimer -= dt;
            if (this.cycleTimer <= 0) {
                this.cycleIndex++;
                if (this.cycleIndex >= STATE_CYCLE.length) this.cycleIndex = STATE_CYCLE.length - 1;
                const nextDuration = STATE_CYCLE[this.cycleIndex];
                this.cycleTimer = nextDuration;

                // Alternar: índices pares = SCATTER, impares = CHASE
                const nextState = (this.cycleIndex % 2 === 0) ? GHOST_STATES.SCATTER : GHOST_STATES.CHASE;
                if (this.state !== nextState) {
                    this.state = nextState;
                    // Inversión clásica al cambiar de fase
                    this.dirX = -this.dirX;
                    this.dirY = -this.dirY;
                }
            }
        }

        // 4. Revivir al llegar a la puerta (estado EATEN)
        if (this.state === GHOST_STATES.EATEN &&
            this.gridX === doorCoords.gridX &&
            this.gridY === doorCoords.gridY) {
            this.state = GHOST_STATES.CHASE;
            this.cycleIndex = 1;
            this.cycleTimer = STATE_CYCLE[1];
            this.gridY = doorCoords.gridY + 2;
            this.isInHouse = true;
            this.exitTimer = 0;
            this.syncPixels(tileSize);
            return;
        }

        // 5. Actualizar velocidad
        this.updateDynamicSpeed(tileSize);

        // 6. Calcular objetivo según estado e IA
        this._updateTarget(players, activeP2, doorCoords, allGhosts);

        // 7. Moverse hacia la celda destino
        this._moveTowardsCell(map, tileSize, doorCoords);

        this.pulseTimer += 0.08;
    }

    //  REBOTE DENTRO DE LA JAULA (mientras espera)

    _bounceInHouse(map, tileSize, doorCoords) {
        const targetPixelX = this.gridX * tileSize + tileSize / 2;
        const targetPixelY = this.gridY * tileSize + tileSize / 2;
        const dist = Math.abs(targetPixelY - this.y);

        if (dist < this.speed) {
            this.x = targetPixelX;
            this.y = targetPixelY;
            // Rebotar verticalmente dentro de la jaula
            const upY = this.gridY - 1;
            const downY = this.gridY + 1;
            if (this.dirY === -1) {
                // subir — comprobar que no sea la puerta ni pared
                const upCell = map[upY] ? map[upY][this.gridX] : 1;
                if (upCell === 4 || upCell === 1) {
                    this.dirY = 1; // rebotar hacia abajo
                } else {
                    this.gridY = upY;
                }
            } else {
                // bajar
                const downCell = map[downY] ? map[downY][this.gridX] : 1;
                if (downCell === 1) {
                    this.dirY = -1;
                } else {
                    this.gridY = downY;
                }
            }
        }

        const destX = this.gridX * tileSize + tileSize / 2;
        const destY = this.gridY * tileSize + tileSize / 2;
        if (this.y < destY) this.y = Math.min(this.y + this.speed, destY);
        else if (this.y > destY) this.y = Math.max(this.y - this.speed, destY);
        this.x = destX;
    }

    //  DEFINICIÓN DEL OBJETIVO DE LA IA

    /** Desplazamiento “Pinky bug” del Pac-Man original (4 o 2 casillas según tiles). */
    _pacmanLeadOffset(dirX, dirY, tiles) {
        let ox = dirX * tiles;
        let oy = dirY * tiles;
        if (dirY === -1) ox -= tiles;
        return { ox, oy };
    }

    _pickChaseTarget(players, activeP2) {
        let target = players.p1;
        if (activeP2 && !players.p2.isDead) {
            if (players.p1.isDead) {
                target = players.p2;
            } else {
                const d1 = this.getDistance(this.gridX, this.gridY, players.p1.gridX, players.p1.gridY);
                const d2 = this.getDistance(this.gridX, this.gridY, players.p2.gridX, players.p2.gridY);
                if (d2 < d1) target = players.p2;
            }
        }
        return target;
    }

    _updateTarget(players, activeP2, doorCoords, allGhosts) {
        // Fantasma comido: volver a la puerta
        if (this.state === GHOST_STATES.EATEN) {
            this.targetX = doorCoords.gridX;
            this.targetY = doorCoords.gridY;
            return;
        }

        // Salida de la jaula: centrarse en la columna de la puerta y subir
        if (this._needsHouseExit(doorCoords)) {
            if (this.gridX !== doorCoords.gridX) {
                this.targetX = doorCoords.gridX;
                this.targetY = this.gridY;
            } else {
                this.targetX = doorCoords.gridX;
                this.targetY = doorCoords.gridY - 1;
            }
            return;
        }

        // Dispersión: correr a su esquina
        if (this.state === GHOST_STATES.SCATTER || this.state === GHOST_STATES.FRIGHTENED) {
            this.targetX = this.cornerX;
            this.targetY = this.cornerY;
            return;
        }

        const target = this._pickChaseTarget(players, activeP2);
        const blinky = allGhosts ? allGhosts.find(g => g.name === 'Gus') : null;

        switch (this.name) {
            case 'Gus':
                // Blinky: apunta directo al jugador
                this.targetX = target.gridX;
                this.targetY = target.gridY;
                break;

            case 'Hank': {
                // Pinky: 4 casillas adelante (con bug al subir)
                const lead = this._pacmanLeadOffset(target.dirX, target.dirY, 4);
                this.targetX = target.gridX + lead.ox;
                this.targetY = target.gridY + lead.oy;
                break;
            }

            case 'Tuco': {
                // Clyde: esquina si está lejos (>=8), persigue si está cerca
                const dist = this.getDistance(this.gridX, this.gridY, target.gridX, target.gridY);
                if (dist >= 8) {
                    this.targetX = this.cornerX;
                    this.targetY = this.cornerY;
                } else {
                    this.targetX = target.gridX;
                    this.targetY = target.gridY;
                }
                break;
            }

            case 'Hector': {
                // Inky: pivote 2 casillas adelante + vector desde Blinky
                const lead = this._pacmanLeadOffset(target.dirX, target.dirY, 2);
                const pivotX = target.gridX + lead.ox;
                const pivotY = target.gridY + lead.oy;
                const bx = blinky ? blinky.gridX : target.gridX;
                const by = blinky ? blinky.gridY : target.gridY;
                this.targetX = pivotX + (pivotX - bx);
                this.targetY = pivotY + (pivotY - by);
                break;
            }
        }
    }

    //  MOVIMIENTO POR EL LABERINTO
    _moveTowardsCell(map, tileSize, doorCoords) {
        const targetPixelX = this.gridX * tileSize + tileSize / 2;
        const targetPixelY = this.gridY * tileSize + tileSize / 2;
        const dist = Math.sqrt(
            Math.pow(targetPixelX - this.x, 2) +
            Math.pow(targetPixelY - this.y, 2)
        );

        if (dist < this.speed) {
            this.x = targetPixelX;
            this.y = targetPixelY;
            this._chooseNextCell(map, doorCoords);
        }

        const destX = this.gridX * tileSize + tileSize / 2;
        const destY = this.gridY * tileSize + tileSize / 2;
        if (this.x < destX) this.x = Math.min(this.x + this.speed, destX);
        else if (this.x > destX) this.x = Math.max(this.x - this.speed, destX);
        if (this.y < destY) this.y = Math.min(this.y + this.speed, destY);
        else if (this.y > destY) this.y = Math.max(this.y - this.speed, destY);
    }

    /** Elige la próxima celda de la cuadrícula usando IA de Pac-Man clásica. */
    _chooseNextCell(map, doorCoords) {
        const dirs = [
            { dx: 0,  dy: -1 }, // arriba  (preferida primero en caso de empate)
            { dx: -1, dy:  0 }, // izquierda
            { dx:  0, dy:  1 }, // abajo
            { dx:  1, dy:  0 }  // derecha
        ];

        let bestDir = null;
        let minDist = Infinity;
        const candidates = [];

        for (const dir of dirs) {
            // No dar media vuelta (regla clásica de Pac-Man)
            if (dir.dx === -this.dirX && dir.dy === -this.dirY) continue;

            const nx = this.gridX + dir.dx;
            const ny = this.gridY + dir.dy;

            if (!this.isWalkable(nx, ny, map)) continue;

            // Puerta (4): entrar solo si está comido; salir si aún está en la jaula
            const cell = (map[ny] && map[ny][nx] !== undefined) ? map[ny][nx] : 0;
            if (cell === 4) {
                const leavingHouse = this._needsHouseExit(doorCoords);
                const returningEaten = this.state === GHOST_STATES.EATEN;
                if (!leavingHouse && !returningEaten) continue;
            }

            const d = this.getDistance(nx, ny, this.targetX, this.targetY);
            candidates.push({ dir, dist: d });
            if (d < minDist) {
                minDist = d;
                bestDir = dir;
            }
        }

        if (candidates.length === 0) {
            // Sin opciones: dar media vuelta como último recurso
            this.dirX = -this.dirX;
            this.dirY = -this.dirY;
        } else if (this.state === GHOST_STATES.FRIGHTENED) {
            // Asustado: movimiento aleatorio entre opciones válidas
            const pick = candidates[Math.floor(Math.random() * candidates.length)];
            this.dirX = pick.dir.dx;
            this.dirY = pick.dir.dy;
        } else {
            // Normal: elegir la dirección que minimiza distancia al objetivo
            this.dirX = bestDir.dx;
            this.dirY = bestDir.dy;
        }

        // Avanzar a la siguiente celda
        this.gridX += this.dirX;
        this.gridY += this.dirY;

        // Túnel lateral
        const cols = map[0].length;
        if (this.gridX < 0) this.gridX = cols - 1;
        else if (this.gridX >= cols) this.gridX = 0;
    }

    //  DIBUJO
    draw(ctx, tileSize) {
        const x = this.x;
        const y = this.y;
        const radius = tileSize * 0.6;

        ctx.save();

        if (this.state === GHOST_STATES.EATEN) {
            this._drawEyes(ctx, x, y, radius, '#ffffff', '#0000ff');
            ctx.restore();
            return;
        }

        if (this.state === GHOST_STATES.FRIGHTENED) {
            const flashing = this.frightenedTimer < 2000 && Math.floor(this.frightenedTimer / 200) % 2 === 0;
            this._drawGhostBody(ctx, x, y, radius, flashing ? '#ffffff' : '#0033cc');
            this._drawFrightenedFace(ctx, x, y, radius, flashing ? '#ff0000' : '#ffcc00');
            ctx.restore();
            return;
        }

        this._drawGhostBody(ctx, x, y, radius, this.color);

        switch (this.name) {
            case 'Gus':    this._drawGusGlasses(ctx, x, y, radius); this._drawGusSuit(ctx, x, y, radius); break;
            case 'Hank':   this._drawHankBadge(ctx, x, y, radius); break;
            case 'Tuco':   this._drawTucoGrill(ctx, x, y, radius); break;
            case 'Hector': this._drawHectorBell(ctx, x, y, radius); break;
        }

        this._drawEyes(ctx, x, y, radius, '#ffffff', '#000000');
        ctx.restore();
    }

    _drawGhostBody(ctx, x, y, radius, color) {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;

        ctx.arc(x, y - radius * 0.1, radius, Math.PI, 0, false);
        ctx.lineTo(x + radius, y + radius);

        const waveCount = 3;
        const waveWidth = (radius * 2) / waveCount;
        const pulse = Math.sin(this.pulseTimer) * 3;

        for (let i = 0; i < waveCount; i++) {
            const sx = x + radius - i * waveWidth;
            const ex = sx - waveWidth;
            ctx.bezierCurveTo(
                sx - waveWidth * 0.25, y + radius + radius * 0.15 + pulse,
                sx - waveWidth * 0.75, y + radius + radius * 0.15 + pulse,
                ex, y + radius
            );
        }

        ctx.lineTo(x - radius, y - radius * 0.1);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    _drawEyes(ctx, x, y, radius, white, pupil) {
        const off = radius * 0.35;
        const er  = radius * 0.25;
        const pr  = radius * 0.12;
        const lx  = this.dirX * radius * 0.08;
        const ly  = this.dirY * radius * 0.08;
        const ey  = y - radius * 0.15;

        for (const side of [-1, 1]) {
            ctx.beginPath(); ctx.fillStyle = white;
            ctx.arc(x + side * off, ey, er, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.fillStyle = pupil;
            ctx.arc(x + side * off + lx, ey + ly, pr, 0, Math.PI * 2); ctx.fill();
        }
    }

    _drawFrightenedFace(ctx, x, y, radius, color) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        const sx = x - radius * 0.4, ex = x + radius * 0.4, my = y + radius * 0.3;
        const step = (ex - sx) / 4;
        ctx.moveTo(sx, my);
        for (let i = 1; i <= 4; i++) ctx.lineTo(sx + i * step, my + (i % 2 === 0 ? -3 : 3));
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.font = `bold ${radius * 0.4}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('o', x - radius * 0.35, y - radius * 0.05);
        ctx.fillText('o', x + radius * 0.35, y - radius * 0.05);
    }

    _drawGusGlasses(ctx, x, y, radius) {
        ctx.strokeStyle = '#eab308'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(x - radius * 0.35, y - radius * 0.15, radius * 0.22, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + radius * 0.35, y - radius * 0.15, radius * 0.22, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - radius * 0.13, y - radius * 0.15); ctx.lineTo(x + radius * 0.13, y - radius * 0.15); ctx.stroke();
    }

    _drawGusSuit(ctx, x, y, radius) {
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.moveTo(x - radius * 0.3, y + radius * 0.5);
        ctx.lineTo(x + radius * 0.3, y + radius * 0.5);
        ctx.lineTo(x, y + radius);
        ctx.closePath(); ctx.fill();

        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(x - radius * 0.05, y + radius * 0.5);
        ctx.lineTo(x + radius * 0.05, y + radius * 0.5);
        ctx.lineTo(x + radius * 0.08, y + radius * 0.9);
        ctx.lineTo(x, y + radius);
        ctx.lineTo(x - radius * 0.08, y + radius * 0.9);
        ctx.closePath(); ctx.fill();
    }

    _drawHankBadge(ctx, x, y, radius) {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(x, y + radius * 0.3);
        ctx.lineTo(x + radius * 0.25, y + radius * 0.45);
        ctx.lineTo(x + radius * 0.15, y + radius * 0.85);
        ctx.lineTo(x, y + radius * 0.95);
        ctx.lineTo(x - radius * 0.25, y + radius * 0.85);
        ctx.lineTo(x - radius * 0.25, y + radius * 0.45);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#78350f';
        ctx.font = `${radius * 0.25}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('★', x, y + radius * 0.65);
    }

    _drawTucoGrill(ctx, x, y, radius) {
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(x - radius * 0.3, y + radius * 0.3, radius * 0.6, radius * 0.12);
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1;
        ctx.strokeRect(x - radius * 0.3, y + radius * 0.3, radius * 0.6, radius * 0.12);
        if (Math.sin(this.pulseTimer * 2.5) > 0.7) {
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${radius * 0.3}px sans-serif`;
            ctx.fillText('✦', x + radius * 0.15, y + radius * 0.32);
        }
    }

    _drawHectorBell(ctx, x, y, radius) {
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(x - radius * 0.8, y, radius * 0.25, 0, Math.PI * 2);
        ctx.arc(x + radius * 0.8, y, radius * 0.25, 0, Math.PI * 2);
        ctx.fill();

        const bounce = Math.sin(this.pulseTimer) * 2;
        const by = y - radius * 1.3 + bounce;
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(x, by, radius * 0.2, Math.PI, 0, false);
        ctx.lineTo(x + radius * 0.2, by + radius * 0.15);
        ctx.lineTo(x - radius * 0.2, by + radius * 0.15);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(x - radius * 0.04, by - radius * 0.3, radius * 0.08, radius * 0.1);

        if (Math.floor(this.pulseTimer * 1.5) % 2 === 0) {
            ctx.fillStyle = '#ff3366';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('DING!', x, by - radius * 0.45);
        }
    }
}
