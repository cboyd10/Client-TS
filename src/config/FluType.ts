import Linkable2 from '#/datastruct/Linkable2.js';
import LruCache from '#/datastruct/LruCache.js';
import Packet from '#/io/Packet.js';
import type Js5 from '#/js5/Js5.js';

export default class FluType extends Linkable2 {
    static readonly recentUse: LruCache<FluType> = new LruCache(64);

    static configClient: Js5;

    colour: number = 0;
    texture: number = -1;
    chroma: number = 0;
    saturation: number = 0;
    lightness: number = 0;
    hue: number = 0;

    static list(arg0: number): FluType {
        const var1 = FluType.recentUse.find(BigInt(arg0));
        if (var1 !== null) {
            return var1;
        }

        const var2 = FluType.configClient.getFile(arg0, 1);
        const var3 = new FluType();
        if (var2 !== null) {
            var3.decode(arg0, new Packet(var2));
        }
        FluType.recentUse.put(BigInt(arg0), var3);
        return var3;
    }

    static resetCache(): void {
        FluType.recentUse.clear();
    }

    static init(arg0: Js5): void {
        FluType.configClient = arg0;
    }

    getHsl(arg0: number): void {
        const var2 = ((arg0 >> 16) & 0xff) / 256.0;
        const var4 = ((arg0 >> 8) & 0xff) / 256.0;
        const var6 = (arg0 & 0xff) / 256.0;
        let var8 = var2;
        if (var2 > var4) {
            var8 = var4;
        }
        let var10 = var2;
        if (var2 < var4) {
            var10 = var4;
        }
        if (var6 > var10) {
            var10 = var6;
        }
        if (var6 < var8) {
            var8 = var6;
        }
        let var12 = 0.0;
        let var14 = 0.0;
        const var16 = (var10 + var8) / 2.0;
        this.lightness = Math.trunc(var16 * 256.0);
        if (this.lightness < 0) {
            this.lightness = 0;
        } else if (this.lightness > 255) {
            this.lightness = 255;
        }
        if (var8 !== var10) {
            if (var16 < 0.5) {
                var12 = (var10 - var8) / (var8 + var10);
            }
            if (var2 === var10) {
                var14 = (var4 - var6) / (var10 - var8);
            } else if (var4 === var10) {
                var14 = (var6 - var2) / (var10 - var8) + 2.0;
            } else if (var6 === var10) {
                var14 = (var2 - var4) / (-var8 + var10) + 4.0;
            }
            if (var16 >= 0.5) {
                var12 = (var10 - var8) / (2.0 - var10 - var8);
            }
        }
        this.saturation = Math.trunc(var12 * 256.0);
        const var18 = var14 / 6.0;
        if (this.saturation < 0) {
            this.saturation = 0;
        } else if (this.saturation > 255) {
            this.saturation = 255;
        }
        if (var16 > 0.5) {
            this.chroma = Math.trunc(var12 * (1.0 - var16) * 512.0);
        } else {
            this.chroma = Math.trunc(var12 * var16 * 512.0);
        }
        if (this.chroma < 1) {
            this.chroma = 1;
        }
        this.hue = Math.trunc(var18 * this.chroma);
    }

    decode(arg0: number, arg1: Packet): void;
    decode(arg0: number, arg1: Packet, arg2: number): void;
    decode(arg0: number, arg1: Packet, arg2?: number): void {
        if (typeof arg2 === 'number') {
            if (arg0 == 1) {
                this.colour = arg1.g3();
                this.getHsl(this.colour);
            } else if (arg0 == 2) {
                this.texture = arg1.g2();
                if (this.texture == 65535) {
                    this.texture = -1;
                }
            } else if (arg0 == 3) {
                arg1.g2();
            }
            return;
        }

        while (true) {
            const var3 = arg1.g1();
            if (var3 === 0) {
                return;
            }
            this.decode(var3, arg1, arg0);
        }
    }
}
