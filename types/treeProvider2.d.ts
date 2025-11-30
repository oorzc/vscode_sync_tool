import * as vscode from "vscode";
import { DeployConfigItem, FileTransferConfigItem } from './config/config';
import FileTransfer from './FileTransfer';
export declare class DepNodeProvider implements vscode.TreeDataProvider<Dependency> {
    private count;
    private items;
    private context;
    private rootPath;
    constructor();
    private _onDidChangeTreeData;
    readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | void>;
    getTreeItem(element: Dependency): vscode.TreeItem;
    getChildren(element?: Dependency): Thenable<Dependency[]>;
    connect(item: Dependency): Promise<void>;
    disconnect(item: Dependency): void;
    refresh(): void;
    getCount(): number;
    getConfig(): Promise<void>;
    updateItemCount(index: number, newCount: number): void;
}
export declare class Dependency extends vscode.TreeItem {
    label: string;
    collapsibleState: vscode.TreeItemCollapsibleState;
    tooltip: string;
    description: string;
    readonly context: vscode.ExtensionContext;
    readonly config: DeployConfigItem;
    readonly rootPath: string;
    readonly command?: vscode.Command | undefined;
    transfer_config: FileTransferConfigItem;
    fileTransfer: FileTransfer;
    contextValue: string;
    client: any;
    children: Dependency[] | undefined;
    constructor(label: string, collapsibleState: vscode.TreeItemCollapsibleState, // 0 不能展开折叠，没有子项 ，1 折叠  ，2 展开
    tooltip: string, description: string, context: vscode.ExtensionContext, config: DeployConfigItem, rootPath: string, command?: vscode.Command | undefined);
    connectClient(): Promise<void>;
    disconnectClient(): void;
    refreshClientTree(element: any): Promise<void>;
}
//# sourceMappingURL=treeProvider2.d.ts.map