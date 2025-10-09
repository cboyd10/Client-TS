import SeqType from '#/config/SeqType.js';

import Linkable from '#/datastruct/Linkable.js';

export default class ClientLocAnim extends Linkable {
    readonly index: number;
    heightmapSW: number;
    readonly heightmapSE: number;
    readonly heightmapNE: number;
    readonly heightmapNW: number;
    seq: SeqType;
    seqFrame: number;
    seqCycle: number;

    constructor(index: number, heightmapSW: number, heightmapSE: number, heightmapNE: number, heightmapNW: number, seq: SeqType, randomFrame: boolean) {
        super();

        this.index = index;
        this.heightmapSW = heightmapSW;
        this.heightmapSE = heightmapSE;
        this.heightmapNE = heightmapNE;
        this.heightmapNW = heightmapNW;
        this.seq = seq;

        if (randomFrame && seq.loops !== -1 && this.seq.delay) {
            this.seqFrame = (Math.random() * this.seq.frameCount) | 0;
            this.seqCycle = (Math.random() * this.seq.delay[this.seqFrame]) | 0;
        } else {
            this.seqFrame = -1;
            this.seqCycle = 0;
        }
    }
}
