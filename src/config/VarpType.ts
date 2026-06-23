import Linkable2 from '#/datastruct/Linkable2.js';
import LruCache from '#/datastruct/LruCache.js';
import Packet from '#/io/Packet.js';
import type Js5 from '#/js5/Js5.js';

export default class VarpType extends Linkable2 {
    static readonly recentUse: LruCache<VarpType> = new LruCache(64);
    static configClient: Js5;
    static numDefinitions: number = 0;

    clientcode: number = 0;

    static list(arg0: number): VarpType {
        const var1 = VarpType.recentUse.find(BigInt(arg0));
        if (var1 !== null) {
            return var1;
        }

        const var2 = VarpType.configClient.getFile(arg0, 16);
        const var3 = new VarpType();
        if (var2 !== null) {
            var3.decode(new Packet(var2));
        }
        VarpType.recentUse.put(BigInt(arg0), var3);
        return var3;
    }

    static resetCache(): void {
        VarpType.recentUse.clear();
    }

    static init(arg0: Js5): void {
        VarpType.configClient = arg0;
        VarpType.numDefinitions = VarpType.configClient.getFileIdLimit(16);
    }

    decode(arg0: number, arg1: Packet): void;
    decode(arg0: Packet): void;
    decode(arg0: Packet | number, arg1?: Packet): void {
        if (typeof arg0 === 'number') {
            if (arg0 === 5) {
                this.clientcode = arg1!.g2();
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
