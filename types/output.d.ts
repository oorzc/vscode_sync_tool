import * as vscode from 'vscode';
import { Task } from './types/config';
export declare const outputChannel: vscode.OutputChannel;
export declare function updateProgress(showAll?: boolean): void;
export declare function addLogTask(task: string | Task): void;
export declare function cleanLogTask(isClear?: boolean): void;
export declare function updateTaskProgress(forceUpdate?: boolean): void;
//# sourceMappingURL=output.d.ts.map