import NpcType from '#/config/NpcType.js';
import SeqType from '#/config/SeqType.js';
import SpotType from '#/config/SpotType.js';

import ClientEntity from '#/dash3d/ClientEntity.js';

import AnimFrame from '#/dash3d/AnimFrame.js';
import Model from '#/dash3d/Model.js';

export const enum NpcUpdate {
    HITMARK2 = 0x1,
    ANIM = 0x2,
    FACEENTITY = 0x4,
    SAY = 0x8,
    HITMARK = 0x10,
    CHANGETYPE = 0x20,
    SPOTANIM = 0x40,
    FACESQUARE = 0x80,
    // custom (issue #150): mirrors the server's NpcInfoProt.TIMER (0x100) --
    // generic network "ticks remaining" countdown mask, first consumer is
    // the Fishing plugin's relocation countdown. Since the original 8 low
    // bits (0x1-0x80) were already fully occupied with no spare "BIG"-style
    // continuation flag, the server's mask header is now unconditionally 2
    // bytes (little-endian) any time an npc has any mask update at all --
    // see the mask read in Client.getNpcPosExtended().
    TIMER = 0x100
}

export default class ClientNpc extends ClientEntity {
    type: NpcType | null = null;
    // custom (issue #150): generic "ticks remaining" payload for
    // NpcUpdate.TIMER, in client loop-cycle units (mirrors Client.rebootTimer's
    // unit convention: the server's raw game-tick value is multiplied by 30
    // on decode -- see Client.getNpcPosExtended() -- and this field is then
    // decremented by 1 once per client cycle in Client.gameLoop(), so reading
    // it back out (divide by 50 for seconds) always reflects the live
    // countdown between server updates, not just its value as of the last
    // packet. -1 (the default) means no timer is currently armed. The server
    // sends this mask once, non-persisting, when the timer is armed (see
    // NpcInfoTimer.persists() in Engine-TS) and never re-sends the same
    // countdown mid-flight -- the client owns ticking it down.
    timerMaskTicks: number = -1;

    override getTempModel(): Model | null {
        if (this.type == null) {
            return null;
        }

        let model = this.getTempModel2();
        if (model == null) {
            return null;
        }

        this.height = model.minY;

        if (this.spotanimId != -1 && this.spotanimFrame != -1) {
            const spot = SpotType.list[this.spotanimId];
            const spotModel = spot.getTempModel2();

            if (spotModel != null) {
                const temp: Model = Model.copyForAnim(spotModel, true, AnimFrame.animateTransparencies(this.spotanimFrame), false);
                temp.translate(-this.spotanimHeight, 0, 0);
                temp.prepareAnim();
                if (spot.seq && spot.seq.frames) {
                    temp.animate(spot.seq.frames[this.spotanimFrame]);
                }

                temp.labelFaces = null;
                temp.labelVertices = null;

                if (spot.resizeh != 128 || spot.resizev != 128) {
                    temp.resize(spot.resizev, spot.resizeh, spot.resizeh);
                }

                temp.calculateNormals(spot.ambient + 64, spot.contrast + 850, -30, -50, -30, true);

                const models: Model[] = [model, temp];
                model = Model.combine(models, 2);
            }
        }

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

            return this.type.getTempModel(secondaryTransform, -1, null);
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
