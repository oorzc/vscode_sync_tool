import * as vscode from "vscode";
import { DeployConfigItem } from './config/config';
export declare class DepNodeProvider implements vscode.TreeDataProvider<Dependency> {
    private count;
    private items;
    private context;
    private rootPath;
    constructor();
    private _onDidChangeTreeData;
    readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | void>;
    getTreeItem(element: Dependency): vscode.TreeItem;
    refresh(): void;
    getCount(): number;
    getConfig(): Promise<void>;
    getChildren(element?: Dependency): Thenable<Dependency[]>;
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
    constructor(label: string, collapsibleState: vscode.TreeItemCollapsibleState, // 0 不能展开折叠，没有子项 ，1 折叠  ，2 展开
    tooltip: string, description: string, context: vscode.ExtensionContext, config: DeployConfigItem, rootPath: string, command?: vscode.Command | undefined);
    iconPath: {
        light: string;
        dark: string;
    };
    contextValue: string;
}
//# sourceMappingURL=treeProvider%20copy.d.ts.map