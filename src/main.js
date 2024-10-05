import Board from "./components/board.js"
import Ball from "./components/ball.js"
import Hole from "./components/hole.js"

class Game {
    constructor() {
        this.canvas = document.querySelector('canvas')
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

    run() {
        this.board.draw()
    }

    endGame() {
        const balls = this.board.countBalls()
        if(balls === 1) {
            this.winer = true
        } else {
            this.winer = false
        }
        this.drawEndGame()
    }

    drawEndGame() {
        if (this.winer) {
            console.log('You win!')
        }  else {
            console.log('You lost!')
        }
    }

    movedDown(e) {
        const relCords = this.relPosition(e.clientX, e.clientY)
        if (this.board.isDraggable(relCords.x, relCords.y)) {
            const cords = this.board.calcIndex(relCords.x, relCords.y)
            this.is_dragged = true
            this.lastCords = cords
            this.board.setHole(cords.x,cords.y)
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
        if (this.board.isHole(relCords.x, relCords.y) && (cords.x !== this.lastCords.x || cords.y !== this.lastCords.y)) {
            this.board.setBall(cords.x,cords.y)
            const dx = cords.x - this.lastCords.x
            const dy = cords.y - this.lastCords.y
            this.board.setHole(cords.x - (dx / 2), cords.y - (dy / 2))
        } else {
            this.board.setBall(this.lastCords.x,this.lastCords.y)
        }
        this.board.draw()
        this.is_dragged = false
        this.lastCords = null
        if(!this.board.hasDraggable()) this.endGame()
    }

    drawMovedBall(cx,cy) {
        const ball = new Ball(this.ctx, this.board.radius)
        ball.draw(cx, cy)
    }

    relPosition(x, y) {
        return {x: Math.round(x - this.position.x), y: Math.round(y - this.position.y) }
    }
}

(() => {
    window.game = new Game()
    game.run()
})()
