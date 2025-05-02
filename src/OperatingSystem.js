import Process from "./Process.js";
import CPUScheduler from "./CPUScheduler.js";

export default class OperatingSystem {
    constructor() {
        this.newQueue = [
            Process.add(0, 5, 2), 
            Process.add(1, 2, 0), 
            Process.add(2, 4, 1)];
        this.readyQueue = new CPUScheduler();
        this.terminateQueue = [];
        this.currentProcess = "";

        this.ganttChart = [];

        this.timer = 0;
        this.totalBurstTime = 0;
        this.newQueue.forEach(pid => {
            const process = Process.get(pid);
            this.totalBurstTime += process.burstTime;
        });
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
        if (this.readyQueue.isEmpty()) {
            return;
        }

        if (this.currentProcess == "") {
            this.currentProcess = this.readyQueue.top();
            this.readyQueue.pop();
        } else {
            const currentProcess = Process.get(this.currentProcess);
            const nextProcess = Process.get(this.readyQueue.top());
            if (nextProcess.priority < currentProcess.priority) {
                this.readyQueue.push(this.currentProcess);
                this.currentProcess = this.readyQueue.top();
                this.readyQueue.pop();
            }
        }
    }

    // Run current process for 1 unit
    executeProcess(deltaTime) {
        if (this.currentProcess == "") {
            if (this.ganttChart.length > 0 && this.ganttChart[this.ganttChart.length - 1].pid != "") {
                this.ganttChart[this.ganttChart.length - 1].endTime = this.timer;
            }
            this.ganttChart.push({ pid: "", startTime: Math.floor(this.timer), endTime: this.timer });
            return;
        }
        if (this.ganttChart.length == 0 || this.ganttChart[this.ganttChart.length - 1].pid != this.currentProcess) {
            this.ganttChart.push({ pid: this.currentProcess, startTime: Math.floor(this.timer), endTime: this.timer });
        } else {
            this.ganttChart[this.ganttChart.length - 1].endTime = this.timer;
        }
        const currentProcess = Process.get(this.currentProcess);
        if (currentProcess.remainingTime == undefined) {
            currentProcess.remainingTime = currentProcess.burstTime;
        }
        currentProcess.remainingTime -= deltaTime;
        if (currentProcess.remainingTime <= 0) {
            currentProcess.completionTime = Math.floor(this.timer);
            this.terminateQueue.push(this.currentProcess);
            this.currentProcess = "";
        }
    }

    update(deltaTime) {
        this.timer += deltaTime;
        this.handleNewQueue();
        this.dispatcher();
        this.executeProcess(deltaTime);
    }
}