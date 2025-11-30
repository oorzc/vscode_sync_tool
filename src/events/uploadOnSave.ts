const isDirectory = require("is-directory")
import path from "path"
import { getAllowFiles, getRootPath, verityConfig, isUpRoot } from "../utils"
import * as vscode from "vscode"
import { opType, FileTransferConfigItem } from "../types/config"
import FileTransfer from "../FileTransfer"


export const uploadOnSave = async (
	config: FileTransferConfigItem,
	file: string,
	opType: opType
) => {
	let rootPath = getRootPath()
	let fileTransfer = new FileTransfer(config)
	let client = await fileTransfer.getClient(config, true)
	if (!client) return
	try {
		const { type } = config
		await verityConfig(config)
		let remoteFilePath = path.relative(rootPath, file)
		if (type != 'ftp') {
			remoteFilePath = path.join(
				config.remotePath,
				path.relative(rootPath, file)
			)
		}
		switch (opType.op) {
			case "add":
			case "edit":
				await uploadFile(file, remoteFilePath)
				break
			case "rename":
				if (!opType.newname) {
					return
				}
				// 重命名文件
				let remotePath = path.relative(rootPath, opType.newname)
				let localPath = path.relative(rootPath, file)
				if (config.type !== 'ftp') {
					remotePath = path.join(
						config.remotePath,
						path.relative(rootPath, opType.newname)
					)
					localPath = path.join(
						config.remotePath,
						path.relative(rootPath, file)
					)
				}
				await FileTransfer.addTask({
					config: config,
					localPath,
					remotePath: path.posix.join('/', remotePath),
					fileType: opType.type,
					operationType: 'rename'
				}, true);
				break
			case "delete":
				await FileTransfer.addTask({
					config: config,
					localPath: file,
					remotePath: path.posix.join('/', remoteFilePath),
					fileType: opType.type,
					operationType: 'delete'
				}, true);
				break
			default:
				break
		}
	} catch (err) {
		let msg = `[${config.name}][${config.type}][上传失败]`;
		vscode.window.showErrorMessage(`${msg}：${err?.toString()}`)
	} finally {
		fileTransfer.releaseClient(client, config)
	}

	//上传文件
	async function uploadFile(file: string, remotePath: string) {
		let { up_to_root, remotePath: newRemotePath } = isUpRoot(config, remotePath, rootPath)

		if (!isDirectory.sync(file)) {
			let newPath = up_to_root ? newRemotePath : remotePath
			await FileTransfer.addTask({
				config: config,
				localPath: file,
				remotePath: path.posix.join('/', newPath),
				operationType: 'upload'
			});
		} else {
			let files = await getAllowFiles(
				config,
				file
			)
			if (files && files.length) {
				for (const vv of files) {
					if (up_to_root) {
						remotePath = path.join(
							newRemotePath,
							path.relative(rootPath, vv)
						)
					} else {
						remotePath = path.relative(
							config.type !== 'ftp' ? config.remotePath : "",
							path.relative(rootPath, vv)
						)
					}
					await FileTransfer.addTask({
						config: config,
						localPath: vv,
						remotePath: path.posix.join('/', remotePath),
						operationType: 'upload'
					});
				}
			}
		}
	}
}




