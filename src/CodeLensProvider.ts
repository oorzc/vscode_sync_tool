import os from 'os';
import * as path from "path"
import * as fs from "fs-extra"
import * as vscode from "vscode"
import { parseTree, Node, getNodeValue, applyEdits, modify, format } from "jsonc-parser"
import { getPluginSetting, getRootPath, generateRandomPassword } from "./utils"
import { l10n } from "vscode"
var CryptoJS = require("crypto-js")

class JsonCodeLensProvider implements vscode.CodeLensProvider {
  // 提供 CodeLens
  provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    const codeLenses: vscode.CodeLens[] = []

    let file = document.uri.fsPath || ""
    if (path.basename(file) !== "sync_config.jsonc") {
      return codeLenses
    }

    const text = document.getText()
    try {
      const result = getTopLevelKeysWithPosition(text)
      result.map((v) => {
        const range = new vscode.Range(
          document.positionAt(v.position.start),
          document.positionAt(v.position.end)
        )
        // 加密按钮
        codeLenses.push(
          new vscode.CodeLens(range, {
            title: l10n.t('encrypt'),
            command: "sync_tools.encrypt",
            arguments: [file, v],
          })
        )
        // 解密按钮
        codeLenses.push(
          new vscode.CodeLens(range, {
            title: l10n.t('decrypt'),
            command: "sync_tools.decrypt",
            arguments: [file, v],
          })
        )
        //修改秘钥
        codeLenses.push(
          new vscode.CodeLens(range, {
            title: l10n.t('modifyKey'),
            command: "sync_tools.changeSecretKey",
            arguments: [file, v],
          })
        )
      })
    } catch (e) {
      console.error("sync_config.jsonc " + l10n.t('fileFormatError'))
    } finally {
      return codeLenses
    }
  }
}

