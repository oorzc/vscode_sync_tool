import archiver from "archiver";
import FileTransfer from "./FileTransfer";
import * as vscode from "vscode";
import { Dependency } from "./sshProvider";
import { DeployConfigItem } from "./config/config";
export declare class Deploy {
    label: string;
    config: DeployConfigItem;
    fileTransfer: FileTransfer;
    files: any[];
    rename_files: any[];
    delete_files: any[];
    zipPath: string;
    useZip: boolean;
    context: vscode.ExtensionContext;
    workspaceRoot: string;
    taskList: {
        task: () => void | Promise<any>;
        tip: string;
        increment: number;
        async?: boolean;
    }[];
    callback: (success: boolean) => void;
    client: any;
    constructor(dependency: Dependency, callback: (success: boolean) => void);
    start: () => Promise<void>;
    checkConfig: () => Promise<void>;
    submitGIt: () => Promise<void>;
    execBuild: () => Promise<void>;
    connect: () => Promise<void>;
    buildZip: () => Promise<void> | undefined;
    handleZipFile: (vFile: string, archive: archiver.Archiver, basePath: string) => Promise<void>;
    rmRemoteFile: () => Promise<void>;
    deleteRemoteFile: (file: string, type: number) => Promise<void>;
    uploadLocalFile: () => Promise<void>;
    uploadFileByProcess(file: string, remoteFile: string): Promise<void>;
    unzipRemoteFile: () => any;
    removeLocalFile: () => void;
    disconnect: () => void;
    clearCache: () => void;
}
//# sourceMappingURL=deploy%20copy.d.ts.map