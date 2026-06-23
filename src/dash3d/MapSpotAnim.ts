import SpotType from '#/config/SpotType.js';
import SeqType from '#/config/SeqType.js';

import type ModelLit from '#/dash3d/ModelLit.js';
import ModelSource, { type SceneTag } from '#/dash3d/ModelSource.js';

export default class MapSpotAnim extends ModelSource {
    anim: SeqType | null = null;
    field286: number = -32768;
    readonly startCycle: number;
    animFrame: number = 0;
    animCycle: number = 0;
    animComplete: boolean = false;
    readonly z: number;
    readonly x: number;
    readonly y: number;
    readonly type: number;
    readonly level: number;

    constructor(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number, arg6: number) {
        super();

        this.z = arg3;
        this.x = arg2;
        this.y = arg4;
        this.startCycle = arg6 + arg5;
        this.type = arg0;
        this.level = arg1;
        const var8 = SpotType.list(this.type).anim;
        if (var8 === -1) {
            this.animComplete = true;
        } else {
            this.animComplete = false;
            this.anim = SeqType.list(var8);
        }
    }

    override method87(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number, arg6: number, arg7: number, arg8: SceneTag): void {
        const var11 = this.getTempModel();
        if (var11 != null) {
            var11.method87(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8);
            this.field286 = var11.method88();
        }
    }

    override method88(): number {
        return this.field286;
    }

    getTempModel(): ModelLit | null {
        const var1 = SpotType.list(this.type);
        let var2: ModelLit | null;
        if (this.animComplete) {
            var2 = var1.getTempModel2(-1);
        } else {
            var2 = var1.getTempModel2(this.animFrame);
        }
        return var2 === null ? null : var2;
    }

    doAnim(arg0: number): void {
        if (this.animComplete) {
            return;
        }

        this.animCycle += arg0;
        while (this.animCycle > this.anim!.delay![this.animFrame]) {
            this.animCycle -= this.anim!.delay![this.animFrame];
            this.animFrame++;
            if (this.anim!.frames!.length <= this.animFrame) {
                this.animComplete = true;
                return;
            }
        }
    }
}
