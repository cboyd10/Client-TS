import Linkable2 from '#/datastruct/Linkable2.js';
import LruCache from '#/datastruct/LruCache.js';
import Packet from '#/io/Packet.js';
import JagString from '#/jstring/JagString.js';
import type Js5 from '#/js5/Js5.js';
import type QuickChatDynamicProvider from '#/config/QuickChatDynamicProvider.js';

export default class QuickChatPhraseType extends Linkable2 {
    static readonly recentUse: LruCache<QuickChatPhraseType> = new LruCache(64);
    static readonly ENCODE_BIT_LENGTHS: Int32Array = new Int32Array([2, 2, 4, 0, 1, 8, 0, 0, 0, 0, 2]);
    static readonly DECODE_BIT_LENGTHS: Int32Array = new Int32Array([2, 2, 4, 2, 1, 8, 4, 1, 4, 4, 2]);
    static readonly DYNAMIC_PARAM_COUNTS: Int32Array = new Int32Array([1, 0, 0, 0, 1, 0, 2, 1, 1, 1, 0]);
    static readonly EMPTY: string = '';
    static readonly field3644: string = '...';

    static configClient: Js5;
    static dynamicProvider: QuickChatDynamicProvider | null = null;
    static globalConfigClient: Js5;

    dynamicCommands: Int32Array | null = null;
    autoResponses: Int32Array | null = null;
    textSegments: string[] | null = null;
    dynamicCommandParams: (Int32Array | null)[] | null = null;

    static list(arg0: number): QuickChatPhraseType {
        const var1 = QuickChatPhraseType.recentUse.find(BigInt(arg0));
        if (var1 !== null) {
            return var1;
        }

        let var2: Uint8Array | null;
        if (arg0 >= 32768) {
            var2 = QuickChatPhraseType.globalConfigClient.getFile(arg0 & 0x7fff, 1);
        } else {
            var2 = QuickChatPhraseType.configClient.getFile(arg0, 1);
        }

        const var3 = new QuickChatPhraseType();
        if (var2 !== null) {
            var3.decode(new Packet(var2));
        }
        if (arg0 >= 32768) {
            var3.markGlobal();
        }
        QuickChatPhraseType.recentUse.put(BigInt(arg0), var3);
        return var3;
    }

    static init(arg0: Js5, arg1: QuickChatDynamicProvider | null, arg2: Js5): void {
        QuickChatPhraseType.configClient = arg2;
        QuickChatPhraseType.dynamicProvider = arg1;
        QuickChatPhraseType.globalConfigClient = arg0;
    }

    static formatDynamicValue(arg0: bigint, arg1: number, arg2: Int32Array | null): string {
        if (QuickChatPhraseType.dynamicProvider !== null) {
            const var4 = QuickChatPhraseType.dynamicProvider.formatDynamicValue(arg2, arg1, arg0);
            if (var4 !== null) {
                return var4;
            }
        }
        return arg1 == 5 ? JagString.toRawUsername(arg0)!.toScreenName().toString() : JagString.valueOf(arg0).toString();
    }

    getDynamicCommand(arg0: number): number {
        return this.dynamicCommands === null || arg0 < 0 || arg0 > this.dynamicCommands.length ? -1 : this.dynamicCommands[arg0];
    }

    getDynamicCommandCount(): number {
        return this.dynamicCommands === null ? 0 : this.dynamicCommands.length;
    }

    decodeInner(arg0: Packet, arg1: number): void {
        if (arg1 == 1) {
            this.textSegments = arg0.gjstr().split('<');
        } else if (arg1 == 2) {
            const var3 = arg0.g1();
            this.autoResponses = new Int32Array(var3);
            for (let var4 = 0; var4 < var3; var4++) {
                this.autoResponses[var4] = arg0.g2();
            }
        } else if (arg1 == 3) {
            const var5 = arg0.g1();
            this.dynamicCommandParams = new Array(var5);
            this.dynamicCommands = new Int32Array(var5);
            for (let var6 = 0; var6 < var5; var6++) {
                const var7 = arg0.g2();
                this.dynamicCommands[var6] = var7;
                this.dynamicCommandParams[var6] = new Int32Array(QuickChatPhraseType.DYNAMIC_PARAM_COUNTS[var7]);
                for (let var8 = 0; var8 < QuickChatPhraseType.DYNAMIC_PARAM_COUNTS[var7]; var8++) {
                    this.dynamicCommandParams[var6]![var8] = arg0.g2();
                }
            }
        }
    }

    decodeMessage(arg0: Packet): string {
        const text: string[] = [];
        if (this.dynamicCommands !== null) {
            for (let var3 = 0; var3 < this.dynamicCommands.length; var3++) {
                text.push(this.textSegments![var3]);
                text.push(QuickChatPhraseType.formatDynamicValue(arg0.method300(QuickChatPhraseType.DECODE_BIT_LENGTHS[this.dynamicCommands[var3]]), this.dynamicCommands[var3], this.dynamicCommandParams![var3]));
            }
        }
        text.push(this.textSegments![this.textSegments!.length - 1]);
        return text.join('');
    }

    getText(): string {
        if (this.textSegments === null) {
            return QuickChatPhraseType.EMPTY;
        }

        const text: string[] = [this.textSegments[0]];
        for (let var2 = 1; var2 < this.textSegments.length; var2++) {
            text.push(QuickChatPhraseType.field3644);
            text.push(this.textSegments[var2]);
        }
        return text.join('');
    }

    decode(arg0: Packet): void {
        while (true) {
            const var2 = arg0.g1();
            if (var2 === 0) {
                return;
            }
            this.decodeInner(arg0, var2);
        }
    }

    getDynamicCommandParam(arg0: number, arg1: number): number {
        if (this.dynamicCommands === null || arg1 < 0 || this.dynamicCommands.length < arg1) {
            return -1;
        } else if (this.dynamicCommandParams![arg1] === null || arg0 < 0 || arg0 > this.dynamicCommandParams![arg1]!.length) {
            return -1;
        } else {
            return this.dynamicCommandParams![arg1]![arg0];
        }
    }

    encodeMessage(arg0: Packet, arg1: Int32Array | number[]): void {
        if (this.dynamicCommands === null) {
            return;
        }

        for (let var3 = 0; var3 < this.dynamicCommands.length; var3++) {
            if (var3 >= arg1.length) {
                return;
            }
            const var4 = QuickChatPhraseType.ENCODE_BIT_LENGTHS[this.getDynamicCommand(var3)];
            if (var4 > 0) {
                arg0.method306(var4, arg1[var3]);
            }
        }
    }

    markGlobal(): void {
        if (this.autoResponses !== null) {
            for (let var1 = 0; var1 < this.autoResponses.length; var1++) {
                this.autoResponses[var1] |= 0x8000;
            }
        }
    }
}
