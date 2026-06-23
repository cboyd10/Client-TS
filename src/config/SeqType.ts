import AnimFrameSet from '#/dash3d/AnimFrameSet.js';
import ModelLit from '#/dash3d/ModelLit.js';
import Linkable2 from '#/datastruct/Linkable2.js';
import LruCache from '#/datastruct/LruCache.js';

import Packet from '#/io/Packet.js';
import type Js5 from '#/js5/Js5.js';

export default class SeqType extends Linkable2 {
    static readonly recentUse: LruCache<SeqType> = new LruCache(64);
    static readonly framesetCache: LruCache<AnimFrameSet> = new LruCache(100);

    static configClient: Js5;
    static anims: Js5;
    static bases: Js5;

    preanim_move: number = -1;
    walkmerge: Int32Array | null = null;
    delay: Int32Array | null = null;
    field1993: boolean = false;
    priority: number = 5;
    replaceheldleft: number = -1;
    sound: Int32Array[] | null = null;
    iframes: Int32Array | null = null;
    reachforward: boolean = false;
    loops: number = -1;
    replaceheldright: number = -1;
    postanim_move: number = -1;
    duplicatebehaviour: number = 2;
    maxloops: number = 99;
    frames: Int32Array | null = null;

    static list(arg0: number): SeqType {
        const var1 = SeqType.recentUse.find(BigInt(arg0));
        if (var1 !== null) {
            return var1;
        }

        const var2 = SeqType.configClient.getFile(SeqType.getGroupId(arg0), SeqType.getFileId(arg0));
        const var3 = new SeqType();
        if (var2 !== null) {
            var3.decode(new Packet(var2));
        }
        var3.postDecode();
        SeqType.recentUse.put(BigInt(arg0), var3);
        return var3;
    }

    static resetCache(): void {
        SeqType.recentUse.clear();
        SeqType.framesetCache.clear();
    }

    static init(arg0: Js5, arg1: Js5, arg2: Js5): void {
        SeqType.anims = arg1;
        SeqType.configClient = arg0;
        SeqType.bases = arg2;
    }

    static loadFrameset(arg0: Js5, arg1: number, arg2: Js5): AnimFrameSet | null {
        let var3 = true;
        const var4 = arg2.getFileList(arg1)!;
        for (let var5 = 0; var5 < var4.length; var5++) {
            const var6 = arg2.peekFile(var4[var5], arg1);
            if (var6 === null) {
                var3 = false;
            } else {
                const var7 = (var6[1] & 0xff) | ((var6[0] & 0xff) << 8);
                const var8 = arg0.peekFile(0, var7);
                if (var8 === null) {
                    var3 = false;
                }
            }
        }
        if (!var3) {
            return null;
        }
        try {
            return new AnimFrameSet(arg2, arg0, arg1, false);
        } catch (var9) {
            return null;
        }
    }

    static get(arg0: number): AnimFrameSet | null {
        const var1 = SeqType.framesetCache.find(BigInt(arg0));
        if (var1 !== null) {
            return var1;
        }

        const var2 = SeqType.loadFrameset(SeqType.bases, arg0, SeqType.anims);
        if (var2 !== null) {
            SeqType.framesetCache.put(BigInt(arg0), var2);
        }
        return var2;
    }

    static getGroupId(arg0: number): number {
        return arg0 & 0x7f;
    }

    static getFileId(arg0: number): number {
        return arg0 >>> 7;
    }

    animateModel(arg0: ModelLit, arg1: number): ModelLit {
        const var3 = this.frames![arg1];
        const var4 = SeqType.get(var3 >> 16);
        const var5 = var3 & 0xffff;
        if (var4 === null) {
            return arg0.copyForAnim2(true, true);
        } else {
            const var6 = arg0.copyForAnim2(!var4.getAnimateTransparencies(var5), !this.field1993);
            var6.animate(var4, var5, this.field1993);
            return var6;
        }
    }

    decode(dat: Packet): void;
    decode(dat: Packet, code: number): void;
    decode(dat: Packet, code?: number): void {
        if (typeof code === 'number') {
            if (code === 1) {
                const var3 = dat.g2();
                this.delay = new Int32Array(var3);
                for (let i = 0; i < var3; i++) {
                    this.delay[i] = dat.g2();
                }

                this.frames = new Int32Array(var3);
                for (let i = 0; i < var3; i++) {
                    this.frames[i] = dat.g2();
                }
                for (let i = 0; i < var3; i++) {
                    this.frames[i] += dat.g2() << 16;
                }
            } else if (code === 2) {
                this.loops = dat.g2();
            } else if (code === 3) {
                const count = dat.g1();
                this.walkmerge = new Int32Array(count + 1);
                for (let i = 0; i < count; i++) {
                    this.walkmerge[i] = dat.g1();
                }
                this.walkmerge[count] = 9999999;
            } else if (code === 4) {
                this.reachforward = true;
            } else if (code === 5) {
                this.priority = dat.g1();
            } else if (code === 6) {
                this.replaceheldleft = dat.g2();
            } else if (code === 7) {
                this.replaceheldright = dat.g2();
            } else if (code === 8) {
                this.maxloops = dat.g1();
            } else if (code === 9) {
                this.preanim_move = dat.g1();
            } else if (code === 10) {
                this.postanim_move = dat.g1();
            } else if (code === 11) {
                this.duplicatebehaviour = dat.g1();
            } else if (code === 12) {
                const count = dat.g1();
                this.iframes = new Int32Array(count);
                for (let i = 0; i < count; i++) {
                    this.iframes[i] = dat.g2();
                }
                for (let i = 0; i < count; i++) {
                    this.iframes[i] += dat.g2() << 16;
                }
            } else if (code === 13) {
                const count = dat.g2();
                this.sound = new Array(count);
                for (let i = 0; i < count; i++) {
                    const len = dat.g1();
                    if (len > 0) {
                        const sound = new Int32Array(len);
                        sound[0] = dat.g3();
                        for (let j = 1; j < len; j++) {
                            sound[j] = dat.g2();
                        }
                        this.sound[i] = sound;
                    }
                }
            } else if (code === 14) {
                this.field1993 = true;
            }
            return;
        }

        while (true) {
            const code = dat.g1();
            if (code === 0) {
                return;
            }
            this.decode(dat, code);
        }
    }

