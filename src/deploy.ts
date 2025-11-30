const childProcess = require("child_process")
const isDirectory = require("is-directory")
import fs from "fs-extra"
import path from "path"
import dayjs from "dayjs"
import archiver from "archiver"
import { l10n } from "vscode"
import * as vscode from "vscode"
import FileTransfer from "./FileTransfer"
import { myEvent } from './events/myEvent';

import { Dependency } from "./treeProvider"
import { FileOpType, FileTransferConfigItem } from "./types/config"
import { oConsole, getAllFiles, checkSubmitGit, getAllowFiles, verityConfig, getRootPath, throttle } from "./utils"
import { getContext } from "./config/globals"
import { ClientConnectionError, NoWatchFilesError } from "./types/connect"
import { addLogTask } from "./output"
import { StatusBarUi } from "./statusBar"

const { log, error } = oConsole

export class Deploy {
	label: string
	config: FileTransferConfigItem
	fileTransfer: FileTransfer
	files: any[] //需要上传的文件或文件夹
	rename_files: any[] //需要重命名的文件或文件夹
	delete_files: any[] //需要删除的文件或文件夹
	zipPath: string
	useZip: boolean
	context: vscode.ExtensionContext
	rootPath: string
	taskList: {
		task: () => void | Promise<any>
		type: string
		tip: string
		increment: number
		async?: boolean
	}[]
	client: any
	all_upload: boolean
	isCanceled: boolean // 添加一个取消标志位

	constructor(dependency: Dependency) {
		this.label = dependency.config.name
		this.config = dependency.config;
		this.context = getContext();
		this.rootPath = getRootPath()
		this.zipPath = ""
		this.useZip = false
		this.all_upload = false
		this.files = []
		this.rename_files = []
		this.delete_files = []
		this.fileTransfer = new FileTransfer(this.config)
		this.isCanceled = false // 初始化为 false，表示未取消

		this.taskList = [
			{ type: 'check config', task: this.checkConfig, tip: l10n.t('Configuration check'), increment: 0, async: true },
			{ type: 'submit git', task: this.submitGIt, tip: l10n.t('Submit Git'), increment: 10, async: true },
			{ type: 'connect', task: this.connect, tip: l10n.t('Connect to server'), increment: 30, async: true },
			{ type: 'exec build', task: this.execBuild, tip: l10n.t('Package'), increment: 20, async: true },
			{ type: 'build zip', task: this.buildZip, tip: l10n.t('Compress file'), increment: 40, async: true },
			{ type: 'delete remote file', task: this.rmRemoteFile, tip: l10n.t('Delete server file'), increment: 50, async: true },
			{ type: 'start sync', task: this.syncFiles, tip: l10n.t('Start sync'), increment: 80, async: true }
		]
	}

	// 新增退出方法，用于设置 isCanceled 标志位
	cancel() {
		this.isCanceled = true
	}

	start = () => {
		return new Promise<void>(async (resolve, reject) => {
			let isError = false
			try {
				const { taskList } = this
				const { length } = taskList
				for (let i = 0; i < length; i++) {
					if (isError || this.isCanceled) break // 检查 isCanceled 标志位
					const { task, async, tip, increment, type } = taskList[i]
					if (async === false) {
						task()
					} else {
						await task()
					}
					switch (type) {
						case 'submit git':
							this.config.submit_git_before_upload && this.showLog(this.config, type, '', tip)
							break;
						case 'exec build':
							this.config.build && this.showLog(this.config, type, 'success', this.config.build)
							break;
						case 'build zip':
							this.config.compress && this.showLog(this.config, type, 'success', tip + "：" + this.zipPath)
							break;
						case 'delete remote file':
							this.config.deleteRemote && this.showLog(this.config, type, 'success', tip)
							break;
						default:
							this.showLog(this.config, type, '', tip)
							break;
					}

				}
				if (this.isCanceled) {
					this.files = []
					reject(new Error(l10n.t('Task canceled')))
				} else {
					resolve()
				}
			} catch (err) {
				isError = true
				if (!(err instanceof ClientConnectionError)) {
					let msg = `[${this.label}][${this.config.type}][error]`;
					// this.showLog(this.config, type, 'error/', tip)
					vscode.window.showErrorMessage(`${msg}: ${err?.toString()}`);
				}
				// await FileTransfer.changeAsyncStatus(this.config.name, 'stop')
				myEvent.fire({
					name: this.label,
					status: 'complete_sync',
					type: 'refreshSyncStatus',
				})
				reject(err)
			}
		});
	}

