import LruCache from '#/datastruct/LruCache.js';

import LocShape from '#/dash3d/LocShape.js';
import { LocAngle } from '#/dash3d/LocAngle.js';

import Model from '#/dash3d/Model.js';

import Jagfile from '#/io/Jagfile.js';
import Packet from '#/io/Packet.js';

import { TypedArray1d } from '#/util/Arrays.js';

export default class LocType {
    static numDefinitions: number = 0;
    static idx: Int32Array | null = null;
    static dat: Packet | null = null;
    static recent: (LocType | null)[] | null = null;
    static recentPos: number = 0;
    static mc1: LruCache<Model> | null = new LruCache(500);
    static mc2: LruCache<Model> | null = new LruCache(30);

    id: number = -1;

    model: Int32Array | null = null;
    shape: Int32Array | null = null;
    name: string | null = null;
    desc: string | null = null;
    recol_s: Uint16Array | null = null;
    recol_d: Uint16Array | null = null;
    width: number = 1;
    length: number = 1;
    blockwalk: boolean = true;
    blockrange: boolean = true;
    active: boolean = false;
    hillskew: boolean = false;
    sharelight: boolean = false;
    occlude: boolean = false;
    anim: number = -1;
    animateTransparencies: boolean = false;
    wallwidth: number = 16;
    ambient: number = 0;
    contrast: number = 0;
    op: (string | null)[] | null = null;
    mirror: boolean = false;
    shadow: boolean = true;
    mapfunction: number = -1;
    mapscene: number = -1;
    resizex: number = 128;
    resizey: number = 128;
    resizez: number = 128;
    offsetx: number = 0;
    offsety: number = 0;
    offsetz: number = 0;
    forceapproach: number = 0;
    forcedecor: boolean = false;

    static init(config: Jagfile): void {
        this.dat = new Packet(config.read('loc.dat'));
        const idx: Packet = new Packet(config.read('loc.idx'));

        this.numDefinitions = idx.g2();
        this.idx = new Int32Array(this.numDefinitions);

        let offset: number = 2;
        for (let id: number = 0; id < this.numDefinitions; id++) {
            this.idx[id] = offset;
            offset += idx.g2();
        }

        this.recent = new TypedArray1d(10, null);
        for (let id: number = 0; id < 10; id++) {
            this.recent[id] = new LocType();
        }
    }

    static list(id: number): LocType {
        if (!this.recent || !this.idx || !this.dat) {
            throw new Error();
        }

        for (let i: number = 0; i < 10; i++) {
            const type: LocType | null = this.recent[i];
            if (type && type.id === id) {
                return type;
            }
        }

        this.recentPos = (this.recentPos + 1) % 10;

        const loc: LocType = this.recent[this.recentPos]!;
        this.dat.pos = this.idx[id];
        loc.id = id;
        loc.reset();
        loc.decode(this.dat);

        return loc;
    }

    private reset(): void {
        this.model = null;
        this.shape = null;
        this.name = null;
        this.desc = null;
        this.recol_s = null;
        this.recol_d = null;
        this.width = 1;
        this.length = 1;
        this.blockwalk = true;
        this.blockrange = true;
        this.active = false;
        this.hillskew = false;
        this.sharelight = false;
        this.occlude = false;
        this.anim = -1;
        this.wallwidth = 16;
        this.ambient = 0;
        this.contrast = 0;
        this.op = null;
        this.animateTransparencies = false;
        this.mapfunction = -1;
        this.mapscene = -1;
        this.mirror = false;
        this.shadow = true;
        this.resizex = 128;
        this.resizey = 128;
        this.resizez = 128;
        this.forceapproach = 0;
        this.offsetx = 0;
        this.offsety = 0;
        this.offsetz = 0;
        this.forcedecor = false;
    }

    decode(dat: Packet): void {
        let active = -1;
        while (true) {
            const code = dat.g1();
            if (code === 0) {
                break;
            }

            if (code === 1) {
                const count: number = dat.g1();
                this.model = new Int32Array(count);
                this.shape = new Int32Array(count);

                for (let i: number = 0; i < count; i++) {
                    this.model[i] = dat.g2();
                    this.shape[i] = dat.g1();
                }
            } else if (code === 2) {
                this.name = dat.gjstr();
            } else if (code === 3) {
                this.desc = dat.gjstr();
            } else if (code === 14) {
                this.width = dat.g1();
            } else if (code === 15) {
                this.length = dat.g1();
            } else if (code === 17) {
                this.blockwalk = false;
            } else if (code === 18) {
                this.blockrange = false;
            } else if (code === 19) {
                active = dat.g1();
                if (active === 1) {
                    this.active = true;
                }
            } else if (code === 21) {
                this.hillskew = true;
            } else if (code === 22) {
                this.sharelight = true;
            } else if (code === 23) {
                this.occlude = true;
            } else if (code === 24) {
                this.anim = dat.g2();

                if (this.anim === 65535) {
                    this.anim = -1;
                }
            } else if (code === 25) {
                this.animateTransparencies = true;
            } else if (code === 28) {
                this.wallwidth = dat.g1();
            } else if (code === 29) {
                this.ambient = dat.g1b();
            } else if (code === 39) {
                this.contrast = dat.g1b();
            } else if (code >= 30 && code < 39) {
                if (!this.op) {
                    this.op = new TypedArray1d(5, null);
                }

                this.op[code - 30] = dat.gjstr();
                if (this.op[code - 30]?.toLowerCase() === 'hidden') {
                    this.op[code - 30] = null;
                }
            } else if (code === 40) {
                const count: number = dat.g1();
                this.recol_s = new Uint16Array(count);
                this.recol_d = new Uint16Array(count);

                for (let i: number = 0; i < count; i++) {
                    this.recol_s[i] = dat.g2();
                    this.recol_d[i] = dat.g2();
                }
            } else if (code === 60) {
                this.mapfunction = dat.g2();
            } else if (code === 62) {
                this.mirror = true;
            } else if (code === 64) {
                this.shadow = false;
            } else if (code === 65) {
                this.resizex = dat.g2();
            } else if (code === 66) {
                this.resizey = dat.g2();
            } else if (code === 67) {
                this.resizez = dat.g2();
            } else if (code === 68) {
                this.mapscene = dat.g2();
            } else if (code === 69) {
                this.forceapproach = dat.g1();
            } else if (code === 70) {
                this.offsetx = dat.g2b();
            } else if (code === 71) {
                this.offsety = dat.g2b();
            } else if (code === 72) {
                this.offsetz = dat.g2b();
            } else if (code === 73) {
                this.forcedecor = true;
            }
        }

        if (!this.shape) {
            this.shape = new Int32Array(1);
        }

        if (active === -1) {
            this.active = false;

            if (this.shape.length > 0 && this.shape[0] === LocShape.CENTREPIECE_STRAIGHT.id) {
                this.active = true;
            }

            if (this.op) {
                this.active = true;
            }
        }
    }