    animateModel90(arg0: number, arg1: ModelLit, arg2: number): ModelLit {
        const var4 = this.frames![arg2];
        const var5 = SeqType.get(var4 >> 16);
        const var6 = var4 & 0xffff;
        if (var5 === null) {
            return arg1.copyForAnim(true, true);
        }
        const var7 = arg0 & 0x3;
        const var8 = arg1.copyForAnim(!var5.getAnimateTransparencies(var6), !this.field1993);
        if (var7 === 1) {
            var8.rotate270();
        } else if (var7 === 2) {
            var8.rotate180();
        } else if (var7 === 3) {
            var8.rotate90();
        }
        var8.animate(var5, var6, this.field1993);
        if (var7 === 1) {
            var8.rotate90();
        } else if (var7 === 2) {
            var8.rotate180();
        } else if (var7 === 3) {
            var8.rotate270();
        }
        return var8;
    }

    animateModel2(arg0: number, arg1: ModelLit): ModelLit {
        const var3 = this.frames![arg0];
        const var4 = SeqType.get(var3 >> 16);
        const var5 = var3 & 0xffff;
        if (var4 === null) {
            return arg1.copyForAnim(true, true);
        } else {
            const var6 = arg1.copyForAnim(!var4.getAnimateTransparencies(var5), !this.field1993);
            var6.animate(var4, var5, this.field1993);
            return var6;
        }
    }

    splitAnimateModel(arg0: number, arg1: SeqType, arg2: number, arg3: ModelLit): ModelLit {
        const var5 = this.frames![arg0];
        const var6 = SeqType.get(var5 >> 16);
        const var7 = var5 & 0xffff;
        if (var6 === null) {
            return arg1.animateModel2(arg2, arg3);
        }
        const var8 = arg1.frames![arg2];
        const var9 = SeqType.get(var8 >> 16);
        const var10 = var8 & 0xffff;
        if (var9 === null) {
            const var11 = arg3.copyForAnim(!var6.getAnimateTransparencies(var7), !this.field1993);
            var11.animate(var6, var7, this.field1993);
            return var11;
        } else {
            const var12 = arg3.copyForAnim(Boolean(Number(!var6.getAnimateTransparencies(var7)) & Number(!var9.getAnimateTransparencies(var10))), Boolean(Number(!arg1.field1993) & Number(!this.field1993)));
            var12.maskAnimate(var6, var7, var9, var10, this.walkmerge, Boolean(Number(arg1.field1993) | Number(this.field1993)));
            return var12;
        }
    }

    postDecode(): void {
        if (this.preanim_move === -1) {
            if (this.walkmerge === null) {
                this.preanim_move = 0;
            } else {
                this.preanim_move = 2;
            }
        }

        if (this.postanim_move !== -1) {
            return;
        }
        if (this.walkmerge === null) {
            this.postanim_move = 0;
        } else {
            this.postanim_move = 2;
        }
    }

    animateModelWithExtra(arg0: number, arg1: ModelLit): ModelLit {
        const var3 = this.frames![arg0];
        const var4 = SeqType.get(var3 >> 16);
        const var5 = var3 & 0xffff;
        if (var4 === null) {
            return arg1.copyForAnim(true, true);
        }
        let var6: AnimFrameSet | null = null;
        let var7 = 0;
        if (this.iframes !== null && this.iframes.length > arg0) {
            const var8 = this.iframes[arg0];
            var6 = SeqType.get(var8 >> 16);
            var7 = var8 & 0xffff;
        }
        if (var6 === null || var7 === 65535) {
            const var9 = arg1.copyForAnim(!var4.getAnimateTransparencies(var5), !this.field1993);
            var9.animate(var4, var5, this.field1993);
            return var9;
        } else {
            const var10 = arg1.copyForAnim(Boolean(Number(!var4.getAnimateTransparencies(var5)) & Number(!var6.getAnimateTransparencies(var7))), !this.field1993);
            var10.animate(var4, var5, this.field1993);
            var10.animate(var6, var7, this.field1993);
            return var10;
        }
    }
}
