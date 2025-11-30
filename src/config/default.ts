import * as vscode from "vscode"

export const configText = `{
    "type": "", // (必填)链接类型，可选值：ftp,sftp,ssh
    "host": "0.0.0.0", // (必填)服务器地址
    "port": "", // (非必填) 端口号 ，ftp默认21，sftp、ssh默认22
    "username": "", // (必填)登录用户名
    "password": "", // 登录密码 (和私钥路径，二选一)
    // "privateKeyPath": "/your_path/id_rsa", // (sftp、ssh配置) 私钥路径 (和登录密码，二选一)，注意：最好不要将密匙，放代码目录下
    // "secretKeyPath": "/your_path/secret_key.txt", //  加密私钥路径，用于加密用户名和密码，注意：最好不要将密匙，放代码目录下
    "proxy": false, // 是否使用代理，默认false
    "upload_on_save": false, // 保存后实时提交，建议单人开发使用，upload_on_save设置为true时，watch、submit_git_before_upload、compress、deleteRemote无效，默认false
    "watch": false, // 监听上传目录文件变动，默认true，如果upload_on_save为true，则此项无效
    "submit_git_before_upload": false, // 团队开发使用，上传代码前提交本地git，防止覆盖远程代码，默认false
    "submit_git_msg": "", // 提交git的message配置，默认空。submit_git_before_upload为true时，不填写会弹出提示框手动填写
    "build": "", // (非必填) 构建执行的命令 如果是前端项目则打开此项
    "compress": false,//  是否压缩上传，并远程解压（账号需要支持ssh登录，系统会自动检测是否支持，不支持，则不会压缩上传），默认false
    "remote_unpacked": "", // 压缩上传后是否远程解压，ssh 默认 true ,其他默认 false
    "delete_remote_compress": "", // 压缩文件上传后是否删除远程压缩文件，ssh 默认 true ,其他默认 false
    "delete_local_compress": "", // 压缩文件上传后是否删除本地压缩文件，默认true
    "deleteRemote": false, // 上传前是否删除远程distPath配置目录，一般用于清理前端部署代码，  默认false
    "upload_to_root": false, // 如果distPath配置目录只有一个，则上传到remotePath根目录，一般用于部署前端代码， 默认false
    "distPath": [], // (非必填) 本地需要上传的目录，支持字符串或数组，默认上传根目录
    "remotePath": "/www/wwwroot/test", // (sftp、ssh配置)上传服务器地址
    "excludePath": [], // (非必填) 当前环境排除的上传文件及目录，会和插件配置excludePath合并，插件配置使用gitignore的时候，会和.gitignore配置文件合并
     "downloadPath": "", //  (非必填) 下载路径，默认为当前项目根目录，手动下载文件、文件夹时使用，可以指定下载地址
     "downloadExcludePath": [],//  (非必填) 下载排除文件及目录
     "default": false // 是否默认环境，为true时可以使用右键菜单快速上传文件或文件夹，对比远程文件，默认为false
}`

const exampleZhText = `{
    //参考配置
    //环境名称，支持自定义名称
    // "test": { //测试环境
    //     "type": "", // (必填)链接类型，可选值：ftp,sftp,ssh
    //     "host": "0.0.0.0", // (必填)服务器地址
    //     "port": 22, // (非必填) 端口号 ，ftp默认21，sftp、ssh默认22
    //     "username": "username", // (必填)登录用户名
    //     "password": "password", // 登录密码 (和私钥路径，二选一)
    //     // "privateKeyPath": "/your_path/id_rsa", //  (sftp、ssh配置)私钥路径 (和登录密码，二选一)，注意：最好不要将密匙，放代码目录下
    //     // "secretKeyPath": "/your_path/secret_key.txt", //  加密私钥路径，用于加密用户名和密码，注意：最好不要将密匙，放代码目录下
    //     "proxy": false, // 是否使用代理，默认false
    //     "upload_on_save": false, // 保存后实时提交，建议单人开发使用，upload_on_save设置为true时，watch、submit_git_before_upload、compress、deleteRemote无效，默认false
    //     "watch": false, // 监听上传目录文件变动，默认false，如果upload_on_save为true，则此项无效。如果配置了distPath目录，则只监听distPath目录下文件变动
    //     "submit_git_before_upload": false, // 团队开发使用，上传代码前提交本地git，防止覆盖远程代码，默认false
    //     "submit_git_msg": "", // 提交git的message配置，默认空。submit_git_before_upload为true时，不填写会弹出提示框手动填写
    //     // "build": "yarn build:test", // (非必填) 构建执行的命令 如果是前端项目则打开此项
    //     "compress": false, //  是否压缩上传，并远程解压（账号需要支持ssh登录，系统会自动检测是否支持，不支持，则不会压缩上传），默认false
    //     "remote_unpacked": true, // 压缩上传后是否远程解压，ssh 默认 true ,其他默认 false
    //     "delete_remote_compress": true, // 压缩文件上传后是否删除远程压缩文件，ssh 默认 true ,其他默认 false
    //     "delete_local_compress": true, // 压缩文件上传后是否删除本地压缩文件，默认 true
    //     "upload_to_root": false, // 如果distPath配置目录只有一个，则上传到remotePath根目录，一般用于部署前端代码， 默认false
    //     "deleteRemote": false, // 上传前是否删除远程distPath配置目录，一般用于清理前端部署代码，  默认false
    //     "distPath": [], // (非必填) 本地需要上传的目录，支持字符串或数组，默认上传根目录
    //     "remotePath": "/www/wwwroot/test", // (sftp、ssh配置) 上传服务器地址
    //     "excludePath": [], // (非必填) 当前环境排除的上传文件及目录，会和插件配置excludePath合并，插件配置使用gitignore的时候，会和.gitignore配置文件合并
    //     "downloadPath": "", //  (非必填) 下载路径，默认为当前项目根目录，手动下载文件、文件夹时使用，可以指定下载地址
    //     "downloadExcludePath": [],//  (非必填) 下载排除文件及目录
    //     "default": false // 是否默认环境，为true时可以使用右键菜单快速上传文件或文件夹，对比远程文件，默认为false
    // }
}`

