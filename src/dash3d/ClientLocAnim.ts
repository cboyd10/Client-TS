import SeqType from '#/config/SeqType.js';

import Linkable from '#/datastruct/Linkable.js';

export default class ClientLocAnim extends Linkable {
    readonly index: number;
    heightSW: number;
    readonly heightSE: number;
    readonly heightNE: number;
    readonly heightNW: number;
    anim: SeqType;
    animFrame: number;
    animCycle: number;

    constructor(index: number, heightSW: number, heightSE: number, heightNE: number, heightNW: number, seq: SeqType, randomFrame: boolean) {
        super();

        this.index = index;
        this.heightSW = heightSW;
        this.heightSE = heightSE;
        this.heightNE = heightNE;
        this.heightNW = heightNW;
        this.anim = seq;

        if (randomFrame && seq.loops !== -1 && this.anim.delay) {
            this.animFrame = (Math.random() * this.anim.numFrames) | 0;
            this.animCycle = (Math.random() * this.anim.delay[this.animFrame]) | 0;
        } else {
            this.animFrame = -1;
            this.animCycle = 0;
        }
    }
}
