import Ball from './ball.js'
import Hole from "./hole.js"

class Board {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;

        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = canvas.width;
        this.offscreenCanvas.height = canvas.height;
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');
        this.boardGenerated = false; // Flaga, czy deska jest już narysowana

        // Liczymy promień kulki tak, aby 9 pól + odstępy (2.1 * radius)
        // zmieściło się w 70% szerokości canvasu.
        // Wzór: (9 * 2.1 * r) = canvas.width * 0.7
        this.radius = Math.round((this.canvas.width * 0.7) / 18);

        this.reset()
    }

    countBalls() {
        let counter = 0
        for(let x= 0; x < 9; x++ ) {
            for(let y = 0; y < 9; y++) {
                if (this.board[x][y] === 1) {
                    counter += 1
                }
            }
        }
        return counter
    }

    draw(){
        this.drawBoard()
        for(let x= 0; x < 9; x++ ) {
            for(let y = 0; y < 9; y++) {
                if (this.board[x][y] === 0) {
                    this.drawHole(x, y)
                } else if (this.board[x][y] === 1) {
                    this.drawBall(x, y)
                } else {
                    // do nothing
                }
            }
        }
    }

    drawBoard() {
        // Jeśli deska już jest w pamięci, po prostu ją wklejamy i kończymy
        if (this.boardGenerated) {
            this.ctx.drawImage(this.offscreenCanvas, 0, 0);
            return;
        }

        const centerX = this.offscreenCanvas.width / 2;
        const centerY = this.offscreenCanvas.height / 2;
        const playAreaRadius = (4.5 * this.radius * 2.2);
        const gutterWidth = this.radius * 2.2;
        const totalBoardRadius = playAreaRadius + (gutterWidth * 0.8);

        // Rysujemy na offscreenCtx (logika pozostaje Twoja)
        const octx = this.offscreenCtx;

        // 1. CIEŃ CAŁEJ PLANSZY
        octx.save();
        octx.shadowColor = "rgba(0, 0, 0, 0.5)";
        octx.shadowBlur = 25;
        octx.shadowOffsetY = 12;

        octx.beginPath();
        octx.arc(centerX, centerY, totalBoardRadius, 0, Math.PI * 2);
        octx.fillStyle = "#3e2723"; // Bardzo ciemna baza
        octx.fill();
        octx.restore();

        // 2. ROWEK (GUTTER) - Bardziej wklęsły
        const gutterGrad = octx.createRadialGradient(
          centerX, centerY, playAreaRadius - 5,
          centerX, centerY, totalBoardRadius
        );
        gutterGrad.addColorStop(0, "#2b1b17"); // Ciemne przejście z tarczy
        gutterGrad.addColorStop(0.2, "#1a0f0d"); // Dno rowka
        gutterGrad.addColorStop(1, "#5d4037"); // Krawędź zewnętrzna

        octx.beginPath();
        octx.arc(centerX, centerY, playAreaRadius + (gutterWidth * 0.3), 0, Math.PI * 2);
        octx.strokeStyle = gutterGrad;
        octx.lineWidth = gutterWidth;
        octx.stroke();

        // 3. GŁÓWNA TARCZA DREWNIANA
        const woodGrad = octx.createRadialGradient(
          centerX - playAreaRadius * 0.2, centerY - playAreaRadius * 0.2, this.radius,
          centerX, centerY, playAreaRadius
        );
        woodGrad.addColorStop(0, "#8d6e63"); // Oświetlenie
        woodGrad.addColorStop(0.8, "#5d4037"); // Naturalne drewno
        woodGrad.addColorStop(1, "#3e2723"); // Cień przy krawędzi (frez)

        octx.beginPath();
        octx.arc(centerX, centerY, playAreaRadius, 0, Math.PI * 2);
        octx.fillStyle = woodGrad;
        octx.fill();

        // 4. WYKOŃCZENIE - BŁYSK NA KRAWĘDZI (RANT)
        octx.beginPath();
        octx.arc(centerX, centerY, playAreaRadius, 0, Math.PI * 2);
        octx.strokeStyle = "rgba(255, 255, 255, 0.12)";
        octx.lineWidth = 1.5;
        octx.stroke();

        this.boardGenerated = true;

        this.ctx.drawImage(this.offscreenCanvas, 0, 0);
    }

    drawBall(x,y) {
        if (this.board[x][y] !== 1) return
        const cords = this.calcCords(x,y)
        if (cords === null) return

        const ball = new Ball(this.ctx, this.radius)
        ball.draw(cords.x, cords.y)
    }

    drawHole(x,y) {
        if (this.board[x][y] !== 0) return
        const cords = this.calcCords(x,y)
        if (cords === null) return

        const hole = new Hole(this.ctx, this.radius)
        hole.draw(cords.x, cords.y)
    }

    calcCords(x, y) {
        const el = this.board[x][y];
        if (el === -1) return null;

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Odległość między środkami kulek
        const spacing = this.radius * 2.1;

        return {
            x: centerX + (x - 4) * spacing,
            y: centerY + (y - 4) * spacing
        };
    }

    calcIndex(cx, cy) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const spacing = this.radius * 2.1;

        const x = Math.round((cx - centerX) / spacing + 4);
        const y = Math.round((cy - centerY) / spacing + 4);

        if (x >= 0 && x <= 8 && y >= 0 && y <= 8) {
            if (this.board[x][y] > -1) {
                return { x: x, y: y };
            }
        }
        return null;
    }

    hasDraggable(){
        for(let x= 0; x < 9; x++ ) {
            for(let y = 0; y < 9; y++) {
                if (this.board[x][y] === 1) {
                    const cCords = this.calcCords(x, y)
                    if (this.isDraggable(cCords.x, cCords.y)) {
                        return true
                    }
                }
            }
        }
        return false
    }

    isDraggable(cx, cy) {
        const cords = this.calcIndex(cx, cy)
        if (cords && this.board[cords.x][cords.y] === 1) {
            // Poziomo (X)
            if((cords.x + 2) < 9  && this.board[cords.x + 2][cords.y] === 0 && this.board[cords.x + 1][cords.y] === 1) return true
            if((cords.x - 2) >= 0 && this.board[cords.x - 2][cords.y] === 0 && this.board[cords.x - 1][cords.y] === 1) return true

            // Pionowo (Y)
            if((cords.y + 2) < 9  && this.board[cords.x][cords.y + 2] === 0 && this.board[cords.x][cords.y + 1] === 1) return true
            if((cords.y - 2) >= 0 && this.board[cords.x][cords.y - 2] === 0 && this.board[cords.x][cords.y - 1] === 1) return true
        }
        return false
    }

    isHole(cx,cy) {
        const cords = this.calcIndex(cx, cy)
        return cords && this.board[cords.x][cords.y] === 0;
    }

    setHole(x, y) {
        this.board[x][y] = 0
    }

    setBall(x, y) {
        const cCords = this.calcCords(x, y)
        if (this.isHole(cCords.x, cCords.y))  this.board[x][y] = 1
    }

    reset() {
        this.board = [
            [-1,-1,-1,1,1,1,-1,-1,-1],
            [-1,-1,-1,1,1,1,-1,-1,-1],
            [-1,-1,-1,1,1,1,-1,-1,-1],
            [1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1],
            [-1,-1,-1,1,1,1,-1,-1,-1],
            [-1,-1,-1,1,1,1,-1,-1,-1],
            [-1,-1,-1,1,1,1,-1,-1,-1]
        ];
        let done = false;
        while (!done) {
            const x = Math.floor(Math.random() * 9);
            const y = Math.floor(Math.random() * 9);

            if (this.board[x][y] === 1) {
                this.board[x][y] = 0;
                done = true;
            }
        }
    }
}

export default Board
