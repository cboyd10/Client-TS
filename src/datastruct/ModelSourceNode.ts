import Linkable2 from '#/datastruct/Linkable2.js';
import type ModelSource from '#/dash3d/ModelSource.js';

export default class ModelSourceNode extends Linkable2 {
    readonly field1829: ModelSource;

    constructor(arg0: ModelSource) {
        super();
        this.field1829 = arg0;
    }
}
