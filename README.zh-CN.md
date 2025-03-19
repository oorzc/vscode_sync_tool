# FTP/SFTP/SSH Sync 

> 代码快速同步工具

[🔥 下载地址](https://marketplace.visualstudio.com/items?itemName=oorzc.ssh-tools)

## 🎉 支持语言

<h3 align="center">
    <a href="https://github.com/oorzc/vscode_sync_tool/lang/en.md">English</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/lang/zh.md">简体中文</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/lang/zh-tw.md">繁体中文</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/lang/es.md">Español</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/lang/fr.md">Français</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/lang/de.md">Deutsch</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/lang/it.md">Italiano</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/lang/ko.md">한국어</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/lang/pt.md">Português</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/lang/ru.md">Pусский</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/lang/tr.md">Türkçe</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/lang/pl.md">Polski</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/lang/ja.md">日本語</a> 
</h3>

## ✨ 插件功能

-   [x] 支持自定义配置多个开发环境
-   [x] 支持实时同步代码
-   [x] 支持记录变动代码，手动上传代码
-   [x] 支持自动构建打包前端项目
-   [x] 支持代码压缩上传（但只有ssh支持上传后远程解压）
-   [x] 支持上传时提交到git 
-   [x] 支持自定义上传目录和排除不上传目录
-   [x] 支持并发上传、下载
-   [x] 支持暂停上传下载，恢复上传下载，停止上传下载
-   [x] 支持本地、远程文件对比
-   [x] 支持查看远程代码，可以进行增删改查、修改权限、移动代码、重命名、下载文件等操作
-   [x] 支持设置代理
-   [x] 支持拖拽上传文件或文件夹到服务器指定目录
-   [x] 👍👍👍支持对配置文件中的账户、密码进行加密，防止服务器账户泄露👍👍👍

## 📖 使用介绍

1. 插件配置

    - 默认忽略.git、.svn、.DS_Store、Thumbs.db、.idea、node_modules、runtime、sync_config.jsonc 文件及文件夹，其他请自行添加
    - 如果存在.gitignore 配置文件，默认使用该配置，忽略上传内容
      ![](https://cdn.jsdelivr.net/gh/oorzc/public_img@main/img/2024%2F11%2F12%2F2a2b4adc7305c7b1c84d796da57cfe81.png)

2. 添加项目配置
   ![](https://cdn.jsdelivr.net/gh/oorzc/public_img@main/img/2024%2F11%2F12%2F0aba393b99df91a094fac6c14a2aebe1.gif)

3. 代理设置，需要同时在下面项目配置中设置 proxy = true 才会生效
   ![](https://cdn.jsdelivr.net/gh/oorzc/public_img@main/img/2024%2F11%2F12%2F9f00f0451dd2c558ad469178d0058713.png)

sync_config.jsonc 配置参考

```jsonc
{
	//环境名称，支持自定义名称
	"test": {
		//测试环境
		"type": "ftp", // (必填)传输类型，支持ftp、sftp、ssh
		"host": "0.0.0.0", // (必填)服务器地址
		"port": 22, // (非必填) 端口号 ，ftp默认21，sftp、ssh默认22
		"username": "username", // (必填)登录用户名
		"password": "password", // 登录密码 (和私钥路径，二选一)
		// "privateKeyPath": "/your_path/id_rsa", // (sftp、ssh配置)私钥路径 (和登录密码，二选一)，注意：最好不要将密匙，放代码根目录
		"proxy": false, // 是否使用代理，默认false
		"upload_on_save": false, // 保存后实时提交，建议单人开发使用，upload_on_save设置为true时，watch、submit_git_before_upload、compress、deleteRemote无效，默认false
		"watch": false, // 监听上传目录文件变动，默认true，如果upload_on_save为true，则此项无效。如果配置了distPath目录，则只监听distPath目录下文件变动
		"submit_git_before_upload": true, // 团队开发使用，上传代码前提交本地git，防止覆盖远程代码，默认false
		"submit_git_msg": "", // 提交git的message配置，默认空。submit_git_before_upload为true时，不填写会弹出提示框手动填写
		// "build": "yarn build:test", // (非必填) 构建执行的命令 如果是前端项目则打开此项
		"compress": true, //  是否压缩上传，默认false
		//"remote_unpacked": true, // 压缩上传后是否远程解压（需要支持ssh），ssh 默认 true ,其他默认 false
		//"delete_remote_compress": true, // 压缩文件上传后是否删除远程压缩文件，ssh 默认 true ,其他默认 false
		//"delete_local_compress": true, // 压缩文件上传后是否删除本地压缩文件，默认true
		"distPath": [], // (非必填) 本地需要上传的目录，支持字符串或数组，默认上传根目录
		"upload_to_root": false, // 如果distPath配置目录只有一个，则上传到remotePath根目录，一般用于部署前端代码， 默认false
		"deleteRemote": false, // 上传前是否删除远程distPath配置目录，一般用于清理前端部署代码， 默认false
		"remotePath": "/www/wwwroot/test", // (sftp、ssh配置)上传服务器地址
		"excludePath": [], // (非必填) 当前环境排除的上传文件及目录，会和插件配置excludePath合并，插件配置使用gitignore的时候，会和.gitignore配置文件合并
		// "downloadPath": "" // (非必填) 下载路径，默认为当前项目根目录，手动下载文件、文件夹时使用，可以指定下载地址
		// "downloadExcludePath": [], //  (非必填) 下载排除文件及目录
		"default": true // 是否默认环境，为true时可以使用右键菜单快速上传文件或文件夹，对比远程文件，默认为false
	},
	"online": {
		//正式环境
		"type": "sftp",
		"host": "0.0.0.0",
		"port": 22,
		"proxy": true,
		"username": "username",
		"password": "password",
		// "privateKeyPath": "/your_path/id_rsa",
		"upload_on_save": false,
		"watch": false,
		"submit_git_before_upload": true,
		"submit_git_msg": "",
		// "build": "yarn build:online",
		"compress": false,
		//"remote_unpacked": false,
		//"delete_remote_compress": true,
		"upload_to_root": false,
		"deleteRemote": false,
		"distPath": [],
		"remotePath": "/www/wwwroot/online",
		"excludePath": [],
		// "downloadPath": "",
	   // "downloadExcludePath": [],
		"default": false
	}
}
```

```js
// excludePath、downloadExcludePath 排除规则，支持通配符
[
	"**/*.mp4",
	"aaa/bbb", //排除aaa/bbb
	"!aaa/bbb/ccc", //不排除aaa/bbb下面的ccc文件夹
]
```

## 上传演示

上传演示
![](https://cdn.jsdelivr.net/gh/oorzc/public_img@main/img/2024%2F11%2F12%2F8f85ff0142ef082749b55f7db3c8bf13.gif)

文件对比演示
![](https://cdn.jsdelivr.net/gh/oorzc/public_img@main/img/2024%2F11%2F12%2F6cbd149ae7959c8097ce288fb91ed800.gif)

## 温馨提示

1.  如过您无法连接服务器，可以尝试使用其他连接工具，比如xftp、filezilla等工具连接服务器，没有问题之后再尝试连接
2. 上传文件后，树级菜单没有更新，可以使用右键菜单，刷新文件树
3. 为什么重复打开文件时，没有从服务器下载文件。为了节省资源，插件会缓存已打开文件，如果需要更新文件，请使用右键菜单，刷新即可
4. 为什么无法解密用户名或密码。你的秘钥已修改，请重新填写初始账户密码，再加密解密
5. 每次编辑配置文件，都会自动停止所有任务。所以在上传期间，请不要随意修改配置文件


## 问题反馈

此项目为业余时间开发，有问题可以在此处反馈，但不一会会修复

[提交问题](https://github.com/oorzc/vscode_sync_tool/issues)