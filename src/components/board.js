import Ball from './ball.js'
import Hole from "./hole.js"

class Board {
    constructor(canvas, ctx) {
        this.canvas = canvas
        this.ctx = ctx
        this.margin = 20
        const canvasRect = this.canvas.getBoundingClientRect()
        this.radius = Math.round((canvasRect.width - 34 - (this.margin * 2)) / 18)
        // this.position = {x: canvasRect.left, y: canvasRect.top}
        this.board = [
            [-1,-1,-1,0,1,1,-1,-1,-1],
            [-1,-1,-1,1,1,1,-1,-1,-1],
            [-1,-1,-1,1,1,1,-1,-1,-1],
            [1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1],
            [-1,-1,-1,1,1,1,-1,-1,-1],
            [-1,-1,-1,1,1,1,-1,-1,-1],
            [-1,-1,-1,1,1,1,-1,-1,-1]
        ]
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
        const radius = this.canvas.width / 2 - (this.margin / 2)
        const x = this.canvas.width / 2
        const y = this.canvas.height / 2
        const color = "#999"
        this.ctx.beginPath()
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI)
        this.ctx.fillStyle = color
        this.ctx.strokeStyle = color
        this.ctx.fill()
        this.ctx.stroke()
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

    calcCords(x,y) {
        const el = this.board[x][y]
        if(el === -1) return null

        const start = this.radius + 5 + this.margin
        return {x: start + (x * this.radius * 2.1), y: start + (y * this.radius * 2.1)}
    }

    calcIndex(cx, cy) {
        const start = this.radius + 5
        const x = Math.floor((cx - start)/(this.radius * 2.1))
        const y = Math.floor((cy - start)/(this.radius * 2.1))
        // const x = Math.round((cx - this.position.x - start)/(this.radius * 2.1))
        // const y = Math.round((cy - this.position.y - start)/(this.radius * 2.1))
        if (x >= 0 && x <= 8 && y >= 0 && y <= 8) {
            if (this.board[x][y] > -1) {
                return {x: x, y: y}
            }
        }
        return null
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
            if((cords.x + 2) < 9  && this.board[cords.x + 2][cords.y] === 0 && this.board[cords.x + 1][cords.y] === 1) return true
            if((cords.x - 2) >= 0 && this.board[cords.x - 2][cords.y] === 0 && this.board[cords.x - 1][cords.y] === 1) return true
            if((cords.y + 2) >= 0 && this.board[cords.x][cords.y + 2] === 0 && this.board[cords.x][cords.y + 1] === 1) return true
            if((cords.y - 2) >= 0 && this.board[cords.x][cords.y - 2] === 0 && this.board[cords.x][cords.y - 1] === 1) return true
        } else {
            return false
        }
    }

    isHole(cx,cy) {
        const cords = this.calcIndex(cx, cy)
        if (cords && this.board[cords.x][cords.y] === 0) return true
        return false
    }

    setHole(x, y) {
        this.board[x][y] = 0
    }

    setBall(x, y) {
        const cCords = this.calcCords(x, y)
        if (this.isHole(cCords.x, cCords.y))  this.board[x][y] = 1
    }
}

export default Board
