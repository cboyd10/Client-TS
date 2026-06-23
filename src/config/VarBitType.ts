import Linkable2 from '#/datastruct/Linkable2.js';
import LruCache from '#/datastruct/LruCache.js';
import Packet from '#/io/Packet.js';
import type Js5 from '#/js5/Js5.js';

export default class VarBitType extends Linkable2 {
    static readonly recentUse: LruCache<VarBitType> = new LruCache(64);

    static configClient: Js5;

    basevar: number = 0;
    startbit: number = 0;
    endbit: number = 0;

    static list(arg0: number): VarBitType {
        const var1 = VarBitType.recentUse.find(BigInt(arg0));
        if (var1 !== null) {
            return var1;
        }

        const var2 = VarBitType.configClient.getFile(VarBitType.getGroupId(arg0), VarBitType.getFileId(arg0));
        const var3 = new VarBitType();
        if (var2 !== null) {
            var3.decode(new Packet(var2));
        }
        VarBitType.recentUse.put(BigInt(arg0), var3);
        return var3;
    }

    static resetCache(): void {
        VarBitType.recentUse.clear();
    }

    static init(arg0: Js5): void {
        VarBitType.configClient = arg0;
    }

    static getGroupId(arg0: number): number {
        return arg0 & 0x3ff;
    }

    static getFileId(arg0: number): number {
        return arg0 >>> 10;
    }

    decode(arg0: Packet): void;
    decode(arg0: number, arg1: Packet): void;
    decode(arg0: Packet | number, arg1?: Packet): void {
        if (typeof arg0 === 'number') {
            if (arg0 === 1) {
                this.basevar = arg1!.g2();
                this.startbit = arg1!.g1();
                this.endbit = arg1!.g1();
            }
            return;
        }

        while (true) {
            const var2 = arg0.g1();
            if (var2 === 0) {
                return;
            }
            this.decode(var2, arg0);
        }
    }
}
