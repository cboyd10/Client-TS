import SpotType from '#/config/SpotType.js';

import ModelSource from '#/dash3d/ModelSource.js';

import Model from '#/dash3d/Model.js';

export default class MapSpotAnim extends ModelSource {
    readonly type: SpotType;
    readonly level: number;
    readonly x: number;
    readonly z: number;
    readonly y: number;
    readonly startCycle: number;

    animComplete: boolean = false;
    animFrame: number = 0;
    animCycle: number = 0;

    constructor(id: number, level: number, x: number, z: number, y: number, cycle: number, delay: number) {
        super();

        this.type = SpotType.list[id];
        this.level = level;
        this.x = x;
        this.z = z;
        this.y = y;
        this.startCycle = cycle + delay;
    }

    update(delta: number): void {
        if (!this.type.seq || !this.type.seq.delay) {
            return;
        }

        for (this.animCycle += delta; this.animCycle > this.type.seq.delay[this.animFrame]; ) {
            this.animCycle -= this.type.seq.delay[this.animFrame] + 1;
            this.animFrame++;

            if (this.animFrame >= this.type.seq.numFrames) {
                this.animFrame = 0;
                this.animComplete = true;
            }
        }
    }

    override getTempModel(): Model {
        const tmp: Model = this.type.getTempModel2();

        const model: Model = Model.copyForAnim(tmp, true, !this.type.animateTransparencies, false);

        if (!this.animComplete && this.type.seq && this.type.seq.frames) {
            model.prepareAnim();
            model.animate(this.type.seq.frames[this.animFrame]);
            model.labelFaces = null;
            model.labelVertices = null;
        }

        if (this.type.resizeh !== 128 || this.type.resizev !== 128) {
            model.resize(this.type.resizeh, this.type.resizev, this.type.resizeh);
        }

        if (this.type.angle !== 0) {
            if (this.type.angle === 90) {
                model.rotate90();
            } else if (this.type.angle === 180) {
                model.rotate90();
                model.rotate90();
            } else if (this.type.angle === 270) {
                model.rotate90();
                model.rotate90();
                model.rotate90();
            }
        }

        model.calculateNormals(64 + this.type.ambient, 850 + this.type.contrast, -30, -50, -30, true);
        return model;
    }
}
