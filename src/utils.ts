import fs from "fs-extra"
import path from "path"
import * as vscode from "vscode"
import { l10n } from "vscode"
import stripJsonComments from "strip-json-comments"
import { DeployConfigItem, FileTransferConfigItem, Permissions } from "./types/config"
import lang from "./config/lang"
// 默认配置
import { configText, getExampleText } from "./config/default"
// jsonc处理
import * as jsonc from "jsonc-parser"
// 文件排除
import { minimatch } from "minimatch"
import { getContext } from "./config/globals"
import dayjs = require("dayjs")


const { exec } = require("child_process")
let systemLang: any = lang

export function sleep(ms: number = 1000) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export const oConsole = {
	log: (...message: any[]) => {
		console.log(...message)
	},
	// 成功信息
	succeed: (...message: any[]) => {
		console.log(...message)
	},
	// 提示信息
	info: (...message: any[]) => {
		console.log(...message)
	},
	// 错误信息
	error: (...message: any[]) => {
		console.error(...message)
	}
}


//获取插件配置
export const getPluginSetting = () => {
	return vscode.workspace.getConfiguration("SyncTools")
}


// 询问对话框同步版
export const showInformationMessage = (msg: string, confirmText = l10n.t('Confirm'), cancelText = l10n.t('Cancel')) => {
	return new Promise((resolve, reject) => {
		vscode.window.showInformationMessage(
			msg,
			confirmText,
			cancelText
		).then((value) => {
			resolve(value)
		});
	})
}


/**
 * 获取根路径
 */
export function getRootPath(file: string = ""): string {
	// 获取当前打开的工作区文件夹
	let workspaceFolders = vscode.workspace.workspaceFolders
	if (workspaceFolders && workspaceFolders.length) {
		return workspaceFolders[0].uri.fsPath;
	} else {
		return "";
	}

	// if (workspaceFolders) {
	// 	let rootPath = ""
	// 	//根据当前文件区分工作区
	// 	if (file) {
	// 		if (workspaceFolders.length > 1) {
	// 			rootPath = path.dirname(file)
	// 			workspaceFolders.map((v) => {
	// 				if (file.indexOf(v.uri.fsPath) != -1) {
	// 					rootPath = v.uri.fsPath
	// 				}
	// 			})
	// 		} else {
	// 			let workPath = workspaceFolders[0].uri.fsPath
	// 			if (isSubPath(file, workPath)) {
	// 				rootPath = workPath
	// 			} else {
	// 				rootPath = path.dirname(file)
	// 			}
	// 		}
	// 	} else {
	// 		rootPath = workspaceFolders[0].uri.fsPath
	// 	}
	// 	return rootPath
	// } else {
	// 	return ""
	// }
}

/**
 * 语言字符
 */
export const getLang = (lang: string, param: any = []) => {
	if (vscode.env.language == "zh-cn") {
		return vscode.l10n.t(lang, param)
	} else {
		if (systemLang[lang]) {
			return vscode.l10n.t(systemLang[lang], param)
		} else {
			return vscode.l10n.t(lang, param)
		}
	}
}

/**
 * 获取某个目录下所有文件
 * @param dir
 * @param is_ignore 是否需要忽略文件或文件夹
 * @param ignore_arr
 * @returns
 */
export const getAllFiles = async (
	dir: string,
	is_ignore: boolean = false,
	ignore_arr: string[] = []
) => {
	let results: string[] = []
	if (fs.existsSync(dir)) {
		let files = fs.readdirSync(dir)
		for (let item of files) {
			let flag = false
			item = path.join(dir, item)
			if (is_ignore) {
				let res = await isIgnore(ignore_arr, item)
				if (!res) {
					flag = true
				}
			} else {
				flag = true
			}
			if (flag) {
				if (fs.lstatSync(item).isDirectory()) {
					results.push(...(await getAllFiles(item, is_ignore, ignore_arr)))
				} else {
					results.push(item)
				}
			}
		}
	}
	return results
}

/**
 * 获取需要上传的文件
 * @param context
 * @param obj
 * @param rootPath
 * @param file
 * @returns
 */