    getModel(shape: number, angle: number, heightmapSW: number, heightmapSE: number, heightmapNE: number, heightmapNW: number, transformId: number): Model | null {
        if (!this.shape) {
            return null;
        }

        let index: number = -1;
        for (let i: number = 0; i < this.shape.length; i++) {
            if (this.shape[i] === shape) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            return null;
        }

        const typecode: bigint = BigInt(BigInt(this.id) << 6n) + BigInt(BigInt(index) << 3n) + BigInt(angle) + BigInt((BigInt(transformId) + 1n) << 32n);
        /*if (reset) {
            typecode = 0L;
        }*/

        let cached: Model | null = LocType.mc2?.find(typecode) as Model | null;
        if (cached) {
            /*if (reset) {
                return cached;
            }*/

            if (this.hillskew || this.sharelight) {
                cached = Model.modelCopyFaces(cached, this.hillskew, this.sharelight);
            }

            if (this.hillskew) {
                const groundY: number = ((heightmapSW + heightmapSE + heightmapNE + heightmapNW) / 4) | 0;

                for (let i: number = 0; i < cached.vertexCount; i++) {
                    const x: number = cached.vertexX[i];
                    const z: number = cached.vertexZ[i];

                    const heightS: number = heightmapSW + ((((heightmapSE - heightmapSW) * (x + 64)) / 128) | 0);
                    const heightN: number = heightmapNW + ((((heightmapNE - heightmapNW) * (x + 64)) / 128) | 0);
                    const y: number = heightS + ((((heightN - heightS) * (z + 64)) / 128) | 0);

                    cached.vertexY[i] += y - groundY;
                }

                cached.calculateBoundsY();
            }

            return cached;
        }

        if (!this.model) {
            return null;
        }

        if (index >= this.model.length) {
            return null;
        }

        let modelId: number = this.model[index];
        if (modelId === -1) {
            return null;
        }

        const flip: boolean = this.mirror !== angle > 3;
        if (flip) {
            modelId += 65536;
        }

        let model: Model | null = LocType.mc1?.find(BigInt(modelId)) as Model | null;
        if (!model) {
            model = Model.get(modelId & 0xffff);
            if (flip) {
                model.rotateY180();
            }

            LocType.mc1?.put(BigInt(modelId), model);
        }

        const scaled: boolean = this.resizex !== 128 || this.resizey !== 128 || this.resizez !== 128;
        const translated: boolean = this.offsetx !== 0 || this.offsety !== 0 || this.offsetz !== 0;

        let modified: Model = Model.modelShareColored(model, !this.recol_s, !this.animateTransparencies, angle === LocAngle.WEST && transformId === -1 && !scaled && !translated);
        if (transformId !== -1) {
            modified.createLabelReferences();
            modified.applyTransform(transformId);
            modified.labelFaces = null;
            modified.labelVertices = null;
        }

        while (angle-- > 0) {
            modified.rotateY90();
        }

        if (this.recol_s && this.recol_d) {
            for (let i: number = 0; i < this.recol_s.length; i++) {
                modified.recolour(this.recol_s[i], this.recol_d[i]);
            }
        }

        if (scaled) {
            modified.scale(this.resizex, this.resizey, this.resizez);
        }

        if (translated) {
            modified.translate(this.offsety, this.offsetx, this.offsetz);
        }

        modified.calculateNormals((this.ambient & 0xff) + 64, (this.contrast & 0xff) * 5 + 768, -50, -10, -50, !this.sharelight);

        if (this.blockwalk) {
            modified.objRaise = modified.minY;
        }

        LocType.mc2?.put(typecode, modified);

        if (this.hillskew || this.sharelight) {
            modified = Model.modelCopyFaces(modified, this.hillskew, this.sharelight);
        }

        if (this.hillskew) {
            const groundY: number = ((heightmapSW + heightmapSE + heightmapNE + heightmapNW) / 4) | 0;

            for (let i: number = 0; i < modified.vertexCount; i++) {
                const x: number = modified.vertexX[i];
                const z: number = modified.vertexZ[i];

                const heightS: number = heightmapSW + ((((heightmapSE - heightmapSW) * (x + 64)) / 128) | 0);
                const heightN: number = heightmapNW + ((((heightmapNE - heightmapNW) * (x + 64)) / 128) | 0);
                const y: number = heightS + ((((heightN - heightS) * (z + 64)) / 128) | 0);

                modified.vertexY[i] += y - groundY;
            }

            modified.calculateBoundsY();
        }

        return modified;
    }
}
