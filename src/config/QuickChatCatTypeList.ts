import Linkable2 from '#/datastruct/Linkable2.js';
import LruCache from '#/datastruct/LruCache.js';
import Packet from '#/io/Packet.js';
import type Js5 from '#/js5/Js5.js';

export default class QuickChatCatTypeList extends Linkable2 {
    static readonly recentUse: LruCache<QuickChatCatTypeList> = new LruCache(64);
    static configClient: Js5;
    static globalConfigClient: Js5;

    phraseShortcuts: Int32Array | null = null;
    description: string | null = null;
    subcategoryIds: Int32Array | null = null;
    subcategoryShortcuts: Int32Array | null = null;
    phraseIds: Int32Array | null = null;

    static list(arg0: number): QuickChatCatTypeList {
        const var1 = QuickChatCatTypeList.recentUse.find(BigInt(arg0));
        if (var1 !== null) {
            return var1;
        }

        let var2: Uint8Array | null;
        if (arg0 < 32768) {
            var2 = QuickChatCatTypeList.configClient.getFile(arg0, 0);
        } else {
            var2 = QuickChatCatTypeList.globalConfigClient.getFile(arg0 & 0x7fff, 0);
        }

        const var3 = new QuickChatCatTypeList();
        if (var2 !== null) {
            var3.decode(new Packet(var2));
        }
        if (arg0 >= 32768) {
            var3.markGlobal();
        }
        QuickChatCatTypeList.recentUse.put(BigInt(arg0), var3);
        return var3;
    }

    static init(arg0: Js5, arg1: Js5): void {
        QuickChatCatTypeList.configClient = arg0;
        QuickChatCatTypeList.globalConfigClient = arg1;
    }

    getPhraseByShortcut(arg0: number): number {
        if (this.phraseIds === null) {
            return -1;
        }
        for (let var2 = 0; var2 < this.phraseIds.length; var2++) {
            if (this.phraseShortcuts![var2] == arg0) {
                return this.phraseIds[var2];
            }
        }
        return -1;
    }

    decodeInner(arg0: number, arg1: Packet): void {
        if (arg0 == 1) {
            this.description = arg1.gjstr();
        } else if (arg0 == 2) {
            const var3 = arg1.g1();
            this.subcategoryShortcuts = new Int32Array(var3);
            this.subcategoryIds = new Int32Array(var3);
            for (let var4 = 0; var4 < var3; var4++) {
                this.subcategoryIds[var4] = arg1.g2();
                const var5 = arg1.g1();
                if (var5 == 0) {
                    this.subcategoryShortcuts[var4] = -1;
                } else {
                    this.subcategoryShortcuts[var4] = var5;
                }
            }
        } else if (arg0 == 3) {
            const var6 = arg1.g1();
            this.phraseShortcuts = new Int32Array(var6);
            this.phraseIds = new Int32Array(var6);
            for (let var7 = 0; var7 < var6; var7++) {
                this.phraseIds[var7] = arg1.g2();
                const var8 = arg1.g1();
                if (var8 == 0) {
                    this.phraseShortcuts[var7] = -1;
                } else {
                    this.phraseShortcuts[var7] = var8;
                }
            }
        }
    }

    decode(arg0: Packet): void {
        while (true) {
            const var2 = arg0.g1();
            if (var2 === 0) {
                return;
            }
            this.decodeInner(var2, arg0);
        }
    }

    getSubcategoryByShortcut(arg0: number): number {
        if (this.subcategoryIds === null) {
            return -1;
        }
        for (let var2 = 0; var2 < this.subcategoryIds.length; var2++) {
            if (this.subcategoryShortcuts![var2] == arg0) {
                return this.subcategoryIds[var2];
            }
        }
        return -1;
    }

    markGlobal(): void {
        if (this.phraseIds !== null) {
            for (let var1 = 0; var1 < this.phraseIds.length; var1++) {
                this.phraseIds[var1] |= 0x8000;
            }
        }
        if (this.subcategoryIds !== null) {
            for (let var2 = 0; var2 < this.subcategoryIds.length; var2++) {
                this.subcategoryIds[var2] |= 0x8000;
            }
        }
    }
}
