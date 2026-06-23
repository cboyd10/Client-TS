import LruCache from '#/datastruct/LruCache.js';
import GlTexture from '#/dash3d/GlTexture.js';
import type TextureProvider from '#/dash3d/TextureProvider.js';
import Packet from '#/io/Packet.js';
import type Js5 from '#/js5/Js5.js';

export default class TextureManager implements TextureProvider {
    readonly field1222: Int8Array;
    readonly enabled: boolean[];
    readonly field1224: Int8Array;
    readonly textures: Js5;
    poolSize: number = 50;
    readonly averageRgb: Int16Array;
    readonly textureCache: LruCache<GlTexture>;
    readonly field1233: Int8Array;
    readonly sprites: Js5;
    readonly field1237: boolean[];
    readonly field1241: boolean[];
    readonly hasTexture: boolean[];
    lowMem: boolean = false;
    readonly opaque: boolean[];
    readonly field1250: Int8Array;

    constructor(arg0: Js5, arg1: Js5, arg2: Js5, _arg3: number, arg4: boolean) {
        this.lowMem = arg4;
        this.textures = arg0;
        this.sprites = arg2;
        this.poolSize = 20;
        this.textureCache = new LruCache(this.poolSize);

        const var6 = new Packet(arg1.getFile(0, 0)!);
        const var7 = var6.g2();
        this.field1222 = new Int8Array(var7);
        this.enabled = new Array(var7).fill(false);
        this.opaque = new Array(var7).fill(false);
        this.field1224 = new Int8Array(var7);
        this.field1250 = new Int8Array(var7);
        this.field1237 = new Array(var7).fill(false);
        this.hasTexture = new Array(var7).fill(false);
        this.field1241 = new Array(var7).fill(false);
        this.field1233 = new Int8Array(var7);
        this.averageRgb = new Int16Array(var7);

        for (let var8 = 0; var8 < var7; var8++) {
            this.hasTexture[var8] = var6.g1() === 1;
        }
        for (let var9 = 0; var9 < var7; var9++) {
            if (this.hasTexture[var9]) {
                this.enabled[var9] = var6.g1() === 1;
            }
        }
        for (let var10 = 0; var10 < var7; var10++) {
            if (this.hasTexture[var10]) {
                this.opaque[var10] = var6.g1() === 1;
            }
        }
        for (let var11 = 0; var11 < var7; var11++) {
            if (this.hasTexture[var11]) {
                this.field1237[var11] = var6.g1() === 1;
            }
        }
        for (let var12 = 0; var12 < var7; var12++) {
            if (this.hasTexture[var12]) {
                this.field1241[var12] = var6.g1() === 1;
            }
        }
        for (let var13 = 0; var13 < var7; var13++) {
            if (this.hasTexture[var13]) {
                this.field1222[var13] = var6.g1b();
            }
        }
        for (let var14 = 0; var14 < var7; var14++) {
            if (this.hasTexture[var14]) {
                this.field1250[var14] = var6.g1b();
            }
        }
        for (let var15 = 0; var15 < var7; var15++) {
            if (this.hasTexture[var15]) {
                this.field1224[var15] = var6.g1b();
            }
        }
        for (let var16 = 0; var16 < var7; var16++) {
            if (this.hasTexture[var16]) {
                this.field1233[var16] = var6.g1b();
            }
        }
        for (let var17 = 0; var17 < var7; var17++) {
            if (this.hasTexture[var17]) {
                this.averageRgb[var17] = var6.g2();
            }
        }
    }

    isOpaque(arg0: number): boolean {
        return this.opaque[arg0];
    }

    isTextureEnabled(arg0: number): boolean {
        return this.enabled[arg0];
    }

    isLoaded(arg0: number): boolean {
        const var2 = this.loadTexture(arg0);
        return var2 === null ? false : var2.isReady(this, this.sprites);
    }

    getAverageRgb(arg0: number): number {
        return this.averageRgb[arg0] & 0xffff;
    }

    loadTexture(arg0: number): GlTexture | null {
        const var2 = this.textureCache.find(BigInt(arg0));
        if (var2 !== null) {
            return var2;
        }

        const var3 = this.textures.getFile(0, arg0);
        if (var3 === null) {
            return null;
        } else {
            const var4 = new Packet(var3);
            const var5 = new GlTexture(var4);
            this.textureCache.put(BigInt(arg0), var5);
            return var5;
        }
    }

    isLowMem(arg0: number): boolean {
        return this.lowMem || this.field1237[arg0];
    }

    reset(): void {
        this.textureCache.clear();
    }

    getTexels(arg0: number): Int32Array | null;
    getTexels(arg0: number, arg1: number): Int32Array | null;
    getTexels(arg0: number, arg1?: number): Int32Array | null {
        if (typeof arg1 === 'undefined') {
            const var2 = this.loadTexture(arg0);
            return var2 === null ? null : var2.getTextures(this.sprites, this.lowMem || this.field1237[arg0], this);
        }

        const var3 = this.loadTexture(arg1);
        if (var3 === null) {
            return null;
        }
        var3.needsAnimation = true;
        return var3.getTexels(this, arg0, this.sprites, this.lowMem || this.field1237[arg1]);
    }

    runAnims(arg0: number): void {
        for (let var2 = this.textureCache.search() as GlTexture | null; var2 !== null; var2 = this.textureCache.findnext() as GlTexture | null) {
            if (var2.needsAnimation) {
                var2.animate(arg0);
                var2.needsAnimation = false;
            }
        }
    }
}