	// 检查配置文件是否完整
	checkConfig = async () => {
		log(`检测配置`)
		let { distPath, watch } = this.config
		await verityConfig(this.config)
		if (!Array.isArray(distPath)) {
			distPath = distPath?.split(",")
		}
		if (!distPath?.length) {
			distPath = [""]
		}

		// 监听模式，只上传缓存中变动文件
		if (watch) {
			// 获取缓存中的文件
			// 获取 workspaceState 对象
			const workspaceState = this.context.workspaceState
			// 从 workspaceState 中读取数据
			let cache_key = this.label + "###" + this.rootPath
			let newGlobalData = workspaceState.get(cache_key)

			if (typeof newGlobalData === "object" && newGlobalData !== null) {
				for (const [key, value] of Object.entries(newGlobalData)) {
					let data = {
						file: key,
						opType: value
					}
					this.files.push(data)
				}
			}
			if (!this.files.length) {
				throw new NoWatchFilesError(l10n.t('No changed files in watch mode'));
			}
		} else {
			// 非监听模式，上传目标目录
			for (let v of distPath) {
				v = path.join(this.rootPath, v)
				if (!isDirectory.sync(v)) {
					this.files.push({
						file: v,
						opType: {
							op: "add",
							type: "file"
						}
					})
					continue
				}
				let res = await getAllowFiles(
					this.config,
					v
				)
				if (res && res.length) {
					res.map((vv) => {
						this.files.push({
							file: vv,
							opType: {
								op: "add",
								type: "file"
							}
						})
					})
				}
			}
		}
	}

	// 提交git
	submitGIt = async () => {
		log(`提交git`)
		try {
			await checkSubmitGit(this.rootPath, this.config)
		} catch (error) {
			throw error
		}
	}

	// 执行打包脚本
	execBuild = () => {
		log(`执行打包脚本`)
		const { config } = this
		const { build } = config
		if (!build) {
			return Promise.resolve()
		}
		return new Promise<void>((resolve, reject) => {
			childProcess.exec(
				`${build}`,
				{ cwd: this.rootPath, maxBuffer: 1024 * 1024 * 1024 },
				(e: { message: any } | null) => {
					if (e === null) {
						resolve()
					} else {
						reject(l10n.t('Failed to execute packaging script: ') + e.message)
					}
				}
			)
		})
	}

	// 连接服务器
	connect = async () => {
		try {
			let client = await this.fileTransfer.getClient(this.config, true)
			await this.fileTransfer.releaseClient(client, this.config)
		} catch (error) {
			throw error
		}
	}

