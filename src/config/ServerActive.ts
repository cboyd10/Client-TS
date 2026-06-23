export default class ServerActive {
    static isUseTarget(arg0: number): boolean {
        return ((arg0 >> 21) & 0x1) !== 0;
    }

    static serverDraggable(arg0: number): number {
        return (arg0 >> 17) & 0x7;
    }

    static isDragTarget(arg0: number): boolean {
        return ((arg0 >> 20) & 0x1) !== 0;
    }

    static isObjOpsEnabled(arg0: number): boolean {
        return ((arg0 >> 30) & 0x1) !== 0;
    }

    static isObjReplaceEnabled(arg0: number): boolean {
        return ((arg0 >> 29) & 0x1) !== 0;
    }

    static isObjUseEnabled(arg0: number): boolean {
        return ((arg0 >> 31) & 0x1) !== 0;
    }

    static pauseButton(arg0: number): boolean {
        return (arg0 & 0x1) !== 0;
    }

    static hasOp(arg0: number, arg1: number): boolean {
        return ((arg1 >> (arg0 + 1)) & 0x1) !== 0;
    }

    static isObjSwapEnabled(arg0: number): boolean {
        return ((arg0 >> 28) & 0x1) !== 0;
    }

    static targetMask(arg0: number): number {
        return (arg0 >> 11) & 0x3f;
    }
}
