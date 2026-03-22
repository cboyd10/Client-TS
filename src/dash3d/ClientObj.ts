import Linkable from '#/datastruct/Linkable.js';

export default class ClientObj extends Linkable {
    readonly id: number;
    count: number;

    constructor(index: number, count: number) {
        super();
        this.id = index;
        this.count = count;
    }
}
