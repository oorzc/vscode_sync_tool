# vscode文档

```js
messgae
vscode.window.showInformationMessage('普通消息');
vscode.window.showWarningMessage('警告消息');
vscode.window.showErrorMessage('错误消息');

// 消息也支持交互按钮，当选中按钮时返回的是按钮本身：
vscode.window.showErrorMessage(`与starling的远程交互依赖vscode-starling.sid配置项`, '打开配置项').then(selection => {
      if (selection === '打开配置项') {
      vscode.commands.executeCommand('workbench.action.openSettings');
      }
});

input box
// 在编辑器顶部展示一个input输入框，使用vscode.window.showInputBox,会返回一个Promise:
const text: string | undefined = await vscode.window.showInputBox({
  '最后一步，输入文案'
})

quick pick
// 用于从一组选项中选择一个，类似于select组件。使用vscode.window.showQuickPick，同样返回一个Promise，resolve时得到被选中的选项或undefined：
const lang: string | undefined = await vscode.window.showQuickPick(['en', 'zh', 'ja'], {
  placeHolder: '第一步：选择语言',
});
// 每个选项也可以是对象类型：
const option: Object | undefined = await vscode.window.showQuickPick([{ id: 1, name: 'a' }, { id: 2, name: 'b' }, { id: 3, name: 'c' }], {
  placeHolder: 'select an option',
});


when 条件支持列表
https://code.visualstudio.com/api/references/when-clause-contexts#conditional-operators

```

## 提取翻译

```sh
npx @vscode/l10n-dev export -o ./l10n ./src
```

## vscodeapi 内置图标

> https://code.visualstudio.com/api/references/icons-in-labels#icon-in-labels



## 打包发布
```sh
vsce package
vsce publish

vsce publish major //例如：1.0.2 -> 2.0.0
vsce publish minor //例如：1.0.2 -> 1.1.2
vsce publish patch //例如：1.0.2 -> 1.0.3
vsce publish 0.0.4 

# 发布到vscodium
npx ovsx publish -p xxxx

# 省略-p 
# 参考文档 https://www.npmjs.com/package/ovsx
export OVSX_PAT="OVSX_TOKEN"
```

## 翻译

帮我将下面的文字翻译为 English，繁体中文，Español，Français，Deutsch，Italiano，한국어，Português，Pусский，Türkçe，Polski，日本語

插件已失效，请下载最新版！