import * as Queue from "../Queue";
export interface ConfigsInterface {
    enableStatusBarItem?: boolean;
    enableQuickPick?: boolean;
    autoDelete?: boolean;
    uploadOnSave?: boolean;
    checkGitignore?: boolean;
    concurrency?: number;
    activeTargets?: string[];
    targets?: TargetOptionsInterface[];
    ignore: string[];
    include: string[];
}
export interface TargetOptionsInterface {
    name: string;
    type: TargetTypes;
    host: string;
    username: string;
    port: number;
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
}
export interface TargetInterface {
    connect(): Promise<any>;
    upload(path: string, destination: string): Promise<string>;
    download(path: string, destination: string): Promise<string>;
    delete(path: string): Promise<string>;
    list(path: string): Promise<string>;
    destroy(): void;
    getName(): string;
    getQueue(): Queue.Queue<QueueTask>;
}
export declare enum TargetTypes {
    ftp = "ftp",
    sftp = "sftp"
}
export interface QueueTask extends Queue.Task<string> {
    filepath: string;
    isFile: boolean;
    action: string;
}
//# sourceMappingURL=Interfaces.d.ts.map