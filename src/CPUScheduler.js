class PriorityQueue {
    /**
     * @param {(a: any, b: any) => boolean} campareFunc
     */
    constructor(campareFunc) {
        this.heap = [];
        this.campareFunc = campareFunc;
    }

    /**
     * @returns {number} length
     */
    get length() {
        return this.heap.length;
    }

    /**
     * @param {any} data
     */
    enqueue(data) {
        this.heap.push(data);
        this.#heapifyUp();
    }

    dequeue() {
        if (this.isEmpty()) return null;
        const top = this.heap[0];
        const last = this.heap.pop();
        if (!this.isEmpty()) {
            this.heap[0] = last;
            this.#heapifyDown();
        }
        return top;
    }

    peek() {
        return this.heap[0] || null;
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    #heapifyUp() {
        let i = this.heap.length - 1;
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (this.#compare(i, parent)) {
                [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];
                i = parent;
            } else break;
        }
    }

    #heapifyDown() {
        let i = 0;
        while (true) {
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            let smallest = i;

            if (left < this.heap.length && this.#compare(left, smallest)) smallest = left;
            if (right < this.heap.length && this.#compare(right, smallest)) smallest = right;

            if (smallest !== i) {
                [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
                i = smallest;
            } else break;
        }
    }

    /**
     * @param {number} i
     * @param {number} j
     */
    #compare(i, j) {
        const a = this.heap[i], b = this.heap[j];
        return this.campareFunc(a, b);
    }
}
  
export default class CPUScheduler {
    constructor() {
        this.readyQueue = [];
    }

    push(process) {
        this.readyQueue.push(process);
    }

    pop() {
        return this.readyQueue.shift();
    }

    top() {
        return this.readyQueue[0];
    }

    isEmpty() {
        return this.readyQueue.length == 0;
    }

    length() {
        return this.readyQueue.length;
    }

    data() {
        return this.readyQueue;
    }
}