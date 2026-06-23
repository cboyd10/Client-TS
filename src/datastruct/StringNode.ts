import Linkable from '#/datastruct/Linkable.js';
import type JagString from '#/jstring/JagString.js';

export default class StringNode extends Linkable {
    field4046: JagString | string | null;

    constructor();
    constructor(arg0: JagString | string | null);
    constructor(arg0: JagString | string | null = null) {
        super();
        this.field4046 = arg0;
    }
}
