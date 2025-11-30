import * as vscode from 'vscode';

let extensionContext: vscode.ExtensionContext;

export function setContext(context: vscode.ExtensionContext) {
    extensionContext = context;
}

export function getContext(): vscode.ExtensionContext {
    return extensionContext;
}