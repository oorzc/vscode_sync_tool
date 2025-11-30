import * as path from "path";
import * as vscode from "vscode";
import { Task } from "./types/config";
import { debounce } from "./utils";

export class StatusBarUi {
    private static _statusBarItem: vscode.StatusBarItem;

    private static get statusBarItem() {
        if (!StatusBarUi._statusBarItem) {
            StatusBarUi._statusBarItem = vscode.window.createStatusBarItem(
                vscode.StatusBarAlignment.Left
            );
            this.statusBarItem.show();
        }
        return StatusBarUi._statusBarItem;
    }


    static working(task: string | Task) {
        if (!task) return
        let text = ""
        let icon = "cloud"

        StatusBarUi.statusBarItem.color = undefined;
        if (typeof task != 'string') {
            if (task.progress === undefined) return;
            let file = path.basename(task.localPath || task.remotePath);
            text = `${task.operationType}: ${file}`;
            if (task.error) {
                StatusBarUi.statusBarItem.color = "#ff0000";
            } else if (task.progress >= 100) {
                text += ` ${task.progress}%`
                // StatusBarUi.statusBarItem.color = "#33ff00";
            } else {
                text += ` ${task.progress || 0}%`
            }
            icon = task.operationType === 'download' ? 'cloud-download' : 'cloud-upload';
        } else {
            if (task.length < 20) {
                text = task
            } else {
                if (task.indexOf(":") != -1) {
                    let arr = task.split(": ")
                    const lastTwo = arr[0].split(']').filter(Boolean).slice(-2).map(s => s + ']');
                    text = lastTwo[0] + lastTwo[1] + '...' + arr[1].slice(-20)
                } else {
                    text = task.slice(-30)
                }
            }
        }
        // 设置状态文本和图标
        StatusBarUi.statusBarItem.text = `$(${icon}) ${text}`
        StatusBarUi.statusBarItem.tooltip = "FTP/SFTP/SSH Sync"

        // const statusBarTooltip = new vscode.MarkdownString('<h2 style="color: #ff0000;">vue-helper2</h2>')
        // statusBarTooltip.supportHtml = true
        // statusBarTooltip.isTrusted = true;
        // statusBarTooltip.appendMarkdown('## ClojureDocs Examples\n\n');
        // statusBarTooltip.appendMarkdown(`32324234 \n\n`);
        // StatusBarUi.statusBarItem.tooltip = statusBarTooltip

        // 显示状态栏项
        StatusBarUi.statusBarItem.show()
        // 设置命令
        StatusBarUi.statusBarItem.command = "sync_tools.outputShow";

        StatusBarUi.clearUpdateBarItemStatus()
    }

    // 防抖清理函数
    static clearUpdateBarItemStatus = debounce(() => {
        // 隐藏状态栏项
        // StatusBarUi.hide();
        StatusBarUi.statusBarItem.color = undefined;
        StatusBarUi.statusBarItem.text = `$(cloud)`
    }, 5000)

    static show() {
        StatusBarUi.statusBarItem.show();
    }
    static hide() {
        StatusBarUi.statusBarItem.hide();
    }
    static dispose() {
        StatusBarUi.statusBarItem.dispose();
    }
}
