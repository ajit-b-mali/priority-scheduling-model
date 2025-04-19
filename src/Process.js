export default class Process {
    static #index = 1;
    static w = 40;
    static h = 40;
    static collection = new Map();

    static add(at, bt) {
        const p = new Process(at, bt);
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

    /**
     * @param {number} at 
     * @param {number} bt 
     */
    constructor(at, bt) {
        this.id = "P" + Process.#index++;
        this.arrivalTime = at;
        this.burstTime = bt;
        this.remainingTime = bt;
        this.completionTime = 0;

        this.color = `hsl(${Math.floor(Math.random() * 256)}, 100%, 50%)`
        this.x = 0;
        this.y = 0;

        this.targetX = 0;
        this.targetY = 0;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
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
        let speed = 100;
        for (const p of Process.collection.values()) {
            if (p.x !== p.targetX) {
                const dx = p.targetX - p.x;
                p.x += Math.sign(dx) * Math.min(Math.abs(dx), speed * dt);
            }
            if (p.y !== p.targetY) {
                const dy = p.targetY - p.y;
                p.y += Math.sign(dy) * Math.min(Math.abs(dy), speed * dt);
            }

            if (Math.abs(p.x - p.targetX) < 1) p.x = p.targetX;
            if (Math.abs(p.y - p.targetY) < 1) p.y = p.targetY;
        }
    }

    get turnaroundTime() {
        return this.completionTime - this.arrivalTime;
    }

    get waitTime() {
        return this.turnaroundTime - this.burstTime;
    }
}
