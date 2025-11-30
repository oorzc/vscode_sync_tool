import fs from "fs-extra"
import * as os from "os"
import * as path from "path"
import * as vscode from "vscode"
import { l10n } from "vscode"
import { FileTransferConfigItem, opType } from './types/config';
import { CACHE_DIRNAME, URI_SCHEME } from './config/config';
import { addConfig, getUserConfig, toArray, isIgnore, getRootPath, getIgnoreConfig, debounce, generateRandomPassword, getPluginSetting, sleep, showInformationMessage } from "./utils"
import { uploadOnSave } from "./events/uploadOnSave"
import { myEvent } from "./events/myEvent"
import { DepNodeProvider } from "./treeProvider"
import { getContext, setContext } from "./config/globals";
import FileTransfer from "./FileTransfer";
import { MemFS } from "./FileProvider";
import { cleanLogTask, outputChannel } from "./output";
import { StatusBarUi } from "./statusBar";
import { Mutex } from 'async-mutex';
import { CodeLensProvider, handleEncryptionOrDecryption } from "./CodeLensProvider"

const isDirectory = require("is-directory")
var CryptoJS = require("crypto-js")

let treeProvider: DepNodeProvider
let TreeView: vscode.TreeView<vscode.TreeItem>

// 防止重命名时，会触发创建文件监听
let renamingFiles: Set<string> = new Set();
// 防止保存时，会触发保存文件监听
let saveFiles: Set<string> = new Set();

// TODO 添加拖拽上传是否需要确认功能，添加ssh右键解压功能，有同步任务时需要刷新同步状态
// TODO watch上传后未清空缓存，需要添加清空缓存功能
// TODO 释放git操作exec
// TODO 检查忽略文件提交
// TODO 下载忽略文件测试
// TODO ssh压缩解压
// TODO 翻译多国语言

// 激活事件
export async function activate(context: vscode.ExtensionContext) {
	// 获取当前时间的毫秒数
	const milliseconds = new Date().getTime();
	let time = CryptoJS.AES.decrypt('U2FsdGVkX196uw7MjNwzhzM5krwWTaEiXoT32XVjezc=', 'sync_tools').toString(CryptoJS.enc.Utf8)
	if (time < milliseconds) {
		return vscode.window.showInformationMessage(l10n.t('thePluginHasExpiredPleaseDownloadTheLatestVersion'))
	}

	// 在扩展启动时，将 context 设置为全局变量
	setContext(context)

	await context.workspaceState.update("sync_config", "")
	vscode.commands.executeCommand("setContext", "canEdit", false);

	const provider = new MemFS();
	context.subscriptions.push(vscode.workspace.registerFileSystemProvider(URI_SCHEME, provider, { isCaseSensitive: true }));

	let rootPath = getRootPath()
	treeProvider = new DepNodeProvider()

	let mutex = new Mutex();  // 初始化锁


	// 注册树视图
	TreeView = vscode.window.createTreeView("asyncToolsView", {
		canSelectMany: true,
		showCollapseAll: false,
		treeDataProvider: treeProvider,
		dragAndDropController: treeProvider
	})
	context.subscriptions.push(TreeView)
	// context.subscriptions.push(treeProvider);

	// 监听自定义事件触发
	myEvent.event(async (eventType: any) => {
		if (eventType == 'update') {
			debouncedUpdateViewCount()
		}
		if (eventType == 'updateMenu') {
			debouncedRefreshMenu()
		}
		if (typeof eventType == 'object') {
			if (eventType.type == 'refreshNode') {
				// 获取锁
				const release = await mutex.acquire();
				try {
					// 执行任务
					await treeProvider.uploadComplete(eventType.task)
				} finally {
					// 释放锁
					release();
				}
			}
			if (eventType.type == 'refreshSyncStatus') {
				treeProvider.updateSyncStatus(eventType.name, eventType.status)
			}
		}
	})
	// 初始化数字显示
	myEvent.fire("update")

	// 添加配置
	let handleAddConfig = vscode.commands.registerCommand(
		"sync_tools.addConfig",
		async () => {
			await addConfig(
				rootPath
			)
			myEvent.fire("update")
		}
	)
	context.subscriptions.push(handleAddConfig)

	// 获取 workspaceState 对象
	const workspaceState = context.workspaceState;
	workspaceState.update("sync_config", "")

	// 注册清除所有缓存的命令
	vscode.commands.registerCommand("sync_tools.clearAllCache", () => clearAllCache(workspaceState))
	// 注册关闭所有连接命令
	vscode.commands.registerCommand("sync_tools.closeAllClient", async () => {
		myEvent.fire("updateMenu")
		FileTransfer.closeAll()
	})
	//清除日志记录
	vscode.commands.registerCommand('sync_tools.clearAllLog', () => {
		cleanLogTask(true)
	});
	// 显示日志输出
	vscode.commands.registerCommand('sync_tools.outputShow', () => {
		treeProvider.getAllNodes()
		outputChannel.show(true)
	});

	// 右键上传文件
	vscode.commands.registerCommand('sync_tools.uploadFilesByExplorer', async (source) => {
		const item = await getDefaultConfig();
		if (item) {
			await uploadFileTask(item, source.fsPath);
		}
	});

	// 右键对比远程文件
	vscode.commands.registerCommand('sync_tools.compareFileByExplorer', async (source) => {
		const item = await getDefaultConfig();
		if (item) {
			await compareFileTask(item, source.fsPath);
		}
	});

	//打开项目设置
	context.subscriptions.push(
		vscode.commands.registerCommand('sync_tools.editConfig', async () => {
			let configPath = path.join(rootPath, 'sync_config.jsonc')
			if (!fs.existsSync(configPath)) return

			const uri = vscode.Uri.file(configPath);
			const document = await vscode.workspace.openTextDocument(uri);
			await vscode.window.showTextDocument(document, {
				preview: false,
				viewColumn: vscode.ViewColumn.Active,
			});
		})
	);

	//打开插件设置
	context.subscriptions.push(
		vscode.commands.registerCommand('sync_tools.openPluginSetting', () => {
			vscode.commands.executeCommand('workbench.action.openSettings', '@ext:oorzc.ssh-tools');
		})
	);


	//代码透镜，在指定文字上方添加操作
	CodeLensProvider(context)


	// 注册文件变动监听
	initFileEvents(context)
}