	buildZip = async () => {
		const { config } = this;
		if (!config.compress) return;

		if (!Array.isArray(config.distPath)) {
			if (typeof config.distPath === "string") {
				config.distPath = config.distPath.split(",");
			} else {
				config.distPath = [];
			}
		}

		// 是否上传到根目录
		let is_upload_root = false;
		let remote_file = "";
		if (config.distPath?.length === 1 && config.upload_to_root) {
			is_upload_root = true;
			remote_file = config.distPath[0];
		}

		this.zipPath = "upload_" + dayjs().format("YYYYMMDD_HHmmss") + ".zip";
		log(`压缩文件夹：${this.zipPath}`);
		const archive = archiver("zip", {
			zlib: { level: 9 }
		});

		const zipPath = path.join(this.rootPath, this.zipPath);
		FileTransfer.noUploadFiles.add(zipPath);

		try {
			const output = fs.createWriteStream(zipPath);
			archive.pipe(output);

			const arr = [];
			const basePath = remote_file && is_upload_root
				? path.join(this.rootPath, remote_file)
				: this.rootPath;

			// 1. 先收集所有需要处理的文件
			for (const v of this.files) {
				if (!v.file || !fs.existsSync(v.file) || !["add", "edit"].includes(v.opType?.op)) {
					continue;
				}
				arr.push(v);
				// await this.handleZipFile(v.file, archive, isDirectory.sync(basePath) ? basePath : this.rootPath);
			}
			if (!arr.length) {
				throw new Error(l10n.t('noFilesThatNeedToBeCompressed'));
			}

			for (const v of arr) {
				// this.handleZipFile(v.file, archive, isDirectory.sync(basePath) ? basePath : this.rootPath);
				archive.file(v.file, { name: path.relative(basePath, v.file) });
			}

			let msg = l10n.t('Compressing files');
			await new Promise<void>((resolve, reject) => {
				archive.on('error', (e) => {
					reject(e)
				});
				// archive.on('progress', throttle((e) => {
				// 	if (e.entries.processed == e.entries.total) {
				// 		StatusBarUi.working(`${msg}:${this.zipPath} 100%`)
				// 		resolve()
				// 	}

				// 	if (e.fs.totalBytes > 30 * 1024 * 1024) {
				// 		const progress = Math.min(parseFloat(((e.entries.processed / e.entries.total) * 100).toFixed(2)), 100);
				// 		StatusBarUi.working(`${msg}:${this.zipPath} ${progress}%`)
				// 	}
				// }, 300));

				output.on('error', (e) => {
					reject(e)
				});
				output.on('finish', () => {
					resolve()
				});
				archive.finalize();
			});

			this.useZip = true;
			setTimeout(() => {
				FileTransfer.noUploadFiles.delete(zipPath);
			}, 2000);

		} catch (e) {
			error(e?.toString());
			throw new Error(l10n.t('Packaging error:') + e?.toString());
		}
	}

	handleZipFile = async (vFile: string, archive: archiver.Archiver, basePath: string) => {
		if (!isDirectory.sync(vFile)) {
			// 是文件
			archive.file(vFile, { name: path.relative(basePath, vFile) });
		} else {
			// 是文件夹，获取所有子文件
			let files = await getAllFiles(vFile);
			files.map((vv, ii) => {
				archive.file(vv, { name: path.relative(basePath, vv) });
			});
		}
	}

	// 删除远程文件
	rmRemoteFile = async () => {
		log(`删除远程文件`)
		const { config } = this
		let { deleteRemote, remotePath, distPath, type } = config
		if (deleteRemote) {
			let remoteFilePath = type == 'ftp' ? "" : remotePath
			log(`4. 删除远程文件 ${remoteFilePath}`)

			let arr: string[] = []
			if (!Array.isArray(distPath)) {
				distPath = distPath?.split(",")
			}
			distPath?.map((v: string) => {
				if (!path.isAbsolute(v)) {
					v = path.join(remoteFilePath, v)
				}
				arr.push(v)
			})

			if (arr.length == 0 || (arr.length == 1 && config.upload_to_root)) {
				await this.deleteRemotePath(remoteFilePath)
			} else {
				for (const v of arr) {
					await this.deleteRemotePath(v)
				}
			}
		}
	}


	async deleteRemotePath(remotePath: string) {
		await FileTransfer.addTask({
			config: this.config,
			localPath: "",
			remotePath,
			operationType: 'delete'
		}, true);
	}

