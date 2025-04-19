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

        this.state = "pause";
        this.canvas.addEventListener("click", () => {
            if (this.state == "pause")
                this.state = "play";
            else
                this.state = "pause";
        });

        document.getElementById("get-summary")?.addEventListener("click", (event) => {
            this.os.printSummary();
        });
    }

    update(deltaTime) {
        if (this.state == "play")
            this.os.update(deltaTime);

        Process.collection.forEach(p => p.update(deltaTime));
    }

    drawNewQueue() {
        let x = 50;
        let y = 80;
        let padding = 5;
        
        // draw title
        this.ctx.fillStyle = "black";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "bottom";
        this.ctx.fillText("new queue", x + (Process.collection.size * Process.w) / 2, y - padding);

        // draw border
        this.ctx.beginPath(); 
        this.ctx.moveTo(x - padding * 2, y - padding);
        this.ctx.lineTo(x + Process.collection.size * Process.w + padding * 2, y - padding);
        this.ctx.moveTo(x - padding * 2, y + Process.h + padding);
        this.ctx.lineTo(x + Process.collection.size * Process.w + padding * 2, y + Process.h + padding);
        this.ctx.closePath();
        this.ctx.stroke();
    }

    drawProcess() {
        let x = 50;
        let y = 80;
        let i = 1;
        for (const pid of this.os.newQueue) {
            const p = Process.get(pid);
            p.targetX = x + (Process.collection.size - i) * Process.w;
            p.targetY = y;
            p.draw(this.ctx);
            i++;
        }

        y = 180;
        i = 1;
        for (const pid of this.os.readyQueue.data()) {
            const p = Process.get(pid);
            p.targetX = x + (Process.collection.size - i) * Process.w;
            p.targetY = y;
            p.draw(this.ctx);
            i++;
        }

        y = 280
        i = 1;
        for (const pid of this.os.terminateQueue) {
            const p = Process.get(pid);
            p.targetX = x + (Process.collection.size - i) * Process.w;
            p.targetY = y;
            p.draw(this.ctx);
            i++;
        }
        
        x = 550;
        y = 50;
        let padding = 10;
        if (this.os.currentProcess) {
            const p = Process.get(this.os.currentProcess);
            p.targetX = x + padding / 2;
            p.targetY = y + padding / 2;
        }

        Process.collection.forEach(p => p.draw(this.ctx));
    }

    drawReadyQueue() {
        let x = 50;
        let y = 180;
        let padding = 5;
        
        // draw title
        this.ctx.fillStyle = "black";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "bottom";
        this.ctx.fillText("ready queue", x + (Process.collection.size * Process.w) / 2, y - padding);

        // draw border
        this.ctx.beginPath();
        this.ctx.moveTo(x - padding * 2, y - padding);
        this.ctx.lineTo(x + Process.collection.size * Process.w + padding * 2, y - padding);
        this.ctx.moveTo(x - padding * 2, y + Process.h + padding);
        this.ctx.lineTo(x + Process.collection.size * Process.w + padding * 2, y + Process.h + padding);
        this.ctx.closePath();
        this.ctx.stroke();
    }

    drawCPU() {
        let x = 550;
        let y = 50;
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
    }

    drawTerminateQueue() {
        let x = 50;
        let y = 280;
        let padding = 5;

        // draw title
        this.ctx.fillStyle = "black";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "bottom";
        this.ctx.fillText("terminate queue", x + (Process.collection.size * Process.w) / 2, y - padding);

        // draw border
        this.ctx.beginPath();
        this.ctx.moveTo(x - padding * 2, y - padding);
        this.ctx.lineTo(x + Process.collection.size * Process.w + padding * 2, y - padding);
        this.ctx.moveTo(x - padding * 2, y + Process.h + padding);
        this.ctx.lineTo(x + Process.collection.size * Process.w + padding * 2, y + Process.h + padding);
        this.ctx.closePath();
        this.ctx.stroke();
    }

    drawTime() {
        let x = this.canvas.width / 2;
        let y = 0;
        let padding = 10;

        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "top";
        this.ctx.fillText(String(Math.floor(this.os.timer)), x, y + padding);
    }

    drawGanttChart() {
        let x = 0;
        let y = 400;
        let padding = 5;

        // draw title
        this.ctx.fillStyle = "black";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "bottom";
        this.ctx.fillText("Gantt Chartt", this.canvas.width / 2, y - padding);

        // draw border
        this.ctx.beginPath();
        this.ctx.moveTo(x - padding * 2, y - padding);
        this.ctx.lineTo(x + this.os.ganttChart.length * Process.w + padding * 2, y - padding);
        this.ctx.moveTo(x - padding * 2, y + Process.h + padding);
        this.ctx.lineTo(x + this.os.ganttChart.length * Process.w + padding * 2, y + Process.h + padding);
        this.ctx.closePath();
        this.ctx.stroke();

        let i = 1;
        for (const pid of this.os.ganttChart) {
            const p = Process.get(pid);
            let px = x + (this.os.ganttChart.length - i) * Process.w;
            let py = y;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(px + 1, py + 1, Process.w - 2, Process.h - 2);
    
            this.ctx.fillStyle = "black";
            this.ctx.font = "24px courier bold";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(p.id, px + Process.w / 2, py + Process.h / 2);

            i++;
        }
        this.ctx.fillStyle = "black";
    }

    draw() {
        this.drawTime();
        this.drawNewQueue();
        this.drawReadyQueue();
        this.drawCPU();
        this.drawTerminateQueue();
        this.drawProcess();
        this.drawGanttChart();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}