const exampleTwText = `{
    //參考配置
    //環境名稱，支持自定義名稱
    // "test": { //測試環境
    //     "type": "", // (必填)鏈接類型，可選值：ftp,sftp,ssh
    //     "host": "0.0.0.0", // (必填)服務器地址
    //     "port": 22, // (非必填) 端口號 ，ftp默認21，sftp、ssh默認22
    //     "username": "username", // (必填)登錄用戶名
    //     "password": "password", // 登錄密碼 (和私鑰路徑，二選一)
    //     // "privateKeyPath": "/your_path/id_rsa", //  (sftp、ssh配置)私鑰路徑 (和登錄密碼，二選一)，注意：最好不要將密匙，放代碼目錄下
    //     // "secretKeyPath": "/your_path/secret_key.txt", //  加密私鑰路徑，用於加密用戶名和密碼，注意：最好不要將密匙，放代碼目錄下
    //     "proxy": false, // 是否使用代理，默認false
    //     "upload_on_save": false, // 保存後實時提交，建議單人開發使用，upload_on_save設置為true時，watch、submit_git_before_upload、compress、deleteRemote無效，默認false
    //     "watch": false, // 監聽上傳目錄文件變動，默認false，如果upload_on_save為true，則此項無效。如果配置了distPath目錄，則只監聽distPath目錄下文件變動
    //     "submit_git_before_upload": false, // 團隊開發使用，上傳代碼前提交本地git，防止覆蓋遠程代碼，默認false
    //     "submit_git_msg": "", // 提交git的message配置，默認空。submit_git_before_upload為true時，不填寫會彈出提示框手動填寫
    //     // "build": "yarn build:test", // (非必填) 構建執行的命令 如果是前端項目則打開此項
    //     "compress": false, //  是否壓縮上傳，並遠程解壓（賬號需要支持ssh登錄，系統會自動檢測是否支持，不支持，則不會壓縮上傳），默認false
    //     "remote_unpacked": true, // 壓縮上傳後是否遠程解壓，ssh 默認 true ,其他默認 false
    //     "delete_remote_compress": true, // 壓縮文件上傳後是否刪除遠程壓縮文件，ssh 默認 true ,其他默認 false
    //     "delete_local_compress": true, // 壓縮文件上傳後是否刪除本地壓縮文件，默認 true
    //     "upload_to_root": false, // 如果distPath配置目錄只有一個，則上傳到remotePath根目錄，一般用於部署前端代碼， 默認false
    //     "deleteRemote": false, // 上傳前是否刪除遠程distPath配置目錄，一般用於清理前端部署代碼，  默認false
    //     "distPath": [], // (非必填) 本地需要上傳的目錄，支持字符串或數組，默認上傳根目錄
    //     "remotePath": "/www/wwwroot/test", // (sftp、ssh配置) 上傳服務器地址
    //     "excludePath": [], // (非必填) 當前環境排除的上傳文件及目錄，會和插件配置excludePath合併，插件配置使用gitignore的時候，會和.gitignore配置文件合併
    //     "downloadPath": "", //  (非必填) 下載路徑，默認為當前項目根目錄，手動下載文件、文件夾時使用，可以指定下載地址
    //     "downloadExcludePath": [],//  (非必填) 下載排除文件及目錄
    //     "default": false // 是否默認環境，為true時可以使用右鍵菜單快速上傳文件或文件夾，對比遠程文件，默認為false
    // }
}`

const exampleEnText = `{
    // Reference configuration
    // Environment name, supports custom names
    // "test": { // Test environment
    //     "type": "", // (Required) Connection type, options: ftp, sftp, ssh
    //     "host": "0.0.0.0", // (Required) Server address
    //     "port": 22, // (Optional) Port number, default is 21 for ftp, 22 for sftp and ssh
    //     "username": "username", // (Required) Login username
    //     "password": "password", // Login password (choose one between password and private key path)
    //     // "privateKeyPath": "/your_path/id_rsa", //  (sftp, ssh configuration) Private key path (choose one between password and private key path), note: it is not recommended to place the key in the code directory
    //     // "secretKeyPath": "/your_path/secret_key.txt", //  Encrypted private key path, used to encrypt username and password, note: it is not recommended to place the key in the code directory
    //     "proxy": false, // Whether to use a proxy, default is false
    //     "upload_on_save": false, // Real-time submission after saving, recommended for single-person development. When upload_on_save is set to true, watch, submit_git_before_upload, compress, deleteRemote are invalid, default is false
    //     "watch": false, // Monitor file changes in the upload directory, default is false. If upload_on_save is true, this item is invalid. If distPath directory is configured, only file changes in the distPath directory are monitored
    //     "submit_git_before_upload": false, // For team development, submit local git before uploading code to prevent overwriting remote code, default is false
    //     "submit_git_msg": "", // Configuration for git commit message, default is empty. If submit_git_before_upload is true and this is not filled, a prompt box will appear for manual input
    //     // "build": "yarn build:test", // (Optional) Build command to execute, open this for front-end projects
    //     "compress": false, //  Whether to compress and upload, and remotely decompress (account needs to support ssh login, the system will automatically detect if it is supported, if not, it will not compress and upload), default is false
    //     "remote_unpacked": true, // Whether to remotely decompress after compressed upload, default is true for ssh, false for others
    //     "delete_remote_compress": true, // Whether to delete the remote compressed file after compressed upload, default is true for ssh, false for others
    //     "delete_local_compress": true, // Whether to delete the local compressed file after compressed upload, default is true
    //     "upload_to_root": false, // If distPath configuration directory has only one, upload to the root directory of remotePath, generally used for deploying front-end code, default is false
    //     "deleteRemote": false, // Whether to delete the remote distPath configuration directory before uploading, generally used for cleaning up front-end deployment code, default is false
    //     "distPath": [], // (Optional) Local directory to upload, supports string or array, default is to upload the root directory
    //     "remotePath": "/www/wwwroot/test", // (sftp, ssh configuration) Upload server address
    //     "excludePath": [], // (Optional) Files and directories to exclude from upload in the current environment, will be merged with the plugin configuration excludePath, when the plugin configuration uses gitignore, it will be merged with the .gitignore configuration file
    //     "downloadPath": "", //  (Optional) Download path, default is the current project root directory, used for manually downloading files or folders, can specify the download address
    //     "downloadExcludePath": [],//  (Optional) Files and directories to exclude from download
    //     "default": false // Whether it is the default environment, when true, you can use the right-click menu to quickly upload files or folders, compare remote files, default is false
    // }
}`


