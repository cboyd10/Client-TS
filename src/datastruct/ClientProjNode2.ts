import Linkable2 from '#/datastruct/Linkable2.js';
import type ClientProj from '#/dash3d/ClientProj.js';

export default class ClientProjNode2 extends Linkable2 {
    readonly field315: ClientProj;

    constructor(arg0: ClientProj) {
        super();
        this.field315 = arg0;
    }
}
