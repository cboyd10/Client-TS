import LruCache from '#/datastruct/LruCache.js';
import Linkable2 from '#/datastruct/Linkable2.js';
import HashTable from '#/datastruct/HashTable.js';
import IntNode from '#/datastruct/IntNode.js';
import Linkable from '#/datastruct/Linkable.js';
import StringNode from '#/datastruct/StringNode.js';

import SeqType from '#/config/SeqType.js';
import Text from '#/constants/Text.js';
import type ModelLit from '#/dash3d/ModelLit.js';
import ModelUnlit from '#/dash3d/ModelUnlit.js';
import ModelSourceCache from '#/dash3d/ModelSourceCache.js';

import Packet from '#/io/Packet.js';
import type Js5 from '#/js5/Js5.js';

import IntMath from '#/util/IntMath.js';
import VarCache from '#/var/VarCache.js';

export default class NpcType extends Linkable2 {
    static readonly recentUse: LruCache<NpcType> = new LruCache(64);
    static readonly modelCache: ModelSourceCache = new ModelSourceCache(50);
    static readonly headModelCache: ModelSourceCache = new ModelSourceCache(5);
    static configClient: Js5;
    static models: Js5;
    static clientpalette: Int16Array = new Int16Array(256);
    recol_d_palette: Int8Array | null = null;

    walkanim_l: number = -1;
    turnspeed: number = 32;
    resizeh: number = 128;
    static readonly NULL: string = 'null';
    name: string = NpcType.NULL;
    readonly op: (string | null)[] = new Array(5).fill(null);
    walkanim_b: number = -1;
    params: HashTable<Linkable> | null = null;
    retex_d: Int16Array | null = null;
    resizev: number = 128;
    size: number = 1;
    field2350: number = 0;
    walkanim_r: number = -1;
    multivarbit: number = -1;
    walksmoothing: boolean = true;
    retex_s: Int16Array | null = null;
    minimap: boolean = true;
    headicon: number = -1;
    field2329: number = 0;
    contrast: number = 0;
    turnleftanim: number = -1;
    vislevel: number = -1;
    readyanim: number = -1;
    walkanim: number = -1;
    ambient: number = 0;
    active: boolean = true;
    turnrightanim: number = -1;
    alwaysontop: boolean = false;
    multivarp: number = -1;
    id: number = 0;
    multinpc: Int32Array | null = null;
    model: Int32Array | null = null;
    head: Int32Array | null = null;
    recol_d: Int16Array | null = null;
    recol_s: Int16Array | null = null;

    static list(arg0: number): NpcType {
        const var1 = NpcType.recentUse.find(BigInt(arg0));
        if (var1 !== null) {
            return var1;
        }

        const var2 = NpcType.configClient.getFile(NpcType.getGroupId(arg0), NpcType.getFileId(arg0));
        const var3 = new NpcType();
        var3.id = arg0;
        if (var2 !== null) {
            var3.decode(new Packet(var2));
        }
        var3.postDecode();
        NpcType.recentUse.put(BigInt(arg0), var3);
        return var3;
    }

    static resetCache(): void {
        NpcType.recentUse.clear();
        NpcType.modelCache.clear();
        NpcType.headModelCache.clear();
    }

    static init(arg0: Js5, arg1: Js5): void {
        NpcType.configClient = arg0;
        NpcType.models = arg1;
    }

    static resetModelCache(): void {
        NpcType.modelCache.clear();
    }

    static resetHeadModelCache(): void {
        NpcType.headModelCache.clear();
    }

    static getFileId(arg0: number): number {
        return arg0 >>> 7;
    }

    static getGroupId(arg0: number): number {
        return arg0 & 0x7f;
    }

    isMultiNpcVisible(): boolean {
        if (this.multinpc === null) {
            return true;
        }
        let var1 = -1;
        if (this.multivarbit !== -1) {
            var1 = VarCache.getVarbit(this.multivarbit);
        } else if (this.multivarp !== -1) {
            var1 = VarCache.var[this.multivarp];
        }
        if (var1 < 0 || var1 >= this.multinpc.length - 1 || this.multinpc[var1] === -1) {
            const var2 = this.multinpc[this.multinpc.length - 1];
            return var2 !== -1;
        } else {
            return true;
        }
    }