export const getAllowFiles = async (
	config: FileTransferConfigItem,
	file: string,
	view: boolean = false,
) => {
	if (!file) return false
	let rootPath = getRootPath(file)
	let ignore_arr = await getIgnoreConfig(config, file, view)
	let arr = []
	//区分根目录和非根目录
	if (rootPath == file) {
		let files = await getAllFiles(file, true, ignore_arr)
		arr.push(...files)
		for (const v of ignore_arr) {
			if (v.startsWith("!")) {
				let other_files = await getAllFiles(
					path.join(rootPath, path.resolve(v.slice(1)))
				)
				for (const vv of other_files) {
					let flag = await isIgnore(ignore_arr, vv)
					if (!flag) {
						arr.push(vv)
					}
				}
			}
		}
	} else {
		if (!view) {
			let new_path = path.relative(rootPath, file)
			ignore_arr.push("!" + new_path)
		}
		let files = await getAllFiles(file)
		for (const v of files) {
			let flag = await isIgnore(ignore_arr, v)
			if (!flag) {
				arr.push(v)
			}
		}
	}
	return arr
}

// 检查是否在排除范围内
export const isIgnore = async (ignore_arr: string[] = [], file: string, flag: boolean = false) => {
	let rootPath = getRootPath(file)
	let new_file_path = !flag ? getNormalPath(path.relative(rootPath, file)) : getNormalPath(file)
	let res = ignore_arr.filter((v) => {
		v = getNormalPath(v)
		if (v.startsWith("!")) {
			return minimatch(new_file_path, v.slice(1)) || minimatch(new_file_path, getNormalPath(path.join(v.slice(1), "**")))
		} else {
			return minimatch(new_file_path, v)
		}
	})
	let longest = getLongestString(res)
	if (longest) {
		if (longest.startsWith("!")) {
			return false
		} else {
			return true
		}
	} else {
		return false
	}
}

/**
 * 获取字符串数组中最长的字符串
 * @param arr 字符串数组
 * @returns 返回最长字符串，若数组为空或不是数组则返回null
 */
function getLongestString(arr: string[]) {
	if (!Array.isArray(arr) || arr.length === 0) {
		return null;
	}
	return arr.reduce((longest, current) => {
		return current.length > longest.length ? current : longest;
	}, '');
}

//获取忽略配置
export const getIgnoreConfig = (
	config: FileTransferConfigItem,
	file: string = "",
	view: boolean = false
) => {
	let context = getContext()
	let rootPath = getRootPath(file)

	let name = config.name
	//获取插件配置
	let syncConfig = getPluginSetting()
	const excludePath = syncConfig.get("excludePath")

	if (view) {
		return Array.isArray(excludePath) ? excludePath : []
	}
	const useGitignore = syncConfig.get<boolean>("gitignore")

	return new Promise<string[]>(async (resolve, reject) => {
		// 获取 workspaceState 对象
		const workspaceState = context.workspaceState
		const value = workspaceState.get("ignore_config_" + name)
		let ignore_arr: string[] = []
		let ignore_temp: string[] = []

		//默认忽略配置
		if (Array.isArray(excludePath)) {
			ignore_temp = [...ignore_temp, ...excludePath]
		}

		//用户忽略配置
		if (config.excludePath) {
			if (Array.isArray(config.excludePath)) {
				ignore_temp = [...ignore_temp, ...config.excludePath]
			} else {
				ignore_temp = [...ignore_temp, ...config.excludePath.split(",")]
			}
		}


		if (useGitignore) {
			//  存在配置则使用配置，减少读写文件开销
			if (value && Array.isArray(value)) {
				ignore_temp = [...ignore_temp, ...value]
			} else {
				let gitignorePath = path.join(rootPath, ".gitignore")
				let data = ""
				if (fs.existsSync(gitignorePath)) {
					data = fs.readFileSync(gitignorePath, "utf-8")
					// 去除注释并将结果转换为数组
					let new_data = data
						.split("\n")
						.map((line: string) => line.trim())
						.filter((line: string) => line && !line.startsWith("#"))
					ignore_temp = [...ignore_temp, ...new_data]

					new_data.map((v) => path.relative(rootPath, v))
					//  更新配置
					await workspaceState.update("ignore_config_" + name, new_data)
				}
			}
		}

		ignore_temp.forEach((v) => {
			// 重写规则
			ignore_arr.push(v)
			ignore_arr.push(path.join(v, "**"))
		})

		//数组去重
		ignore_arr = [...new Set(ignore_arr)]
		if (!ignore_arr.includes("sync_config.jsonc")) {
			ignore_arr.push("sync_config.jsonc")
		}
		resolve(ignore_arr)
	})
}

