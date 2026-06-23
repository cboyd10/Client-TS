import ModelUnlit from '#/dash3d/ModelUnlit.js';
import Linkable2 from '#/datastruct/Linkable2.js';
import LruCache from '#/datastruct/LruCache.js';

import Packet from '#/io/Packet.js';
import type Js5 from '#/js5/Js5.js';

export default class IdkType extends Linkable2 {
    static readonly recentUse: LruCache<IdkType> = new LruCache(64);

    static configClient: Js5;
    static models: Js5;
    static numDefinitions: number = 0;

    disable: boolean = false;
    readonly head: Int32Array = new Int32Array(5).fill(-1);
    type: number = -1;
    model: Int32Array | null = null;
    recol_s: Int16Array | null = null;
    recol_d: Int16Array | null = null;
    retex_s: Int16Array | null = null;
    retex_d: Int16Array | null = null;

    static list(arg0: number): IdkType {
        const var1 = IdkType.recentUse.find(BigInt(arg0));
        if (var1 !== null) {
            return var1;
        }

        const var2 = IdkType.configClient.getFile(arg0, 3);
        const var3 = new IdkType();
        if (var2 !== null) {
            var3.decode(new Packet(var2));
        }
        IdkType.recentUse.put(BigInt(arg0), var3);
        return var3;
    }

    static resetCache(): void {
        IdkType.recentUse.clear();
    }

    static init(arg0: Js5, arg1: Js5): void {
        IdkType.models = arg0;
        IdkType.configClient = arg1;
        IdkType.numDefinitions = IdkType.configClient.getFileIdLimit(3);
    }

    getModelNoCheck(): ModelUnlit | null {
        if (this.model === null) {
            return null;
        }

        const var1 = new Array<ModelUnlit | null>(this.model.length).fill(null);
        for (let var2 = 0; var2 < this.model.length; var2++) {
            var1[var2] = ModelUnlit.load(IdkType.models, this.model[var2]);
        }

        let var3: ModelUnlit | null;
        if (var1.length === 1) {
            var3 = var1[0];
        } else {
            var3 = new ModelUnlit(var1, var1.length);
        }
        if (this.retex_d !== null) {
            for (let var4 = 0; var4 < this.retex_d.length; var4++) {
                var3!.recolour(this.retex_d[var4], this.recol_d![var4]);
            }
        }
        if (this.retex_s !== null) {
            for (let var5 = 0; var5 < this.retex_s.length; var5++) {
                var3!.retexture(this.retex_s[var5], this.recol_s![var5]);
            }
        }
        return var3;
    }

    decode(arg0: Packet, arg1: number): void;
    decode(arg0: Packet): void;
    decode(arg0: Packet, arg1?: number): void {
        if (typeof arg1 === 'number') {
            if (arg1 === 1) {
                this.type = arg0.g1();
            } else if (arg1 === 2) {
                const var3 = arg0.g1();
                this.model = new Int32Array(var3);
                for (let var4 = 0; var4 < var3; var4++) {
                    this.model[var4] = arg0.g2();
                }
            } else if (arg1 === 3) {
                this.disable = true;
            } else if (arg1 === 40) {
                const var7 = arg0.g1();
                this.recol_d = new Int16Array(var7);
                this.retex_d = new Int16Array(var7);
                for (let var8 = 0; var8 < var7; var8++) {
                    this.retex_d[var8] = arg0.g2();
                    this.recol_d[var8] = arg0.g2();
                }
            } else if (arg1 === 41) {
                const var5 = arg0.g1();
                this.recol_s = new Int16Array(var5);
                this.retex_s = new Int16Array(var5);
                for (let var6 = 0; var6 < var5; var6++) {
                    this.retex_s[var6] = arg0.g2();
                    this.recol_s[var6] = arg0.g2();
                }
            } else if (arg1 >= 60 && arg1 < 70) {
                this.head[arg1 - 60] = arg0.g2();
            }
            return;
        }

        while (true) {
            const var2 = arg0.g1();
            if (var2 === 0) {
                return;
            }
            this.decode(arg0, var2);
        }
    }

    getHeadNoCheck(): ModelUnlit {
        let var1 = 0;
        const var2 = new Array<ModelUnlit | null>(5).fill(null);
        for (let var3 = 0; var3 < 5; var3++) {
            if (this.head[var3] !== -1) {
                var2[var1++] = ModelUnlit.load(IdkType.models, this.head[var3]);
            }
        }
        const var4 = new ModelUnlit(var2, var1);
        if (this.retex_d !== null) {
            for (let var5 = 0; var5 < this.retex_d.length; var5++) {
                var4.recolour(this.retex_d[var5], this.recol_d![var5]);
            }
        }
        if (this.retex_s !== null) {
            for (let var6 = 0; var6 < this.retex_s.length; var6++) {
                var4.retexture(this.retex_s[var6], this.recol_s![var6]);
            }
        }
        return var4;
    }

    checkModel(): boolean {
        let var1 = true;
        for (let var2 = 0; var2 < 5; var2++) {
            if (this.head[var2] !== -1 && !IdkType.models.requestDownload(this.head[var2], 0)) {
                var1 = false;
            }
        }
        return var1;
    }

    checkHead(): boolean {
        if (this.model === null) {
            return true;
        }
        let var1 = true;
        for (let var2 = 0; var2 < this.model.length; var2++) {
            if (!IdkType.models.requestDownload(this.model[var2], 0)) {
                var1 = false;
            }
        }
        return var1;
    }
}
