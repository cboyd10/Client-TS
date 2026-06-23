import Linkable2 from '#/datastruct/Linkable2.js';
import LruCache from '#/datastruct/LruCache.js';

import Packet from '#/io/Packet.js';
import type Js5 from '#/js5/Js5.js';

export default class InvType extends Linkable2 {
    static readonly recentUse: LruCache<InvType> = new LruCache(64);
    static configClient: Js5;

    size: number = 0;

    static list(arg0: number): InvType {
        const var1 = InvType.recentUse.find(BigInt(arg0));
        if (var1 !== null) {
            return var1;
        }

        const var2 = InvType.configClient.getFile(arg0, 5);
        const var3 = new InvType();
        if (var2 !== null) {
            var3.decode(new Packet(var2));
        }
        InvType.recentUse.put(BigInt(arg0), var3);
        return var3;
    }

    static init(arg0: Js5): void {
        InvType.configClient = arg0;
    }

    decode(arg0: Packet): void;
    decode(arg0: number, arg1: Packet): void;
    decode(arg0: Packet | number, arg1?: Packet): void {
        if (typeof arg0 === 'number') {
            if (arg0 === 2) {
                this.size = arg1!.g2();
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
