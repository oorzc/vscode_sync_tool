/// <reference types="node" />
import async from 'async';
import * as vscode from "vscode";
import { EventEmitter } from 'events';
import { FileTransferConfigItem, Task, TargetTypes } from "./types/config";
import { Mutex } from 'async-mutex';
export default class FileTransfer extends EventEmitter {
    static instance: FileTransfer;
    static ftpConnectionPools: {
        [key: string]: any[];
    };
    static sftpConnectionPools: {
        [key: string]: any[];
    };
    static queues: {
        [key: string]: async.QueueObject<any>;
    };
    static maxConnectionsMap: {
        [key: string]: number;
    };
    static collectionOfTreeNodes: {
        [key: string]: string;
    };
    static noUploadFiles: Set<string>;
    configItem: FileTransferConfigItem;
    uploadTaskNumber: number;
    maxConnections: number;
    rootPath: string;
    context: vscode.ExtensionContext;
    mutex: Mutex;
    static timer: any;
    existCreateDir: {
        [key: string]: Set<string>;
    };
    existFileSize: {
        [x: string]: number;
    };
    constructor(configItem: FileTransferConfigItem);
    allTaskCompleted(configItem: FileTransferConfigItem): void;
    checkAllTaskCompleted(): boolean;
    addTaskLog(task: Task): void;
    static startCleanupTimer(): void;
    static cleanupConnectionPool(pool: any[], type: TargetTypes): Promise<void>;
    getClient(config: FileTransferConfigItem, showErr?: boolean): Promise<any>;
    releaseClient(client: any, config: FileTransferConfigItem, errorOccurred?: boolean): Promise<void>;
    uploadFile(client: any, task: Task): Promise<void>;
    uploadFolder(task: Task): Promise<void>;
    UnzipFile(client: any, config: FileTransferConfigItem, localPath: string, remotePath: string): Promise<void>;
    downloadFile(client: any, task: Task): Promise<void>;
    downloadFilesFromFTP(client: any, remotePath: string, localPath: string, task: Task): Promise<void>;
    downloadFilesFromSFTP(client: any, remotePath: string, localPath: string, task: Task): Promise<void>;
    existFTPFile(client: any, remotePath: string): Promise<boolean>;
    renameFile(client: any, task: Task, from?: boolean): Promise<void>;
    deleteFile(client: any, task: Task, from?: boolean): Promise<void>;
    addMaxConcurrency(config: FileTransferConfigItem): Promise<void>;
    checkExistFolder(config: FileTransferConfigItem, client: any, file: string): Promise<void>;
    /**
     * 关闭所有 FTP 或 SFTP 连接
     * @param name 指定要关闭的连接池名称，默认为空字符串，表示关闭所有连接池
     */
    static closeAll(name?: string): Promise<void>;
    static changeAsyncStatus(name: string, type: string): Promise<void>;
    clearCache: (config: FileTransferConfigItem) => Promise<void>;
    static addTask(task: Task, lock?: boolean): Promise<void>;
}
//# sourceMappingURL=FileTransfer.d.ts.map