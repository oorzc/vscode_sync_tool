# FTP/SFTP/SSH 동기화

> 코드 빠른 동기화 도구

[🔥 다운로드 주소](https://marketplace.visualstudio.com/items?itemName=oorzc.ssh-tools)

## 🎉 지원 언어

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


## ✨ 플러그인 기능

- [x] 여러 개발 환경의 사용자 정의 구성을 지원  
- [x] 실시간 코드 동기화를 지원  
- [x] 코드 변경 사항을 기록하고 수동으로 코드를 업로드하는 기능을 지원  
- [x] 프론트엔드 프로젝트의 자동 빌드 및 패키징을 지원  
- [x] 코드 압축 및 업로드를 지원 (단, SSH만 업로드 후 원격 압축 해제 지원)  
- [x] 업로드 시 Git에 커밋하는 기능을 지원  
- [x] 사용자 정의 업로드 디렉토리 및 업로드 제외 디렉토리를 지원  
- [x] 동시 업로드 및 다운로드를 지원  
- [x] 업로드 및 다운로드 일시 중지, 재개, 중지를 지원  
- [x] 로컬 및 원격 파일 비교를 지원  
- [x] 원격 코드를 보고 추가, 삭제, 수정, 권한 변경, 코드 이동, 이름 변경, 파일 다운로드 등의 작업을 지원  
- [x] 프록시 설정을 지원  
- [x] 파일 또는 폴더를 서버의 지정된 디렉토리로 드래그 앤 드롭하여 업로드하는 기능을 지원  
- [x] 👍👍👍 구성 파일의 계정 및 비밀번호 암호화를 지원하여 서버 계정 유출을 방지 👍👍👍  

## 📖 사용 설명

1. 플러그인 구성

    - 기본적으로 .git, .svn, .DS_Store, Thumbs.db, .idea, node_modules, runtime, sync_config.jsonc 파일 및 폴더를 무시하며, 다른 파일은 직접 추가해야 합니다.
    - .gitignore 구성 파일이 있는 경우, 기본적으로 해당 구성을 사용하여 업로드 내용을 무시합니다.
      ![](https://cdn.jsdelivr.net/gh/oorzc/public_img@main/img/2024%2F11%2F12%2F2a2b4adc7305c7b1c84d796da57cfe81.png)

2. 프로젝트 구성 추가
   ![](https://cdn.jsdelivr.net/gh/oorzc/public_img@main/img/2024%2F11%2F12%2F0aba393b99df91a094fac6c14a2aebe1.gif)

3. 프록시 설정, 아래 프로젝트 구성에서 proxy = true로 설정해야 적용됩니다.
   ![](https://cdn.jsdelivr.net/gh/oorzc/public_img@main/img/2024%2F11%2F12%2F9f00f0451dd2c558ad469178d0058713.png)

sync_config.jsonc 구성 참조

```jsonc
{
	// 환경 이름, 사용자 정의 이름 지원
	"test": {
		// 테스트 환경
		"type": "ftp", // (필수) 전송 유형, ftp, sftp, ssh 지원
		"host": "0.0.0.0", // (필수) 서버 주소
		"port": 22, // (선택 사항) 포트 번호, ftp 기본 21, sftp, ssh 기본 22
		"username": "username", // (필수) 로그인 사용자 이름
		"password": "password", // 로그인 비밀번호 (개인 키 경로와 둘 중 하나 선택)
		// "privateKeyPath": "/your_path/id_rsa", // (sftp, ssh 구성) 개인 키 경로 (로그인 비밀번호와 둘 중 하나 선택), 주의: 키를 코드 루트 디렉토리에 두지 않는 것이 좋습니다.
		// "secretKeyPath": "/your_path/secret_key.txt", // 암호화 개인 키 경로, 사용자 이름과 비밀번호를 암호화하는 데 사용됩니다. 참고: 키를 코드 디렉토리에 두지 않는 것이 좋습니다.
		"proxy": false, // 프록시 사용 여부, 기본값 false
		"upload_on_save": false, // 저장 후 실시간 업로드, 단일 개발자용으로 권장, upload_on_save가 true일 경우 watch, submit_git_before_upload, compress, deleteRemote가 무효화됩니다, 기본값 false
		"watch": false, // 업로드 디렉토리 파일 변경 감지, 기본값 true, upload_on_save가 true일 경우 이 항목은 무효화됩니다. distPath 디렉토리가 구성된 경우, distPath 디렉토리 하위 파일 변경만 감지합니다.
		"submit_git_before_upload": true, // 팀 개발용, 코드 업로드 전 로컬 git 커밋, 원격 코드 덮어쓰기 방지, 기본값 false
		"submit_git_msg": "", // git 커밋 메시지 구성, 기본값 빈 문자열. submit_git_before_upload이 true일 경우, 입력하지 않으면 메시지 입력 팝업이 나타납니다.
		// "build": "yarn build:test", // (선택 사항) 빌드 실행 명령, 프론트엔드 프로젝트인 경우 이 항목을 활성화합니다.
		"compress": true, // 압축 업로드 여부, 기본값 false
		//"remote_unpacked": true, // 압축 업로드 후 원격에서 압축 해제 여부 (ssh 지원 필요), ssh 기본값 true, 기타 기본값 false
		//"delete_remote_compress": true, // 압축 파일 업로드 후 원격 압축 파일 삭제 여부, ssh 기본값 true, 기타 기본값 false
		//"delete_local_compress": true, // 압축 파일 업로드 후 로컬 압축 파일 삭제 여부, 기본값 true
		"distPath": [], // (선택 사항) 로컬에서 업로드할 디렉토리, 문자열 또는 배열 지원, 기본값 루트 디렉토리 업로드
		"upload_to_root": false, // distPath 구성 디렉토리가 하나일 경우, remotePath 루트 디렉토리에 업로드, 일반적으로 프론트엔드 코드 배포용, 기본값 false
		"deleteRemote": false, // 업로드 전 원격 distPath 구성 디렉토리 삭제 여부, 일반적으로 프론트엔드 배포 코드 정리용, 기본값 false
		"remotePath": "/www/wwwroot/test", // (sftp, ssh 구성) 업로드 서버 주소
		"excludePath": [], // (선택 사항) 현재 환경에서 제외할 업로드 파일 및 디렉토리, 플러그인 구성 excludePath와 병합, 플러그인 구성에서 gitignore를 사용할 경우 .gitignore 구성 파일과 병합
		// "downloadPath": "" // (선택 사항) 다운로드 경로, 기본값 현재 프로젝트 루트 디렉토리, 수동 파일 및 폴더 다운로드 시 사용, 다운로드 주소 지정 가능
		// "downloadExcludePath": [], //  (선택 사항) 다운로드 제외 파일 및 디렉토리
		"default": true // 기본 환경 여부, true일 경우 우클릭 메뉴를 통해 파일 또는 폴더 빠른 업로드, 원격 파일 비교 가능, 기본값 false
	},
	"online": {
		// 프로덕션 환경
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
// excludePath, downloadExcludePath 제외 규칙, 와일드카드 지원
[
	"**/*.mp4",
	"aaa/bbb", // aaa/bbb 제외
	"!aaa/bbb/ccc", // aaa/bbb 아래 ccc 폴더 제외하지 않음
]
```

## 업로드 데모

업로드 데모
![](https://cdn.jsdelivr.net/gh/oorzc/public_img@main/img/2024%2F11%2F12%2F8f85ff0142ef082749b55f7db3c8bf13.gif)

파일 비교 데모
![](https://cdn.jsdelivr.net/gh/oorzc/public_img@main/img/2024%2F11%2F12%2F6cbd149ae7959c8097ce288fb91ed800.gif)

## 친절한 알림

1. 서버에 연결할 수 없는 경우 xftp, filezilla 등의 다른 연결 도구를 사용하여 서버에 연결해 보십시오. 확인 후 다시 연결을 시도할 수 있습니다.
2. 파일을 업로드한 후 트리 메뉴가 업데이트되지 않으면 마우스 오른쪽 버튼 메뉴를 사용하여 파일 트리를 새로 고칠 수 있습니다.
3. 파일을 다시 열 때 서버에서 파일을 다운로드하지 않는 이유는 무엇입니까? 리소스를 절약하기 위해 플러그인은 열린 파일을 캐시합니다. 파일을 업데이트해야 하는 경우 마우스 오른쪽 버튼 메뉴를 사용하여 새로 고침하십시오.
4. 사용자 이름이나 비밀번호를 해독할 수 없는 이유는 무엇입니까? 키가 수정되었습니다. 초기 계정 비밀번호를 다시 입력하고 암호화/해독하십시오.
5. 구성 파일을 편집할 때마다 모든 작업이 자동으로 중지됩니다. 따라서 업로드 중에 구성 파일을 수정하지 마십시오.

## 문제 보고

이 프로젝트는 여가 시간에 개발되었으며, 문제가 있을 경우 여기에 보고할 수 있지만 즉시 수정되지 않을 수 있습니다.

[문제 제출](https://github.com/oorzc/vscode_sync_tool/issues)