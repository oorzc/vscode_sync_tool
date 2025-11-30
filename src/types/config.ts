// 操作文件类型
export interface opType {
    op: string,
    type: string,
    newname?: string,
    md5?: string,
}

export interface FileOpType {
    file: string;
    opType: opType
}

export interface proxyConfigType {
    proxyHost: string,
    proxyPort: number,
    proxyUsername?: string,
    proxyPassword?: string,
    proxyType?: number
}

// 操作文件类型
export enum TargetTypes {
    ftp = "ftp",
    sftp = "sftp",
    ssh = "ssh"
}

export interface DeployConfigItem {
    type: TargetTypes; // 服务器类型
    host: string; // 服务器地址
    port: number; // 端口
    user?: string; // 用户名FTP	
    username: string; // 用户名 SFTP
    password?: string; // 密码
    privateKeyPath?: string; // 秘钥地址
    proxy?: boolean; // 是否使用代理
    sock?: any;
    watch?: boolean; // 监听上传目录文件变动，如果是前端项目不建议启用，默认true
    upload_on_save?: boolean; // 保存后实时提交，建议单人开发使用，upload_on_save设置为true时，watch、submit_git_before_upload、compress、deleteRemote无效，默认false
    submit_git_before_upload?: boolean; // 团队开发使用，上传代码前提交本地git，防止覆盖远程代码，默认true
    submit_git_msg?: string; // 提交git的message配置，默认空。submit_git_before_upload为true时，不填写会弹出提示框手动填写
    build?: string; // 本地打包代码命令，建议前端项目设置
    compress?: boolean; // 是否压缩上传，并远程解压，账号需要支持ssh登录，默认false
    remote_unpacked?: boolean; // 压缩上传后是否远程解压，默认true
    delete_remote_compress?: boolean; // 压缩文件上传后是否删除远程压缩文件，默认true
    delete_local_compress?: boolean; // 压缩文件上传后是否删除本地压缩文件，默认true
    distPath?: string | string[]; // 本地需要上传的目录，支持字符串或数组，默认上传根目录
    upload_to_root?: boolean //上传到根目录
    deleteRemote?: boolean; // 上传前是否删除远程文件
    remotePath: string; // 上传服务器地址  
    excludePath?: string | string[]; //  排除的上传文件及目录
    downloadPath?: string; //  (非必填) 下载路径，默认为当前项目根目录，手动下载文件、文件夹时使用，可以指定下载地址
    default?: boolean; // 默认配置
}

export interface FileTransferConfigItem extends DeployConfigItem {
    name: string; // 配置名称
    start?: string; // 开始时间
    end?: string; // 结束时间
    useTime?: string; // 耗时
    error?: string; // 任务异常日志
    downloadExcludePath?: string|string[]; // 下载排除的文件及目录
}

// 定义任务接口
export interface Task {
    id?: string; // 任务id
    config: FileTransferConfigItem;
    localPath: string;
    remotePath: string;
    fileType?: string;
    fileSize?: number;
    fileSizeText?: string;
    retries?: number; // 任务重试次数
    progress?: number;
    start?: string; // 开始时间
    end?: string; // 结束时间
    useTime?: string; // 耗时
    error?: string; // 任务异常日志
    view?: boolean; // 是否视图中操作
    isDirectory?: boolean; // 是否文件夹
    useZip?: boolean;
    compare?: boolean;
    operationType?: string;
    fileChunks?: { start: number, end: number }[];
}

/**
 * 将权限字符串转换为八进制表示。
 * @param permissions 包含权限信息的对象，包含 user、group 和 other 属性，每个属性为一个字符串，表示对应的权限，
 *                     权限字符串中只能包含 'r'（读权限）、'w'（写权限）和 'x'（执行权限）字符。
 * @returns 返回一个字符串，表示权限的八进制表示。
 */
export type Permissions = {
    user?: string;
    group?: string;
    other?: string;
};