//将配置转化为数组
export const toArray = (obj: { [x: string]: any }): FileTransferConfigItem[] => {
	const arr = []
	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			const element = obj[key]
			arr.push({
				name: key,
				...Object.assign(
					{
						watch: true,
						upload_on_save: false,
						submit_git_before_upload: false,
						submit_git_msg: "",
						compress: false,
						build: "",
						distPath: "",
						deleteRemote: false
					},
					element
				)
			})
		}
	}
	return arr
}

async function selectConfig(jsonText: string) {
	let currConfigJson = JSON.parse(stripJsonComments(jsonText))
	const label = await vscode.window.showInputBox({
		prompt: l10n.t('Please enter an environment name, e.g., test'), // 输入框的提示文本
		placeHolder: l10n.t("Please enter an environment name"), // 输入框的占位文本
		value: "", // 输入框的默认值
		password: false, // 是否以密码模式显示输入（输入内容会被隐藏）
		ignoreFocusOut: true, // 是否在失去焦点时保持输入框打开
		validateInput: (text) => {
			// 可选的输入验证函数，返回错误提示或 null
			if (!text || text.length < 1) {
				return l10n.t('Please enter an environment name')
			}
			if (currConfigJson[text]) {
				return l10n.t('This environment already exists, please re-enter')
			}
			return null
		}
	})
	if (!label) {
		return false
	}

	let clientArr = ['ftp', 'sftp', 'ssh']
	const clientType = await vscode.window.showQuickPick(clientArr, {
		placeHolder: l10n.t('Please select a connection type'), // 快速选择菜单的占位文本
		ignoreFocusOut: true,
		canPickMany: false // 开启多选
	})
	if (!clientType) {
		return false
	}

	const options = [
		{
			label: l10n.t('Use proxy'),
			description: l10n.t('Please configure proxy IP and port in the plugin settings, otherwise, the server cannot be connected'),
			value: "compress",
			picked: false
		},
		{
			label: l10n.t('Real-time submission after saving'),
			description: l10n.t('Recommended for single-person development. When upload_on_save is set to true, submit_git_before_upload is disabled. Default is false'),
			value: "upload_on_save",
			picked: false
		},
		{
			label: l10n.t('Monitor file changes'),
			description: l10n.t('Default is false; if upload_on_save is true, this option is invalid'),
			value: "watch",
			picked: false
		},
		{
			label: l10n.t('Submit local git before uploading code'),
			description: l10n.t('Recommended for team development to prevent overwriting remote code'),
			value: "submit_git_before_upload",
			picked: false
		},
		{
			label: l10n.t('Compress before uploading'),
			description: l10n.t('Only SSH supports remote decompression; others require manual decompression'),
			value: "compress",
			picked: false
		},
		{
			label: l10n.t('Delete remote directory before uploading'),
			description: l10n.t('Delete remote distPath configuration directory before upload, usually for cleaning up frontend deployment code'),
			value: "deleteRemote",
			picked: false
		},
		{
			label: l10n.t('Upload to root directory'),
			description: l10n.t('Generally used for frontend deployment code; effective only if distPath has a single path'),
			value: "upload_to_root",
			picked: false
		},
		{
			label: l10n.t('Is this the default configuration'),
			description: l10n.t('Used for right-click upload and remote file comparison'),
			value: "default",
			picked: false
		}
	]

	const selectedOptions = await vscode.window.showQuickPick(options, {
		placeHolder: l10n.t('Please select configuration (checked is true, unchecked is false)'), // 快速选择菜单的占位文本
		canPickMany: true, // 开启多选
		ignoreFocusOut: true // 点击选项后不会自动关闭
	})
	if (!selectedOptions) {
		return false
	}

	let newConfig: any = {}
	if (selectedOptions) {
		// 用户选择了一个或多个选项
		selectedOptions.forEach((option) => {
			newConfig[option.value] = true
		})
	}

	newConfig['type'] = clientType

	let configJson = JSON.parse(stripJsonComments(configText))
	if (typeof configJson.port === 'string') {
		if (clientType == 'ftp') {
			configJson.port = 21
		} else {
			configJson.port = 22
		}
	}

	setDefaultConfig(configJson, clientType);

	if (clientType == 'ftp') {
		delete configJson.remotePath
	}

	Object.assign(configJson, newConfig)

	// make edits and apply them
	let keys: any[] = [label]
	const edits = jsonc.modify(jsonText, [...keys], configJson, {})
	const updated = jsonc.applyEdits(jsonText, edits)

	// format the updated text
	const formatted = jsonc.format(updated, undefined, {})
	const res = jsonc.applyEdits(updated, formatted)
	return res
}

