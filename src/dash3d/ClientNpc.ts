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

        let model = this.getTempModel2();
        if (model == null) {
            return null;
        }

        const spot = SpotType.list[this.spotanimId];
        const spotModel = spot.getTempModel2();

        const temp: Model = Model.copyForAnim(spotModel, true, !spot.animateTransparencies, false);
        temp.translate(-this.spotanimHeight, 0, 0);
        temp.prepareAnim();
        if (spot.seq && spot.seq.frames) {
            temp.animate(spot.seq.frames[this.spotanimFrame]);
        }

        temp.labelFaces = null;
        temp.labelVertices = null;

        if (spot.resizeh != 128 || spot.resizev != 128) {
            temp.resize(spot.resizeh, spot.resizev, spot.resizeh);
        }

        temp.calculateNormals(spot.ambient + 64, spot.contrast + 850, -30, -50, -30, true);

        const models: Model[] = [model, temp];
        model = Model.combine(models, 2);

        if (this.type.size == 1) {
            model.useAABBMouseCheck = true;
        }

        return model;
    }

    private getTempModel2(): Model | null {
        if (!this.type) {
            return null;
        }

        if (this.primaryAnim < 0 || this.primaryAnimDelay != 0) {
            const secondarySeq = SeqType.list[this.secondaryAnim];
            let secondaryTransform = -1;
            if (this.secondaryAnim >= 0 && secondarySeq.frames) {
                secondaryTransform = secondarySeq.frames[this.secondaryAnimFrame];
            }

            const model: Model | null = this.type.getTempModel(secondaryTransform, -1, null);
            if (!model) {
                return null;
            }

            this.height = model.minY;
            return model;
        } else {
            const primarySeq = SeqType.list[this.primaryAnim];
            let primaryTransform = -1;
            if (primarySeq.frames) {
                primaryTransform = primarySeq.frames[this.primaryAnimFrame];
            }

            const secondarySeq = SeqType.list[this.secondaryAnim];
            let secondaryTransform = -1;
            if (this.secondaryAnim >= 0 && this.secondaryAnim != this.readyanim && secondarySeq.frames) {
                secondaryTransform = secondarySeq.frames[this.secondaryAnimFrame];
            }

            return this.type.getTempModel(primaryTransform, secondaryTransform, primarySeq.walkmerge);
        }
    }

    isReady(): boolean {
        return this.type !== null;
    }
}
