import { Task } from "./types/config";
export declare class StatusBarUi {
    private static _statusBarItem;
    private static get statusBarItem();
    static working(task: string | Task): void;
    static clearUpdateBarItemStatus: () => void;
    static show(): void;
    static hide(): void;
    static dispose(): void;
}
//# sourceMappingURL=statusBar.d.ts.map