function addGitignore(rootPath: string) {
	let gitignorePath = path.join(rootPath, ".gitignore")
	let data = ""
	if (fs.existsSync(gitignorePath)) {
		data = fs.readFileSync(gitignorePath, "utf-8")
		// 去除注释并将结果转换为数组
		let new_data = data
			.split("\n")
			.map((line: string) => line.trim())
			.filter((line: string) => line && !line.startsWith("#"))
		// 如果gitignore中不存在sync_config.jsonc则加入
		const configFilepath = path.join(rootPath, "sync_config.jsonc")
		if (fs.existsSync(configFilepath) && !new_data.includes("sync_config.jsonc")) {
			fs.appendFileSync(gitignorePath, "\nsync_config.jsonc", 'utf-8')
		}
	}
}

/**
 * 添加配置
 * @param context  上下文
 * @param rootPath 项目路径
 * @returns
 */
export async function addConfig(rootPath: string) {
	try {
		let context = getContext();
		// 获取 workspaceState 对象
		const workspaceState = context.workspaceState
		const filepath = path.join(rootPath, "sync_config.jsonc")
		addGitignore(rootPath)
		if (!fs.existsSync(filepath)) {
			let updatedConfigData = await selectConfig(getExampleText())
			if (!updatedConfigData) {
				return
			}

			fs.writeFileSync(filepath, updatedConfigData, "utf8")
		} else {
			let data = fs.readFileSync(filepath, "utf-8")
			let updatedConfigData = await selectConfig(data)
			if (!updatedConfigData) {
				return
			}
			// 写入更新后的配置文件
			fs.writeFileSync(filepath, updatedConfigData, "utf8")
		}

		//打开配置文件
		vscode.workspace.openTextDocument(filepath).then((document) => {
			vscode.window.showTextDocument(document).then(() => {
				// vscode.window.showInformationMessage(l10n.t('已创建配置文件：sync_config.jsonc'));
			})
		})

		let data = fs.readFileSync(filepath, "utf-8")
		if (data) {
			let res = JSON.parse(stripJsonComments(data))
			await workspaceState.update("sync_config", res)
		}
	} catch (error) {

		vscode.window.showInformationMessage(l10n.t('sync_config.jsonc configuration file format error!'))
	}
}

/**
 * 获取用户配置
 * @param context  上下文
 * @param rootPath 项目路径
 * @param type 创建配置文件 1需要 2不需要
 * @param showErr 显示异常 1需要 2不需要
 * @returns
 */
export async function getUserConfig(
	type: number = 1,
	showErr = 1
) {
	try {
		let context = getContext()
		let rootPath = getRootPath()
		// 获取 workspaceState 对象
		const workspaceState = context.workspaceState
		const value = workspaceState.get("sync_config")
		//  存在配置直接返回
		if (value && type == 2) {
			return value
		}

		let configData = {}
		if (configText) {
			configData = JSON.parse(stripJsonComments(configText))
		}

		const filepath = path.join(rootPath, "sync_config.jsonc")
		addGitignore(rootPath)
		if (!fs.existsSync(filepath)) {
			if (type < 2) {
				let obj = await selectConfig(getExampleText())
				if (!obj) {
					return false
				}
				fs.writeFileSync(filepath, obj, "utf8")
				vscode.workspace.openTextDocument(filepath).then((document) => {
					vscode.window.showTextDocument(document).then(() => {
						vscode.window.showInformationMessage(
							l10n.t('Configuration file created: sync_config.jsonc')
						)
					})
				})
			} else {
				vscode.commands.executeCommand("setContext", "canEdit", false);
				return {}
			}
		}
		let data = fs.readFileSync(filepath, "utf-8")

		if (data) {
			let res = JSON.parse(stripJsonComments(data))

			Object.keys(res).map(v => {
				if (res[v]) {
					if (typeof res[v].port === 'string') {
						if (res[v].type == 'ftp') {
							res[v].port = 21
						} else {
							res[v].port = 22
						}
					}

					setDefaultConfig(res[v], res[v].type);
				}

				if (res[v].remotePath) {
					res[v].remotePath = getNormalPath(path.posix.join('/', res[v].remotePath))
				}

				const deepCopy = JSON.parse(JSON.stringify(configData));
				res[v] = Object.assign(deepCopy, res[v]);
			})
			await workspaceState.update("sync_config", res)
			vscode.commands.executeCommand("setContext", "canEdit", true);

			return res
		} else {
			return {}
		}
	} catch (error) {

		if (showErr) {
			vscode.window.showInformationMessage(
				l10n.t('sync_config.jsonc configuration file format error!')
			)
		}
		return false
	}
}

