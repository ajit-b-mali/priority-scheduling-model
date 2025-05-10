import OperatingSystem from "./OperatingSystem.js";
import Process from "./Process.js";

export default class Application {
    /**
     * @param {HTMLCanvasElement} canvas
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        if (!this.ctx) throw new Error("Browser doesn't support 2d rendering canvas");
        this.ctx.font = "24px courier bold";

        this.os = new OperatingSystem();
        window.addEventListener("resize", () => {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
        });
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        this.state = "pause";
        document.getElementById("play-simulation")?.addEventListener("click", _ => this.state = "play");
        document.getElementById("pause-simulation")?.addEventListener("click", _ => this.state = "pause");
        document.getElementById("fast-simulation")?.addEventListener("click", _ => this.state = "fast");
        document.getElementById("slow-simulation")?.addEventListener("click", _ => this.state = "slow");
        document.getElementById("reset-simulation")?.addEventListener("click", _ => this.os.reset());
        document.getElementById("add-process-form")?.addEventListener("submit", this.addProcess.bind(this));
        document.getElementById("clear-processes")?.addEventListener("click", this.clearProcesses.bind(this));
        document.getElementById("close-modal")?.addEventListener("click", _ => {
            document.getElementById('processModal')?.classList.remove('show');
        });
        
        canvas.addEventListener("click", (event) => {
            console.log(this.os.ganttChart)
        });

        this.newQueuePos = {x: 50, y: 80};
        this.readyQueuePos = {x: 50, y: 200};
        this.terminateQueuePos = {x: 50, y: 350};
        this.cpuPos = {x: 400, y: 200};
    }

    getPath(from, to, pid)
    {
        let p0 = {x: 0, y: 0};
        let p1 = {x: 0, y: 0};
        let p2 = {x: 0, y: 0};
        let p3 = {x: 0, y: 0};

        let queueWidth = Process.collection.size * Process.w;
        if (queueWidth < Process.w * 3)
            queueWidth = Process.w * 3;

        if (from == "" && to == "new") {
            let i = this.os.newQueue.indexOf(pid);
            let endX = this.newQueuePos.x + (Process.collection.size - i) * Process.w - Process.w;
            p0 = {x: 0, y: 0};
            p1 = {x: 0, y: 0};
            p2 = {x: this.newQueuePos.x - 100, y: this.newQueuePos.y};
            p3 = {x: endX, y: this.newQueuePos.y};
        } else if (from == "new" && to == "run") {
            let startX = this.newQueuePos.x + queueWidth - Process.w;
            let endX = this.cpuPos.x;

            p0 = {x: startX, y: this.newQueuePos.y};
            p1 = {x: startX + 100, y: this.newQueuePos.y};
            p2 = {x: endX + 5, y: this.cpuPos.y + 5};
            p3 = {x: endX + 5, y: this.cpuPos.y + 5};
        } else if (from == "new" && to == "ready") {
            let startX = this.newQueuePos.x + queueWidth - Process.w;
            let i = this.os.readyQueue.data().indexOf(pid);
            let endX = this.readyQueuePos.x + (Process.collection.size - i) * Process.w - Process.w;

            p0 = {x: startX, y: this.newQueuePos.y};
            p1 = {x: startX + 100, y: this.newQueuePos.y};
            p2 = {x: this.readyQueuePos.x - 100, y: this.readyQueuePos.y};
            p3 = {x: endX, y: this.readyQueuePos.y};
        } else if (from == "ready" && to == "run") {
            let startX = this.readyQueuePos.x + queueWidth - Process.w;
            let endX = this.cpuPos.x;

            p0 = {x: startX, y: this.readyQueuePos.y};
            p1 = {x: startX + 100, y: this.readyQueuePos.y};
            p2 = {x: endX + 5, y: this.cpuPos.y + 5};
            p3 = {x: endX + 5, y: this.cpuPos.y + 5};
        } else if (from == "run" && to == "ready") {
            let i = this.os.readyQueue.data().indexOf(pid);
            let endX = this.readyQueuePos.x + (Process.collection.size - i) * Process.w - Process.w;

            p0 = {x: this.cpuPos.x + 5, y: this.cpuPos.y + 5};
            p1 = {x: this.cpuPos.x + 5, y: this.cpuPos.y + 5};
            p2 = {x: this.readyQueuePos.x - 100, y: this.readyQueuePos.y};
            p3 = {x: endX, y: this.readyQueuePos.y};
        } else if (from == "run" && to == "terminate") {
            let i = this.os.terminateQueue.indexOf(pid);
            let endX = this.terminateQueuePos.x + (Process.collection.size - i) * Process.w - Process.w;
            p0 = {x: this.cpuPos.x + 5, y: this.cpuPos.y + 5};
            p1 = {x: this.cpuPos.x + 5, y: this.cpuPos.y + 5};
            p2 = {x: this.terminateQueuePos.x - 100, y: this.terminateQueuePos.y};
            p3 = {x: endX, y: this.terminateQueuePos.y};
        }

        return [p0, p1, p2, p3];
    }

    clearProcesses() {
        Process.collection.clear();
        this.os.reset();
        this.state = "pause";
    }

    addProcess(event) {
        const addProcessForm = /** @type {HTMLFormElement} */ (document.getElementById('add-process-form'));
        if (!addProcessForm) return;
        event.preventDefault();

