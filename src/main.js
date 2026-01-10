import Board from "./components/board.js"
import Ball from "./components/ball.js"

export class Game {
    constructor(canvas) {
        this.canvas = canvas
        this.ctx = this.canvas.getContext("2d")
        const canvasRect = this.canvas.getBoundingClientRect()
        this.position = {x: canvasRect.left, y: canvasRect.top}
        this.board = new Board(this.canvas, this.ctx)
        this.is_dragged = false
        this.lastCords = null
        // this.canvas.addEventListener('click', (e) => this.clicked(e))
        this.canvas.addEventListener('mousedown', (e) => this.movedDown(e))
        this.canvas.addEventListener('mousemove', (e) => this.moved(e))
        this.canvas.addEventListener('mouseup', (e) => this.movedUp(e))
    }

    resetGame() {
        this.game_over = false;
        this.winer = false;
        this.board.reset();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.board.draw();
    }

    run() {
        this.resetGame()
    }

    endGame() {
        const balls = this.board.countBalls()
        this.winer = balls === 1;
        this.drawEndGame()
    }

    drawEndGame() {
        const balls = this.board.countBalls();
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // 1. Nakładamy półprzezroczystą maskę na całą planszę
        this.ctx.save();
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; // Przyciemnienie
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 2. Rysujemy stylowy baner pod tekst
        this.ctx.fillStyle = "rgba(44, 62, 80, 0.8)"; // Ciemny granat/szary
        this.ctx.fillRect(0, centerY - 70, this.canvas.width, 140);

        // Złota linia na górze i dole baneru
        this.ctx.strokeStyle = "#f1c40f";
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, centerY - 70);
        this.ctx.lineTo(this.canvas.width, centerY - 70);
        this.ctx.moveTo(0, centerY + 70);
        this.ctx.lineTo(this.canvas.width, centerY + 70);
        this.ctx.stroke();

        // 3. Konfiguracja tekstu
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";

        // Cień dla tekstu (efekt "neon" lub po prostu lepsza czytelność)
        this.ctx.shadowColor = "rgba(0, 0, 0, 1)";
        this.ctx.shadowBlur = 10;

        // Główny tytuł
        this.ctx.font = "bold 50px Arial";
        this.ctx.fillStyle = this.winer ? "#f1c40f" : "#ecf0f1"; // Złoty dla wygranej, biały dla reszty
        const title = this.winer ? "PERFEKCJA!" : "KONIEC GRY";
        this.ctx.fillText(title, centerX, centerY - 15);

        // Podtytuł z wynikiem
        this.ctx.shadowBlur = 5;
        this.ctx.font = "24px Arial";
        this.ctx.fillStyle = "#bdc3c7";
        let message = `Pozostało kulek: ${balls}`;
        if (balls === 1) message = "Została tylko jedna kulka! Brawo!";
        this.ctx.fillText(message, centerX, centerY + 35);

        this.ctx.restore();

        this.ctx.font = "bold 20px Arial";
        this.ctx.fillStyle = "#f1c40f";
        this.ctx.fillText("KLIKNIJ, ABY ZAGRAĆ PONOWNIE", centerX - 100, centerY + 100);

        // Flaga, żebyśmy wiedzieli, że gra się skończyła
        this.game_over = true;
    }

    movedDown(e) {
        if (this.game_over) {
            this.resetGame();
        }

        const relCords = this.relPosition(e.clientX, e.clientY)
        if (this.board.isDraggable(relCords.x, relCords.y)) {
            const cords = this.board.calcIndex(relCords.x, relCords.y)
            this.is_dragged = true
            this.lastCords = cords
            this.board.setHole(cords.x,cords.y)
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
            this.board.draw()
            this.drawMovedBall(relCords.x, relCords.y)
        }
    }

    moved(e) {
        if (!this.is_dragged) { return }

        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height)
        this.board.draw()
        const relCords = this.relPosition(e.clientX, e.clientY)
        this.drawMovedBall(relCords.x, relCords.y)
    }

    movedUp(e) {
        if (!this.is_dragged) { return }

        const relCords = this.relPosition(e.clientX, e.clientY)
        const cords = this.board.calcIndex(relCords.x, relCords.y)

        // OBLICZAMY DYSTANS
        const dx = cords ? cords.x - this.lastCords.x : 0;
        const dy = cords ? cords.y - this.lastCords.y : 0;

        // WARUNEK: Musi być dziura, inne pole, i DOKŁADNIE 2 pola odległości (pionowo lub poziomo)
        const isValidDistance = (Math.abs(dx) === 2 && dy === 0) || (Math.abs(dy) === 2 && dx === 0);

        if (cords && this.board.isHole(relCords.x, relCords.y) && isValidDistance) {

            const midX = cords.x - (dx / 2);
            const midY = cords.y - (dy / 2);

            // Dodatkowe sprawdzenie: czy przeskakujemy nad kulką (wartość 1)
            if (this.board.board[midX][midY] === 1) {
                this.board.setBall(cords.x, cords.y);
                this.board.setHole(midX, midY);
            } else {
                // Przeskok nad pustym polem - cofnij
                this.board.setBall(this.lastCords.x, this.lastCords.y);
            }

        } else {
            // Nie dziura, za daleko, na ukos lub to samo pole - cofnij
            this.board.setBall(this.lastCords.x, this.lastCords.y);
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.board.draw()
        this.is_dragged = false
        this.lastCords = null
        if(!this.board.hasDraggable()) this.endGame()
    }

    drawMovedBall(cx,cy) {
        // const ball = new Ball(this.ctx, this.board.radius)
        // ball.draw(cx, cy)

        this.ctx.save(); // Zapisujemy stan (czysty, bez cieni)

        // Resetujemy ewentualne cienie, które mogły zostać z rysowania tła
        this.ctx.shadowColor = "transparent";
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;

        // Rysujemy kulkę
        const ball = new Ball(this.ctx, this.board.radius);
        ball.draw(cx, cy);

        this.ctx.restore(); // Przywracamy stan sprzed rysowania kulki
    }

    relPosition(x, y) {
        return {x: Math.round(x - this.position.x), y: Math.round(y - this.position.y) }
    }
}
