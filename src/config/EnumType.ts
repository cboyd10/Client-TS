import HashTable from '#/datastruct/HashTable.js';
import IntNode from '#/datastruct/IntNode.js';
import Linkable from '#/datastruct/Linkable.js';
import Linkable2 from '#/datastruct/Linkable2.js';
import LruCache from '#/datastruct/LruCache.js';
import StringNode from '#/datastruct/StringNode.js';

import Packet from '#/io/Packet.js';
import type Js5 from '#/js5/Js5.js';
import IntMath from '#/util/IntMath.js';

export default class EnumType extends Linkable2 {
    static readonly recentUse: LruCache<EnumType> = new LruCache(128);
    static configClient: Js5;
    static readonly NULL: string = 'null';

    defaultString: string = EnumType.NULL;
    inputtype: number = 0;
    defaultInt: number = 0;
    outputtype: number = 0;
    table: HashTable<Linkable> | null = null;

    static list(arg0: number): EnumType {
        const var1 = EnumType.recentUse.find(BigInt(arg0));
        if (var1 !== null) {
            return var1;
        }

        const var2 = EnumType.configClient.getFile(EnumType.getGroupId(arg0), EnumType.getFileId(arg0));
        const var3 = new EnumType();
        if (var2 !== null) {
            var3.decode(new Packet(var2));
        }
        EnumType.recentUse.put(BigInt(arg0), var3);
        return var3;
    }

    static init(arg0: Js5): void {
        EnumType.configClient = arg0;
    }

    static getGroupId(arg0: number): number {
        return arg0 & 0xff;
    }

    static getFileId(arg0: number): number {
        return arg0 >>> 8;
    }

    decode(arg0: Packet): void;
    decode(arg0: number, arg1: Packet): void;
    decode(arg0: Packet | number, arg1?: Packet): void {
        if (typeof arg0 === 'number') {
            if (arg0 === 1) {
                this.inputtype = arg1!.g1();
            } else if (arg0 === 2) {
                this.outputtype = arg1!.g1();
            } else if (arg0 === 3) {
                this.defaultString = arg1!.gjstr();
            } else if (arg0 === 4) {
                this.defaultInt = arg1!.g4();
            } else if (arg0 === 5 || arg0 === 6) {
                const var3 = arg1!.g2();
                this.table = new HashTable(IntMath.bitceil(var3));
                for (let var4 = 0; var4 < var3; var4++) {
                    const var5 = arg1!.g4();
                    let var6: Linkable;
                    if (arg0 === 5) {
                        var6 = new StringNode(arg1!.gjstr());
                    } else {
                        var6 = new IntNode(arg1!.g4());
                    }
                    this.table.put(BigInt(var5), var6);
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

    getValueInt(arg0: number): number {
        if (this.table === null) {
            return this.defaultInt;
        } else {
            const var2 = this.table.find(BigInt(arg0)) as IntNode | null;
            return var2 === null ? this.defaultInt : var2.value;
        }
    }

    getValueString(arg0: number): string {
        if (this.table === null) {
            return this.defaultString;
        } else {
            const var2 = this.table.find(BigInt(arg0)) as StringNode | null;
            return var2 === null ? this.defaultString : (var2.field4046 as string);
        }
    }
}
