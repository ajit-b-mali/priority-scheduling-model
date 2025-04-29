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

        document.getElementById("play-simulation")?.addEventListener("click", _ => this.state = "play");
        document.getElementById("pause-simulation")?.addEventListener("click", _ => this.state = "pause");
        document.getElementById("fast-simulation")?.addEventListener("click", _ => this.state = "fast");
        document.getElementById("slow-simulation")?.addEventListener("click", _ => this.state = "slow");
        document.getElementById("add-process-form")?.addEventListener("submit", this.addProcess.bind(this));
        document.getElementById("clear-processes")?.addEventListener("click", this.clearProcesses.bind(this));
        document.getElementById("close-modal")?.addEventListener("click", _ => {
            document.getElementById('processModal')?.classList.remove('show');
        });
    }

    clearProcesses() {
        this.os.newQueue.length = 0;
        this.os.readyQueue.clear();
        this.os.terminateQueue.length = 0;
        Process.collection.clear();
        this.os.currentProcess = "";
    }

    addProcess(event) {
        const addProcessForm = /** @type {HTMLFormElement} */ (document.getElementById('add-process-form'));
        if (!addProcessForm) return;
        event.preventDefault();
        const formData = new FormData(addProcessForm);
        const at = formData.get('at');
        const bt = formData.get('bt');
        const priority = formData.get('priority');

        const newProcess = Process.add(at, bt, priority);
        this.os.newQueue.push(newProcess);
    }

    drawCPU(x, y) {
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

        if (this.os.currentProcess) {
            const p = Process.get(this.os.currentProcess);
            p.targetX = x + padding / 2;
            p.targetY = y + padding / 2;
        }
    }

    drawTime(x, y) {
        let padding = 10;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "top";
        this.ctx.fillText(String(Math.floor(this.os.timer)), x, y + padding);
    }

    drawQueue(title, x, y) {
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

    drawProcessQueue(queue, x, y) {
        let i = 1;
        for (const pid of queue) {
            const p = Process.get(pid);
            p.targetX = x + (Process.collection.size - i) * Process.w;
            p.targetY = y;
            p.draw(this.ctx);
            i++;
        }
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

    drawGanttChart(ganttChart, currentProcess, timer) {
        const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("gantt-canvas"));
        canvas.width = this.canvas.clientWidth;
        canvas.height = 100;
        canvas.style.border = "1px solid black";
        if (!canvas) throw new Error("Gantt chart canvas not found");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Browser doesn't support 2d rendering canvas");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
        const boxHeight = 50;
        const startX = 10;
        const startY = 10;
        const boxWidth = 40; // Width for fully completed 1 time unit (for finished processes)
        
        let x = startX;
        
        // Draw finished processes
        ganttChart.forEach(pid => {
            const p = Process.get(pid);
    
            const color = p ? p.color : "gray";
            ctx.fillStyle = color;
            ctx.fillRect(x, startY, boxWidth, boxHeight);
    
            ctx.strokeStyle = "black";
            ctx.strokeRect(x, startY, boxWidth, boxHeight);
    
            ctx.fillStyle = "black";
            ctx.font = "16px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(pid, x + boxWidth / 2, startY + boxHeight / 2);
    
            x += boxWidth;
        });
    
        // Draw currently executing process (smooth progress)
        if (currentProcess !== "") {
            const p = Process.get(currentProcess);
            if (p) {
                const elapsed = p.burstTime - p.remainingTime;
                const progress = elapsed / p.burstTime; // 0.0 to 1.0
                const progressWidth = progress * boxWidth;
    
                ctx.fillStyle = p.color;
                ctx.fillRect(x, startY, progressWidth, boxHeight);
    
                ctx.strokeStyle = "black";
                ctx.strokeRect(x, startY, boxWidth, boxHeight);
    
                ctx.fillStyle = "black";
                ctx.font = "16px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(currentProcess, x + boxWidth / 2, startY + boxHeight / 2);
            }
        }
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    update(deltaTime) {
        Process.collection.forEach(p => p.update(deltaTime));
        this.updateSummaryTable();
        
        if (this.os.terminateQueue.length == Process.collection.size)
            this.state = "pause";

        if (this.state == "fast") {
            this.os.update(deltaTime * 4);
        }
        if (this.state == "slow") {
            this.os.update(deltaTime / 3);
        }
        if (this.state == "pause") {
            return;
        }
        if (this.state == "play")
        {
            this.os.update(deltaTime);
        }

    }

    draw() {
        this.drawTime(this.canvas.width / 2, 0);
        
        this.drawQueue("new queue", 50, 80);
        this.drawProcessQueue(this.os.newQueue, 50, 80);
        
        this.drawQueue("ready queue", 200, 200);
        this.drawProcessQueue(this.os.readyQueue.data(), 200, 200);
        
        this.drawQueue("terminate queue", 700, 350);
        this.drawProcessQueue(this.os.terminateQueue, 700, 350);
        
        this.drawCPU(600, 200);

        this.drawGanttChart(this.os.ganttChart, this.os.currentProcess, this.os.timer);

        Process.collection.forEach(p => p.draw(this.ctx));
    }
}