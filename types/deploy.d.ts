import archiver from "archiver";
import * as vscode from "vscode";
import FileTransfer from "./FileTransfer";
import { Dependency } from "./treeProvider";
import { FileOpType, FileTransferConfigItem } from "./types/config";
export declare class Deploy {
    label: string;
    config: FileTransferConfigItem;
    fileTransfer: FileTransfer;
    files: any[];
    rename_files: any[];
    delete_files: any[];
    zipPath: string;
    useZip: boolean;
    context: vscode.ExtensionContext;
    rootPath: string;
    taskList: {
        task: () => void | Promise<any>;
        type: string;
        tip: string;
        increment: number;
        async?: boolean;
    }[];
    client: any;
    all_upload: boolean;
    isCanceled: boolean;
    constructor(dependency: Dependency);
    cancel(): void;
    start: () => Promise<void>;
    checkConfig: () => Promise<void>;
    submitGIt: () => Promise<void>;
    execBuild: () => Promise<void>;
    connect: () => Promise<void>;
    buildZip: () => Promise<void>;
    handleZipFile: (vFile: string, archive: archiver.Archiver, basePath: string) => Promise<void>;
    rmRemoteFile: () => Promise<void>;
    deleteRemotePath(remotePath: string): Promise<void>;
    syncFiles: () => Promise<void>;
    uploadFile(v: FileOpType): Promise<void>;
    renameFile(v: FileOpType): Promise<void>;
    deleteFile(v: FileOpType): Promise<void>;
    showLog(config: FileTransferConfigItem, type: string, status: string, msg?: string): void;
}
//# sourceMappingURL=deploy.d.ts.map