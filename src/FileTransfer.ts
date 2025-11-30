const SftpClient = require("./lib/ssh2-sftp-client/index")
const ftp = require("basic-ftp-proxy")
const proxySocket = require("basic-ftp-proxy/dist/proxySocket")

import fs from "fs-extra"
import path from 'path';
import dayjs from "dayjs"
import async from 'async';
import { l10n } from 'vscode';
import * as vscode from "vscode"
import { EventEmitter } from 'events';
import { FileTransferConfigItem, Task, TargetTypes, proxyConfigType } from "./types/config";
import { getRootPath, getAllowFiles, isUpRoot, formatFileSize, getUseTime, getPluginSetting, sleep, getNormalPath, isIgnore } from './utils';
import { SocksClient } from "socks";
import { SocksProxyType } from "socks/typings/common/constants";
import { getContext } from "./config/globals";
import { Mutex } from 'async-mutex';
import { addLogTask, cleanLogTask, updateTaskProgress } from './output';
import { ClientConnectionError } from './types/connect';
import { myEvent } from './events/myEvent';
import { StatusBarUi } from './statusBar';
import { getDecryptionCode } from "./CodeLensProvider";

EventEmitter.setMaxListeners(99999)

// 文件传输类
export default class FileTransfer extends EventEmitter {
    static instance: FileTransfer;
    static ftpConnectionPools: { [key: string]: any[] } = {}; // ftp连接池
    static sftpConnectionPools: { [key: string]: any[] } = {}; // sftp连接池
    static queues: { [key: string]: async.QueueObject<any> } = {}; // 用于存储每个 configItem.name 的任务队列
    static maxConnectionsMap: { [key: string]: number } = {}; // 存储每个 configItem.name 对应的并发数量
    static collectionOfTreeNodes: { [key: string]: string } = {}; // 存储需要刷新的树节点的集合
    static noUploadFiles: Set<string> = new Set<string>(); // 存储不上传的文件

    configItem: FileTransferConfigItem; // 配置项
    uploadTaskNumber: number; // 上传数量达到多少时开启并发
    maxConnections: number; // 最大连接数
    rootPath: string
    context: vscode.ExtensionContext;
    mutex: Mutex;  // 定义互斥锁
    static timer: any = null; // 定时器
    // 已创建的目录集合，用于判断是否已创建过该目录
    existCreateDir: { [key: string]: Set<string> } = {};
    existFileSize: { [x: string]: number; } = {}