    decode(arg0: Packet): void;
    decode(arg0: number, arg1: Packet): void;
    decode(arg0: Packet | number, arg1?: Packet): void {
        if (typeof arg0 === 'number') {
            if (arg0 === 1) {
                const var3 = arg1!.g1();
                this.model = new Int32Array(var3);
                for (let var4 = 0; var4 < var3; var4++) {
                    this.model[var4] = arg1!.g2();
                }
            } else if (arg0 === 2) {
                this.name = arg1!.gjstr();
            } else if (arg0 === 12) {
                this.size = arg1!.g1();
            } else if (arg0 === 13) {
                this.readyanim = arg1!.g2();
            } else if (arg0 === 14) {
                this.walkanim = arg1!.g2();
            } else if (arg0 === 15) {
                this.turnleftanim = arg1!.g2();
            } else if (arg0 === 16) {
                this.turnrightanim = arg1!.g2();
            } else if (arg0 === 17) {
                this.walkanim = arg1!.g2();
                this.walkanim_b = arg1!.g2();
                this.walkanim_r = arg1!.g2();
                this.walkanim_l = arg1!.g2();
            } else if (arg0 >= 30 && arg0 < 35) {
                this.op[arg0 - 30] = arg1!.gjstr();
                if (this.op[arg0 - 30]!.toLowerCase() === Text.hidden.toLowerCase()) {
                    this.op[arg0 - 30] = null;
                }
            } else if (arg0 === 40) {
                const var20 = arg1!.g1();
                this.recol_d = new Int16Array(var20);
                this.recol_s = new Int16Array(var20);
                for (let var21 = 0; var21 < var20; var21++) {
                    this.recol_s[var21] = arg1!.g2();
                    this.recol_d[var21] = arg1!.g2();
                }
            } else if (arg0 === 41) {
                const var18 = arg1!.g1();
                this.retex_d = new Int16Array(var18);
                this.retex_s = new Int16Array(var18);
                for (let var19 = 0; var19 < var18; var19++) {
                    this.retex_s[var19] = arg1!.g2();
                    this.retex_d[var19] = arg1!.g2();
                }
            } else if (arg0 === 42) {
                const var5 = arg1!.g1();
                this.recol_d_palette = new Int8Array(var5);
                for (let var6 = 0; var6 < var5; var6++) {
                    this.recol_d_palette[var6] = arg1!.g1b();
                }
            } else if (arg0 === 60) {
                const var16 = arg1!.g1();
                this.head = new Int32Array(var16);
                for (let var17 = 0; var17 < var16; var17++) {
                    this.head[var17] = arg1!.g2();
                }
            } else if (arg0 === 93) {
                this.minimap = false;
            } else if (arg0 === 95) {
                this.vislevel = arg1!.g2();
            } else if (arg0 === 97) {
                this.resizeh = arg1!.g2();
            } else if (arg0 === 98) {
                this.resizev = arg1!.g2();
            } else if (arg0 === 99) {
                this.alwaysontop = true;
            } else if (arg0 === 100) {
                this.ambient = arg1!.g1b();
            } else if (arg0 === 101) {
                this.contrast = arg1!.g1b() * 5;
            } else if (arg0 === 102) {
                this.headicon = arg1!.g2();
            } else if (arg0 === 103) {
                this.turnspeed = arg1!.g2();
            } else if (arg0 === 106 || arg0 === 118) {
                let var13 = -1;
                this.multivarbit = arg1!.g2();
                if (this.multivarbit === 65535) {
                    this.multivarbit = -1;
                }
                this.multivarp = arg1!.g2();
                if (this.multivarp === 65535) {
                    this.multivarp = -1;
                }
                if (arg0 === 118) {
                    var13 = arg1!.g2();
                    if (var13 === 65535) {
                        var13 = -1;
                    }
                }
                const var14 = arg1!.g1();
                this.multinpc = new Int32Array(var14 + 2);
                for (let var15 = 0; var15 <= var14; var15++) {
                    this.multinpc[var15] = arg1!.g2();
                    if (this.multinpc[var15] === 65535) {
                        this.multinpc[var15] = -1;
                    }
                }
                this.multinpc[var14 + 1] = var13;
            } else if (arg0 === 107) {
                this.active = false;
            } else if (arg0 === 109) {
                this.walksmoothing = false;
            } else if (arg0 === 111) {
                // spotshadow
            } else if (arg0 === 113) {
                // spotshadowcolour
                arg1!.g2();
                arg1!.g2();
            } else if (arg0 === 114) {
                // spotshadowtrans
                arg1!.g1b();
                arg1!.g1b();
            } else if (arg0 === 115) {
                this.field2350 = arg1!.g1() * 4;
                this.field2329 = arg1!.g1() * 4;
            } else if (arg0 === 119) {
                // walkflags
                arg1!.g1b();
            } else if (arg0 === 249) {
                const var7 = arg1!.g1();
                if (this.params === null) {
                    const var8 = IntMath.bitceil(var7);
                    this.params = new HashTable(var8);
                }
                for (let var9 = 0; var9 < var7; var9++) {
                    const var10 = arg1!.g1() === 1;
                    const var11 = arg1!.g3();
                    let var12: Linkable;
                    if (var10) {
                        var12 = new StringNode(arg1!.gjstr());
                    } else {
                        var12 = new IntNode(arg1!.g4());
                    }
                    this.params.put(BigInt(var11), var12);
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

    getParamInt(arg0: number, arg1: number): number {
        if (this.params === null) {
            return arg0;
        } else {
            const var3 = this.params.find(BigInt(arg1)) as IntNode | null;
            return var3 === null ? arg0 : var3.value;
        }
    }

    postDecode(): void {}

    getParamString(arg0: number, arg1: string | null): string | null {
        if (this.params === null) {
            return arg1;
        } else {
            const var3 = this.params.find(BigInt(arg0)) as StringNode | null;
            return var3 === null ? arg1 : (var3.field4046 as string);
        }
    }

    getMultiNpc(): NpcType | null {
        let var1 = -1;
        if (this.multivarbit !== -1) {
            var1 = VarCache.getVarbit(this.multivarbit);
        } else if (this.multivarp !== -1) {
            var1 = VarCache.var[this.multivarp];
        }

        if (var1 < 0 || this.multinpc!.length - 1 <= var1 || this.multinpc![var1] === -1) {
            const var2 = this.multinpc![this.multinpc!.length - 1];
            return var2 === -1 ? null : NpcType.list(var2);
        } else {
            return NpcType.list(this.multinpc![var1]);
        }
    }

    getHeadModelLit(arg0: number, arg1: SeqType | null): ModelLit | null {
        if (this.multinpc !== null) {
            const var3 = this.getMultiNpc();
            return var3 === null ? null : var3.getHeadModelLit(arg0, arg1);
        } else if (this.head === null) {
            return null;
        } else {
            let var4 = NpcType.headModelCache.find(BigInt(this.id)) as ModelLit | null;
            if (var4 === null) {
                let var5 = false;
                for (let var6 = 0; var6 < this.head.length; var6++) {
                    if (!NpcType.models.requestDownload(this.head[var6], 0)) {
                        var5 = true;
                    }
                }
                if (var5) {
                    return null;
                }

                const var7: ModelUnlit[] = new Array(this.head.length);
                for (let var8: number = 0; var8 < this.head.length; var8++) {
                    var7[var8] = ModelUnlit.load(NpcType.models, this.head[var8])!;
                }

                let var9: ModelUnlit;
                if (var7.length === 1) {
                    var9 = var7[0];
                } else {
                    var9 = new ModelUnlit(var7, var7.length);
                }

                if (this.recol_s !== null) {
                    for (let var10: number = 0; var10 < this.recol_s.length; var10++) {
                        if (this.recol_d_palette === null || this.recol_d_palette.length <= var10) {
                            var9.recolour(this.recol_s[var10], this.recol_d![var10]);
                        } else {
                            var9.recolour(this.recol_s[var10], NpcType.clientpalette[this.recol_d_palette[var10] & 0xff]);
                        }
                    }
                }

                if (this.retex_s !== null) {
                    for (let var11: number = 0; var11 < this.retex_s.length; var11++) {
                        var9.retexture(this.retex_s[var11], this.retex_d![var11]);
                    }
                }

                var4 = var9.light(64, 768, -50, -10, -50);
                NpcType.headModelCache.put(BigInt(this.id), var4);
            }
            if (arg1 !== null) {
                var4 = arg1.animateModelWithExtra(arg0, var4);
            }
            return var4;
        }
    }

    getTempModel(arg0: SeqType | null, arg1: number, arg2: number, arg3: SeqType | null): ModelLit | null {
        if (this.multinpc !== null) {
            const var5 = this.getMultiNpc();
            return var5 === null ? null : var5.getTempModel(arg0, arg1, arg2, arg3);
        }

        let var6 = NpcType.modelCache.find(BigInt(this.id)) as ModelLit | null;

        if (var6 === null) {
            let var7 = false;
            for (let var8 = 0; var8 < this.model!.length; var8++) {
                if (!NpcType.models.requestDownload(this.model![var8], 0)) {
                    var7 = true;
                }
            }
            if (var7) {
                return null;
            }

            const var9: ModelUnlit[] = new Array(this.model!.length);
            for (let var10: number = 0; var10 < this.model!.length; var10++) {
                var9[var10] = ModelUnlit.load(NpcType.models, this.model![var10])!;
            }

            let var11: ModelUnlit;
            if (var9.length === 1) {
                var11 = var9[0];
            } else {
                var11 = new ModelUnlit(var9, var9.length);
            }

            if (this.recol_s !== null) {
                for (let var12: number = 0; var12 < this.recol_s.length; var12++) {
                    if (this.recol_d_palette === null || var12 >= this.recol_d_palette.length) {
                        var11.recolour(this.recol_s[var12], this.recol_d![var12]);
                    } else {
                        var11.recolour(this.recol_s[var12], NpcType.clientpalette[this.recol_d_palette[var12] & 0xff]);
                    }
                }
            }

            if (this.retex_s !== null) {
                for (let var13: number = 0; var13 < this.retex_s.length; var13++) {
                    var11.retexture(this.retex_s[var13], this.retex_d![var13]);
                }
            }

            var6 = var11.light(this.ambient + 64, 850 - -this.contrast, -30, -50, -30);
            NpcType.modelCache.put(BigInt(this.id), var6);
        }

        let var14: ModelLit;
        if (arg3 !== null && arg0 !== null) {
            var14 = arg3.splitAnimateModel(arg2, arg0, arg1, var6);
        } else if (arg3 !== null) {
            var14 = arg3.animateModel2(arg2, var6);
        } else if (arg0 === null) {
            var14 = var6.copyForAnim(true, true);
        } else {
            var14 = arg0.animateModel2(arg1, var6);
        }

        if (this.resizeh !== 128 || this.resizev !== 128) {
            var14.resize(this.resizeh, this.resizev, this.resizeh);
        }

        return var14;
    }
}
