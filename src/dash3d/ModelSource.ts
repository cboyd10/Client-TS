import Linkable from '#/datastruct/Linkable.js';

import Model from '#/dash3d/Model.js';

export default class ModelSource extends Linkable {
    getTempModel(_loopCycle: number): Model | null {
        return null;
    }
}
