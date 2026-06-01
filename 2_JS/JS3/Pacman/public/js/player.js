class Player {
    constructor(id, name, gridX, gridY, controls, closedSrc, openSrc) {
        this.id = id; // SI ES P1 O P2 
        this.name = name;
        this.startGridX = gridX;
        this.startGridY = gridY;
        this.controls = controls;
        
        // Cargar sprites
        this.imgClosed = new Image();
        this.imgClosed.src = closedSrc;
        this.imgOpen = new Image();
        this.imgOpen.src = openSrc;

        this.resetGame();
        this.resetPosition();
    }

    /* Restablece las vidas y el puntaje (cuando arranca una partida nueva) */
    resetGame() {
        this.score = 0;
        this.lives = 3;
        this.isDead = false;
    }

    /* Restablece únicamente la posición de inicio y los vectores de movimiento de la ronda */
    resetPosition() {
        this.gridX = this.startGridX;
        this.gridY = this.startGridY;
        
        this.x = 0; 
        this.y = 0;
        
        this.dirX = 0;
        this.dirY = 0;
        this.nextDirX = 0;
        this.nextDirY = 0;
        
        this.speed = 2.0; // Se recalculará de forma dinámica según tileSize
        this.isMoving = false;
        
        this.mouthOpen = false;
        this.animationTimer = 0;
        this.animationSpeed = 10;
        
        this.angle = 0;
        this.mirrorY = false;
    }

    /* Llama a ambos reinicios para compatibilidad. */
    reset() {
        this.resetPosition();
        this.resetGame();
    }

    /* Sincroniza la posición en pixeles con la posición de la cuadrícula */
    syncPixels(tileSize) {
        this.x = this.gridX * tileSize + tileSize / 2;
        this.y = this.gridY * tileSize + tileSize / 2;
        this.speed = Math.max(1.0, tileSize * 0.11); // Velocidad proporcional
    }

    /* Establece la siguiente dirección deseada */
    setNextDirection(dx, dy) {
        this.nextDirX = dx;
        this.nextDirY = dy;
        
        if (this.dirX === 0 && this.dirY === 0) {
            this.dirX = dx;
            this.dirY = dy;
        }
    }

    isValidMove(gx, gy, map) {
        if (gx < 0 || gx >= map[0].length) return true;
        if (gy < 0 || gy >= map.length) return false;
        
        const cell = map[gy][gx];
        return cell !== 1 && cell !== 4;
    }

    /* Actualiza la posición del jugador usando velocidades relativas al tileSize. */
    update(map, tileSize) {
        if (this.isDead) return;

        // Ajustar la velocidad para que escale con el tamaño de celda de forma continua
        this.speed = Math.max(1.0, tileSize * 0.11);

        const targetX = this.gridX * tileSize + tileSize / 2;
        const targetY = this.gridY * tileSize + tileSize / 2;

        const distanceToTarget = Math.sqrt(Math.pow(targetX - this.x, 2) + Math.pow(targetY - this.y, 2));

        if (distanceToTarget < this.speed) {
            this.x = targetX;
            this.y = targetY;

            // Cambiar dirección si es válido
            if ((this.nextDirX !== 0 || this.nextDirY !== 0) && 
                this.isValidMove(this.gridX + this.nextDirX, this.gridY + this.nextDirY, map)) {
                this.dirX = this.nextDirX;
                this.dirY = this.nextDirY;
            }

            if (this.isValidMove(this.gridX + this.dirX, this.gridY + this.dirY, map)) {
                this.gridX += this.dirX;
                this.gridY += this.dirY;
                
                const cols = map[0].length;
                if (this.gridX < 0) {
                    this.gridX = cols - 1;
                    this.x = this.gridX * tileSize + tileSize / 2;
                } else if (this.gridX >= cols) {
                    this.gridX = 0;
                    this.x = this.gridX * tileSize + tileSize / 2;
                }
                
                this.isMoving = true;
            } else {
                this.dirX = 0;
                this.dirY = 0;
                this.isMoving = false;
            }
        }

        if (this.isMoving) {
            const destX = this.gridX * tileSize + tileSize / 2;
            const destY = this.gridY * tileSize + tileSize / 2;

            if (this.x < destX) this.x = Math.min(this.x + this.speed, destX);
            else if (this.x > destX) this.x = Math.max(this.x - this.speed, destX);

            if (this.y < destY) this.y = Math.min(this.y + this.speed, destY);
            else if (this.y > destY) this.y = Math.max(this.y - this.speed, destY);

            this.updateRotation();

            this.animationTimer++;
            if (this.animationTimer >= this.animationSpeed) {
                this.mouthOpen = !this.mouthOpen;
                this.animationTimer = 0;
            }
        } else {
            this.mouthOpen = false;
        }
    }

    updateRotation() {
        if (this.dirX > 0) {
            this.angle = 0;
            this.mirrorY = false;
        } else if (this.dirX < 0) {
            this.angle = Math.PI;
            this.mirrorY = true;
        } else if (this.dirY > 0) {
            this.angle = Math.PI / 2;
            this.mirrorY = false;
        } else if (this.dirY < 0) {
            this.angle = -Math.PI / 2;
            this.mirrorY = false;
        }
    }

    draw(ctx, tileSize) {
        if (this.isDead) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        if (this.mirrorY) {
            ctx.scale(1, -1);
        }
        /* el búfer de dirección y la animación de la boca */

        const img = this.mouthOpen ? this.imgOpen : this.imgClosed;
        const size = tileSize * 1.35; 
        
        if (img.complete && img.naturalWidth !== 0) {
            ctx.drawImage(img, -size / 2, -size / 2, size, size);
        } else {
            ctx.beginPath();
            ctx.fillStyle = this.id === 'p1' ? '#00ff66' : '#ffcc00';
            const mouthSize = this.mouthOpen ? 0.2 : 0.05;
            ctx.arc(0, 0, tileSize / 2, mouthSize * Math.PI, (2 - mouthSize) * Math.PI);
            ctx.lineTo(0, 0);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }
}
