class Hole {
    constructor(ctx, radius) {
        this.ctx = ctx
        this.radius = radius
    }

    draw(x,y) {
        const radius = this.radius
        const color = "#555"
        const gradient = this.ctx.createRadialGradient(x + radius/4, y + radius/4, radius / 4, x, y, radius)
        gradient.addColorStop(0, "#999")
        gradient.addColorStop(0.8, color)
        this.ctx.beginPath()
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI)
        this.ctx.fillStyle = gradient
        this.ctx.strokeStyle = color
        this.ctx.fill()
        this.ctx.stroke()
    }
}

export default Hole