// 获取默认配置
async function getDefaultConfig() {
	const config = await getUserConfig(2);
	if (!config) return null;

	const defaultConfig = toArray(config).filter(v => v.default);
	if (defaultConfig.length === 0) {
		vscode.window.showErrorMessage(l10n.t("Please set the default configuration first: {default: true}"));
		return null;
	} else if (defaultConfig.length > 1) {
		vscode.window.showErrorMessage(l10n.t('Default configuration {default: true} cannot exceed 1'));
		return null;
	}
	return defaultConfig[0];
}

// 生成远程路径
function generateRemotePath(item: FileTransferConfigItem, sourcePath: string) {
	let rootPath = getRootPath()
	return path.posix.join(item.type !== "ftp" ? item.remotePath : "/", path.relative(rootPath, sourcePath));
}

// 上传文件任务
async function uploadFileTask(item: FileTransferConfigItem, sourcePath: string) {
	const remotePath = generateRemotePath(item, sourcePath);
	new FileTransfer(item);
	await FileTransfer.addTask({
		config: item,
		localPath: sourcePath,
		remotePath,
		isDirectory: isDirectory.sync(sourcePath),
		operationType: 'upload'
	});
}

// 比对文件任务
async function compareFileTask(item: FileTransferConfigItem, sourcePath: string) {
	const remotePath = generateRemotePath(item, sourcePath);
	const localPath = path.join(os.tmpdir(), CACHE_DIRNAME, item.name, remotePath);
	new FileTransfer(item);
	await FileTransfer.addTask({
		config: item,
		localPath,
		remotePath,
		compare: true,
		isDirectory: isDirectory.sync(sourcePath),
		operationType: 'download'
	});
}

