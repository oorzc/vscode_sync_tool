import { TargetInterface, TargetOptionsInterface } from "./Interfaces";
export default class Targets {
    private static items;
    static add(target: TargetInterface): void;
    static destroyAllTargets(): void;
    static getActive(): TargetInterface[];
    static getName(): TargetInterface[];
    static getItems(): TargetInterface[];
    static findByName(name: string): TargetInterface;
    static getTargetInstance(targetConfig: TargetOptionsInterface): TargetInterface | null;
}
//# sourceMappingURL=Targets.d.ts.map