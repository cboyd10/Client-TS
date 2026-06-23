import Linkable2 from '#/datastruct/Linkable2.js';
import LruCache from '#/datastruct/LruCache.js';

import Packet from '#/io/Packet.js';
import type Js5 from '#/js5/Js5.js';

export default class ParamType extends Linkable2 {
    static readonly recentUse: LruCache<ParamType> = new LruCache(64);
    static configClient: Js5;

    type: number = 0;
    defaultInt: number = 0;
    defaultString: string | null = null;

    static list(arg0: number): ParamType {
        const var1 = ParamType.recentUse.find(BigInt(arg0));
        if (var1 !== null) {
            return var1;
        }

        const var2 = ParamType.configClient.getFile(arg0, 11);
        const var3 = new ParamType();
        if (var2 !== null) {
            var3.decode(new Packet(var2));
        }
        ParamType.recentUse.put(BigInt(arg0), var3);
        return var3;
    }

    static init(arg0: Js5): void {
        ParamType.configClient = arg0;
    }

    isString(): boolean {
        return this.type == 115;
    }

    decode(arg0: Packet): void;
    decode(arg0: number, arg1: Packet): void;
    decode(arg0: Packet | number, arg1?: Packet): void {
        if (typeof arg0 === 'number') {
            if (arg0 === 1) {
                this.type = arg1!.g1();
            } else if (arg0 === 2) {
                this.defaultInt = arg1!.g4();
            } else if (arg0 === 5) {
                this.defaultString = arg1!.gjstr();
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
