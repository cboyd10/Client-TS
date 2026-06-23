import Linkable2 from '#/datastruct/Linkable2.js';
import Texture from '#/dash3d/Texture.js';
import type TextureProvider from '#/dash3d/TextureProvider.js';
import Packet from '#/io/Packet.js';
import Js5 from '#/js5/Js5.js';

export default class GlTexture extends Linkable2 {
    static animationBuffer: Int32Array | null = null;

    needsAnimation: boolean = false;
    readonly texture: Texture;
    readonly smooth: boolean;
    readonly columnMajor: boolean;
    readonly scrollXSpeed: number;
    readonly scrollYSpeed: number;
    brightness: number = 0;
    texels: Int32Array | null = null;

    constructor(arg0: Packet) {
        super();
        this.texture = new Texture(arg0);
        this.smooth = arg0.g1() === 1;
        this.columnMajor = arg0.g1() === 1;
        arg0.g1();
        arg0.g1();
        const var2 = arg0.g1() & 0x3;
        this.scrollXSpeed = arg0.g1b();
        this.scrollYSpeed = arg0.g1b();
        arg0.g1();
        arg0.g1();
    }

    getTextures(arg0: Js5, arg1: boolean, arg2: TextureProvider): Int32Array | null {
        if (this.texture.isReady(arg2, arg0)) {
            const var4 = arg1 ? 64 : 128;
            return this.texture.render(1.0, var4, this.columnMajor, arg0, arg2, var4, false);
        } else {
            return null;
        }
    }

    animate(arg0: number): void {
        if (this.texels === null || (this.scrollYSpeed === 0 && this.scrollXSpeed === 0)) {
            return;
        }
        if (GlTexture.animationBuffer === null || GlTexture.animationBuffer.length < this.texels.length) {
            GlTexture.animationBuffer = new Int32Array(this.texels.length);
        }
        const var2 = this.texels.length;
        const var3 = this.scrollXSpeed * arg0;
        const var4 = var2 - 1;
        const var5 = this.texels.length === 4096 ? 64 : 128;
        const var6 = var5 * arg0 * this.scrollYSpeed;
        const var7 = var5 - 1;
        for (let var8 = 0; var8 < var2; var8 += var5) {
            const var9 = (var8 + var6) & var4;
            for (let var10 = 0; var10 < var5; var10++) {
                const var11 = var8 + var10;
                const var12 = var9 + (var7 & (var3 + var10));
                GlTexture.animationBuffer[var11] = this.texels[var12];
            }
        }
        const var13 = this.texels;
        this.texels = GlTexture.animationBuffer;
        GlTexture.animationBuffer = var13;
    }

    isReady(arg0: TextureProvider, arg1: Js5): boolean {
        return this.texture.isReady(arg0, arg1);
    }

    finalize(): void {}

    getTexels(arg0: TextureProvider, arg1: number, arg2: Js5, arg3: boolean): Int32Array | null {
        if (this.texels === null || arg1 !== this.brightness) {
            if (!this.texture.isReady(arg0, arg2)) {
                return null;
            }
            const var5 = arg3 ? 64 : 128;
            this.texels = this.texture.render(arg1, var5, this.columnMajor, arg2, arg0, var5, true);
            this.brightness = arg1;
            if (this.smooth) {
                const var6 = new Int32Array(var5);
                const var7 = new Int32Array(var5 * var5);
                const var8 = new Int32Array(var5);
                const var9 = new Int32Array(var5);
                let var10 = var5;
                let var11 = var5;
                const var12 = var5 - 1;
                const var13 = var5 - 1;
                const var14 = var5 * var5;
                for (let var15 = 2; var15 >= 0; var15--) {
                    for (let var16 = var13; var16 >= 0; var16--) {
                        var10--;
                        const var17 = this.texels[var10];
                        var6[var16] += (var17 >> 16) & 0xff;
                        var9[var16] += (var17 >> 8) & 0xff;
                        var8[var16] += var17 & 0xff;
                    }
                    if (var10 === 0) {
                        var10 = var14;
                    }
                }
                let var18 = var14;
                for (let var19 = var12; var19 >= 0; var19--) {
                    let var20 = 1;
                    let var21 = 0;
                    let var22 = 0;
                    let var23 = 0;
                    let var24 = 1;
                    for (let var25 = 2; var25 >= 0; var25--) {
                        var24--;
                        var23 += var6[var24];
                        var22 += var8[var24];
                        var21 += var9[var24];
                        if (var24 === 0) {
                            var24 = var5;
                        }
                    }
                    for (let var26 = var13; var26 >= 0; var26--) {
                        var20--;
                        var24--;
                        const var27 = (var23 / 9) | 0;
                        const var28 = (var22 / 9) | 0;
                        const var29 = (var21 / 9) | 0;
                        var18--;
                        var7[var18] = var28 | (var29 << 8) | (var27 << 16);
                        var21 += var9[var24] - var9[var20];
                        var23 += var6[var24] - var6[var20];
                        var22 += var8[var24] - var8[var20];
                        if (var24 === 0) {
                            var24 = var5;
                        }
                        if (var20 === 0) {
                            var20 = var5;
                        }
                    }
                    for (let var30 = var13; var30 >= 0; var30--) {
                        var11--;
                        const var31 = this.texels[var11];
                        var10--;
                        const var32 = this.texels[var10];
                        var6[var30] += ((var32 >> 16) & 0xff) - ((var31 & 0xff6387) >> 16);
                        var9[var30] += ((var32 >> 8) & 0xff) - ((var31 >> 8) & 0xff);
                        var8[var30] += (var32 & 0xff) - (var31 & 0xff);
                    }
                    if (var11 === 0) {
                        var11 = var14;
                    }
                    if (var10 === 0) {
                        var10 = var14;
                    }
                }
                this.texels = var7;
            }
        }
        return this.texels;
    }
}