        const formData = new FormData(addProcessForm);
        const at = formData.get('at');
        const bt = formData.get('bt');
        const priority = formData.get('priority');

        if(Process.collection.size >= 10) {
            alert("Process limit reached");
            return;
        }

        Process.add(Number(at), Number(bt), Number(priority));

        this.os.reset();
    }

    drawCPU() {
        const {x, y} = this.cpuPos;
        let padding = 10;
        this.ctx.fillStyle = "black";

        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "bottom";
        this.ctx.fillText("CPU", x + (Process.w + padding) / 2, y);

        this.ctx.strokeRect(x, y, Process.w + padding, Process.h + padding);
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(x - 1, y + padding / 2, Process.w + padding + 2, Process.h);
        this.ctx.fillRect(x + padding / 2, y - 1, Process.w, Process.h + padding + 2);

        this.ctx.fillStyle = "black";

        // if (this.os.currentProcess) {
        //     const p = Process.get(this.os.currentProcess);
        //     p.targetX = x + padding / 2;
        //     p.targetY = y + padding / 2;
        // }
    }

    drawTime(x, y) {
        let padding = 10;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "top";
        this.ctx.fillText("Current Time: " + String(Math.floor(this.os.timer)), x, y + padding);
    }

    drawQueue(title, { x, y }) {
        const padding = 5;

        let width = Process.collection.size * Process.w;
        if (width <= Process.w * 3)
            width = Process.w * 3;
        
        this.ctx.font = "16px Arial";
        this.ctx.fillStyle = "black";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "bottom";
        this.ctx.fillText(title, x + width / 2, y - padding);
        

        this.ctx.beginPath();
        this.ctx.moveTo(x - padding * 2, y - padding);
        this.ctx.lineTo(x + width, y - padding);
        this.ctx.moveTo(x - padding * 2, y + Process.h + padding);
        this.ctx.lineTo(x + width, y + Process.h + padding);
        this.ctx.closePath();
        this.ctx.stroke();
    }

    updateSummaryTable() {
        const table = /** @type {HTMLTableElement | null} */ (document.querySelector('.summary-table table'));
        if (!table) return;

        // Clear existing rows except the header
        const rows = table.querySelectorAll('tr:not(:first-child)');
        rows.forEach(row => row.remove());

        // Populate table with process data
        for (const process of Process.collection.values()) {
            const row = table.insertRow();
            row.insertCell().textContent = process.id;
            row.insertCell().textContent = process.arrivalTime;
            row.insertCell().textContent = process.burstTime;
            row.insertCell().textContent = process.priority;
            row.insertCell().textContent = process.completionTime;
            row.insertCell().textContent = process.waitTime;
            row.insertCell().textContent = process.turnaroundTime;
        }
    }

    drawGanttChart() {
        const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("gantt-canvas"));
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext("2d"));

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "black";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height * 0.3);
        ctx.lineTo(canvas.width, canvas.height * 0.3);
        ctx.closePath();
        ctx.stroke();
        
        const inlinePadding = 20;
        let processUnitWidth = (canvas.width - inlinePadding * 2) / this.os.timer;
        for (let i = 0; i <= this.os.timer; i++) {
            let x = i * processUnitWidth + inlinePadding;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "16px arial bold";
            ctx.fillText(i.toFixed(), x, canvas.height * 0.8);
        }

        this.os.ganttChart.forEach(({pid, startTime, endTime}) => {
            if (pid != "") {
                const process = Process.get(pid);
                ctx.fillStyle = process.color;
            } else {
                ctx.fillStyle = "gray";
            }
            let x = startTime * processUnitWidth + inlinePadding;
            let y = 0;
            let w = (endTime - startTime) * processUnitWidth;
            let h = canvas.height * 0.6;
            ctx.fillRect(x, y, w, h);
        });
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    update(deltaTime) {
        Process.collection.forEach(p => p.update(deltaTime));
        this.updateSummaryTable();

        for (const p of Process.collection.values()) {
            if (p.nextState != p.state) {
                const [p0, p1, p2, p3] = this.getPath(p.state, p.nextState, p.id);
                p.state = p.nextState;
                p.move(p0, p1, p2, p3);
            }
        }

        if (this.os.terminateQueue.length == Process.collection.size)
            this.state = "pause";

        if (this.state == "pause") {
            return;
        } else if (this.state == "fast") {
            this.os.update(deltaTime * 4);
        } else if (this.state == "slow") {
            this.os.update(deltaTime / 3);
        } else if (this.state == "play")
        {
            this.os.update(deltaTime);
        }
    }

    draw() {
        this.drawTime(this.canvas.width / 2, 0);
        
        this.drawQueue("new queue", this.newQueuePos);
        this.drawQueue("ready queue", this.readyQueuePos);
        this.drawQueue("terminate queue", this.terminateQueuePos);
        this.drawCPU();
        this.drawGanttChart();

        // Process.collection.forEach(p => p.draw(this.ctx));
        for (const process of Process.collection.values()) {
            process.draw(this.ctx);
        }
    }
}