const exampleEsText = `{
    // Configuración de referencia
    // Nombre del entorno, admite nombres personalizados
    // "test": { // Entorno de prueba
    //     "type": "", // (Obligatorio) Tipo de conexión, valores opcionales: ftp, sftp, ssh
    //     "host": "0.0.0.0", // (Obligatorio) Dirección del servidor
    //     "port": 22, // (Opcional) Número de puerto, ftp por defecto 21, sftp, ssh por defecto 22
    //     "username": "username", // (Obligatorio) Nombre de usuario
    //     "password": "password", // Contraseña (o ruta de la clave privada, elegir uno)
    //     // "privateKeyPath": "/your_path/id_rsa", //  (Configuración de sftp, ssh) Ruta de la clave privada (o contraseña, elegir uno), nota: es mejor no colocar la clave en el directorio del código
    //     // "secretKeyPath": "/your_path/secret_key.txt", //  Ruta de la clave privada cifrada, utilizada para cifrar el nombre de usuario y la contraseña, nota: es mejor no colocar la clave en el directorio del código
    //     "proxy": false, // Usar proxy, por defecto false
    //     "upload_on_save": false, // Subir automáticamente después de guardar, recomendado para desarrollo individual, si upload_on_save es true, watch, submit_git_before_upload, compress, deleteRemote son inválidos, por defecto false
    //     "watch": false, // Observar cambios en los archivos del directorio de subida, por defecto false, si upload_on_save es true, este ítem es inválido. Si se configura el directorio distPath, solo se observarán los cambios en los archivos dentro de distPath
    //     "submit_git_before_upload": false, // Para desarrollo en equipo, confirmar cambios en git local antes de subir, para evitar sobrescribir el código remoto, por defecto false
    //     "submit_git_msg": "", // Configuración del mensaje de confirmación de git, por defecto vacío. Si submit_git_before_upload es true y no se completa, se mostrará un cuadro de diálogo para ingresar manualmente
    //     // "build": "yarn build:test", // (Opcional) Comando de construcción, si es un proyecto frontend, habilitar esta opción
    //     "compress": false, //  Comprimir antes de subir y descomprimir en el servidor (la cuenta debe soportar ssh, el sistema detectará automáticamente si es compatible, si no, no se comprimirá), por defecto false
    //     "remote_unpacked": true, // Descomprimir en el servidor después de subir, ssh por defecto true, otros por defecto false
    //     "delete_remote_compress": true, // Eliminar archivo comprimido remoto después de subir, ssh por defecto true, otros por defecto false
    //     "delete_local_compress": true, // Eliminar archivo comprimido local después de subir, por defecto true
    //     "upload_to_root": false, // Si distPath tiene un solo directorio, subir a la raíz de remotePath, generalmente utilizado para implementar código frontend, por defecto false
    //     "deleteRemote": false, // Eliminar directorio remoto distPath antes de subir, generalmente utilizado para limpiar código frontend implementado, por defecto false
    //     "distPath": [], // (Opcional) Directorio local a subir, admite cadena o array, por defecto subir directorio raíz
    //     "remotePath": "/www/wwwroot/test", // (Configuración de sftp, ssh) Dirección del servidor de subida
    //     "excludePath": [], // (Opcional) Archivos y directorios excluidos en el entorno actual, se combinará con excludePath de la configuración del plugin, si el plugin usa gitignore, se combinará con el archivo .gitignore
    //     "downloadPath": "", //  (Opcional) Ruta de descarga, por defecto directorio raíz del proyecto actual, utilizado para descargar manualmente archivos o carpetas, se puede especificar la dirección de descarga
    //     "downloadExcludePath": [],//  (Opcional) Archivos y directorios excluidos en la descarga
    //     "default": false // Si es el entorno por defecto, si es true, se puede usar el menú contextual para subir rápidamente archivos o carpetas, comparar archivos remotos, por defecto false
    // }
}`

