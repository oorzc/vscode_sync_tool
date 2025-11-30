/// <reference types="node" />
import { QueueTask, TargetInterface, TargetOptionsInterface } from "./Interfaces";
import { EventEmitter } from "events";
import { Queue } from "../Queue";
export default class SFTP extends EventEmitter implements TargetInterface {
    private options;
    private client;
    private name;
    private isConnected;
    private isConnecting;
    private queue;
    constructor(options: TargetOptionsInterface);
    connect(): Promise<unknown>;
    upload(localPath: string, remoteFile: string): Promise<string>;
    download(localPath: string, remoteFile: string): Promise<string>;
    list(remoteFile: string): Promise<string>;
    delete(remoteFile: string): Promise<string>;
    getName(): string;
    getQueue(): Queue<QueueTask>;
    destroy(): void;
}
//# sourceMappingURL=SFTP.d.ts.map