export interface opType {
    op: string;
    type: string;
    newname?: string;
    md5?: string;
}
export interface FileOpType {
    file: string;
    opType: opType;
}
export interface proxyConfigType {
    proxyHost: string;
    proxyPort: number;
    proxyUsername?: string;
    proxyPassword?: string;
    proxyType?: number;
}
export declare enum TargetTypes {
    ftp = "ftp",
    sftp = "sftp",
    ssh = "ssh"
}
export interface DeployConfigItem {
    type: TargetTypes;
    host: string;
    port: number;
    user?: string;
    username: string;
    password?: string;
    privateKeyPath?: string;
    proxy?: boolean;
    sock?: any;
    watch?: boolean;
    upload_on_save?: boolean;
    submit_git_before_upload?: boolean;
    submit_git_msg?: string;
    build?: string;
    compress?: boolean;
    remote_unpacked?: boolean;
    delete_remote_compress?: boolean;
    delete_local_compress?: boolean;
    distPath?: string | string[];
    upload_to_root?: boolean;
    deleteRemote?: boolean;
    remotePath: string;
    excludePath?: string | string[];
    downloadPath?: string;
    default?: boolean;
}
export interface FileTransferConfigItem extends DeployConfigItem {
    name: string;
    start?: string;
    end?: string;
    useTime?: string;
    error?: string;
    downloadExcludePath?: string | string[];
}
export interface Task {
    id?: string;
    config: FileTransferConfigItem;
    localPath: string;
    remotePath: string;
    fileType?: string;
    fileSize?: number;
    fileSizeText?: string;
    retries?: number;
    progress?: number;
    start?: string;
    end?: string;
    useTime?: string;
    error?: string;
    view?: boolean;
    isDirectory?: boolean;
    useZip?: boolean;
    compare?: boolean;
    operationType?: string;
    fileChunks?: {
        start: number;
        end: number;
    }[];
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
//# sourceMappingURL=config.d.ts.map