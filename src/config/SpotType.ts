import SeqType from '#/config/SeqType.js';

import Linkable2 from '#/datastruct/Linkable2.js';
import LruCache from '#/datastruct/LruCache.js';

import type ModelLit from '#/dash3d/ModelLit.js';
import ModelUnlit from '#/dash3d/ModelUnlit.js';
import ModelSourceCache from '#/dash3d/ModelSourceCache.js';

import Packet from '#/io/Packet.js';
import type Js5 from '#/js5/Js5.js';

// jag::oldscape::configdecoder::SpotType
export default class SpotType extends Linkable2 {
    // jag::oldscape::configdecoder::SpotType::m_pConfigClient
    static configClient: Js5;

    // jag::oldscape::configdecoder::SpotType::m_pModels
    static models: Js5;

    // jag::oldscape::configdecoder::SpotType::m_recentUse
    static readonly recentUse: LruCache<SpotType> = new LruCache(64);

    // jag::oldscape::configdecoder::SpotType::m_modelCache
    static readonly modelCache: ModelSourceCache = new ModelSourceCache(30);

    id: number = 0;
    model: number = 0;
    anim: number = -1;
    recol_s: Int16Array | null = null;
    recol_d: Int16Array | null = null;
    retex_s: Int16Array | null = null;
    retex_d: Int16Array | null = null;
    resizeh: number = 128;
    resizev: number = 128;
    angle: number = 0;
    ambient: number = 0;
    contrast: number = 0;
    hillskew: boolean = false;

    static init(models: Js5, config: Js5): void {
        SpotType.models = models;
        SpotType.configClient = config;
    }

    static getGroupId(id: number): number {
        return id & 0xff;
    }

    static getFileId(id: number): number {
        return id >>> 8;
    }

    static list(id: number): SpotType {
        const cached = SpotType.recentUse.find(BigInt(id));
        if (cached !== null) {
            return cached;
        }

        const data = SpotType.configClient.getFile(SpotType.getGroupId(id), SpotType.getFileId(id));
        const type = new SpotType();
        type.id = id;
        if (data !== null) {
            type.decode(new Packet(data));
        }

        SpotType.recentUse.put(BigInt(id), type);
        return type;
    }

    // jag::oldscape::configdecoder::SpotType::Decode
    decode(buf: Packet): void {
        while (true) {
            const code = buf.g1();
            if (code === 0) {
                return;
            }

            this.decodeInner(code, buf);
        }
    }

    // jag::oldscape::configdecoder::SpotType::Decode
    decodeInner(code: number, buf: Packet): void {
        if (code === 1) {
            this.model = buf.g2();
        } else if (code === 2) {
            this.anim = buf.g2();
        } else if (code === 4) {
            this.resizeh = buf.g2();
        } else if (code === 5) {
            this.resizev = buf.g2();
        } else if (code === 6) {
            this.angle = buf.g2();
        } else if (code === 7) {
            this.ambient = buf.g1();
        } else if (code === 8) {
            this.contrast = buf.g1();
        } else if (code === 9) {
            this.hillskew = true;
        } else if (code === 40) {
            const count = buf.g1();
            this.recol_s = new Int16Array(count);
            this.recol_d = new Int16Array(count);
            for (let var6 = 0; var6 < count; var6++) {
                this.recol_s[var6] = buf.g2();
                this.recol_d[var6] = buf.g2();
            }
        } else if (code === 41) {
            const count = buf.g1();
            this.retex_d = new Int16Array(count);
            this.retex_s = new Int16Array(count);
            for (let var4 = 0; var4 < count; var4++) {
                this.retex_s[var4] = buf.g2();
                this.retex_d[var4] = buf.g2();
            }
        }
    }

    // jag::oldscape::configdecoder::SpotType::GetTempModel2
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
            var6 = SeqType.list(this.anim).animateModel2(var2, arg0);
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

    static resetCache(): void {
        SpotType.recentUse.clear();
        SpotType.modelCache.clear();
    }
}