const exampleKoText = `{
    // 참조 설정
    // 환경 이름, 사용자 정의 이름 지원
    // "test": { // 테스트 환경
    //     "type": "", // (필수) 연결 유형, 선택 가능 값: ftp, sftp, ssh
    //     "host": "0.0.0.0", // (필수) 서버 주소
    //     "port": 22, // (선택 사항) 포트 번호, ftp 기본값 21, sftp, ssh 기본값 22
    //     "username": "username", // (필수) 로그인 사용자 이름
    //     "password": "password", // 로그인 비밀번호 (개인 키 경로와 둘 중 하나 선택)
    //     // "privateKeyPath": "/your_path/id_rsa", //  (sftp, ssh 설정) 개인 키 경로 (로그인 비밀번호와 둘 중 하나 선택), 주의: 키를 코드 디렉토리에 두지 않는 것이 좋음
    //     // "secretKeyPath": "/your_path/secret_key.txt", //  암호화된 개인 키 경로, 사용자 이름과 비밀번호 암호화에 사용, 주의: 키를 코드 디렉토리에 두지 않는 것이 좋음
    //     "proxy": false, // 프록시 사용 여부, 기본값 false
    //     "upload_on_save": false, // 저장 후 실시간 업로드, 단일 개발자 사용 권장, upload_on_save가 true일 경우, watch, submit_git_before_upload, compress, deleteRemote 무효, 기본값 false
    //     "watch": false, // 업로드 디렉토리 파일 변경 감시, 기본값 false, upload_on_save가 true일 경우 무효. distPath 디렉토리가 설정된 경우, distPath 디렉토리 내 파일 변경만 감시
    //     "submit_git_before_upload": false, // 팀 개발 사용, 코드 업로드 전 로컬 git 커밋, 원격 코드 덮어쓰기 방지, 기본값 false
    //     "submit_git_msg": "", // git 커밋 메시지 설정, 기본값 빈 값. submit_git_before_upload가 true일 경우, 입력하지 않으면 수동 입력 팝업 표시
    //     // "build": "yarn build:test", // (선택 사항) 빌드 실행 명령, 프론트엔드 프로젝트인 경우 활성화
    //     "compress": false, //  압축 업로드 및 원격 압축 해제 여부 (계정이 ssh 로그인 지원 필요, 시스템에서 자동으로 지원 여부 확인, 지원하지 않으면 압축 업로드 안 함), 기본값 false
    //     "remote_unpacked": true, // 압축 업로드 후 원격 압축 해제 여부, ssh 기본값 true, 기타 기본값 false
    //     "delete_remote_compress": true, // 압축 파일 업로드 후 원격 압축 파일 삭제 여부, ssh 기본값 true, 기타 기본값 false
    //     "delete_local_compress": true, // 압축 파일 업로드 후 로컬 압축 파일 삭제 여부, 기본값 true
    //     "upload_to_root": false, // distPath 설정 디렉토리가 하나일 경우, remotePath 루트 디렉토리에 업로드, 일반적으로 프론트엔드 코드 배포에 사용, 기본값 false
    //     "deleteRemote": false, // 업로드 전 원격 distPath 설정 디렉토리 삭제 여부, 일반적으로 프론트엔드 배포 코드 정리에 사용, 기본값 false
    //     "distPath": [], // (선택 사항) 로컬 업로드 디렉토리, 문자열 또는 배열 지원, 기본값 루트 디렉토리 업로드
    //     "remotePath": "/www/wwwroot/test", // (sftp, ssh 설정) 업로드 서버 주소
    //     "excludePath": [], // (선택 사항) 현재 환경에서 제외할 업로드 파일 및 디렉토리, 플러그인 설정 excludePath와 병합, 플러그인 설정에서 gitignore 사용 시, .gitignore 설정 파일과 병합
    //     "downloadPath": "", //  (선택 사항) 다운로드 경로, 기본값 현재 프로젝트 루트 디렉토리, 수동 파일, 폴더 다운로드 시 사용, 다운로드 주소 지정 가능
    //     "downloadExcludePath": [],//  (선택 사항) 다운로드 제외 파일 및 디렉토리
    //     "default": false // 기본 환경 여부, true일 경우 우클릭 메뉴로 파일 또는 폴더 빠른 업로드, 원격 파일 비교 가능, 기본값 false
    // }
}`
const examplePtText = `{
    // Configuração de referência
    // Nome do ambiente, suporta nome personalizado
    // "test": { // Ambiente de teste
    //     "type": "", // (Obrigatório) Tipo de conexão, valores opcionais: ftp, sftp, ssh
    //     "host": "0.0.0.0", // (Obrigatório) Endereço do servidor
    //     "port": 22, // (Opcional) Número da porta, padrão 21 para ftp, 22 para sftp e ssh
    //     "username": "username", // (Obrigatório) Nome de usuário para login
    //     "password": "password", // Senha de login (ou caminho da chave privada, escolha um)
    //     // "privateKeyPath": "/your_path/id_rsa", //  (Configuração sftp, ssh) Caminho da chave privada (ou senha de login, escolha um), atenção: evite colocar a chave no diretório do código
    //     // "secretKeyPath": "/your_path/secret_key.txt", //  Caminho da chave privada criptografada, usada para criptografar nome de usuário e senha, atenção: evite colocar a chave no diretório do código
    //     "proxy": false, // Usar proxy, padrão false
    //     "upload_on_save": false, // Envio em tempo real após salvar, recomendado para desenvolvimento individual, quando upload_on_save é true, watch, submit_git_before_upload, compress, deleteRemote são ignorados, padrão false
    //     "watch": false, // Monitorar alterações de arquivos no diretório de upload, padrão false, se upload_on_save for true, esta opção é ignorada. Se distPath estiver configurado, apenas monitora alterações no diretório distPath
    //     "submit_git_before_upload": false, // Para desenvolvimento em equipe, commit no git local antes de enviar, para evitar sobrescrever código remoto, padrão false
    //     "submit_git_msg": "", // Mensagem de commit no git, padrão vazio. Se submit_git_before_upload for true e não preenchido, exibe prompt para preenchimento manual
    //     // "build": "yarn build:test", // (Opcional) Comando de build, ative para projetos frontend
    //     "compress": false, //  Compactar antes de enviar e descompactar remotamente (a conta precisa suportar login ssh, o sistema verifica automaticamente, se não suportar, não compacta), padrão false
    //     "remote_unpacked": true, // Descompactar remotamente após envio compactado, padrão true para ssh, false para outros
    //     "delete_remote_compress": true, // Excluir arquivo compactado remoto após envio, padrão true para ssh, false para outros
    //     "delete_local_compress": true, // Excluir arquivo compactado local após envio, padrão true
    //     "upload_to_root": false, // Se distPath tiver apenas um diretório, enviar para a raiz de remotePath, geralmente usado para implantação de código frontend, padrão false
    //     "deleteRemote": false, // Excluir diretório distPath remoto antes de enviar, geralmente usado para limpar código de implantação frontend, padrão false
    //     "distPath": [], // (Opcional) Diretório local para envio, suporta string ou array, padrão envia diretório raiz
    //     "remotePath": "/www/wwwroot/test", // (Configuração sftp, ssh) Endereço do servidor de upload
    //     "excludePath": [], // (Opcional) Arquivos e diretórios excluídos no ambiente atual, mesclado com excludePath da configuração do plugin, se o plugin usar gitignore, mesclado com .gitignore
    //     "downloadPath": "", //  (Opcional) Caminho de download, padrão diretório raiz do projeto, usado para download manual de arquivos ou pastas, pode especificar local de download
    //     "downloadExcludePath": [],//  (Opcional) Arquivos e diretórios excluídos no download
    //     "default": false // Ambiente padrão, se true, permite envio rápido de arquivos ou pastas pelo menu de contexto, comparar arquivos remotos, padrão false
    // }
}`
const exampleRuText = `{
    // Справочная конфигурация
    // Название среды, поддерживает пользовательское имя
    // "test": { // Тестовая среда
    //     "type": "", // (Обязательно) Тип соединения, возможные значения: ftp, sftp, ssh
    //     "host": "0.0.0.0", // (Обязательно) Адрес сервера
    //     "port": 22, // (Необязательно) Номер порта, по умолчанию 21 для ftp, 22 для sftp и ssh
    //     "username": "username", // (Обязательно) Имя пользователя для входа
    //     "password": "password", // Пароль для входа (или путь к приватному ключу, выберите одно)
    //     // "privateKeyPath": "/your_path/id_rsa", //  (Конфигурация sftp, ssh) Путь к приватному ключу (или пароль для входа, выберите одно), внимание: не рекомендуется размещать ключ в каталоге кода
    //     // "secretKeyPath": "/your_path/secret_key.txt", //  Путь к зашифрованному приватному ключу, используется для шифрования имени пользователя и пароля, внимание: не рекомендуется размещать ключ в каталоге кода
    //     "proxy": false, // Использовать прокси, по умолчанию false
    //     "upload_on_save": false, // Мгновенная загрузка после сохранения, рекомендуется для индивидуальной разработки, если upload_on_save равно true, watch, submit_git_before_upload, compress, deleteRemote игнорируются, по умолчанию false
    //     "watch": false, // Мониторинг изменений файлов в каталоге загрузки, по умолчанию false, если upload_on_save равно true, эта опция игнорируется. Если настроен distPath, мониторит только изменения в каталоге distPath
    //     "submit_git_before_upload": false, // Для командной разработки, коммит в локальный git перед загрузкой, чтобы избежать перезаписи удаленного кода, по умолчанию false
    //     "submit_git_msg": "", // Сообщение коммита в git, по умолчанию пустое. Если submit_git_before_upload равно true и не заполнено, отображает запрос на ручное заполнение
    //     // "build": "yarn build:test", // (Необязательно) Команда сборки, активируйте для фронтенд-проектов
    //     "compress": false, //  Сжатие перед загрузкой и удаленная распаковка (аккаунт должен поддерживать ssh-вход, система автоматически проверяет, если не поддерживает, сжатие не выполняется), по умолчанию false
    //     "remote_unpacked": true, // Удаленная распаковка после загрузки сжатого файла, по умолчанию true для ssh, false для других
    //     "delete_remote_compress": true, // Удаление удаленного сжатого файла после загрузки, по умолчанию true для ssh, false для других
    //     "delete_local_compress": true, // Удаление локального сжатого файла после загрузки, по умолчанию true
    //     "upload_to_root": false, // Если distPath содержит только один каталог, загрузить в корень remotePath, обычно используется для развертывания фронтенд-кода, по умолчанию false
    //     "deleteRemote": false, // Удаление удаленного каталога distPath перед загрузкой, обычно используется для очистки фронтенд-кода, по умолчанию false
    //     "distPath": [], // (Необязательно) Локальный каталог для загрузки, поддерживает строку или массив, по умолчанию загружает корневой каталог
    //     "remotePath": "/www/wwwroot/test", // (Конфигурация sftp, ssh) Адрес сервера для загрузки
    //     "excludePath": [], // (Необязательно) Исключаемые файлы и каталоги в текущей среде, объединяется с excludePath из конфигурации плагина, если плагин использует gitignore, объединяется с .gitignore
    //     "downloadPath": "", //  (Необязательно) Путь для загрузки, по умолчанию корневой каталог проекта, используется для ручной загрузки файлов или папок, можно указать место загрузки
    //     "downloadExcludePath": [],//  (Необязательно) Исключаемые файлы и каталоги при загрузке
    //     "default": false // Среда по умолчанию, если true, позволяет быстро загружать файлы или папки через контекстное меню, сравнивать удаленные файлы, по умолчанию false
    // }
}`
const exampleFrText = `{
    // Configuration de référence
    // Nom de l'environnement, le nom peut être personnalisé
    // "test": { // Environnement de test
    // "type": "", // (Obligatoire) Type de connexion, valeurs possibles : ftp, sftp, ssh
    // "host": "0.0.0.0", // (Obligatoire) Adresse du serveur
    // "port": 22, // (Optionnel) Port, par défaut 21 pour FTP, 22 pour SFTP et SSH
    // "username": "username", // (Obligatoire) Nom d'utilisateur
    // "password": "password", // Mot de passe (ou chemin de la clé privée, l'un ou l'autre)
    // // "privateKeyPath": "/your_path/id_rsa", // (Configuration SFTP/SSH) Chemin de la clé privée (ou mot de passe, l'un ou l'autre), attention : évitez de stocker la clé dans le répertoire du code
    // // "secretKeyPath": "/your_path/secret_key.txt", // Chemin de la clé secrète pour chiffrer le nom d'utilisateur et le mot de passe, attention : évitez de stocker la clé dans le répertoire du code
    // "proxy": false, // Utiliser un proxy, par défaut false
    // "upload_on_save": false, // Téléverser automatiquement après sauvegarde, recommandé pour le développement en solo. Si true, les options watch, submit_git_before_upload, compress, deleteRemote sont ignorées. Par défaut false
    // "watch": false, // Surveiller les modifications des fichiers dans le répertoire de téléversement, par défaut false. Si upload_on_save est true, cette option est ignorée. Si distPath est configuré, seuls les fichiers dans distPath sont surveillés
    // "submit_git_before_upload": false, // Pour le travail en équipe, valider les modifications Git avant le téléversement pour éviter d'écraser le code distant, par défaut false
    // "submit_git_msg": "", // Message de commit Git, par défaut vide. Si submit_git_before_upload est true et que ce champ est vide, une boîte de dialogue apparaîtra pour saisir manuellement le message
    // // "build": "yarn build:test", // (Optionnel) Commande de build pour les projets frontaux
    // "compress": false, // Compresser avant téléversement et décompresser à distance (nécessite un accès SSH), par défaut false
    // "remote_unpacked": true, // Décompresser à distance après téléversement, par défaut true pour SSH, false pour les autres
    // "delete_remote_compress": true, // Supprimer le fichier compressé distant après téléversement, par défaut true pour SSH, false pour les autres
    // "delete_local_compress": true, // Supprimer le fichier compressé local après téléversement, par défaut true
    // "upload_to_root": false, // Si distPath contient un seul répertoire, téléverser à la racine de remotePath, utile pour le déploiement de code frontend, par défaut false
    // "deleteRemote": false, // Supprimer le répertoire distant distPath avant téléversement, utile pour nettoyer le code déployé, par défaut false
    // "distPath": [], // (Optionnel) Répertoire local à téléverser, chaîne ou tableau, par défaut la racine
    // "remotePath": "/www/wwwroot/test", // (Configuration SFTP/SSH) Répertoire distant de téléversement
    // "excludePath": [], // (Optionnel) Fichiers/répertoires à exclure pour cet environnement, fusionné avec excludePath du plugin. Si le plugin utilise .gitignore, fusionné avec .gitignore
    // "downloadPath": "", // (Optionnel) Chemin de téléchargement, par défaut la racine du projet, utilisé pour télécharger manuellement des fichiers/dossiers
    // "downloadExcludePath": [], // (Optionnel) Fichiers/répertoires à exclure lors du téléchargement
    // "default": false // Environnement par défaut, si true, permet d'utiliser le menu contextuel pour téléverser rapidement des fichiers/dossiers ou comparer avec les fichiers distants, par défaut false
    // }
}`
const exampleDeText = `{
    // Referenzkonfiguration
    // Umgebungsname, benutzerdefinierter Name möglich
    // "test": { // Testumgebung
    // "type": "", // (Pflicht) Verbindungstyp, mögliche Werte: ftp, sftp, ssh
    // "host": "0.0.0.0", // (Pflicht) Serveradresse
    // "port": 22, // (Optional) Port, Standard: 21 für FTP, 22 für SFTP und SSH
    // "username": "username", // (Pflicht) Benutzername
    // "password": "password", // Passwort (oder Pfad zum privaten Schlüssel, entweder/oder)
    // // "privateKeyPath": "/your_path/id_rsa", // (SFTP/SSH-Konfiguration) Pfad zum privaten Schlüssel (oder Passwort, entweder/oder), Achtung: Schlüssel nicht im Code-Verzeichnis speichern
    // // "secretKeyPath": "/your_path/secret_key.txt", // Pfad zum Verschlüsselungsschlüssel für Benutzername und Passwort, Achtung: Schlüssel nicht im Code-Verzeichnis speichern
    // "proxy": false, // Proxy verwenden, Standard: false
    // "upload_on_save": false, // Automatisches Hochladen nach Speichern, empfohlen für Einzelentwicklung. Wenn true, werden watch, submit_git_before_upload, compress, deleteRemote ignoriert. Standard: false
    // "watch": false, // Überwachen von Dateiänderungen im Upload-Verzeichnis, Standard: false. Wenn upload_on_save true ist, wird diese Option ignoriert. Wenn distPath konfiguriert ist, werden nur Dateien in distPath überwacht
    // "submit_git_before_upload": false, // Für Teamarbeit, Git-Commit vor Upload, um Überschreiben von Remote-Code zu vermeiden, Standard: false
    // "submit_git_msg": "", // Git-Commit-Nachricht, Standard: leer. Wenn submit_git_before_upload true ist und dieses Feld leer ist, erscheint ein Dialog zur manuellen Eingabe
    // // "build": "yarn build:test", // (Optional) Build-Befehl für Frontend-Projekte
    // "compress": false, // Vor Upload komprimieren und remote entpacken (erfordert SSH-Zugriff), Standard: false
    // "remote_unpacked": true, // Remote entpacken nach Upload, Standard: true für SSH, false für andere
    // "delete_remote_compress": true, // Remote komprimierte Datei nach Upload löschen, Standard: true für SSH, false für andere
    // "delete_local_compress": true, // Lokale komprimierte Datei nach Upload löschen, Standard: true
    // "upload_to_root": false, // Wenn distPath nur ein Verzeichnis enthält, Upload in das Stammverzeichnis von remotePath, nützlich für Frontend-Deployment, Standard: false
    // "deleteRemote": false, // Remote distPath-Verzeichnis vor Upload löschen, nützlich für Bereinigung von deploytem Code, Standard: false
    // "distPath": [], // (Optional) Lokales Upload-Verzeichnis, Zeichenkette oder Array, Standard: Stammverzeichnis
    // "remotePath": "/www/wwwroot/test", // (SFTP/SSH-Konfiguration) Remote-Upload-Verzeichnis
    // "excludePath": [], // (Optional) Auszuschließende Dateien/Verzeichnisse für diese Umgebung, wird mit excludePath des Plugins zusammengeführt. Wenn Plugin .gitignore verwendet, wird mit .gitignore zusammengeführt
    // "downloadPath": "", // (Optional) Download-Pfad, Standard: Projektstammverzeichnis, verwendet für manuellen Download von Dateien/Ordnern
    // "downloadExcludePath": [], // (Optional) Auszuschließende Dateien/Verzeichnisse beim Download
    // "default": false // Standardumgebung, wenn true, ermöglicht Kontextmenü für schnelles Hochladen von Dateien/Ordnern oder Vergleich mit Remote-Dateien, Standard: false
    // }
}`
const exampleItText = `{
    // Configurazione di riferimento
    // Nome dell'ambiente, è possibile personalizzare il nome
    // "test": { // Ambiente di test
    // "type": "", // (Obbligatorio) Tipo di connessione, valori possibili: ftp, sftp, ssh
    // "host": "0.0.0.0", // (Obbligatorio) Indirizzo del server
    // "port": 22, // (Opzionale) Porta, predefinita: 21 per FTP, 22 per SFTP e SSH
    // "username": "username", // (Obbligatorio) Nome utente
    // "password": "password", // Password (o percorso della chiave privata, uno dei due)
    // // "privateKeyPath": "/your_path/id_rsa", // (Configurazione SFTP/SSH) Percorso della chiave privata (o password, uno dei due), attenzione: evitare di memorizzare la chiave nella directory del codice
    // // "secretKeyPath": "/your_path/secret_key.txt", // Percorso della chiave segreta per crittografare nome utente e password, attenzione: evitare di memorizzare la chiave nella directory del codice
    // "proxy": false, // Usare un proxy, predefinito: false
    // "upload_on_save": false, // Caricamento automatico dopo il salvataggio, consigliato per sviluppo singolo. Se true, watch, submit_git_before_upload, compress, deleteRemote vengono ignorati. Predefinito: false
    // "watch": false, // Monitorare le modifiche dei file nella directory di upload, predefinito: false. Se upload_on_save è true, questa opzione viene ignorata. Se distPath è configurato, vengono monitorati solo i file in distPath
    // "submit_git_before_upload": false, // Per lavoro di squadra, eseguire commit Git prima del caricamento per evitare sovrascritture del codice remoto, predefinito: false
    // "submit_git_msg": "", // Messaggio di commit Git, predefinito: vuoto. Se submit_git_before_upload è true e questo campo è vuoto, apparirà una finestra di dialogo per l'inserimento manuale
    // // "build": "yarn build:test", // (Opzionale) Comando di build per progetti frontend
    // "compress": false, // Comprimere prima del caricamento e decomprimere in remoto (richiede accesso SSH), predefinito: false
    // "remote_unpacked": true, // Decomprimere in remoto dopo il caricamento, predefinito: true per SSH, false per altri
    // "delete_remote_compress": true, // Eliminare il file compresso remoto dopo il caricamento, predefinito: true per SSH, false per altri
    // "delete_local_compress": true, // Eliminare il file compresso locale dopo il caricamento, predefinito: true
    // "upload_to_root": false, // Se distPath contiene una sola directory, caricare nella root di remotePath, utile per il deployment di codice frontend, predefinito: false
    // "deleteRemote": false, // Eliminare la directory remota distPath prima del caricamento, utile per la pulizia del codice deploytato, predefinito: false
    // "distPath": [], // (Opzionale) Directory locale da caricare, stringa o array, predefinito: root
    // "remotePath": "/www/wwwroot/test", // (Configurazione SFTP/SSH) Directory remota di caricamento
    // "excludePath": [], // (Opzionale) File/directory da escludere per questo ambiente, unito a excludePath del plugin. Se il plugin usa .gitignore, unito a .gitignore
    // "downloadPath": "", // (Opzionale) Percorso di download, predefinito: root del progetto, usato per il download manuale di file/cartelle
    // "downloadExcludePath": [], // (Opzionale) File/directory da escludere durante il download
    // "default": false // Ambiente predefinito, se true, consente di usare il menu contestuale per caricare rapidamente file/cartelle o confrontare con file remoti, predefinito: false
    // }
}`
const exampleTrText = `{
    // Referans yapılandırma
    // Ortam adı, özel isimler desteklenir
    // "test": { // Test ortamı
    //     "type": "", // (Zorunlu) Bağlantı türü, seçenekler: ftp, sftp, ssh
    //     "host": "0.0.0.0", // (Zorunlu) Sunucu adresi
    //     "port": 22, // (Opsiyonel) Port numarası, ftp varsayılan 21, sftp, ssh varsayılan 22
    //     "username": "username", // (Zorunlu) Giriş kullanıcı adı
    //     "password": "password", // Giriş şifresi (veya özel anahtar yolu, ikisinden biri)
    //     // "privateKeyPath": "/your_path/id_rsa", //  (sftp, ssh yapılandırması) Özel anahtar yolu (veya giriş şifresi, ikisinden biri), not: anahtarı kod dizinine koymamak daha iyidir
    //     // "secretKeyPath": "/your_path/secret_key.txt", //  Şifreli özel anahtar yolu, kullanıcı adı ve şifreyi şifrelemek için kullanılır, not: anahtarı kod dizinine koymamak daha iyidir
    //     "proxy": false, // Vekil sunucu kullanılsın mı, varsayılan false
    //     "upload_on_save": false, // Kaydetme sonrası anında gönderim, tek kişilik geliştirme için önerilir, upload_on_save true olduğunda, watch, submit_git_before_upload, compress, deleteRemote geçersiz olur, varsayılan false
    //     "watch": false, // Yükleme dizinindeki dosya değişikliklerini izleme, varsayılan false, eğer upload_on_save true ise bu geçersiz olur. Eğer distPath dizini yapılandırıldıysa, sadece distPath dizinindeki dosya değişiklikleri izlenir
    //     "submit_git_before_upload": false, // Takım geliştirme için kullanılır, kod yüklemeden önce yerel git'i gönderir, uzaktaki kodun üzerine yazılmasını önler, varsayılan false
    //     "submit_git_msg": "", // Git gönderim mesajı yapılandırması, varsayılan boş. submit_git_before_upload true ise, boş bırakılırsa manuel olarak doldurmak için bir uyarı kutusu açılır
    //     // "build": "yarn build:test", // (Opsiyonel) Derleme komutu, eğer ön uç projesi ise bu seçenek açılır
    //     "compress": false, //  Sıkıştırılarak yüklensin mi ve uzaktan açılsın mı (hesap ssh girişini desteklemeli, sistem otomatik olarak desteklenip desteklenmediğini kontrol eder, desteklenmiyorsa sıkıştırılmaz), varsayılan false
    //     "remote_unpacked": true, // Sıkıştırıldıktan sonra uzaktan açılsın mı, ssh varsayılan true, diğerleri varsayılan false
    //     "delete_remote_compress": true, // Sıkıştırılmış dosya yüklendikten sonra uzaktaki sıkıştırılmış dosya silinsin mi, ssh varsayılan true, diğerleri varsayılan false
    //     "delete_local_compress": true, // Sıkıştırılmış dosya yüklendikten sonra yerel sıkıştırılmış dosya silinsin mi, varsayılan true
    //     "upload_to_root": false, // Eğer distPath yapılandırma dizini tek ise, remotePath kök dizinine yüklenir, genellikle ön uç kodunun dağıtımı için kullanılır, varsayılan false
    //     "deleteRemote": false, // Yüklemeden önce uzaktaki distPath yapılandırma dizini silinsin mi, genellikle ön uç dağıtım kodunu temizlemek için kullanılır, varsayılan false
    //     "distPath": [], // (Opsiyonel) Yerel olarak yüklenecek dizin, dize veya dizi desteklenir, varsayılan olarak kök dizin yüklenir
    //     "remotePath": "/www/wwwroot/test", // (sftp, ssh yapılandırması) Sunucuya yükleme adresi
    //     "excludePath": [], // (Opsiyonel) Mevcut ortamda yüklenmeyecek dosya ve dizinler, eklenti yapılandırması excludePath ile birleştirilir, eklenti yapılandırması gitignore kullanıyorsa, .gitignore yapılandırma dosyası ile birleştirilir
    //     "downloadPath": "", //  (Opsiyonel) İndirme yolu, varsayılan olarak mevcut proje kök dizini, manuel dosya veya klasör indirirken kullanılır, indirme adresi belirtilebilir
    //     "downloadExcludePath": [],//  (Opsiyonel) İndirme hariç dosya ve dizinler
    //     "default": false // Varsayılan ortam mı, true olduğunda sağ tık menüsü ile hızlı dosya veya klasör yükleme, uzaktaki dosyaları karşılaştırma gibi işlemler yapılabilir, varsayılan false
    // }
}`