// 注册文件创建监听器
function initFileEvents(context: vscode.ExtensionContext): void {
	let rootPath = getRootPath()
	if (!rootPath) return

	// 创建文件系统观察者
	const directoryToWatch = vscode.Uri.file(rootPath);
	const fileWatcher = vscode.workspace.createFileSystemWatcher(
		// 指定要监听的目录路径
		new vscode.RelativePattern(directoryToWatch, '**/*')
	);

	// 创建文件系统观察者
	// const fileWatcher = vscode.workspace.createFileSystemWatcher('**/*');
	context.subscriptions.push(
		fileWatcher.onDidCreate(async (uri) => {
			console.log(`创建了：${uri.fsPath}`)
			if (renamingFiles.has(uri.fsPath)) {
				return;
			}

			if (FileTransfer.noUploadFiles.has(uri.fsPath)) {
				return
			}

			if (uri.fsPath.indexOf(rootPath) == -1) return
			let opType = {
				op: "add",
				type: "file"
			}
			if (isDirectory.sync(uri.fsPath)) {
				opType.type = "directory"
			}
			saveChangeFile(context, uri.fsPath, opType)
		})
	)

	fileWatcher.onDidChange((uri) => {
		console.log(`修改了：${uri.fsPath}`)
		if (saveFiles.has(uri.fsPath)) {
			return;
		}
		if (uri.fsPath.indexOf(rootPath) == -1) return
		if (fs.lstatSync(uri.fsPath).isDirectory()) {
			let opType = {
				op: "add",
				type: "directory"
			}
			saveChangeFile(context, uri.fsPath, opType)
		} else {
			let opType = {
				op: "add",
				type: "file"
			}
			saveChangeFile(context, uri.fsPath, opType)
		}
	});
	// fileWatcher.onDidDelete((uri) => { });

	// 注册添加文件的事件（已废弃，无法监听git拉取文件）
	// context.subscriptions.push(
	// 	vscode.workspace.onDidCreateFiles((event) => {
	// 		const { files } = event
	// 		files.forEach(async (file) => {
	// 			console.log(`创建了：${file.fsPath}`)
	// 			let opType = {
	// 				op: "add",
	// 				type: "file"
	// 			}
	// 			if (isDirectory.sync(file.fsPath)) {
	// 				opType.type = "directory"
	// 			}
	// 			await saveChangeFile(context, file.fsPath, opType)
	// 		})
	// 	})
	// )

	// 修改文件监听器
	context.subscriptions.push(
		vscode.workspace.onDidSaveTextDocument((document) => {
			debounceSave(document)
		})
	)

	// 注册文件删除前的事件
	context.subscriptions.push(
		vscode.workspace.onWillDeleteFiles(async (e) => {
			for (const v of e.files) {
				console.log(`删除了：${v.fsPath}`)
				if (v.fsPath.indexOf(rootPath) == -1) continue
				if (fs.lstatSync(v.fsPath).isDirectory()) {
					let opType = {
						op: "delete",
						type: "directory"
					}
					saveChangeFile(context, v.fsPath, opType)
					// let files = await getAllFiles(v.fsPath)
					// for (const vv of files) {
					// 	let opType2 = {
					// 		op: "delete",
					// 		type: "file"
					// 	}
					// 	await saveChangeFile(context, vv, opType2)
					// }
				} else {
					let opType = {
						op: "delete",
						type: "file"
					}
					saveChangeFile(context, v.fsPath, opType)
				}
			}
		})
	)

	// 重命名监听器
	context.subscriptions.push(
		// vscode.workspace.onDidRenameFiles((event) => {
		vscode.workspace.onWillRenameFiles((event) => {
			const { files } = event
			for (const v of files) {
				console.log(`重命名了：${v.oldUri} 为 ${v.newUri}`)
				if (v.oldUri.fsPath.indexOf(rootPath) == -1) continue

				// 记录将要被重命名的文件或文件夹
				renamingFiles.add(v.newUri.fsPath);
				setTimeout(() => {
					renamingFiles.delete(v.newUri.fsPath)
				}, 10000);

				let opType = {
					op: "rename",
					type: "file",
					newname: v.newUri.fsPath
				}
				if (isDirectory.sync(v.oldUri.fsPath)) {
					opType.type = "directory"
				}
				saveChangeFile(context, v.oldUri.fsPath, opType)
			}
		})
	)
}

// 清除所有缓存
async function clearAllCache(workspaceState: vscode.Memento) {
	vscode.window.showInformationMessage(l10n.t('Are you sure you want to clear all watch caches?'), l10n.t('Confirm'), l10n.t('Cancel')).then(async selection => {
		if (selection === l10n.t('Confirm')) {
			// 获取所有key
			let keys = workspaceState.keys();
			// 清空所有缓存
			for (const v of keys) {
				await workspaceState.update(v, '');
			}
			myEvent.fire("update")
		}
	});
}


