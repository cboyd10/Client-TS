import SeqType from '#/config/SeqType.js';

import Linkable2 from '#/datastruct/Linkable2.js';
import LruCache from '#/datastruct/LruCache.js';

import type ModelLit from '#/dash3d/ModelLit.js';
import ModelUnlit from '#/dash3d/ModelUnlit.js';
import ModelSourceCache from '#/dash3d/ModelSourceCache.js';

import Packet from '#/io/Packet.js';
import type Js5 from '#/js5/Js5.js';

export default class SpotType extends Linkable2 {
    static readonly recentUse: LruCache<SpotType> = new LruCache(64);
    static readonly modelCache: ModelSourceCache = new ModelSourceCache(30);

    static models: Js5;
    static configClient: Js5;

    recol_d: Int16Array | null = null;

    ambient: number = 0;
    resizev: number = 128;
    contrast: number = 0;
    resizeh: number = 128;
    hillskew: boolean = false;
    angle: number = 0;
    anim: number = -1;
    id: number = 0;

    model: number = 0;
    retex_s: Int16Array | null = null;
    recol_s: Int16Array | null = null;
    retex_d: Int16Array | null = null;

    static list(arg0: number): SpotType {
        const var1 = SpotType.recentUse.find(BigInt(arg0));
        if (var1 !== null) {
            return var1;
        }

        const var2 = SpotType.configClient.getFile(SpotType.getGroupId(arg0), SpotType.getFileId(arg0));
        const var3 = new SpotType();
        var3.id = arg0;
        if (var2 !== null) {
            var3.decode(new Packet(var2));
        }
        SpotType.recentUse.put(BigInt(arg0), var3);
        return var3;
    }

    static resetCache(): void {
        SpotType.recentUse.clear();
        SpotType.modelCache.clear();
    }

    static init(arg0: Js5, arg1: Js5): void {
        SpotType.models = arg0;
        SpotType.configClient = arg1;
    }

    static getFileId(arg0: number): number {
        return arg0 >>> 8;
    }

    static getGroupId(arg0: number): number {
        return arg0 & 0xff;
    }

    decode(arg0: number, arg1: Packet): void;
    decode(arg0: Packet): void;
    decode(arg0: Packet | number, arg1?: Packet): void {
        if (typeof arg0 === 'number') {
            if (arg0 === 1) {
                this.model = arg1!.g2();
            } else if (arg0 === 2) {
                this.anim = arg1!.g2();
            } else if (arg0 === 4) {
                this.resizeh = arg1!.g2();
            } else if (arg0 === 5) {
                this.resizev = arg1!.g2();
            } else if (arg0 === 6) {
                this.angle = arg1!.g2();
            } else if (arg0 === 7) {
                this.ambient = arg1!.g1();
            } else if (arg0 === 8) {
                this.contrast = arg1!.g1();
            } else if (arg0 === 9) {
                this.hillskew = true;
            } else if (arg0 === 40) {
                const var5 = arg1!.g1();
                this.recol_s = new Int16Array(var5);
                this.recol_d = new Int16Array(var5);
                for (let var6 = 0; var6 < var5; var6++) {
                    this.recol_s[var6] = arg1!.g2();
                    this.recol_d[var6] = arg1!.g2();
                }
            } else if (arg0 === 41) {
                const var3 = arg1!.g1();
                this.retex_d = new Int16Array(var3);
                this.retex_s = new Int16Array(var3);
                for (let var4 = 0; var4 < var3; var4++) {
                    this.retex_s[var4] = arg1!.g2();
                    this.retex_d[var4] = arg1!.g2();
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

    getTempModel2(arg0: number): ModelLit | null {
        let var2 = SpotType.modelCache.find(BigInt(this.id)) as ModelLit | null;
        if (var2 === null) {
            const var3 = ModelUnlit.load(SpotType.models, this.model);
            if (var3 === null) {
                return null;
            }

            if (this.recol_s !== null) {
                for (let var4 = 0; var4 < this.recol_s.length; var4++) {
                    var3.recolour(this.recol_s[var4], this.recol_d![var4]);
                }
            }

            if (this.retex_s !== null) {
                for (let var5 = 0; var5 < this.retex_s.length; var5++) {
                    var3.retexture(this.retex_s[var5], this.retex_d![var5]);
                }
            }

            var2 = var3.light(this.ambient + 64, this.contrast + 850, -30, -50, -30);
            SpotType.modelCache.put(BigInt(this.id), var2);
        }

        let var6: ModelLit;
        if (this.anim === -1 || arg0 === -1) {
            var6 = var2.copyForAnim2(true, true);
        } else {
            var6 = SeqType.list(this.anim).animateModel(var2, arg0);
        }

        if (this.resizeh !== 128 || this.resizev !== 128) {
            var6.resize(this.resizeh, this.resizev, this.resizeh);
        }

        if (this.angle !== 0) {
            if (this.angle === 90) {
                var6.rotate90();
            }
            if (this.angle === 180) {
                var6.rotate180();
            }
            if (this.angle === 270) {
                var6.rotate270();
            }
        }

        return var6;
    }
}
