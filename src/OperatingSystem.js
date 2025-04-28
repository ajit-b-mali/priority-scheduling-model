import Process from "./Process.js";
import CPUScheduler from "./CPUScheduler.js";

export default class OperatingSystem {
    constructor() {
        this.newQueue = [
            Process.add(0, 4, 2),
            Process.add(1, 3, 1),
            Process.add(2, 2, 3),
            Process.add(3, 3, 2),
            Process.add(4, 5, 1),
        ];
        this.readyQueue = new CPUScheduler();
        this.terminateQueue = [];

        this.ganttChart = [];
        this.lastTime = 0;
        this.timer = 0;
        this.currentProcess = "";
    }

    // Move arrived processes to readyQueue
    handleNewQueue() {
        this.newQueue = this.newQueue.filter(pid => {
            const p = Process.get(pid);
            if (p.arrivalTime <= this.timer) {
                this.readyQueue.push(pid);
                return false;
            }
            return true;
        });
    }

    // Assign process if idle
    dispatcher() {
        if (!this.currentProcess && !this.readyQueue.isEmpty()) {
            this.currentProcess = this.readyQueue.top();
            this.readyQueue.pop();
        }
    }

    // Run current process for 1 unit
    executeProcess(deltaTime) {
        if (this.currentProcess == "") return;

        const p = Process.get(this.currentProcess);
        p.remainingTime -= deltaTime;
        if (p.remainingTime <= 0) {
            p.completionTime = Math.floor(this.timer);
            this.terminateQueue.push(this.currentProcess);
            this.currentProcess = "";
        }
    }

    handleGanttChart() {
        if (this.lastTime != Math.floor(this.timer)) {
            this.lastTime = Math.floor(this.timer);

            if (this.currentProcess == "") {
                const p = new Process(0, 0, 0);
                p.color = "gray";
                this.ganttChart.push(p.id);
            }
            else
                this.ganttChart.push(this.currentProcess);
        }
    }

    update(deltaTime) {
        this.timer += deltaTime;
        this.handleNewQueue();
        this.executeProcess(deltaTime);
        this.dispatcher();

        this.handleGanttChart();
    }
}