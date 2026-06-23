import HashTable from '#/datastruct/HashTable.js';
import IntNode from '#/datastruct/IntNode.js';
import Linkable from '#/datastruct/Linkable.js';
import Linkable2 from '#/datastruct/Linkable2.js';
import LruCache from '#/datastruct/LruCache.js';
import StringNode from '#/datastruct/StringNode.js';

import Packet from '#/io/Packet.js';
import type Js5 from '#/js5/Js5.js';
import IntMath from '#/util/IntMath.js';

export default class StructType extends Linkable2 {
    static readonly recentUse: LruCache<StructType> = new LruCache(64);
    static configClient: Js5;

    params: HashTable<Linkable> | null = null;

    static list(arg0: number): StructType {
        const var1 = StructType.recentUse.find(BigInt(arg0));
        if (var1 !== null) {
            return var1;
        }

        const var2 = StructType.configClient.getFile(arg0, 26);
        const var3 = new StructType();
        if (var2 !== null) {
            var3.decode(new Packet(var2));
        }
        StructType.recentUse.put(BigInt(arg0), var3);
        return var3;
    }

    static init(arg0: Js5): void {
        StructType.configClient = arg0;
    }

    decode(arg0: number, arg1: Packet): void;
    decode(arg0: Packet): void;
    decode(arg0: Packet | number, arg1?: Packet): void {
        if (typeof arg0 === 'number') {
            if (arg0 === 249) {
                const var3 = arg1!.g1();
                if (this.params === null) {
                    const var4 = IntMath.bitceil(var3);
                    this.params = new HashTable(var4);
                }
                for (let var5 = 0; var5 < var3; var5++) {
                    const var6 = arg1!.g1() === 1;
                    const var7 = arg1!.g3();
                    let var8: Linkable;
                    if (var6) {
                        var8 = new StringNode(arg1!.gjstr());
                    } else {
                        var8 = new IntNode(arg1!.g4());
                    }
                    this.params.put(BigInt(var7), var8);
                }
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

    getParamString(arg0: string | null, arg1: number): string | null {
        if (this.params === null) {
            return arg0;
        } else {
            const var3 = this.params.find(BigInt(arg1)) as StringNode | null;
            return var3 === null ? arg0 : (var3.value as string);
        }
    }

    getParamInt(arg0: number, arg1: number): number {
        if (this.params === null) {
            return arg0;
        } else {
            const var3 = this.params.find(BigInt(arg1)) as IntNode | null;
            return var3 === null ? arg0 : var3.value;
        }
    }
}
