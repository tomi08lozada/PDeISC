/* Este módulo utiliza la Web Audio API para generar efectos de sonido retro */

class SoundController {
    constructor() {
        this.ctx = null;
        this.muted = false;
        
        // Cargar estado de silencio inicial
        const savedMute = localStorage.getItem('breaking_pacman_muted');
        if (savedMute !== null) {
            this.muted = savedMute === 'true';
        }
    }

    /*  Inicializa el contexto de audio tras la interacción del usuario.*/
    init() {
        if (!this.ctx) {
            // Soporte para navegadores antiguos
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContextClass();
        }
        
        // Reanudar si está suspendido (política del navegador)
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('breaking_pacman_muted', this.muted);
        return this.muted;
    }

    isMuted() {
        return this.muted;
    }

    /* Crea un oscilador para notas simples y lo conecta con una ganancia (volumen) */
    playTone(frequency, type, duration, volume = 0.1, delay = 0) {
        if (this.muted) return;
        this.init();

        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = type; // 'sine', 'square', 'sawtooth', 'triangle'
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime + delay);

        gainNode.gain.setValueAtTime(volume, this.ctx.currentTime + delay);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + delay + duration);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + delay);
        osc.stop(this.ctx.currentTime + delay + duration);
    }

    /* Sonido de inicio de juego */
    playStartGame() {
        if (this.muted) return;
        this.init();

        const now = this.ctx.currentTime;
        const notes = [
            { freq: 220, type: 'sawtooth', dur: 0.15 }, // La 3 (A3)
            { freq: 261.63, type: 'sawtooth', dur: 0.15 }, // Do 4 (C4)
            { freq: 311.13, type: 'sawtooth', dur: 0.2 }, // Re# 4 (D#4) - Tono disonante tenso
            { freq: 293.66, type: 'sawtooth', dur: 0.2 }, // Re 4 (D4)
            { freq: 392, type: 'square', dur: 0.6 } // Sol 4 (G4) - Final
        ];

        let timeOffset = 0;
        notes.forEach(note => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = note.type;
            osc.frequency.setValueAtTime(note.freq, now + timeOffset);
            
            gain.gain.setValueAtTime(0.12, now + timeOffset);
            gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + note.dur);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(now + timeOffset);
            osc.stop(now + timeOffset + note.dur);
            
            timeOffset += note.dur * 0.9;
        });
    }

    /* Sonido de comer billete */
    playEatMoney() {
        this.playTone(880, 'triangle', 0.08, 0.08); // La 5
    }

    /* Sonido de comer tubo de ensayo redondo */
    playEatFlask() {
        if (this.muted) return;
        this.init();

        const now = this.ctx.currentTime;
        const dur = 0.3;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        // Frecuencia modulada de burbuja
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + dur);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + dur);
    }

    /* Sonido al comer a un fantasma */
    playEatGhost() {
        if (this.muted) return;
        this.init();

        const now = this.ctx.currentTime;
        // Dos tonos rápidos ascendentes
        this.playTone(523.25, 'square', 0.1, 0.15, 0); // Do 5
        this.playTone(659.25, 'square', 0.2, 0.15, 0.08); // Mi 5
    }

    /* Sonido de muerte del jugador */
    playDeath() {
        if (this.muted) return;
        this.init();

        const now = this.ctx.currentTime;
        const dur = 0.8;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(60, now + dur);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + dur);
    }

    /* Sonido al pasar de nivel */
    playLevelComplete() {
        if (this.muted) return;
        this.init();

        const now = this.ctx.currentTime;
        const notes = [261.63, 329.63, 392, 523.25, 659.25, 783.99]; 
        let offset = 0;

        notes.forEach((freq, idx) => {
            const isLast = idx === notes.length - 1;
            const dur = isLast ? 0.4 : 0.12;
            
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + offset);
            
            gain.gain.setValueAtTime(0.12, now + offset);
            gain.gain.exponentialRampToValueAtTime(0.001, now + offset + dur);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(now + offset);
            osc.stop(now + offset + dur);
            
            offset += 0.08;
        });
    }

    /* Sonido de victoria final  */
    playGameWin() {
        if (this.muted) return;
        this.init();

        const now = this.ctx.currentTime;
        const notes = [
            { f: 523.25, d: 0.15 }, // C5
            { f: 523.25, d: 0.15 },
            { f: 523.25, d: 0.15 },
            { f: 523.25, d: 0.4 },
            { f: 415.30, d: 0.4 }, // G#4
            { f: 466.16, d: 0.4 }, // A#4
            { f: 523.25, d: 0.8 }  // C5 (largo)
        ];

        let offset = 0;
        notes.forEach(note => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(note.f, now + offset);
            
            gain.gain.setValueAtTime(0.1, now + offset);
            gain.gain.exponentialRampToValueAtTime(0.001, now + offset + note.d);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(now + offset);
            osc.stop(now + offset + note.d);
            
            offset += note.d * 0.95;
        });
    }

    /* Sonido de Sirena */
    playFrightenedBeep() {
        if (this.muted) return;
        this.init();
        
        // Tocamos un bip disonante
        this.playTone(330, 'triangle', 0.15, 0.05);
        setTimeout(() => {
            this.playTone(220, 'triangle', 0.15, 0.05);
        }, 150);
    }
}

// Instanciar controlador global
const sound = new SoundController();