function setDefaultConfig(config: { [x: string]: boolean }, type: string) {
	const properties = ['remote_unpacked', 'delete_remote_compress', 'delete_local_compress'];

	properties.forEach(prop => {
		if (config[prop] === undefined || typeof config[prop] === 'string') {
			config[prop] = type === 'ssh';
		}
	});
}

// 检测git是否提交
export const checkSubmitGit = async (workspaceRoot: string, config: DeployConfigItem) => {
	return new Promise(async (resolve, reject) => {
		let { submit_git_before_upload, submit_git_msg } = config
		if (submit_git_before_upload) {
			let msg: any
			if (submit_git_msg) {
				msg = submit_git_msg
			} else {
				try {
					msg = await inputMsg({ prompt: l10n.t('Please enter git commit message') })
				} catch (error) {
					reject(error)
					return
				}
			}

			if (!msg) {
				reject(`\n ${l10n.t('No git commit information was entered')} \n`)
				return
			}

			let command = `cd ${workspaceRoot} && git add . && git commit -m '${msg}' && git push`

			try {
				await execCommand(workspaceRoot, msg, command)
				resolve(true)
			} catch (error) {
				reject(error)
			}
		} else {
			resolve(true)
		}
	})
}

//执行命令
function execCommand(workspaceRoot: string, msg: string, command: string) {
	return new Promise((resolve, reject) => {
		exec(command, (error: any, stdout: any, stderr: string | undefined) => {
			if (stdout) {
				// reject('git: ' + stdout)
				if (stdout.indexOf("no changes added to commit") != -1) {
					command = `cd ${workspaceRoot} && git add . && git commit -m '${msg}' && git push`
					resolve(execCommand(workspaceRoot, msg, command))
					return
				} else if (stdout.indexOf("Your branch is ahead of") != -1) {
					command = `cd ${workspaceRoot} &&  git push`
					resolve(execCommand(workspaceRoot, msg, command))
					return
				} else if (stdout.indexOf("Your branch is up to date with") != -1) {
					resolve(true)
					return
				}
			}
			if (stderr) {
				let arr: any[] = []
				stderr.split("\n").forEach((line: string) => {
					if (line && line.indexOf("error:") != -1) {
						arr.push(line)
					}
					if (line && line.indexOf("hint:") != -1) {
						arr.push(line.replace("hint:", ""))
					}
				})
				if (arr.length) {
					reject(
						`\n ${l10n.t('Git commit failed, please commit manually')} \n` + arr.join(" \n ")
					)
					return
				}

				if (stderr.indexOf("fatal") != -1) {
					reject(`\n ${l10n.t('Git commit failed, please commit manually')} \n` + stderr)
					return
				}
			}
			if (error) {
				reject(`\n ${l10n.t('Git commit failed, please commit manually')} \n`)
				return
			}
			resolve(true)
		})
	})
}

export function inputMsg(option: vscode.InputBoxOptions, isGit: boolean = false) {
	return new Promise<string>((resolve, reject) => {
		// 弹出文本输入框
		vscode.window
			.showInputBox(option)
			.then((value) => {
				if (value) {
					if (!value.trim()) {
						isGit && vscode.window.showInformationMessage(l10n.t('Commit message cannot be empty, please re-enter!'), l10n.t('Got it')
						)
						resolve(inputMsg(option))
					} else {
						resolve(value)
					}
				} else {
					if (isGit) {
						reject(`\n ${l10n.t('No git commit information was entered')} \n`)
					} else {
						resolve('')
					}
				}
			})
	})
}

//获取文件大小
export const getFileSizeFsExtra = async (filePath: string) => {
	try {
		const stats = await fs.stat(filePath)
		const fileSizeInBytes = stats.size
		return fileSizeInBytes
	} catch (err) {
		return null
	}
}

