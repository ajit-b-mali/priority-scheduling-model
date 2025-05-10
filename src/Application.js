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
        
        canvas.addEventListener("mousemove", (event) => {
            const tooltip = /** @type (HTMLDivElement) */ (document.getElementById("tooltip"));
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            let hoveredProcess = null;
            for (const p of Process.collection.values()) {
                if (x >= p.x && x <= p.x + Process.w && y >= p.y && y <= p.y + Process.h) {
                    this.ctx.canvas.style.cursor = "pointer";
                    hoveredProcess = p;
                    break;
                }
            }
            if (hoveredProcess) {
                tooltip.innerHTML = `
                    <h3>Pid: ${hoveredProcess.id}</h3>
                    <h3>Arrival Time: ${hoveredProcess.arrivalTime}</h3>
                    <h3>Burst Time: ${hoveredProcess.burstTime}</h3>
                    <h3>Priority: ${hoveredProcess.priority}</h3>
                    <h3>Remaining Burst Time: ${Math.round(hoveredProcess.remainingTime)}</h3>
                `;
                tooltip.style.left = `${event.clientX + 10}px`;
                tooltip.style.top = `${event.clientY + 10}px`;
                tooltip.style.display = "block";
            } else {
                this.ctx.canvas.style.cursor = "default";
                tooltip.style.display = "none";
            }
        });
        this.newQueuePos = {x: this.canvas.width * 0.1, y: 80};
        this.readyQueuePos = {x: this.canvas.width * 0.1, y: 220};
        this.terminateQueuePos = {x: this.canvas.width * 0.1, y: 350};
        this.cpuPos = {x: this.canvas.width * 0.75, y: 215};
    }

    clearProcesses() {
        Process.collection.clear();
        this.os.reset();
        this.state = "pause";
        Process.colorIndex = 0;
    }

    addProcess(event) {
        const addProcessForm = /** @type {HTMLFormElement} */ (document.getElementById('add-process-form'));
        if (!addProcessForm) return;
        event.preventDefault();

        const formData = new FormData(addProcessForm);
        const at = formData.get('at');
        const bt = formData.get('bt');
        const priority = formData.get('priority');

        if (Process.collection.size >= 10) {
            alert("Process limit reached");
            return;
        }
        if (at === "" || bt === "" || priority === "") {
            alert("Please fill all fields");
            return;
        }

        if (Number(at) < 0) {
            alert("Invalid arrival time");
            return;
        }
        if (Number(bt) < 1) {
            alert("invalid burst time");
            return;
        }
        if (Number(priority) < 0 || Number(priority) > 255) {
            alert("Invalid priority");
            return;
        }
        Process.add(Number(at), Number(bt), Number(priority));

        this.os.reset();
    }

    drawCPU({x, y}) {
        let padding = 10;
        this.ctx.fillStyle = "black";

        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "bottom";
        this.ctx.fillText("CPU", x + (Process.w + padding) / 2, y);

        this.ctx.strokeRect(x, y, Process.w + padding, Process.h + padding);
        this.ctx.fillStyle = "white";
        this.ctx.clearRect(x - 1, y + padding / 2, Process.w + padding + 2, Process.h);
        this.ctx.clearRect(x + padding / 2, y - 1, Process.w, Process.h + padding + 2);

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
        this.ctx.fillText("Current time: " + String(Math.floor(this.os.timer)), x, y + padding);
    }

    drawQueue(title, {x, y}) {
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
        this.ctx.lineTo(x + width + padding, y - padding);
        this.ctx.moveTo(x - padding * 2, y + Process.h + padding);
        this.ctx.lineTo(x + width + padding, y + Process.h + padding);
        this.ctx.closePath();
        this.ctx.stroke();
    }

    drawProcessQueue(queue, {x, y}) {
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
        for (let i = 0; i <= this.os.timer && this.os.timer < 60; i++) {
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
        this.updateSummaryTable();
        
        if (this.os.terminateQueue.length == Process.collection.size)
            this.state = "pause";
        
        if (this.state == "fast") {
            this.os.update(deltaTime * 4);
            Process.collection.forEach(p => p.update(deltaTime * 4));
            return;
        }
        if (this.state == "slow") {
            this.os.update(deltaTime / 3);
            Process.collection.forEach(p => p.update(deltaTime / 3));
            return;
        }
        if (this.state == "pause") {
            Process.collection.forEach(p => p.update(deltaTime));
            return;
        }
        if (this.state == "play")
        {
            Process.collection.forEach(p => p.update(deltaTime));
            this.os.update(deltaTime);
            return;
        }

    }

    draw() {
        this.drawTime(this.canvas.width / 2, 0);

        this.drawQueue("new queue", this.newQueuePos);
        this.drawProcessQueue(this.os.newQueue, this.newQueuePos);

        this.drawQueue("ready queue", this.readyQueuePos);
        this.drawProcessQueue(this.os.readyQueue.data(), this.readyQueuePos);

        this.drawQueue("terminate queue", this.terminateQueuePos);
        this.drawProcessQueue(this.os.terminateQueue, this.terminateQueuePos);

        this.drawCPU(this.cpuPos);

        this.drawGanttChart();

        Process.collection.forEach(p => p.draw(this.ctx));
    }
}