class Ball {
    constructor(ctx, radius) {
        this.ctx = ctx
        this.radius = radius
    }

    draw(x,y) {
        const radius = this.radius
        const color = "#000000"
        const gradient = this.ctx.createRadialGradient(x - radius/3, y - radius/3, radius/100, x, y, radius)
        gradient.addColorStop(0, "#ffffff")
        gradient.addColorStop(0.1, "#ddd")
        gradient.addColorStop(0.3, "#777")
        gradient.addColorStop(0.6, color)
        this.ctx.beginPath()
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI)
        this.ctx.fillStyle = gradient
        this.ctx.strokeStyle = color
        this.ctx.fill()
        this.ctx.stroke()
    }
}

export default Ball
