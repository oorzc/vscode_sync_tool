/// <reference types="node" />
import * as vscode from "vscode";
import FileTransfer from './FileTransfer';
import { FileTransferConfigItem, Task } from './types/config';
import { TreeItem, ProviderResult } from 'vscode';
export declare class RepositoryFile {
    name: string;
    isDirectory: boolean;
    size: number;
    permission?: string;
}
export declare class Dependency extends TreeItem {
    config: FileTransferConfigItem;
    collapsibleState: vscode.TreeItemCollapsibleState;
    tooltip: string;
    description: string;
    index: number;
    isRun: boolean;
    children: RepositoryFileNode[];
    parent: boolean;
    isLoading: boolean;
    realPath: string;
    constructor(config: FileTransferConfigItem, collapsibleState: vscode.TreeItemCollapsibleState, // 0 不能展开折叠，没有子项 ，1 折叠  ，2 展开
    tooltip: string, description: string, index: number);
}
export declare class RepositoryFileNode extends TreeItem {
    file: RepositoryFile;
    parent: Dependency | RepositoryFileNode;
    parentPath: string;
    realPath: string;
    config: FileTransferConfigItem;
    isLoading: boolean;
    children: RepositoryFileNode[];
    isNew: boolean;
    constructor(file: RepositoryFile, parent: Dependency | RepositoryFileNode, parentPath: string);
}
export declare class DepNodeProvider implements vscode.TreeDataProvider<TreeItem>, vscode.TreeDragAndDropController<Dependency | RepositoryFileNode> {
    dropMimeTypes: string[];
    dragMimeTypes: string[];
    private _onDidChangeTreeData;
    readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | void>;
    private count;
    private items;
    private context;
    private rootPath;
    private allNodes;
    refreshTimer: string | number | NodeJS.Timeout | undefined;
    constructor();
    handleDrop(target: Dependency | RepositoryFileNode | undefined, sources: vscode.DataTransfer, token: vscode.CancellationToken): Promise<void>;
    handleDrag(source: (Dependency | RepositoryFileNode)[], treeDataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): Promise<void>;
    dispose(): void;
    uploadEntry(item: Dependency): Promise<void>;
    pauseSync(item: Dependency): Promise<void>;
    stopSync(item: Dependency): Promise<void>;
    restartSync(item: Dependency): Promise<void>;
    uploadComplete(task: Task): Promise<void>;
    findExistingPath(a1: {
        [x: string]: Dependency | RepositoryFileNode;
    }, a2: string[], task: Task): Dependency | RepositoryFileNode | null;
    updateSyncStatus(name: string, type: string): Promise<void>;
    connect(item: Dependency): Promise<void>;
    disconnect(item: Dependency): Promise<void>;
    getParent(element: TreeItem): TreeItem | undefined;
    changeMenuStatus(item: Dependency, type: string): Promise<void>;
    getClient(config: FileTransferConfigItem): Promise<{
        client: any;
        fileTransfer: FileTransfer;
    }>;
    releaseClient(client: any, config: FileTransferConfigItem): Promise<void>;
    getTreeItem(element: Dependency | RepositoryFileNode): vscode.TreeItem;
    refresh(status?: boolean): void;
    refreshEntry(obj: Dependency | RepositoryFileNode, type?: string): Promise<void>;
    clearFileCache(node: Dependency | RepositoryFileNode): void;
    getCount(): number;
    getMenu(): Promise<void>;
    getAllNodes(): {
        [key: string]: Dependency | RepositoryFileNode;
    };
    private addNode;
    addNodes(...nodes: (Dependency | RepositoryFileNode)[]): void;
    getChildren(element?: TreeItem): ProviderResult<TreeItem[]>;
    getFileNodes(element: Dependency | RepositoryFileNode, remotePath: string): Promise<RepositoryFileNode[]>;
    mapFilesToNodes(files: any[], element: Dependency | RepositoryFileNode, remotePath: string): RepositoryFileNode[];
    private openResource;
    showErrorMessage(task: Task, obj: RepositoryFileNode, err: any): void;
    showRemoteFile(filePath: string, comparePath: string, uri: vscode.Uri, obj: RepositoryFileNode): Promise<void>;
    saveFile(name: string, content: string, localPath: string, remotePath: string): Promise<void>;
    addFileOrFolder(obj: Dependency | RepositoryFileNode, opType: number): Promise<void>;
    uploadFiles(obj: Dependency | RepositoryFileNode): Promise<void>;
    downloadFile(obj: Dependency | RepositoryFileNode): Promise<void>;
    compareFile(obj: RepositoryFileNode): Promise<string | undefined>;
    renameFile(obj: RepositoryFileNode): Promise<void>;
    chmodFile(obj: RepositoryFileNode): Promise<string | undefined>;
    deleteFile(obj: RepositoryFileNode): Promise<void>;
    checkToClose(obj: RepositoryFileNode, delete_cache?: boolean): void;
    refreshCount(): void;
    clearCache(item: Dependency): Promise<void>;
    showLog(config: FileTransferConfigItem, type: string, status: string, msg?: string): void;
}
//# sourceMappingURL=treeProvider.d.ts.map