//验证配置
export const verityConfig = async (config: DeployConfigItem) => {
	let { host, username, password, privateKeyPath, remotePath, type } = config
	let typeArr = ["ftp", "sftp", "ssh"]
	if (!type || !typeArr.includes(type)) {
		throw new Error(l10n.t('Please configure server protocol type [type], e.g., ftp, sftp, ssh'))
	}
	if (!host) {
		throw new Error(l10n.t('Please configure server address [host]'))
	}
	if (!username) {
		throw new Error(l10n.t('Please configure username [username]'))
	}
	if (type == 'ftp' && !password && !privateKeyPath) {
		throw new Error(l10n.t('Please configure server password or key file path'))
	}
	if (type != 'ftp' && !remotePath) {
		throw new Error(l10n.t('Please configure server file directory [remotePath]'))
	}
}

/**
 * 判断是否需要上传到根目录
 * @param config 部署配置项
 * @param remotePath 远程路径
 * @param rootPath 根路径
 * @returns 返回一个对象，包含是否需要上传到根目录的布尔值 up_to_root 和处理后的远程路径 remotePath
 */
export const isUpRoot = (config: DeployConfigItem, remotePath: string, rootPath: string) => {
	if (!Array.isArray(config.distPath)) {
		config.distPath = config.distPath?.split(",")
	}
	let len = config.distPath?.length || 0

	// 只有一个目录则上传该目录下文件，不包含目录
	let up_to_root = false
	if (len == 1 && config.distPath && config.upload_to_root) {
		up_to_root = true

		let new_path = path.posix.join(config.type !== "ftp" ? config.remotePath : "/", config.distPath[0])
		if (remotePath.indexOf(new_path) != -1) {
			remotePath = path.posix.join(
				config.type !== "ftp" ? config.remotePath : "/",
				path.relative(new_path, remotePath)
			)
		} else {
			remotePath = path.posix.join(
				config.type !== "ftp" ? config.remotePath : "/",
				remotePath
			)
		}
	}
	return { up_to_root, remotePath }
}


/**
 * 防抖函数，通过延迟执行函数，避免函数在短时间内被频繁调用。
 * @param fn 需要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @param immediate 是否立即执行第一次调用，默认为 false，即延迟执行
 * @returns 返回一个新的函数，该函数在延迟时间内多次调用时，只会在最后一次调用延迟时间结束后执行一次
 */
export function debounce<T extends (...args: any[]) => any>(
	fn: T,
	delay: number,
	immediate: boolean = false
): (...args: Parameters<T>) => void {
	let timer: ReturnType<typeof setTimeout> | null;

	return function (...args: Parameters<T>) {
		if (timer) clearTimeout(timer);

		if (immediate && !timer) {
			fn(...args); // 立即执行
		}

		timer = setTimeout(() => {
			if (!immediate) fn(...args); // 延迟执行
			timer = null; // 清除计时器
		}, delay);
	};
}


/**
 * 节流函数，用于限制函数的执行频率
 * @param func 需要被节流的函数
 * @param wait 节流时间间隔，单位毫秒
 * @returns 返回一个新的函数，该函数会在指定的时间间隔内最多只执行一次原函数
 */
export function throttle<T extends (...args: any[]) => any>(func: T, wait: number) {
	let timeout: NodeJS.Timeout | null = null;
	let lastCall = 0;

	return function (this: any, ...args: Parameters<T>) {
		const now = Date.now();

		if (lastCall + wait <= now) {
			if (timeout) {
				clearTimeout(timeout);
				timeout = null;
			}
			lastCall = now;
			func.apply(this, args);
		} else if (!timeout) {
			timeout = setTimeout(() => {
				lastCall = Date.now();
				timeout = null;
				func.apply(this, args);
			}, wait - (now - lastCall));
		}
	};
}


function isSubPath(parentPath: string, childPath: string) {
	const parentSegments = parentPath.split('/');
	const childSegments = childPath.split('/');

	// 如果父路径的节点数比子路径多，则不可能是子路径
	if (parentSegments.length > childSegments.length) {
		return false;
	}

	// 逐个节点匹配
	for (let i = 0; i < parentSegments.length; i++) {
		if (parentSegments[i] !== childSegments[i]) {
			return false;
		}
	}
	return true;
}

