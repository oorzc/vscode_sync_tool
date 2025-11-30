import { opType, DeployConfigItem } from '../config/config';
export declare class SftpUploader {
    static instance: any;
    sftp: any;
    constructor();
    uploadOnSave(label: string, workspaceRoot: string, config: DeployConfigItem, file: string, opType: opType): Promise<void>;
}
//# sourceMappingURL=uploadOnSave%20copy%202.d.ts.map