    // 构造函数
    constructor(configItem: FileTransferConfigItem) {
        super();

        let syncConfig = getPluginSetting()
        let uploadTaskNumber = syncConfig.get('uploadTaskNumber', 10)
        let uploadConcurrentLimit = syncConfig.get('uploadConcurrentLimit', 3)
        this.configItem = configItem;
        this.rootPath = getRootPath();
        this.uploadTaskNumber = uploadTaskNumber;
        this.maxConnections = uploadConcurrentLimit;
        this.context = getContext();
        // this.setMaxListeners(999);
        this.mutex = new Mutex();  // 初始化锁
        // 确保共享实例
        FileTransfer.instance = this;
        this.existCreateDir[configItem.name] = new Set();

        // 初始化连接池
        if (!FileTransfer.ftpConnectionPools[configItem.name]) {
            FileTransfer.ftpConnectionPools[configItem.name] = [];
        }
        if (!FileTransfer.sftpConnectionPools[configItem.name]) {
            FileTransfer.sftpConnectionPools[configItem.name] = [];
        }

        FileTransfer.startCleanupTimer()

        // 初始化最大并发数
        if (!FileTransfer.maxConnectionsMap[configItem.name]) {
            FileTransfer.maxConnectionsMap[configItem.name] = 1; // 默认并发数
        }

        // 初始化队列
        // 如果当前 configItem.name 没有对应的队列，则创建新的队列
        if (!FileTransfer.queues[configItem.name]) {
            FileTransfer.queues[configItem.name] = async.queue(async (task: Task, callback) => {
                let client: any;
                const maxRetries = 3;  // 每个任务的最大重试次数

                // 定义任务执行的函数
                const executeTask = async (task: Task) => {
                    try {
                        client = await this.getClient(task.config);
                        if (task.config.type == 'ftp') await client.cd("/")
                        this.configItem = task.config;
                        this.addTaskLog(task)

                        // 如果是对比文件，且远程不存在该文件，则不执行对比
                        if (task.compare && !task.isDirectory && task.operationType == 'download') {
                            let msg = l10n.t('Remote file does not exist')
                            task.remotePath = getNormalPath(task.remotePath);

                            let res = true
                            if (task.config.type == 'ftp') {
                                res = await this.existFTPFile(client, task.remotePath)
                            } else {
                                res = await client.exists(task.remotePath)
                            }
                            if (!res) {
                                task.error = msg
                                let msg2 = `[compare][${task.config.name}][${task.config.type}][error]：${task.remotePath} ${msg}`;
                                vscode.window.showErrorMessage(msg2);
                                await this.releaseClient(client, task.config);
                                updateTaskProgress();
                                callback && callback();  // 任务完成，调用回调
                                return
                            }
                        }

                        // 根据任务类型决定执行何种操作
                        switch (task.operationType) {
                            case 'upload':
                                await this.uploadFile(client, task);
                                break;
                            case 'download':
                                await this.downloadFile(client, task);
                                break;
                            case 'delete':
                                await this.deleteFile(client, task);
                                break;
                            case 'rename':
                                await this.renameFile(client, task);
                                break;
                            default:
                                throw new Error(`Unknown operation type: ${task.operationType}`);
                        }

                        // 释放连接
                        await this.releaseClient(client, task.config);
                        task.error = ''
                        updateTaskProgress();

                        // 视图上传需要刷新的视图菜单树节点
                        if (task.operationType !== 'download') {
                            const key = `${task.config.name}###${task.remotePath}`;
                            myEvent.fire({
                                nodePath: key,
                                task: task,
                                type: 'refreshNode',
                            });
                        }

                        if (task.compare && !task.isDirectory) {
                            let localPath = path.join(this.rootPath, path.relative(task.config.type == 'ftp' ? "/" : task.config.remotePath, task.remotePath))
                            // 执行对比命令
                            vscode.commands.executeCommand('vscode.diff', vscode.Uri.file(task.localPath), vscode.Uri.file(localPath), `${l10n.t('Local file')} ↔ ${l10n.t('Remote file')}: ${path.relative(this.rootPath, localPath)}`);
                        }

                        // 动态增加并发数
                        this.addMaxConcurrency(task.config)

                        // 所有任务完成，清理缓存
                        if (!FileTransfer.queues[task.config.name].length() && FileTransfer.queues[task.config.name].running() === 1) {
                            this.allTaskCompleted(task.config)
                        }

                        callback && callback();  // 任务完成，调用回调
                    } catch (err) {
                        // 释放连接
                        await this.releaseClient(client, task.config);

                        let msg = '[error]'
                        if (err instanceof ClientConnectionError) {
                            if (err.message.indexOf("many connections") != -1) {
                                task.error = `${err.message}`
                                updateTaskProgress();
                                await FileTransfer.changeAsyncStatus(task.config.name, 'stop')
                            }
                            callback && callback();  // 任务失败，调用回调
                        } else {
                            task.retries ? task.retries++ : task.retries = 1;  // 增加重试次数
                            // console.error(`Error during ${task.operationType} of ${task.localPath} to ${task.remotePath}:`, err);
                            if (task.retries < maxRetries) {
                                console.log(`Retrying (${task.retries}/${maxRetries})...`);
                                msg = `[${l10n.t('Retry')} (${task.retries}/${maxRetries})] ${err}`
                                task.error = `${msg}`
                                updateTaskProgress();
                                await sleep(2000);
                                await executeTask(task);  // 递归调用以进行重试
                            } else {
                                console.error(`Task failed after ${maxRetries} retries.`);
                                task.error = `${err}`
                                updateTaskProgress();

                                // 退出任务
                                await FileTransfer.changeAsyncStatus(task.config.name, 'stop')


                                callback && callback();  // 任务失败，调用回调
                            }
                        }
                    }
                };

                // 执行任务
                await executeTask(task);
            }, FileTransfer.maxConnectionsMap[configItem.name]);


            // 所有任务完成
            FileTransfer.queues[configItem.name].drain(() => {
                console.log(`${[configItem.name]} 所有任务已完成`);
                // this.allTaskCompleted(configItem)
            });

        }
    }

