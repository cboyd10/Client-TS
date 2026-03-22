import Linkable from '#/datastruct/Linkable.js';

export default class ClientObj extends Linkable {
    readonly id: number;
    count: number;

    constructor(id: number, count: number) {
        super();
        this.id = id;
        this.count = count;
    }
}
