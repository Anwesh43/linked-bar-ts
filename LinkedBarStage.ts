const w : number = window.innerWidth, h : number = window.innerHeight, BAR_NODES = 5
class LinkedBarStage {

    canvas : HTMLCanvasElement = document.createElement('canvas')

    context : CanvasRenderingContext2D

    linkedBar : LinkedBar = new LinkedBar()

    animator : Animator = new Animator()

    constructor() {
        this.initCanvas()
    }

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
        this.linkedBar.draw(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.linkedBar.startUpdating(() => {
                this.animator.start(() => {
                    this.render()
                    this.linkedBar.update(() => {
                        this.animator.stop()
                    })
                })
            })
        }
    }

    static init() {
        const stage : LinkedBarStage = new LinkedBarStage()
        stage.render()
        stage.handleTap()
    }
}

class State {

    prevScale : number = 0

    dir : number = 0

    j : number = 0

    scales : Array<number> = [0, 0, 0]

    update(stopcb : Function) {
        this.scales[this.j] += this.dir * 0.1
        if (Math.abs(this.scales[this.j] - this.prevScale) > 1) {
            this.scales[this.j] = this.prevScale + this.dir
            this.j += this.dir
            if (this.j == this.scales.length || this.j == -1) {
                this.j -= this.dir
                this.dir = 0
                this.prevScale = this.scales[this.j]
                stopcb()
            }
        }
    }

    startUpdating(startcb) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            startcb()
        }
    }
}

class Animator {
    animated : boolean = false
    interval : number

    start(updatecb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(() => {
                updatecb()
            }, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class BarNode {

    state : State = new State()

    next : BarNode

    prev : BarNode

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < BAR_NODES - 1) {
            this.next = new BarNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        const gap : number = w / BAR_NODES, h_gap = h / 10
        context.save()
        context.translate(gap * this.i, h/2)
        context.fillStyle = '#2ecc71'
        context.fillRect((gap / 2) * this.state.scales[1], -h_gap/2, (gap / 2) * this.state.scales[0] - (gap / 2) * this.state.scales[1], h_gap)
        context.fillStyle = '#e74c3c'
        context.fillRect(gap/2 + (gap / 2) * this.state.scales[2], -h_gap/2, (gap / 2) * this.state.scales[1] - (gap / 2) * this.state.scales[2], h_gap)
        context.restore()
    }

    update(stopcb : Function) {
        this.state.update(stopcb)
    }

    startUpdating(startcb : Function) {
        this.state.startUpdating(startcb)
    }

    getNext(dir : number, cb : Function) {
        var curr : BarNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class LinkedBar {

    curr : BarNode = new BarNode(0)

    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(stopcb) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            stopcb()
        })
    }

    startUpdating(startcb : Function) {
        this.curr.startUpdating(startcb)
    }
}
