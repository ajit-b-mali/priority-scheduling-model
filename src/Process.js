/**
 * @param {number} t
 * @param {{ x: number; y: number; }} p0
 * @param {{ x: number; y: number; }} p1
 * @param {{ x: number; y: number; }} p2
 * @param {{ x: number; y: number; }} p3
 * @param {number} sharpness
 * 
 * @returns {{x: number, y: number}} point
 */
function getSharpCubicBezierPoint(t, p0, p1, p2, p3, sharpness = 0.5) {
    const interpolate = (a, b, factor) => ({
        x: a.x + (b.x - a.x) * factor,
        y: a.y + (b.y - a.y) * factor,
    });

    // Move control points closer to anchors
    const p1Sharp = interpolate(p0, p1, sharpness);
    const p2Sharp = interpolate(p3, p2, sharpness);

    t = t * t * (3 - 2 * t);

    let a = (1 - t) ** 3;
    let b = 3 * (1 - t) ** 2 * t;
    let c = 3 * (1 - t) * t ** 2;
    let d = t ** 3;

    const x = a * p0.x + b * p1Sharp.x + c * p2Sharp.x + d * p3.x;
    const y = a * p0.y + b * p1Sharp.y + c * p2Sharp.y + d * p3.y;

    return { x, y };
}

export default class Process {
    static w = 40;
    static h = 40;
    static collection = new Map();

    static add(at, bt, priority) {
        if (Process.collection.size >= 10) {
            throw new Error("Process limit reached");
        }
        const p = new Process(at, bt, priority);
        Process.collection.set(p.id, p);
        return p.id;
    }

    /**
     * @param {string} id
     * @returns {Process} process
     */
    static get(id) {
        return Process.collection.get(id);
    }

    static resetAll() {
        for (const p of Process.collection.values()) {
            p.reset();
        }
    }

    /**
     * @param {number} at 
     * @param {number} bt 
     * @param {number} priority
     */
    constructor(at, bt, priority) {
        this.id = "P" + (Process.collection.size + 1);
        this.arrivalTime = at;
        this.burstTime = bt;
        this.priority = priority;
        this.remainingTime = bt;
        this.completionTime = 0;
        this.state = ""; // new, ready, run, terminate
        this.nextState = "new";

        this.color = `hsl(${Math.floor(Math.random() * 256)}, 100%, 50%)`
        this.x = 0;
        this.y = 0;

        this.t = 1;
        this.p0 = { x: 0, y: 0 };
        this.p1 = { x: 0, y: 0 };
        this.p2 = { x: 0, y: 0 };
        this.p3 = { x: 0, y: 0 };
    }

    move(start, c0, c1, end) {
        this.p0 = start;
        this.p1 = c0;
        this.p2 = c1;
        this.p3 = end;

        this.t = 0;
    }

    reset() {
        this.remainingTime = this.burstTime;
        this.completionTime = 0;
        this.state = "";
        this.nextState = "new";
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        const { x, y } = getSharpCubicBezierPoint(this.t, this.p0, this.p1, this.p2, this.p3, 3);
        this.x = x;
        this.y = y;

        // this.x and this.y will get here
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + 1, this.y + 1, Process.w - 2, Process.h - 2);

        ctx.fillStyle = "black";
        ctx.font = "24px courier bold";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.id, this.x + Process.w / 2, this.y + Process.h / 2);

        ctx.fillStyle = "black";
    }
 
    update(dt) {
        this.t += 1.1 * dt;
        if (this.t >= 1)
        {
            this.p0 = {x: this.p3.x, y: this.p3.y};
            this.p1 = {x: this.p3.x, y: this.p3.y};
            this.p2 = {x: this.p3.x, y: this.p3.y};
            this.p3 = {x: this.p3.x, y: this.p3.y};
            this.t = 1;
        }
    }

    get turnaroundTime() {
        let result = this.completionTime - this.arrivalTime;
        if (result < 0) result = 0;
        return result;
    }

    get waitTime() {
        let result = this.turnaroundTime - this.burstTime;
        if (result < 0) result = 0;
        return result;
    }
}
