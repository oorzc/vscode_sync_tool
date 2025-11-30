import * as vscode from "vscode";
export declare function CodeLensProvider(context: vscode.ExtensionContext): void;
export declare function handleEncryptionOrDecryption(action: string, filePath: string, obj: {
    value: any;
    key: any;
}): Promise<string | undefined>;
export declare function getDecryptionCode(key: string | undefined, newSecretKey: string): any;
//# sourceMappingURL=CodeLensProvider.d.ts.map