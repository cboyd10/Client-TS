import Linkable2 from '#/datastruct/Linkable2.js';
import MapSpotAnim from '#/dash3d/MapSpotAnim.js';

export default class MapSpotAnimNode extends Linkable2 {
    readonly field4474: MapSpotAnim;

    constructor(arg0: MapSpotAnim) {
        super();
        this.field4474 = arg0;
    }
}