    allTaskCompleted(configItem: FileTransferConfigItem) {
        this.existCreateDir[configItem.name].clear();
        setTimeout(() => {
            StatusBarUi.working(`${[configItem.name]} ${l10n.t('All tasks completed')}`);
            configItem.watch && this.clearCache(configItem)
            myEvent.fire({
                name: configItem.name,
                status: 'complete_sync',
                type: 'refreshSyncStatus',
            })
        }, 1500);
        setTimeout(() => {
            let res = this.checkAllTaskCompleted()
            res && StatusBarUi.working(l10n.t('All tasks completed'));
            res && cleanLogTask()
        }, 2500);
    }

    checkAllTaskCompleted() {
        let flag = true
        for (const [k, v] of Object.entries(FileTransfer.queues)) {
            if (v.length() !== 0) {
                flag = false;
            }
        }
        return flag
    }


    addTaskLog(task: Task) {
        if (task.isDirectory && task.operationType && ['upload', 'download'].includes(task.operationType)) return
        if (!task.start) task.start = dayjs().format('YYYY-MM-DD HH:mm:ss');
        if (task.progress === undefined) task.progress = 0;
        addLogTask(task);
    }

    // 启动清理定时器，只启动一次
    static startCleanupTimer() {
        FileTransfer.timer && clearInterval(FileTransfer.timer);
        FileTransfer.timer = setInterval(async () => {
            for (const [k, v] of Object.entries(FileTransfer.queues)) {
                // 如果任务队列不为空，则跳过清理
                if (v.length() !== 0) {
                    return;
                }
                console.log("清理连接池中....");

                // 循环清理所有 FTP 连接池
                await FileTransfer.cleanupConnectionPool(FileTransfer.ftpConnectionPools[k], 'ftp' as TargetTypes);
                // 循环清理所有 SFTP 连接池
                await FileTransfer.cleanupConnectionPool(FileTransfer.sftpConnectionPools[k], 'sftp' as TargetTypes);
            }
        }, 60 * 1000); // 每分钟清理
    }

    // 清理连接池，判断连接是否可用，再移除
    static async cleanupConnectionPool(pool: any[], type: TargetTypes): Promise<void> {
        for (let i = pool.length - 1; i >= 0; i--) {
            const client = pool[i];
            try {
                // 检查 FTP 或 SFTP 连接是否仍然活跃
                await (type === 'ftp' ? client.pwd() : client.cwd());
                console.log(`Connection is still active, keeping in pool.`);
            } catch (err) {
                // 如果检测失败，说明连接不可用，移除连接
                console.log(`Connection is not active, cleaning up ${type} connection.`);
                pool.splice(i, 1);
                // 关闭不可用连接
                await (type === 'ftp' ? client.close() : client.end());
            }
        }
    }

