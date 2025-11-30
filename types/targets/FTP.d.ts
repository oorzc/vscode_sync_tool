/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { QueueTask, TargetInterface, TargetOptionsInterface } from "./Interfaces";
import * as vscode from "vscode";
import { Queue } from "../Queue";
import EventEmitter = require("events");
export declare class FTP extends EventEmitter implements TargetInterface {
    private options;
    private client;
    private name;
    private isConnected;
    private isConnecting;
    private queue;
    private creatingDirectories;
    constructor(options: TargetOptionsInterface);
    connect(): Promise<any>;
    upload(uri: vscode.Uri, attempts?: number): Promise<vscode.Uri>;
    delete(uri: vscode.Uri): Promise<vscode.Uri>;
    download(uri: vscode.Uri, destination?: vscode.Uri): Promise<vscode.Uri>;
    stream2buffer(stream: NodeJS.ReadableStream): Promise<Buffer>;
    downloadDir(uri: vscode.Uri): Promise<vscode.Uri>;
    deleteDir(uri: vscode.Uri): Promise<vscode.Uri>;
    mkdir(dir: string): Promise<string>;
    getName(): string;
    getQueue(): Queue<QueueTask>;
    destroy(): void;
}
//# sourceMappingURL=FTP.d.ts.map