// 格式化文件大小
export function formatFileSize(bytes: number) {
	if (bytes === 0) return '0 B'; // 如果大小为 0，直接返回
	const units = ['B', 'KB', 'MB', 'GB', 'TB']; // 定义单位
	const k = 1024;
	const i = Math.floor(Math.log(bytes) / Math.log(k)); // 计算单位索引
	const fileSize = (bytes / Math.pow(k, i)).toFixed(2); // 计算文件大小并保留两位小数
	return `${fileSize} ${units[i]}`; // 返回带有单位的结果
}

// 获取使用时间
export function getUseTime(date: string | undefined) {
	if (!date) return ''
	// 获取毫秒数差值
	const diffInMilliseconds = new Date().getTime() - dayjs(date).valueOf();
	// 将毫秒数转换为秒数
	const diffInSeconds = diffInMilliseconds / 1000;

	let useTime = '';
	// 判断秒数是否大于 60
	if (diffInSeconds >= 60) {
		// 秒数大于 60，转换为分钟输出，并保留两位小数
		const diffInMinutes = (diffInSeconds / 60).toFixed(2);
		useTime = `${diffInMinutes} m`;
	} else {
		// 秒数小于 60，直接输出秒数，并保留两位小数
		useTime = `${diffInSeconds.toFixed(2)} s`
	}
	return useTime
}

//转换路径
export function splitPath(path: string) {
	const parts = path.split('/').filter(Boolean); // 去除空字符串部分
	const result = ['/']; // 初始化包含根路径

	parts.reduce((accumulatedPath, currentPart) => {
		const newPath = accumulatedPath + '/' + currentPart;
		result.push(newPath);
		return newPath;
	}, '');

	return result;
}

// 获取上一级路径的辅助函数
export function getParentPath(filepath: string) {
	const segments = filepath.split('/').filter(Boolean); // 去除空字符串部分
	segments.pop(); // 去掉最后一节
	return '/' + segments.join('/'); // 拼接上一级路径并确保前面有一个斜杠
}

// 对文件数组进行排序
export function sortFiles(filesArr: any[], isNested: boolean = false) {
	return filesArr.sort((a, b) => {
		// 确定是否需要访问嵌套对象中的 isDirectory 属性
		const aDir = isNested ? a.file.isDirectory : a.isDirectory;
		const bDir = isNested ? b.file.isDirectory : b.isDirectory;

		// 首先比较是否是目录，目录排在前面
		if (aDir && !bDir) {
			return -1; // a 在前
		}
		if (!aDir && bDir) {
			return 1; // b 在前
		}
		// 如果都是目录或者都不是，则按 compare_key 排序
		const aKey = isNested ? a.file['name'] : a['name'];
		const bKey = isNested ? b.file['name'] : b['name'];
		return aKey.localeCompare(bKey);
	});
}

/**
 * 检查Linux文件或目录权限是否在有效的000-777范围内
 * @param {string|number} permissions - 权限值
 * @returns {boolean} 是否为有效权限
 */
export function isValidLinuxPermission(permissions: string | number) {
	// 将权限转换为字符串，并确保格式是三位数字
	const strPermissions = String(permissions);
	const regex = /^[0-7]{3}$/;

	// 正则表达式确保权限格式，并且权限在000到777的范围内
	return regex.test(strPermissions) && Number(strPermissions) <= 777;
}


export function permissionsToOctal(permissions: Permissions): string {
	// 定义每个权限字符对应的数字
	const permMap: { [key: string]: number } = { 'r': 4, 'w': 2, 'x': 1 };

	// 计算每类权限的八进制值
	function calcPermValue(permStr: string): number {
		return [...permStr].reduce((sum, char) => sum + (permMap[char] || 0), 0);
	}

	// 分别计算 user, group 和 other 的权限值
	const userPerm = calcPermValue(permissions.user || '');
	const groupPerm = calcPermValue(permissions.group || '');
	const otherPerm = calcPermValue(permissions.other || '');

	// 返回八进制表示的权限
	return `${userPerm}${groupPerm}${otherPerm}`;
}

export const getNormalPath = (remotePath: string) => {
	// 使用正则表达式匹配 Windows 盘符（如 C:\）并移除它
	// const normalizedPath = remotePath.replace(/^[A-Za-z]:\\/, "")
	// 使用 Node.js 的 path 模块来进一步处理路径（如果需要）
	// 例如，可以转换为正斜杠（Linux/Unix 风格）
	return path.posix.normalize(remotePath).replace(/\\/g, "/")
}

// 生成随机密码字符串的函数
export function generateRandomPassword(length: number) {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}