	// 同步文件
	syncFiles = async () => {
		log(`同步文件`)
		// 是否压缩上传
		if (this.config.compress && this.useZip) {
			console.log("上传压缩文件");
			let remotePath = path.join(this.config.type !== "ftp" ? this.config.remotePath : "", this.zipPath)
			const localPath = path.join(this.rootPath, this.zipPath)

			if (fs.existsSync(localPath)) {
				FileTransfer.addTask({
					config: this.config,
					localPath,
					remotePath,
					useZip: this.useZip,
					operationType: 'upload'
				});
			}
		} else {
			for (const v of this.files) {
				switch (v.opType.op) {
					case "add":
					case "edit":
						this.uploadFile(v)
						break
					case "rename":
						this.renameFile(v)
						break
					case "delete":
						this.deleteFile(v)
						break;
					default:
						break
				}
			}
		}
	}

	async uploadFile(v: FileOpType) {
		if (!fs.existsSync(v.file)) {
			return
		}
		if (!Array.isArray(this.config.distPath)) {
			this.config.distPath = this.config.distPath?.split(",")
		}
		let len = this.config.distPath?.length || 0

		let remotePath = path.join(
			this.config.type !== "ftp" ? this.config.remotePath : "",
			path.relative(this.rootPath, v.file)
		)

		// 只有一个目录则上传该目录下文件，不包含目录
		let up_to_root = false
		if (len == 1 && this.config.distPath && this.config.upload_to_root) {
			up_to_root = true

			let new_path = path.join(this.rootPath, this.config.distPath[0])
			remotePath = path.join(
				this.config.type !== "ftp" ? this.config.remotePath : "",
				path.relative(new_path, v.file)
			)
		}

		// 判断是文件还是文件夹
		if (isDirectory.sync(v.file)) {
			let files = await getAllowFiles(
				this.config,
				v.file
			)
			if (files && files.length) {
				for (const vv of files) {
					if (up_to_root) {
						remotePath = path.join(
							this.config.type !== "ftp" ? this.config.remotePath : "",
							path.relative(this.config.type !== "ftp" ? this.rootPath : "", vv)
						)
					}

					remotePath = this.config.type == "ftp" ? path.posix.join("/", remotePath) : remotePath
					await FileTransfer.addTask({
						config: this.config,
						localPath: vv,
						remotePath,
						operationType: 'upload'
					});
				}
			}
		} else {
			remotePath = this.config.type == "ftp" ? path.posix.join("/", remotePath) : remotePath
			await FileTransfer.addTask({
				config: this.config,
				localPath: v.file,
				remotePath,
				operationType: 'upload'
			});
		}
	}

	async renameFile(v: FileOpType) {
		if (!v.opType.newname || !fs.existsSync(v.opType.newname)) {
			return
		}

		let remotePath = path.join(
			this.config.type !== "ftp" ? this.config.remotePath : "",
			path.relative(this.rootPath, v.opType.newname)
		)
		let localPath = path.join(
			this.config.type !== "ftp" ? this.config.remotePath : "",
			path.relative(this.rootPath, v.file)
		)

		// 重命名文件
		await FileTransfer.addTask({
			config: this.config,
			localPath,
			remotePath,
			operationType: 'rename'
		});
	}

	async deleteFile(v: FileOpType) {
		let remotePath: string = path.join(
			this.config.type !== "ftp" ? this.config.remotePath : "",
			path.relative(this.rootPath, v.file)
		)

		await FileTransfer.addTask({
			config: this.config,
			localPath: '',
			remotePath,
			operationType: 'delete'
		});
	}

	showLog(config: FileTransferConfigItem, type: string, status: string, msg: string = '') {
		let time = dayjs().format('YYYY-MM-DD HH:mm:ss')
		let status_txt = status ? `[${status}]` : ''
		let txt = `[${time}][${config.name}][${config.type}][${type}]${status_txt}: ${msg}`;
		addLogTask(txt);
	}



}


