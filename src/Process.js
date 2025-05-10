const colorPool = [
  "#FF0000", // Red
  "#00FF00", // Green
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#FFA500", // Orange
  "#800080", // Purple
  "#008000", // Dark Green
  "#cccccc"  // Black (for contrast or fallback)
];
// You can add more colors to this array as needed

export default class Process {
    static w = 40;
    static h = 40;
    static collection = new Map();
    static colorIndex = 0;

    static add(at, bt, priority) {
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
        this.state = "new";

        this.color = colorPool[Process.colorIndex++ % colorPool.length];
        this.x = 0;
        this.y = 0;

        this.targetX = 0;
        this.targetY = 0;
    }

    reset() {
        this.remainingTime = this.burstTime;
        this.completionTime = 0;
        this.state = "new";
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + 1, this.y + 1, Process.w - 2, Process.h - 2);

        ctx.fillStyle = "black";
        ctx.font = "18px courier bold";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.id, this.x + Process.w / 2, this.y + Process.h / 2);

        ctx.fillStyle = "white";
        ctx.fillRect(this.x + 2, this.y + 2, Process.w - 4, 5);
        ctx.fillStyle = "green";
        ctx.fillRect(this.x + 2, this.y + 2, (Process.w - 4) * (this.burstTime - this.remainingTime) / this.burstTime, 5);

        ctx.fillStyle = "black";
    }
 
    update(dt) {
        let speed = 200;
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