// 将变化文件加入缓存
async function saveChangeFile(
	context: vscode.ExtensionContext,
	file: string,
	opType: opType
) {
	// 去掉一些其他文件
	if (!fs.existsSync(file)) {
		return
	}

	// 获取 workspaceState 对象
	const workspaceState = context.workspaceState

	let rootPath = getRootPath(file)
	if (rootPath) {
		// 如果是操作的根目录下面的配置文件
		if (path.basename(file) == "sync_config.jsonc" || (opType.newname && path.basename(opType.newname) == "sync_config.jsonc")) {
			//清空sync_config缓存
			await workspaceState.update("sync_config", "")
			await workspaceState.update("excludePath", "")
			setTimeout(async () => {
				//重新生成配置
				await getUserConfig(2, 2)
				//关闭连接
				await FileTransfer.closeAll()
				// 刷新视图显示
				myEvent.fire("updateMenu")

			}, 100);
			return
		}

		let config = await getUserConfig(2, 2)
		if (config) {
			let list = toArray(config)
			list.forEach(async (item, index) => {
				if (path.basename(file) == ".gitignore") {
					//清空忽略文件配置缓存
					await workspaceState.update("excludePath", "")
					//清空ignore_config缓存
					await workspaceState.update("ignore_config_" + item.name, "")
				}
				let ignore_arr = await getIgnoreConfig(item, file)
				// 判断是否直传代码
				if (item.upload_on_save) {
					// 检测是否排除
					let res = await isIgnore(ignore_arr, file)
					if (!res) {
						uploadOnSave(item, file, opType)
					}
					return
				}

				// 判断是否监听项目
				if (!item.watch) return

				// 检测是否排除
				let res = await isIgnore(ignore_arr, file)
				if (!res) {
					let cache_key = item.name + "###" + rootPath
					// 从 workspaceState 中读取数据
					let globalData = workspaceState.get(cache_key)
					let data: Record<string, opType> = {}

					if (typeof globalData === "object" && globalData !== null) {
						data = globalData as Record<string, opType>
						// 防止对同一个文件重复操作
						let newOpType = JSON.parse(JSON.stringify(opType));
						if (data[file] && data[file].type == newOpType.type) {
							if (data[file].op == 'add' && newOpType.op == 'delete') {
								delete data[file]
							} else if (data[file] && data[file].op == 'delete' && newOpType.op == 'add') {
								delete data[file]
							} else if (data[file] && data[file].op == 'add' && newOpType.op == 'rename' && newOpType.newname) {
								newOpType.op = 'add'
								data[newOpType.newname] = newOpType
								delete data[file]
							} else if (data[file] && data[file].op == 'edit' && newOpType.op == 'rename' && newOpType.newname) {
								newOpType.op = 'add'
								data[newOpType.newname] = newOpType
								data[file].op = 'delete'
							} else {
								data[file] = opType
							}
						} else {
							let flag = false
							for (const [k, v] of Object.entries(data)) {
								if ((newOpType.op == 'rename' || newOpType.op == 'delete') && v.newname && v.newname == file) {
									flag = true
									data[k] = newOpType
								}
							}
							if (!flag) {
								data[file] = opType
							}
						}
					} else {
						data[file] = opType
					}
					// 向 workspaceState 中写入数据
					await workspaceState.update(cache_key, data)
				}
			})
			myEvent.fire("update")
		}
	}
}


// 防抖设置
let debounceSave = debounce(async (document) => {
	let rootPath = getRootPath()
	let context = getContext()
	console.log(`保存了文件`, document)

	// 记录将要被重命名的文件或文件夹
	saveFiles.add(document.uri.fsPath);
	setTimeout(() => {
		saveFiles.delete(document.uri.fsPath)
	}, 10000);

	if (document.uri.fsPath.indexOf(rootPath) == -1) {
		let pathArr = document.uri.fsPath.split(path.sep)
		if (pathArr.length < 3) return
		let config_name = pathArr[1]
		let remotePath = pathArr.slice(3).join("/")
		let localPath = pathArr.slice(4).join("/")
		localPath = localPath ? localPath : remotePath
		let filePath = path.join(os.tmpdir(), CACHE_DIRNAME, config_name, localPath)
		await treeProvider.saveFile(config_name, document.getText(), filePath, remotePath)
		return
	}

	// 执行你的操作
	let opType = {
		op: "edit",
		type: "file"
	}
	saveChangeFile(context, document.fileName, opType)
}, 800, true)

let debouncedUpdateViewCount = debounce(() => {
	treeProvider.refreshCount()
	let count = treeProvider.getCount()
	if (count) {
		TreeView.badge = { tooltip: count + l10n.t('Tasks pending upload'), value: treeProvider.getCount() }
	} else {
		TreeView.badge = { tooltip: '', value: 0 }
	}
}, 1000, false);

let debouncedRefreshMenu = debounce(() => {
	treeProvider.refresh()
}, 2000);

// 销毁周期
export async function deactivate() {
	StatusBarUi.dispose()
	FileTransfer.closeAll()
}