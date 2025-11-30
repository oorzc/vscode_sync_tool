import * as vscode from "vscode";
export declare class DepNodeProvider implements vscode.TreeDataProvider<Dependency> {
    private workspaceRoot;
    constructor(workspaceRoot: string);
    private _onDidChangeTreeData;
    readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | void>;
    getDeployConfig: () => any;
    getTreeItem(element: Dependency): vscode.TreeItem;
    refresh(): void;
    getChildren(element?: Dependency): Thenable<Dependency[]>;
}
export declare class Dependency extends vscode.TreeItem {
    readonly label: string;
    private readonly version;
    readonly collapsibleState: vscode.TreeItemCollapsibleState;
    readonly config: DeployConfigItem;
    readonly workspaceRoot: string;
    readonly command?: vscode.Command | undefined;
    constructor(label: string, version: string, collapsibleState: vscode.TreeItemCollapsibleState, config: DeployConfigItem, workspaceRoot: string, command?: vscode.Command | undefined);
    iconPath: {
        light: string;
        dark: string;
    };
    contextValue: string;
}
export interface DeployConfig {
    [x: string]: DeployConfigItem;
}
export interface DeployConfigItem {
    host: string;
    username: string;
    port: number;
    password: string;
    remotePath: string;
    build?: string;
    distPath?: string;
    privateKeyPath?: string;
    remove?: boolean;
}
//# sourceMappingURL=nodeDependencies.d.ts.map