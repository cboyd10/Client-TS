import Linkable2 from '#/datastruct/Linkable2.js';
import LruCache from '#/datastruct/LruCache.js';
import Packet from '#/io/Packet.js';
import type Js5 from '#/js5/Js5.js';

export default class FloType extends Linkable2 {
    static readonly recentUse: LruCache<FloType> = new LruCache(64);

    static configClient: Js5;
    static numDefinitions: number = 0;
    static defaultWater: number = 0;

    waterfogcolour: number = 1190717;
    mapcolour: number = -1;
    waterfogscale: number = 16;
    texture: number = -1;
    occlude: boolean = true;
    colour: number = 0;

    static list(arg0: number): FloType {
        const var1 = FloType.recentUse.find(BigInt(arg0));
        if (var1 !== null) {
            return var1;
        }

        const var2 = FloType.configClient.getFile(arg0, 4);
        const var3 = new FloType();
        if (var2 !== null) {
            var3.decode(new Packet(var2), arg0);
        }
        FloType.recentUse.put(BigInt(arg0), var3);
        return var3;
    }

    static resetCache(): void {
        FloType.recentUse.clear();
    }

    static init(arg0: Js5): void {
        FloType.configClient = arg0;
        FloType.numDefinitions = FloType.configClient.getFileIdLimit(4);
    }

    static getHsl(arg0: number): number {
        return arg0 == 16711935 ? -1 : FloType.getColour(arg0);
    }

    static getColour(arg0: number): number {
        const var1 = ((arg0 >> 8) & 0xff) / 256.0;
        const var3 = ((arg0 >> 16) & 0xff) / 256.0;
        const var5 = (arg0 & 0xff) / 256.0;
        let var7 = var3;
        if (var3 < var1) {
            var7 = var1;
        }
        let var9 = 0.0;
        let var11 = var3;
        if (var1 < var3) {
            var11 = var1;
        }
        if (var7 < var5) {
            var7 = var5;
        }
        if (var11 > var5) {
            var11 = var5;
        }
        let var13 = 0.0;
        const var15 = (var11 + var7) / 2.0;
        if (var11 !== var7) {
            if (var15 < 0.5) {
                var9 = (var7 - var11) / (var7 + var11);
            }
            if (var3 === var7) {
                var13 = (var1 - var5) / (var7 - var11);
            } else if (var7 === var1) {
                var13 = (var5 - var3) / (var7 - var11) + 2.0;
            } else if (var5 === var7) {
                var13 = (var3 - var1) / (-var11 + var7) + 4.0;
            }
            if (var15 >= 0.5) {
                var9 = (var7 - var11) / (2.0 - var11 - var7);
            }
        }
        const var17 = var13 / 6.0;
        let var19 = Math.trunc(var9 * 256.0);
        const var20 = Math.trunc(var17 * 256.0);
        if (var19 < 0) {
            var19 = 0;
        } else if (var19 > 255) {
            var19 = 255;
        }
        let var21 = Math.trunc(var15 * 256.0);
        if (var21 < 0) {
            var21 = 0;
        } else if (var21 > 255) {
            var21 = 255;
        }
        if (var21 > 243) {
            var19 >>= 4;
        } else if (var21 > 217) {
            var19 >>= 3;
        } else if (var21 > 192) {
            var19 >>= 2;
        } else if (var21 > 179) {
            var19 >>= 1;
        }
        return ((var19 >> 5) << 7) + ((var20 >> 2) << 10) + (var21 >> 1);
    }

    decode(arg0: Packet, arg1: number): void;
    decode(arg0: number, arg1: number, arg2: Packet): void;
    decode(arg0: Packet | number, arg1: Packet | number, arg2?: Packet): void {
        if (typeof arg0 === 'number') {
            if (arg1 == 1) {
                this.colour = FloType.getHsl(arg2!.g3());
            } else if (arg1 == 2) {
                this.texture = arg2!.g1();
            } else if (arg1 == 3) {
                this.texture = arg2!.g2();
                if (this.texture == 65535) {
                    this.texture = -1;
                }
            } else if (arg1 == 5) {
                this.occlude = false;
            } else if (arg1 == 7) {
                this.mapcolour = FloType.getHsl(arg2!.g3());
            } else if (arg1 == 8) {
                FloType.defaultWater = arg0;
            } else if (arg1 == 9) {
                arg2!.g2();
            } else if (arg1 == 10) {
            } else if (arg1 == 11) {
                arg2!.g1();
            } else if (arg1 == 12) {
            } else if (arg1 == 13) {
                this.waterfogcolour = arg2!.g3();
            } else if (arg1 == 14) {
                this.waterfogscale = arg2!.g1();
            }
            return;
        }

        while (true) {
            const var3 = arg0.g1();
            if (var3 === 0) {
                return;
            }
            this.decode(arg1 as number, var3, arg0);
        }
    }
}
