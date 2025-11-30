import { TargetInterface, TargetOptionsInterface } from "./Interfaces";
export default class Connector {
    private static items;
    static add(target: TargetInterface): void;
    static destroyAllConnector(): void;
    static getActive(): void;
    static getItems(): TargetInterface[];
    static findByName(name: string): TargetInterface;
    static getTargetInstance(targetConfig: TargetOptionsInterface): TargetInterface | null;
    static getRelativePath(targetConfig: TargetOptionsInterface, path: any): string;
}
//# sourceMappingURL=Connector%20copy.d.ts.map