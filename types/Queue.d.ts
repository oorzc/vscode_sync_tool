/// <reference types="node" />
import { EventEmitter } from "events";
export interface Task<T> extends EventEmitter {
    (cb: Function): Promise<T> | void;
}
export declare class Queue<T extends Task<any>> extends EventEmitter {
    concurrency: number;
    autostart: boolean;
    private running;
    private pendingTasks;
    private executionTasks;
    private executedTasks;
    constructor();
    getPendingTasks(): T[];
    removeAllPendingTasks(): this;
    push(task: T): this;
    unshift(task: T): this;
    start(): this;
    stop(): this;
    end(): this;
    run(task: T): this;
    private next;
}
//# sourceMappingURL=Queue.d.ts.map