export function CodeLensProvider(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      { scheme: "file", language: "jsonc" },
      new JsonCodeLensProvider()
    )
  )

  context.subscriptions.push(
    vscode.commands.registerCommand("sync_tools.encrypt", async (filePath, obj) => {
      await handleEncryptionOrDecryption("encrypt", filePath, obj)
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand("sync_tools.decrypt", async (filePath, obj) => {
      await handleEncryptionOrDecryption("decrypt", filePath, obj)
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand("sync_tools.changeSecretKey", async (filePath, obj) => {
      try {

        const secretKeyPath = getOrCreateSecretKeyPath(obj);
        const secretKey = getOrCreateSecretKey(secretKeyPath);

        // 打开文件并获取 TextDocument 对象
        const document = await vscode.workspace.openTextDocument(secretKeyPath);
        // 在编辑器中显示文件
        await vscode.window.showTextDocument(document);
        let content = fs.readFileSync(filePath, "utf8")
        updateContent(filePath, content, [
          { path: [obj.value['label'], 'secretKeyPath'], value: secretKeyPath },
        ])
      } catch (error) {
        error && vscode.window.showErrorMessage(error?.toString())
      }
    })
  )
}



export async function handleEncryptionOrDecryption(
  action: string,
  filePath: string,
  obj: { value: any; key: any }
) {
  try {
    if (!fs.existsSync(filePath)) return
    const secretKeyPath = getOrCreateSecretKeyPath(obj);
    const secretKey = getOrCreateSecretKey(secretKeyPath);

    let content = fs.readFileSync(filePath, "utf8")
    let decryptedCode = getDecryptionCode(obj.value[obj.key], secretKey)


    if (action === "encrypt") {
      if (decryptedCode) {
        return // 已经加密，无需重复操作
      }

      if (!obj.value[obj.key]) {
        return vscode.window.showErrorMessage(l10n.t('theEncryptedDataCannotBeEmpty'))
      }

      // 加密用户名和密码
      const encryptedCode = CryptoJS.AES.encrypt(
        obj.value[obj.key],
        secretKey
      ).toString()


      // 更新内容
      if (obj.value.secretKeyPath) {
        updateContent(filePath, content, [
          { path: [obj.value['label'], obj.key], value: encryptedCode },
        ])
      } else {
        updateContent(filePath, content, [
          { path: [obj.value['label'], obj.key], value: encryptedCode },
          { path: [obj.value['label'], 'secretKeyPath'], value: secretKeyPath },
        ])
      }
    } else if (action === "decrypt") {
      if (!decryptedCode) {
        return // 已经解密，无需重复操作
      }

      // 更新内容
      updateContent(filePath, content, [
        { path: [obj.value['label'], obj.key], value: decryptedCode },
      ])
    }
  } catch (error) {
    console.log(error)
    error && vscode.window.showErrorMessage(error?.toString())
  }
}


// 获取或创建密钥路径
function getOrCreateSecretKeyPath(obj: { value: any }): string {
  const homeDirectory = path.join(os.homedir(), 'vscode_sync_tool', path.basename(getRootPath()));
  let secretKeyPath = path.join(homeDirectory, 'secret_key_' + obj.value.label + '.txt');
  if (obj.value.secretKeyPath) {
    if (!fs.existsSync(obj.value.secretKeyPath)) {
      throw new Error(l10n.t('theSecretKeyFileDoesNotExist'));
    }
    secretKeyPath = obj.value.secretKeyPath;
  } else {
    if (!fs.existsSync(homeDirectory)) {
      fs.mkdirSync(homeDirectory, { recursive: true });
    }
  }
  return secretKeyPath;
}

// 获取或创建密钥
function getOrCreateSecretKey(secretKeyPath: string): string {
  let secretKey = fs.existsSync(secretKeyPath) ? fs.readFileSync(secretKeyPath, "utf8") : '';
  if (!secretKey) {
    secretKey = generateRandomPassword(16);
    fs.writeFileSync(secretKeyPath, secretKey, "utf8");
  }
  return secretKey;
}

export function getDecryptionCode(key: string = "", newSecretKey: string) {
  const code = key
    ? CryptoJS.AES.decrypt(key, newSecretKey).toString(CryptoJS.enc.Utf8)
    : key
  return code
}

function updateContent(
  filePath: string,
  content: string,
  modifications: { path: any; value: any }[]
) {
  return new Promise<void>((resolve, reject) => {
    modifications.forEach(({ path, value }) => {
      const edit = modify(content, path, value, {})
      content = applyEdits(content, edit)

      const formatted = format(content, undefined, {})
      content = applyEdits(content, formatted)
    })

    // 保存到文件
    fs.writeFileSync(filePath, content, "utf8")
    resolve()
  });
}

interface Position {
  start: number
  end: number
}

interface KeyWithPosition {
  key: string
  position: Position
  value: unknown
}

function getTopLevelKeysWithPosition(jsonContent: string): KeyWithPosition[] {
  // 解析 JSONC 文本为 AST 树
  const tree: Node | undefined = parseTree(jsonContent)
  if (!tree || !tree.children) {
    return []
  }

  // 获取 JSON 根节点的子节点（第一层键）
  const rootNode = tree.children || []
  const keysWithPositions: KeyWithPosition[] = []

  rootNode.forEach((node) => {
    if (node.type === "property" && node.children && node.children.length === 2) {
      const nodeKey = node.children[0] // 属性名节点
      const valueNode = node.children[1] // 属性值节点
      valueNode.children &&
        valueNode.children.map((v) => {
          if (v.children) {
            let keyNode = v.children[0] // 属性名节点
            if (keyNode.value == "username" || keyNode.value == "password") {
              keysWithPositions.push({
                key: keyNode.value, // 键名
                position: {
                  start: keyNode.offset, // 键名的起始位置（字符索引）
                  end: keyNode.offset + keyNode.length, // 键名的结束位置（字符索引）
                },
                value: { label: nodeKey.value, ...getNodeValue(valueNode) }, // 键对应的值
              })
            }
          }
        })
    }
  })
  return keysWithPositions
}
