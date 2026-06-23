import Linkable from '#/datastruct/Linkable.js';

export default class IntNode extends Linkable {
    value: number;

    constructor();
    constructor(arg0: number);
    constructor(arg0: number = 0) {
        super();
        this.value = arg0;
    }
}
