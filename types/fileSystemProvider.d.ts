import * as vscode from "vscode";
export declare class File implements vscode.FileStat {
    type: vscode.FileType;
    ctime: number;
    mtime: number;
    size: number;
    name: string;
    data?: Uint8Array;
    constructor(name: string);
}
export declare class Directory implements vscode.FileStat {
    type: vscode.FileType;
    ctime: number;
    mtime: number;
    size: number;
    name: string;
    entries: Map<string, File | Directory>;
    constructor(name: string);
}
export type Entry = File | Directory;
export declare class MemFS implements vscode.FileSystemProvider {
    root: Directory;
    stat(uri: vscode.Uri): vscode.FileStat;
    readDirectory(uri: vscode.Uri): [string, vscode.FileType][];
    readFile(uri: vscode.Uri): Uint8Array;
    writeFile(uri: vscode.Uri, content: Uint8Array, options: {
        create: boolean;
        overwrite: boolean;
    }): void;
    rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: {
        overwrite: boolean;
    }): void;
    delete(uri: vscode.Uri): void;
    createDirectory(uri: vscode.Uri): void;
    private _lookup;
    private _lookupAsDirectory;
    private _lookupAsFile;
    private _lookupParentDirectory;
    private _emitter;
    private _bufferedEvents;
    private _fireSoonHandle?;
    readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]>;
    watch(_resource: vscode.Uri): vscode.Disposable;
    private _fireSoon;
}
//# sourceMappingURL=fileSystemProvider.d.ts.map