const examplePlText = `{
    // Konfiguracja referencyjna
    // Nazwa środowiska, obsługuje niestandardowe nazwy
    // "test": { // Środowisko testowe
    //     "type": "", // (Wymagane) Typ połączenia, opcje: ftp, sftp, ssh
    //     "host": "0.0.0.0", // (Wymagane) Adres serwera
    //     "port": 22, // (Opcjonalne) Numer portu, domyślnie ftp 21, sftp, ssh domyślnie 22
    //     "username": "username", // (Wymagane) Nazwa użytkownika do logowania
    //     "password": "password", // Hasło do logowania (lub ścieżka klucza prywatnego, jedno z dwóch)
    //     // "privateKeyPath": "/your_path/id_rsa", //  (Konfiguracja sftp, ssh) Ścieżka klucza prywatnego (lub hasło do logowania, jedno z dwóch), uwaga: lepiej nie umieszczać klucza w katalogu kodu
    //     // "secretKeyPath": "/your_path/secret_key.txt", //  Ścieżka zaszyfrowanego klucza prywatnego, używana do szyfrowania nazwy użytkownika i hasła, uwaga: lepiej nie umieszczać klucza w katalogu kodu
    //     "proxy": false, // Czy używać proxy, domyślnie false
    //     "upload_on_save": false, // Natychmiastowe przesyłanie po zapisaniu, zalecane dla rozwoju jednoosobowego, gdy upload_on_save jest ustawione na true, watch, submit_git_before_upload, compress, deleteRemote są nieważne, domyślnie false
    //     "watch": false, // Śledzenie zmian plików w katalogu przesyłania, domyślnie false, jeśli upload_on_save jest true, to jest nieważne. Jeśli skonfigurowano katalog distPath, tylko zmiany w katalogu distPath są śledzone
    //     "submit_git_before_upload": false, // Używane w rozwoju zespołowym, przesyłanie lokalnego gita przed przesłaniem kodu, aby zapobiec nadpisaniu zdalnego kodu, domyślnie false
    //     "submit_git_msg": "", // Konfiguracja wiadomości przesyłania gita, domyślnie pusta. Jeśli submit_git_before_upload jest true, jeśli puste, pojawi się okno dialogowe do ręcznego wypełnienia
    //     // "build": "yarn build:test", // (Opcjonalne) Polecenie budowania, jeśli projekt frontendowy, to otwórz tę opcję
    //     "compress": false, //  Czy kompresować przesyłanie i rozpakować zdalnie (konto musi obsługiwać logowanie ssh, system automatycznie sprawdza, czy obsługuje, jeśli nie, to nie będzie kompresować przesyłania), domyślnie false
    //     "remote_unpacked": true, // Czy rozpakować zdalnie po kompresji przesyłania, ssh domyślnie true, inne domyślnie false
    //     "delete_remote_compress": true, // Czy usunąć zdalny skompresowany plik po przesłaniu, ssh domyślnie true, inne domyślnie false
    //     "delete_local_compress": true, // Czy usunąć lokalny skompresowany plik po przesłaniu, domyślnie true
    //     "upload_to_root": false, // Jeśli skonfigurowano tylko jeden katalog distPath, przesyłaj do katalogu głównego remotePath, zazwyczaj używane do wdrażania kodu frontendowego, domyślnie false
    //     "deleteRemote": false, // Czy usunąć zdalny katalog distPath przed przesłaniem, zazwyczaj używane do czyszczenia wdrożonego kodu frontendowego, domyślnie false
    //     "distPath": [], // (Opcjonalne) Lokalny katalog do przesłania, obsługuje ciąg znaków lub tablicę, domyślnie przesyła katalog główny
    //     "remotePath": "/www/wwwroot/test", // (Konfiguracja sftp, ssh) Adres przesyłania na serwer
    //     "excludePath": [], // (Opcjonalne) Pliki i katalogi wykluczone z przesyłania w bieżącym środowisku, zostaną połączone z excludePath w konfiguracji wtyczki, jeśli wtyczka używa gitignore, zostanie połączona z plikiem konfiguracyjnym .gitignore
    //     "downloadPath": "", //  (Opcjonalne) Ścieżka pobierania, domyślnie katalog główny bieżącego projektu, używane przy ręcznym pobieraniu plików lub folderów, można określić adres pobierania
    //     "downloadExcludePath": [],//  (Opcjonalne) Pliki i katalogi wykluczone z pobierania
    //     "default": false // Czy domyślne środowisko, jeśli true, można używać menu kontekstowego do szybkiego przesyłania plików lub folderów, porównywania zdalnych plików, domyślnie false
    // }
}`

