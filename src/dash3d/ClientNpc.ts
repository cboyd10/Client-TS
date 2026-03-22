import NpcType from '#/config/NpcType.js';
import SeqType from '#/config/SeqType.js';
import SpotType from '#/config/SpotType.js';

import ClientEntity from '#/dash3d/ClientEntity.js';

import Model from '#/dash3d/Model.js';

export const enum NpcUpdate {
    ANIM = 0x2,
    FACEENTITY = 0x4,
    SAY = 0x8,
    HITMARK = 0x10,
    CHANGETYPE = 0x20,
    SPOTANIM = 0x40,
    FACESQUARE = 0x80
}

export default class ClientNpc extends ClientEntity {
    type: NpcType | null = null;

    override getTempModel(_loopCycle: number): Model | null {
        if (this.type == null) {
            return null;
        }

        if (this.spotanimId === -1 || this.spotanimFrame === -1) {
            return this.getTempModel2();
        }

        const model: Model | null = this.getTempModel2();
        if (!model) {
            return null;
        }

        const spotanim: SpotType = SpotType.list[this.spotanimId];

        const model1: Model = Model.copyForAnim(spotanim.getTempModel2(), true, !spotanim.animateTransparencies, false);
        model1.translate(-this.spotanimHeight, 0, 0);
        model1.prepareAnim();
        if (spotanim.seq && spotanim.seq.frames) {
            model1.animate(spotanim.seq.frames[this.spotanimFrame]);
        }
        model1.labelFaces = null;
        model1.labelVertices = null;

        if (spotanim.resizeh !== 128 || spotanim.resizev !== 128) {
            model1.resize(spotanim.resizeh, spotanim.resizev, spotanim.resizeh);
        }

        model1.calculateNormals(64 + spotanim.ambient, 850 + spotanim.contrast, -30, -50, -30, true);

        const models: Model[] = [model, model1];
        const tmp: Model = Model.combine(models, 2);

        if (this.type.size === 1) {
            tmp.useAABBMouseCheck = true;
        }

        return tmp;
    }

    private getTempModel2(): Model | null {
        if (!this.type) {
            return null;
        }

        if (this.primaryAnim >= 0 && this.primaryAnimDelay === 0) {
            const frames: Int16Array | null = SeqType.list[this.primaryAnim].frames;
            if (frames) {
                const primaryTransformId: number = frames[this.primaryAnimFrame];
                let secondaryTransformId: number = -1;
                if (this.secondaryAnim >= 0 && this.secondaryAnim !== this.readyanim) {
                    const secondFrames: Int16Array | null = SeqType.list[this.secondaryAnim].frames;
                    if (secondFrames) {
                        secondaryTransformId = secondFrames[this.secondaryAnimFrame];
                    }
                }
                return this.type.getTempModel(primaryTransformId, secondaryTransformId, SeqType.list[this.primaryAnim].walkmerge);
            }
        }

        let transformId: number = -1;
        if (this.secondaryAnim >= 0) {
            const secondFrames: Int16Array | null = SeqType.list[this.secondaryAnim].frames;
            if (secondFrames) {
                transformId = secondFrames[this.secondaryAnimFrame];
            }
        }

        const model: Model | null = this.type.getTempModel(transformId, -1, null);
        if (!model) {
            return null;
        }

        this.height = model.minY;
        return model;
    }

    isReady(): boolean {
        return this.type !== null;
    }
}
