# FTP/SFTP/SSH同期ツール

> コードを迅速に同期するツール

[🔥 ダウンロード先](https://marketplace.visualstudio.com/items?itemName=oorzc.ssh-tools)

## 🎉 サポートする言語

<h3 align="center">
    <a href="https://github.com/oorzc/vscode_sync_tool/blob/main/lang/en.md">English</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/blob/main/lang/zh.md">简体中文</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/blob/main/lang/zh-tw.md">繁体中文</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/blob/main/lang/es.md">Español</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/blob/main/lang/fr.md">Français</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/blob/main/lang/de.md">Deutsch</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/blob/main/lang/it.md">Italiano</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/blob/main/lang/ko.md">한국어</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/blob/main/lang/pt.md">Português</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/blob/main/lang/ru.md">Pусский</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/blob/main/lang/tr.md">Türkçe</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/blob/main/lang/pl.md">Polski</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/blob/main/lang/ja.md">日本語</a> 
</h3>

## ✨ プラグインの機能

- [x] 複数の開発環境のカスタム設定をサポート  
- [x] リアルタイムのコード同期をサポート  
- [x] コードの変更を記録し、手動でコードをアップロードする機能をサポート  
- [x] フロントエンドプロジェクトの自動ビルドとパッケージングをサポート  
- [x] コードの圧縮とアップロードをサポート（ただし、SSHのみがアップロード後のリモート解凍をサポート）  
- [x] アップロード時にGitにコミットする機能をサポート  
- [x] カスタムアップロードディレクトリとアップロード除外ディレクトリをサポート  
- [x] 同時アップロードとダウンロードをサポート  
- [x] アップロードとダウンロードの一時停止、再開、停止をサポート  
- [x] ローカルとリモートのファイル比較をサポート  
- [x] リモートコードの表示をサポートし、追加、削除、変更、権限変更、コードの移動、名前変更、ファイルのダウンロードなどの操作が可能  
- [x] プロキシ設定をサポート  
- [x] ファイルまたはフォルダをサーバーの指定ディレクトリにドラッグ＆ドロップしてアップロードする機能をサポート  
- [x] 👍👍👍 設定ファイル内のアカウントとパスワードの暗号化をサポートし、サーバーアカウントの漏洩を防止 👍👍👍  

## 📖 使用方法

1. プラグインの設定

    - デフォルトでは、.git、.svn、.DS_Store、Thumbs.db、.idea、node_modules、runtime、sync_config.jsoncのファイルとフォルダが無視されます。その他は自分で追加してください。
    - .gitignore設定ファイルが存在する場合、デフォルトでその設定を使用し、アップロード内容を無視します。
      ![](https://cdn.jsdelivr.net/gh/oorzc/public_img@main/img/2024%2F11%2F12%2F2a2b4adc7305c7b1c84d796da57cfe81.png)

2. プロジェクト設定の追加
   ![](https://cdn.jsdelivr.net/gh/oorzc/public_img@main/img/2024%2F11%2F12%2F0aba393b99df91a094fac6c14a2aebe1.gif)

3. プロキシ設定は、以下のプロジェクト設定でproxy = trueを設定する必要があります。
   ![](https://cdn.jsdelivr.net/gh/oorzc/public_img@main/img/2024%2F11%2F12%2F9f00f0451dd2c558ad469178d0058713.png)

sync_config.jsoncの設定例

```jsonc
{
    // 環境名、カスタマイズ可能
    "test": {
        // テスト環境
        "type": "ftp", // (必須) 転送タイプ、ftp、sftp、sshをサポート
        "host": "0.0.0.0", // (必須) サーバーアドレス
        "port": 22, // (任意) ポート番号、ftpのデフォルトは21、sftpとsshのデフォルトは22
        "username": "username", // (必須) ログインユーザー名
        "password": "password", // ログインパスワード (秘密鍵パスと二択)
        // "privateKeyPath": "/your_path/id_rsa", // (sftp、ssh設定) 秘密鍵パス (ログインパスワードと二択)、注意：秘密鍵をコードのルートディレクトリに置かないでください
      //   "secretKeyPath": "/your_path/secret_key.txt", // 暗号化秘密鍵のパス、ユーザー名とパスワードを暗号化するために使用されます。注意：鍵をコードディレクトリに置かない方が良いです。
        "proxy": false, // プロキシを使用するかどうか、デフォルトはfalse
        "upload_on_save": false, // 保存後に即時アップロード、単独開発での使用を推奨。upload_on_saveをtrueに設定すると、watch、submit_git_before_upload、compress、deleteRemoteは無効になります。デフォルトはfalse
        "watch": false, // アップロードディレクトリのファイル変更を監視する、デフォルトはtrue。upload_on_saveがtrueの場合、この項目は無効になります。distPathディレクトリが設定されている場合、distPathディレクトリ内のファイル変更のみを監視します。
        "submit_git_before_upload": true, // チーム開発で使用、アップロード前にローカルのgitをコミットし、リモートコードの上書きを防止します。デフォルトはfalse
        "submit_git_msg": "", // gitコミットのメッセージ設定、デフォルトは空。submit_git_before_uploadがtrueで、未入力の場合はメッセージ入力用のポップアップが表示されます。
        // "build": "yarn build:test", // (任意) ビルド実行コマンド、フロントエンドプロジェクトの場合はこの項目を有効にします。
        "compress": true, // 圧縮してアップロードするかどうか、デフォルトはfalse
        //"remote_unpacked": true, // 圧縮アップロード後にリモートで解凍するかどうか（sshをサポートする必要があります）、sshのデフォルトはtrue、その他はfalse
        //"delete_remote_compress": true, // 圧縮ファイルのアップロード後にリモートの圧縮ファイルを削除するかどうか、sshのデフォルトはtrue、その他はfalse
        //"delete_local_compress": true, // 圧縮ファイルのアップロード後にローカルの圧縮ファイルを削除するかどうか、デフォルトはtrue
        "distPath": [], // (任意) アップロードするローカルディレクトリ、文字列または配列をサポート、デフォルトはルートディレクトリをアップロード
        "upload_to_root": false, // distPathに設定されたディレクトリが1つの場合、remotePathのルートディレクトリにアップロードします。主にフロントエンドコードのデプロイに使用します。デフォルトはfalse
        "deleteRemote": false, // アップロード前にリモートのdistPathに設定されたディレクトリを削除するかどうか、主にフロントエンドデプロイコードのクリーンアップに使用します。デフォルトはfalse
        "remotePath": "/www/wwwroot/test", // (sftp、ssh設定) アップロード先のサーバーディレクトリ
        "excludePath": [], // (任意) この環境で除外するアップロードファイルとディレクトリ、プラグイン設定のexcludePathと統合されます。プラグイン設定でgitignoreを使用する場合、.gitignore設定ファイルと統合されます。
        // "downloadPath": "" // (任意) ダウンロード先のディレクトリ、デフォルトは現在のプロジェクトのルートディレクトリ、手動でファイルやフォルダをダウンロードする際に指定できます。
        // "downloadExcludePath": [], //  (任意) ダウンロード時に除外するファイルとディレクトリ
        "default": true // デフォルト環境かどうか、trueの場合、右クリックメニューでファイルやフォルダを迅速にアップロードし、リモートファイルを比較できます。デフォルトはfalse
    },
    "online": {
        // 本番環境
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
// excludePath、downloadExcludePathの除外ルール、ワイルドカードをサポート
[
    "**/*.mp4",
    "aaa/bbb", // aaa/bbbを除外
    "!aaa/bbb/ccc", // aaa/bbb配下のcccフォルダは除外しない
]
```

## アップロードデモ

アップロードデモ
![](https://cdn.jsdelivr.net/gh/oorzc/public_img@main/img/2024%2F11%2F12%2F8f85ff0142ef082749b55f7db3c8bf13.gif)

ファイル比較デモ
![](https://cdn.jsdelivr.net/gh/oorzc/public_img@main/img/2024%2F11%2F12%2F6cbd149ae7959c8097ce288fb91ed800.gif)

## 親切なリマインダー

1. サーバーに接続できない場合、xftpやfilezillaなどの他の接続ツールを使用してサーバーに接続してみてください。確認後、再度接続を試みることができます。
2. ファイルをアップロードした後、ツリーメニューが更新されない場合は、右クリックメニューを使用してファイルツリーを更新できます。
3. ファイルを再度開くときに、サーバーからファイルがダウンロードされないのはなぜですか？リソースを節約するため、プラグインは開いたファイルをキャッシュします。ファイルを更新する必要がある場合は、右クリックメニューを使用して更新してください。
4. ユーザー名やパスワードを復号化できないのはなぜですか？キーが変更されました。初期アカウントのパスワードを再入力し、再度暗号化/復号化してください。
5. 設定ファイルを編集するたびに、すべてのタスクが自動的に停止します。そのため、アップロード中に設定ファイルを随意に変更しないでください。

## 問題の報告

このプロジェクトは余暇時間に開発されたものです。問題がある場合は、こちらで報告できますが、すぐに修正されるとは限りません。

[問題を報告する](https://github.com/oorzc/vscode_sync_tool/issues)