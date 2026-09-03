import ObjType from '#/config/ObjType.js';
import type Model from '#/dash3d/Model.js';
import ModelSource from '#/dash3d/ModelSource.js';

export default class ClientObj extends ModelSource {
    readonly id: number;
    count: number;
    // custom (issue #126): the npc type that dropped this obj, or -1 if it
    // wasn't dropped by an npc (player-dropped, static/quest spawn, or an
    // OBJ_REVEAL of another player's drop -- the protocol doesn't carry
    // sourceNpc on OBJ_REVEAL since that path never fires for the drop's
    // own receiver). Read by LootTracker's ground-item correlation.
    readonly sourceNpc: number;

    constructor(id: number, count: number, sourceNpc: number = -1) {
        super();
        this.id = id;
        this.count = count;
        this.sourceNpc = sourceNpc;
    }

    override getTempModel(): Model | null {
        const obj = ObjType.list(this.id);
        return obj.getModelLit(this.count);
    }
}
