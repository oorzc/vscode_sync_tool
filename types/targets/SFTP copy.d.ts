/// <reference types="node" />
import { QueueTask, TargetInterface, TargetOptionsInterface } from "./Interfaces";
import { EventEmitter } from "events";
import { Queue } from "../Queue";
export default class SFTP extends EventEmitter implements TargetInterface {
    private options;
    private client;
    private sftp;
    private name;
    private isConnected;
    private isConnecting;
    private queue;
    constructor(options: TargetOptionsInterface);
    delete(path: string): Promise<string>;
    connect(cb: Function, errorCb?: Function | undefined): void;
    upload(filepath: string): Promise<string>;
    download(filepath: string, destination?: string): Promise<string>;
    list(filepath: string): Promise<string>;
    downloadDir(filepath: string): Promise<string>;
    deleteDir(filepath: string): Promise<string>;
    mkdir(dir: string): Promise<string>;
    getName(): string;
    getQueue(): Queue<QueueTask>;
    destroy(): void;
}
//# sourceMappingURL=SFTP%20copy.d.ts.map