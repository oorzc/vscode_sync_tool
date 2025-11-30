import { v4 as uuidv4 } from 'uuid';
import * as vscode from 'vscode';
import { Task } from './types/config';
import { StatusBarUi } from './statusBar';
import { debounce, getPluginSetting } from './utils';

// 创建一个输出通道
export const outputChannel = vscode.window.createOutputChannel('async-tools-output');

let debounceShowLogPanel = debounce(() => {
    let syncConfig = getPluginSetting()
    const logShow = syncConfig.get<boolean>("logShow", true)
    if (logShow) {
        // 显示输出面板
        outputChannel.show(true);
    }
}, 1000, true);

// 定义 tasks 数组，允许包含 string 和 Task 类型
let tasks: (string | Task)[] = [];

// 节流相关变量
let lastUpdateTime = 0;  // 记录上一次输出的时间
const updateInterval = 1000;  // 1 秒间隔

let timeout: NodeJS.Timeout
// 用于刷新输出面板内容的函数（节流版）
function throttledUpdateProgress(forceUpdate: boolean = false) {
    debounceShowLogPanel()

    // forceUpdate 标记任务是否强制更新
    const now = Date.now();
    if (now - lastUpdateTime >= updateInterval || forceUpdate) {
        // 超过 1 秒，允许更新
        lastUpdateTime = now;
        forceUpdate = false;  // 重置任务更新标记
        updateProgress();  // 调用实际的更新函数

        // 延迟一秒再执行更新
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            updateProgress();
        }, 1100);
    }
}

// 实际的更新进度函数
export function updateProgress(showAll: boolean = false) {
    // 获取最后100个任务
    let recentTasks = tasks.slice(-100);
    if (showAll) recentTasks = tasks;
    // 用于存储所有任务的输出
    let outputLines: string[] = [];

    // 按照progress和error排序：
    // 1. progress为100的任务排在最前
    // 2. error任务排在中间
    // 3. progress不为100的任务排在最后
    // 按照progress和error排序：
    recentTasks.sort((a, b) => {
        // 如果是字符串，跳过排序
        if (typeof a === 'string' || typeof b === 'string') return 0;

        // 1. 先根据 start 时间排序（开始时间最早的排在前面）
        if (a.start && b.start && a.start !== b.start) return new Date(a.start).getTime() - new Date(b.start).getTime();

        // 2. progress 为 100 的任务排在 progress 不为 100 的任务前
        if (a.progress === 100 && b.progress !== 100) return -1;
        if (a.progress !== 100 && b.progress === 100) return 1;

        // 3. error 为 true 的任务排在没有 error 的任务前
        if (a.error && !b.error) return -1;
        if (!a.error && b.error) return 1;

        // 4. 默认返回 0，保持当前顺序
        return 0;
    });
    let len = recentTasks.length;
    for (let i = 0; i < len; i++) {
        const task = recentTasks[i];

        // 如果是字符串，直接输出
        if (typeof task === 'string') {
            outputLines.push(task);
            continue;
        }

        // 只处理 Task 类型的任务
        if (task.progress === undefined) continue;

        let commonText = `[${task.start}][${task.config.name}][${task.config.type}][${task.compare ? 'compare' : task.operationType}]`;
        if (task.fileSizeText) {
            commonText += `[${task.fileSizeText}]`;
        }
        let destination = task.operationType === 'download' ? `${task.remotePath} -> ${task.localPath}` : `${task.localPath} -> ${task.remotePath}`;
        if (task.compare) {
            destination = task.remotePath
        }
        let msg = '';

        if (task.error) {
            msg = `${commonText}[error]: ${destination}  ${task.error}`;
        } else if (task.progress >= 100) {
            let useTime = task.useTime ? `[${task.useTime}]` : '';
            msg = `${commonText}${useTime}: ${destination}`;
        } else {
            // 使用整数进度条
            let progressBlocks = Math.floor(task.progress / 10);  // 进度块数目
            let progressText = task.progress ? `[` + '#'.repeat(progressBlocks) + '-'.repeat(10 - progressBlocks) + `] ${task.progress}%` : ""
            msg = `${commonText}${progressText}: ${destination}`;
        }
        outputLines.push(msg);
    }
    recentTasks.length && StatusBarUi.working(recentTasks[recentTasks.length - 1]);
    // 清空面板
    outputChannel.clear();
    outputChannel.appendLine(outputLines.join('\n'));

    // if (showAll && tasks.length > 500) {
    // cleanLogTask()
    // }
}


// 添加任务的函数
export function addLogTask(task: string | Task) {
    if (typeof task === 'string') {
        tasks.push(task);
    } else {
        if (!task.id) {
            task.id = uuidv4()
            tasks.push(task);
        } else {
            if (!tasks.find(item => typeof item !== 'string' && item.id === task.id)) {
                tasks.push(task);
            }
        }
    }
    throttledUpdateProgress(); // 使用节流版本的更新函数
}

export function cleanLogTask(isClear: boolean = false) {
    tasks = []
    isClear && outputChannel.clear();
}


// 手动更新任务进度的函数
export function updateTaskProgress(forceUpdate: boolean = false) {
    throttledUpdateProgress(forceUpdate); // 使用节流版本的更新函数
}