    // 获取连接
    async getClient(config: FileTransferConfigItem, showErr: boolean = false): Promise<any> {
        const pool = config.type === 'ftp' ? FileTransfer.ftpConnectionPools : FileTransfer.sftpConnectionPools;
        let client = pool[config.name].pop();

        if (!client) {
            try {
                const configClone = JSON.parse(JSON.stringify(config))
                // 如果需要代理，通过 SocksClient 创建 socket
                if (configClone.proxy) {
                    const proxyConfig = getPluginSetting().get<proxyConfigType>("proxyConfig");
                    if (!proxyConfig || (!proxyConfig.proxyHost || !proxyConfig.proxyPort || ![4, 5].includes(proxyConfig.proxyType as SocksProxyType))) {
                        throw new Error(l10n.t('Please check if the proxy configuration is correct'));
                    }

                    try {
                        const { socket } = await SocksClient.createConnection({
                            proxy: {
                                host: proxyConfig.proxyHost,
                                port: proxyConfig.proxyPort,
                                userId: proxyConfig.proxyUsername,
                                password: proxyConfig.proxyPassword,
                                type: proxyConfig.proxyType as SocksProxyType,
                            },
                            command: "connect",
                            timeout: 10000,
                            destination: { host: configClone.host, port: configClone.port },
                        });

                        configClone.type === 'ftp'
                            ? (client = new ftp.Client({
                                useInitialHost: true,
                                buildSocket: () => proxySocket.create(proxyConfig.proxyHost, proxyConfig.proxyPort),
                            }))
                            : (configClone.sock = socket, client = new SftpClient());
                    } catch (err) {
                        throw new Error(l10n.t('Proxy connection failed, please check configuration:') + err?.toString());
                    }
                } else {
                    client = configClone.type === 'ftp' ? new ftp.Client() : new SftpClient();
                }

                if (configClone.secretKeyPath && fs.existsSync(configClone.secretKeyPath)) {
                    let secretKey = fs.readFileSync(configClone.secretKeyPath, 'utf-8');
                    const decryptedUsername = getDecryptionCode(configClone.username, secretKey)
                    const decryptedPassword = getDecryptionCode(configClone.password, secretKey)
                    configClone.username = decryptedUsername ? decryptedUsername : configClone.username;
                    configClone.password = decryptedPassword ? decryptedPassword : configClone.password;
                }

                if (configClone.type === 'ftp') {
                    // 设置 FTP 用户名，并连接
                    configClone.user = configClone.username;
                    // 匹配IPv4地址的正则表达式
                    const ipv4Pattern = /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}$/;
                    if (ipv4Pattern.test(configClone.host)) {
                        client.prepareTransfer = ftp.enterPassiveModeIPv4
                    }
                    // client.ftp.verbose = true;
                }

                await (configClone.type === 'ftp' ? client.access(configClone) : client.connect(configClone));
            } catch (err) {
                // 清理连接防止内存泄漏
                if (client) {
                    await (config.type === 'ftp' ? client.close() : client.end());
                }

                // 显示错误信息
                if (showErr) {
                    vscode.window.showErrorMessage(`[${config.name}][${config.type}][error]: ${err?.toString()}`);
                }

                throw new ClientConnectionError(`Failed to connect: ${err}`);
            }
        }