const exampleJaText = `{
    // 参考設定
    // 環境名、カスタム名をサポート
    // "test": { // テスト環境
    //     "type": "", // (必須) 接続タイプ、オプション: ftp, sftp, ssh
    //     "host": "0.0.0.0", // (必須) サーバーアドレス
    //     "port": 22, // (オプション) ポート番号、ftpデフォルト21、sftp、sshデフォルト22
    //     "username": "username", // (必須) ログインユーザー名
    //     "password": "password", // ログインパスワード (または秘密鍵パス、どちらか一つ)
    //     // "privateKeyPath": "/your_path/id_rsa", //  (sftp, ssh設定) 秘密鍵パス (またはログインパスワード、どちらか一つ)、注意: 鍵をコードディレクトリに置かない方が良い
    //     // "secretKeyPath": "/your_path/secret_key.txt", //  暗号化された秘密鍵パス、ユーザー名とパスワードを暗号化するために使用、注意: 鍵をコードディレクトリに置かない方が良い
    //     "proxy": false, // プロキシを使用するか、デフォルトfalse
    //     "upload_on_save": false, // 保存後即時アップロード、単独開発に推奨、upload_on_saveがtrueの場合、watch、submit_git_before_upload、compress、deleteRemoteは無効、デフォルトfalse
    //     "watch": false, // アップロードディレクトリのファイル変更を監視、デフォルトfalse、upload_on_saveがtrueの場合、これは無効。distPathディレクトリが設定されている場合、distPathディレクトリ内のファイル変更のみ監視
    //     "submit_git_before_upload": false, // チーム開発に使用、コードアップロード前にローカルgitをコミット、リモートコードの上書きを防止、デフォルトfalse
    //     "submit_git_msg": "", // gitコミットメッセージ設定、デフォルト空。submit_git_before_uploadがtrueの場合、空欄の場合は手動入力のプロンプトが表示される
    //     // "build": "yarn build:test", // (オプション) ビルドコマンド、フロントエンドプロジェクトの場合、このオプションを有効にする
    //     "compress": false, //  アップロードを圧縮し、リモートで解凍するか (アカウントはsshログインをサポートする必要あり、システムは自動的にサポートを確認、サポートされていない場合、圧縮アップロードは行われない)、デフォルトfalse
    //     "remote_unpacked": true, // 圧縮アップロード後、リモートで解凍するか、sshデフォルトtrue、その他デフォルトfalse
    //     "delete_remote_compress": true, // 圧縮ファイルアップロード後、リモートの圧縮ファイルを削除するか、sshデフォルトtrue、その他デフォルトfalse
    //     "delete_local_compress": true, // 圧縮ファイルアップロード後、ローカルの圧縮ファイルを削除するか、デフォルトtrue
    //     "upload_to_root": false, // distPath設定ディレクトリが一つだけの場合、remotePathルートディレクトリにアップロード、通常フロントエンドコードのデプロイに使用、デフォルトfalse
    //     "deleteRemote": false, // アップロード前にリモートのdistPath設定ディレクトリを削除するか、通常フロントエンドデプロイコードのクリーンアップに使用、デフォルトfalse
    //     "distPath": [], // (オプション) アップロードするローカルディレクトリ、文字列または配列をサポート、デフォルトでルートディレクトリをアップロード
    //     "remotePath": "/www/wwwroot/test", // (sftp, ssh設定) サーバーアップロードアドレス
    //     "excludePath": [], // (オプション) 現在の環境でアップロードしないファイルとディレクトリ、プラグイン設定のexcludePathとマージされ、プラグイン設定がgitignoreを使用する場合、.gitignore設定ファイルとマージされる
    //     "downloadPath": "", //  (オプション) ダウンロードパス、デフォルトは現在のプロジェクトルートディレクトリ、手動でファイルやフォルダをダウンロードする際に使用、ダウンロードアドレスを指定可能
    //     "downloadExcludePath": [],//  (オプション) ダウンロード除外ファイルとディレクトリ
    //     "default": false // デフォルト環境か、trueの場合、右クリックメニューでファイルやフォルダを迅速にアップロード、リモートファイルと比較が可能、デフォルトfalse
    // }
}`

export const getExampleText = () => {
    let configLangText = ''
    let lang = vscode.env.language
    switch (lang) {
        case "zh-cn":
            configLangText = exampleZhText
            break;
        case "zh-tw":
            configLangText = exampleZhText
            break;
        case "en":
            configLangText = exampleEnText
            break;
        case "es":
            configLangText = exampleEsText
            break;
        case "ko":
            configLangText = exampleKoText
            break;
        case "pt-br":
            configLangText = examplePtText
            break;
        case "ru":
            configLangText = exampleRuText
            break;
        case "fr":
            configLangText = exampleFrText
            break;
        case "de":
            configLangText = exampleDeText
            break;
        case "it":
            configLangText = exampleItText
            break;
        case "tr":
            configLangText = exampleTrText
            break;
        case "pl":
            configLangText = examplePlText
            break;
        case "ja":
            configLangText = exampleJaText
            break;
        default:
            configLangText = exampleEnText
            break;
    }
    return configLangText
}