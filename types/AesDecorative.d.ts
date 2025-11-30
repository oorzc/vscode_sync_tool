import * as vscode from 'vscode';
export declare function CodeLensProvider(context: vscode.ExtensionContext): void;
export declare function handleEncryptionOrDecryption(action: string, filePath: string, obj: {
    value: any;
    key: any;
}, oldSecretKey?: string): Promise<string | undefined>;
//# sourceMappingURL=AesDecorative.d.ts.map