        return client;
    }

    // 释放连接
    async releaseClient(client: any, config: FileTransferConfigItem, errorOccurred = false) {
        if (!client || errorOccurred) return;

        try {
            // 检查连接是否可用
            if (config.type === 'ftp') {
                await client.pwd();
            } else {
                await client.cwd();
            }

            // 将连接放回连接池
            if (config.type === 'ftp') {
                FileTransfer.ftpConnectionPools[config.name].push(client);
            } else {
                FileTransfer.sftpConnectionPools[config.name].push(client);
            }
        } catch (err) {
            console.log('Connection check failed, removing connection:', err);
            // 关闭连接
            await (config.type === 'ftp' ? client.close() : client.end());
        }
    }


    // 上传文件
    async uploadFile(client: any, task: Task): Promise<void> {
        let { localPath, remotePath, config, useZip, isDirectory } = task;
        return new Promise(async (resolve, reject) => {
            try {
                let remoteDirPath = path.dirname(remotePath);
                // 检查文件夹是否存在
                await this.checkExistFolder(task.config, client, remoteDirPath)
                const fileStat = fs.statSync(task.localPath);
                task.fileSize = fileStat.size
                task.isDirectory = fileStat.isDirectory()
                task.fileSizeText = formatFileSize(task.fileSize)
                // 开始上传
                if (config.type === "ftp") {
                    if (task.isDirectory) {
                        await this.uploadFolder(task)
                    } else {
                        // 检查文件是否为空
                        if (task.fileSize === 0) {
                            // 向空文件中写入一个空格字符
                            fs.writeFileSync(localPath, " ")
                        }

                        client.trackProgress((info: any) => {
                            if (info.type == 'upload') {
                                if (!task.fileSize) {
                                    task.useTime = getUseTime(task.start)
                                    task.progress = 100
                                } else {
                                    const progress = Math.min(parseFloat(((info.bytes / task.fileSize) * 100).toFixed(2)), 100);
                                    console.log(`上传进度: ${progress}% (${info.bytes} / ${task.fileSize} 字节)`);
                                    task.progress = progress
                                    if (progress >= 100 || !info.bytes) {
                                        task.useTime = getUseTime(task.start)
                                    }
                                }
                                updateTaskProgress();
                            }
                        });
                        remotePath = getNormalPath(remotePath)
                        await client.uploadFrom(localPath, remotePath)
                        client.trackProgress()
                    }
                } else {
                    if (isDirectory) {
                        await this.uploadFolder(task)
                    } else {
                        const readStream = fs.createReadStream(task.localPath, { start: 0 })
                        remotePath = getNormalPath(remotePath)
                        await client.fastPut(readStream.path, remotePath, {
                            flags: "r+",
                            autoClose: true,
                            step: async (transferred: number, chunk: any, total: number) => {
                                // console.log(`已传输: ${transferred}/${total} 字节`)
                                task.progress = Math.min(parseFloat(((transferred / total) * 100).toFixed(2)), 100);
                                // task.localPath.includes(this.rootPath) && updateUploadStatus(true, `${[task.operationType]}: ${path.relative(this.rootPath, task.localPath)} ${task.progress}%`)
                                if (task.progress >= 100 && !task.end) {
                                    task.useTime = getUseTime(task.start)
                                }
                                updateTaskProgress();
                            }
                        })
                    }
                }

                // 是否使用压缩上传
                if (useZip) {
                    // 是否远程解压
                    if (config.type == 'ssh' && task.config.remote_unpacked) {
                        await this.UnzipFile(client, task.config, localPath, remotePath)
                    }
                    //是否删除远程压缩文件
                    if (task.config.delete_remote_compress) {
                        await this.deleteFile(client, task, false);
                    }
                    //删除本地压缩文件
                    if (task.config.delete_local_compress && fs.existsSync(localPath)) {
                        fs.unlinkSync(localPath)
                    }
                }
                resolve()
            } catch (err) {
                console.error(`Error upload file: ${err}`);
                reject(err);
            }
        });
    }

    async uploadFolder(task: Task) {
        let { localPath, remotePath, view } = task;
        let files = await getAllowFiles(
            task.config,
            localPath,
            view
        )
        if (files && files.length) {
            for (let vv of files) {
                let remoteFile = path.posix.join("/", remotePath, path.relative(localPath, vv))
                let newTask = JSON.parse(JSON.stringify(task))
                newTask.operationType = "upload"
                newTask.localPath = vv
                newTask.view = view
                newTask.isDirectory = false
                newTask.remotePath = remoteFile
                await FileTransfer.addTask(newTask)
            }
        }
    }


    // 解压远程文件
    UnzipFile(client: any, config: FileTransferConfigItem, localPath: string, remotePath: string) {
        return new Promise<void>((resolve, reject) => {
            client
                .exec(`unzip -o ${remotePath} -d ${config.remotePath}`)
                .then(async (v: any) => {
                    if (!v.code) {
                        resolve()
                    } else {
                        reject(`${l10n.t('Decompression failed')}: ${v}`)
                    }
                }).catch((err: any) => {
                    console.error(`解压失败: ${remotePath}`, err);
                    reject(`${l10n.t('Decompression failed')}: ${remotePath}`)
                });
        });
    }


    // 下载任务
    async downloadFile(client: any, task: Task) {
        let { localPath, remotePath, config, isDirectory } = task;

        try {
            if (task.isDirectory) {
                if (config.type === "ftp") {
                    await this.downloadFilesFromFTP(client, remotePath, localPath, task)
                } else {
                    await this.downloadFilesFromSFTP(client, remotePath, localPath, task)
                }
            } else {
                // 检查本地文件夹是否存在
                let dirName = path.dirname(task.localPath)
                if (!fs.existsSync(dirName)) {
                    fs.mkdirSync(dirName, { recursive: true });
                }

                task.remotePath = getNormalPath(task.remotePath)

                let ignoreArr: string[] = []
                //用户忽略配置
                if (config.downloadExcludePath) {
                    if (Array.isArray(config.downloadExcludePath)) {
                        ignoreArr = config.downloadExcludePath
                    } else {
                        ignoreArr = [...config.downloadExcludePath.split(",")]
                    }
                }
                let isExclude = await isIgnore(ignoreArr, task.remotePath, true)
                if (isExclude) {
                    return
                }


                FileTransfer.noUploadFiles.add(localPath)
                if (config.type === "ftp") {
                    // 下载文件
                    const fileSize = await client.size(task.remotePath);
                    client.trackProgress(async (info: any) => {
                        if (info.type == 'download') {
                            if (!fileSize) {
                                task.useTime = getUseTime(task.start)
                                task.progress = 100
                                setTimeout(() => {
                                    FileTransfer.noUploadFiles.delete(localPath)
                                }, 3000);
                            } else {
                                const progress = Math.min(parseFloat(((info.bytes / fileSize) * 100).toFixed(2)), 100);
                                console.log(`下载进度: ${progress}% (${info.bytes} / ${fileSize} 字节)`);
                                task.progress = progress
                                if (progress >= 100 || !info.bytes) {
                                    delete this.existFileSize[info.name]
                                    task.useTime = getUseTime(task.start)
                                    setTimeout(() => {
                                        FileTransfer.noUploadFiles.delete(localPath)
                                    }, 3000);
                                }
                            }
                            updateTaskProgress();
                        }
                    });
                    await client.downloadTo(task.localPath, task.remotePath);
                    client.trackProgress()
                } else {
                    // 下载文件
                    await client.fastGet(task.remotePath, task.localPath, {
                        step: async (transferred: number, chunk: any, total: number) => {
                            console.log(`已传输: ${transferred}/${total} 字节`);
                            let progress = Math.min(parseFloat(((transferred / total) * 100).toFixed(2)), 100);
                            task.progress = progress
                            if (progress >= 100) {
                                task.useTime = getUseTime(task.start)
                                setTimeout(() => {
                                    FileTransfer.noUploadFiles.delete(localPath)
                                }, 3000);
                            }
                            updateTaskProgress();
                        }
                    });
                }
            }
        } catch (err) {
            console.error(`Error downloading file: ${err}`);
            throw err;
        }
    }


    async downloadFilesFromFTP(client: any, remotePath: string, localPath: string, task: Task) {
        try {
            const list = await client.list(remotePath); // 列出远程文件
            for (const item of list) {
                let remoteFilePath = path.join(remotePath, item.name);
                const localFilePath = path.join(localPath, item.name);

                if (item.isDirectory) {
                    // 递归处理子目录
                    await this.downloadFilesFromFTP(client, remoteFilePath, localFilePath, task);
                } else {
                    let obj = JSON.parse(JSON.stringify(task));
                    obj.localPath = localFilePath
                    obj.remotePath = remoteFilePath
                    obj.operationType = "download"
                    obj.isDirectory = false
                    FileTransfer.addTask(obj)
                }
            }
        } catch (err) {
            console.error(`FTP 下载文件出错: ${err}`);
            throw err;
        }
    }

    async downloadFilesFromSFTP(client: any, remotePath: string, localPath: string, task: Task) {
        try {
            const list = await client.list(remotePath); // 列出远程文件
            for (const item of list) {
                let remoteFilePath = path.join(remotePath, item.name);
                const localFilePath = path.join(localPath, item.name);

                if (item.type === 'd') { // 检查是否是目录
                    // 递归处理子目录
                    await this.downloadFilesFromSFTP(client, remoteFilePath, localFilePath, task);
                } else {
                    let obj = JSON.parse(JSON.stringify(task));
                    obj.localPath = localFilePath
                    obj.remotePath = remoteFilePath
                    obj.operationType = "download"
                    obj.isDirectory = false
                    FileTransfer.addTask(obj)
                }
            }
        } catch (err) {
            console.error(`SFTP 下载文件出错: ${err}`);
            throw err;
        }
    }

    async existFTPFile(client: any, remotePath: string) {
        let exists = false
        try {
            let dirname = getNormalPath(path.dirname(remotePath));
            let res = await client.list(dirname)
            if (res.filter((v: any) => v.name == path.basename(remotePath)).length == 1) {
                exists = true
            }
        } catch (err) {
            exists = false
        }
        return exists
    }

    // 重命名任务
    async renameFile(client: any, task: Task, from: boolean = true) {
        let { localPath: oldPath, remotePath: newPath, config, fileType } = task;
        if (!oldPath || !newPath) return

        try {
            let { up_to_root, remotePath: newRemotePath } = isUpRoot(task.config, newPath, this.rootPath)
            let { remotePath: oldRemotePath } = isUpRoot(task.config, oldPath, this.rootPath)
            if (from && up_to_root) {
                newPath = newRemotePath
                oldPath = oldRemotePath
            }
            let exists = false
            // 检查文件是否存在
            if (config.type === "ftp") {
                oldPath = path.posix.join("/", oldPath)
                newPath = path.posix.join("/", newPath)
                exists = await this.existFTPFile(client, oldPath)
            } else {
                exists = await client.exists(oldPath);
            }
            if (exists) {
                //存在直接重命名
                await client.rename(oldPath, newPath);
                task.progress = 100
                task.useTime = getUseTime(task.start)
            } else {
                //不存在则上传
                let localPath = task.localPath
                if (!fs.existsSync(task.localPath)) {
                    localPath = path.posix.join(
                        this.rootPath,
                        path.relative(config.type == 'ftp' ? "" : task.config.remotePath, newPath)
                    )
                }
                // 判断是文件还是文件夹
                if (fileType == 'directory') {
                    task.localPath = localPath
                    await this.uploadFolder(task)
                } else {
                    //判断文件夹是否存在
                    let dirName = path.dirname(newPath)
                    dirName = config.type == 'ftp' ? path.posix.join("/", dirName) : dirName
                    await this.checkExistFolder(task.config, client, dirName)

                    let newTask = JSON.parse(JSON.stringify(task))
                    newTask.localPath = localPath
                    newTask.remotePath = config.type == 'ftp' ? path.posix.join("/", newPath) : newPath
                    newTask.operationType = "upload"
                    FileTransfer.addTask(newTask)
                }
            }
            return
        } catch (err) {
            console.error(`Error renaming file: ${err}`);
            throw err;
        }
    }

    // 删除任务
    async deleteFile(client: any, task: Task, from: boolean = true) {
        let { remotePath, config } = task;
        try {
            let { up_to_root, remotePath: newRemotePath } = isUpRoot(this.configItem, remotePath, this.rootPath)
            if (from && up_to_root) {
                remotePath = newRemotePath
            }
            remotePath = getNormalPath(remotePath)
            if (config.type === "ftp") {
                let basename = path.basename(remotePath)
                // 判断basename中是否包含空格
                let dirname = path.dirname(remotePath)

                basename = getNormalPath(basename)
                dirname = getNormalPath(dirname)
                if (basename == ".") {
                    await client.removeDir(remotePath, true)
                } else {
                    if (/\s/.test(basename)) {
                        await client.cd(dirname)
                        let files = await client.list()
                        for (const v of files) {
                            if (v.name == basename) {
                                if (v.type == 1) {
                                    await client.remove(basename)
                                }
                                if (v.type == 2) {
                                    await client.removeDir(basename)
                                }
                            }
                        }
                        await client.cd("/")
                    } else {
                        let files = await client.list(dirname)
                        if (files.length) {
                            for (let v of files) {
                                if (v.name == basename) {
                                    // type 0 Unknown 1 File 2 Directory 3 SymbolicLink
                                    if (v.type == 1) {
                                        await client.remove(remotePath)
                                    }
                                    if (v.type == 2) {
                                        await client.removeDir(remotePath, true)
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                const res = await client.exists(remotePath);
                // 判断是文件还是文件夹
                if (res) {
                    if (res == "-") {
                        await client.delete(remotePath)
                    } else if (res == "d") {
                        await client.rmdir(remotePath, true)
                    }
                }
            }
            task.progress = 100
            task.useTime = getUseTime(task.start)
            return
        } catch (err) {
            console.error(`Error deleting file: ${err}`);
            throw err;
        }
    }


    // 动态增加并发数
    async addMaxConcurrency(config: FileTransferConfigItem) {
        const queue = FileTransfer.queues[config.name]; // 根据 configItem.name 获取对应的队列
        if (queue.length() < this.uploadTaskNumber || queue.concurrency >= this.maxConnections) {
            return
        }
        await this.mutex.runExclusive(async () => {
            let testSuccess = true;
            let retryCount = 0;
            const maxRetries = 3;
            const retryDelay = 1000;

            while (retryCount < maxRetries && testSuccess) {
                try {
                    const pool = (config.type === "ftp")
                        ? FileTransfer.ftpConnectionPools[config.name]
                        : FileTransfer.sftpConnectionPools[config.name];

                    if (pool.length >= this.maxConnections + queue.running()) {
                        console.log(`Max connections of ${this.maxConnections} already achieved.`);
                        break;
                    }

                    const connections = [];
                    for (let i = 0; i < this.maxConnections - queue.running() - pool.length; i++) {
                        connections.push(this.getClient(config));
                    }

                    let arr = await Promise.all(connections);
                    await Promise.all(arr.map(client => this.releaseClient(client, config)));

                    if (queue.concurrency < this.maxConnections) {
                        console.log(`Increasing concurrency...`);
                        queue.concurrency++;
                        FileTransfer.maxConnectionsMap[config.name] = queue.concurrency;
                    } else {
                        console.log(`Connection pool not filled. Current pool length: ${queue.concurrency}`);
                        testSuccess = false; // 强制退出
                    }

                } catch (e) {
                    console.error(`Error during connection:`, e);
                    testSuccess = false; // 遇到错误，退出循环
                }

                retryCount++;

                if (retryCount < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                }
            }

            console.log(`Final connection pool length: ${(config.type === "ftp")
                ? FileTransfer.ftpConnectionPools[config.name].length
                : FileTransfer.sftpConnectionPools[config.name].length}`);

        });
    }

    async checkExistFolder(config: FileTransferConfigItem, client: any, file: string) {
        file = path.posix.join("/", file)
        file = getNormalPath(file)
        if (this.existCreateDir[config.name].has(file)) {
            return
        }

        if (config.type === "ftp") {
            try {
                let exist = await this.existFTPFile(client, file)
                if (!exist) {
                    await client.ensureDir(file)
                    this.existCreateDir[config.name].add(file);
                }
            } catch (error: any) {
                throw error;
            }
        } else {
            const exists = await client.exists(file);
            if (!exists) {
                await client.mkdir(file, true)
                this.existCreateDir[config.name].add(file);
            }
        }
    }

    /**
     * 关闭所有 FTP 或 SFTP 连接
     * @param name 指定要关闭的连接池名称，默认为空字符串，表示关闭所有连接池
     */
    static async closeAll(name: string = '') {
        const closeConnections = async (pools: Record<string, any[]>, closeMethod: string) => {
            const tasks = [];
            for (const [k, clients] of Object.entries(pools)) {
                !name && await FileTransfer.changeAsyncStatus(k, 'stop');
                // 并行关闭所有客户端
                tasks.push(...clients.map(async (client) => {
                    await client[closeMethod]();
                }));
                // 清空连接池
                pools[k] = [];
            }

            // 等待所有客户端关闭操作完成
            await Promise.all(tasks);
        };

        await closeConnections(FileTransfer.ftpConnectionPools, 'close');
        await closeConnections(FileTransfer.sftpConnectionPools, 'end');
    }


    static async changeAsyncStatus(name: string, type: string) {
        const queue = FileTransfer.queues[name]; // 根据 configItem.name 获取对应的队列
        if (!queue) return
        switch (type) {
            case 'pause':
                queue.pause();
                break;
            case 'restart':
                queue.resume();
                break;
            case 'stop':
                queue.kill();
                myEvent.fire({
                    name: name,
                    status: 'complete_sync',
                    type: 'refreshSyncStatus',
                })
                break;
            default:
                break;
        }
    }

    //清空缓存
    clearCache = async (config: FileTransferConfigItem) => {
        console.log("清空缓存");
        // 获取 workspaceState 对象
        const workspaceState = this.context.workspaceState
        let cache_key = config.name + "###" + this.rootPath
        await workspaceState.update(cache_key, "")
        myEvent.fire("update")
    }

    static async addTask(task: Task, lock: boolean = false) {
        const instance = FileTransfer.instance;
        const queue = FileTransfer.queues[task.config.name]; // 根据 config.name 获取对应的队列
        task.remotePath = getNormalPath(task.remotePath)

        myEvent.fire({
            name: task.config.name,
            status: 'start_sync',
            type: 'refreshSyncStatus',
        })

        try {
            if (lock) {
                // 如果需要锁，获取锁并执行任务
                const release = await instance.mutex.acquire();
                try {
                    queue.push(task);
                } finally {
                    release();  // 确保任务执行完成后释放锁
                }
            } else {
                // 不需要锁的任务直接执行
                queue.push(task);
            }
        } catch (error) {
            // 捕获并处理异常
            console.error("Failed to add task to queue:", error);
        }
    }
}
