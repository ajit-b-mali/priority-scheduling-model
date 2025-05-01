import Process from "./Process.js";

export default class CPUScheduler {
    constructor() {
        this.readyQueue = [];
    }

    push(process) {
        this.readyQueue.push(process);
        this.readyQueue.sort((first, second) => {
            const a = Process.get(first);
            const b = Process.get(second);
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            } else {
                return a.arrivalTime - b.arrivalTime;
            }
        });
    }

    pop() {
        return this.readyQueue.shift();
    }

    top() {
        return this.readyQueue[0];
    }

    isEmpty() {
        return this.readyQueue.length === 0;
    }

    length() {
        return this.readyQueue.length;
    }

    data() {
        return this.readyQueue;
    }

    clear() {
        this.readyQueue.length = 0;
    }
}
