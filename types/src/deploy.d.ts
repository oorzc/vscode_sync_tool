import { NodeSSH } from "node-ssh";
import { DeployConfigItem } from "./nodeDependencies";
export declare class Deploy {
    config: DeployConfigItem;
    ssh: NodeSSH;
    workspaceRoot: string;
    taskList: {
        task: () => void | Promise<any>;
        tip: string;
        increment: number;
        async?: boolean;
    }[];
    callback: (success: boolean) => void;
    constructor(config: DeployConfigItem, workspaceRoot: string, callback: (success: boolean) => void);
    start: () => Promise<void>;
    checkConfig: () => void;
    execBuild: () => Promise<void>;
    buildZip: () => Promise<void>;
    connectSSH: () => Promise<void>;
    removeRemoteFile: () => Promise<import("node-ssh").SSHExecCommandResponse> | undefined;
    uploadLocalFile: () => Promise<void>;
    unzipRemoteFile: () => Promise<import("node-ssh").SSHExecCommandResponse>;
    removeLocalFile: () => void;
    disconnectSSH: () => void;
}
//# sourceMappingURL=deploy.d.ts.map