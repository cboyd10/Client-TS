import Model from '#/dash3d/Model.js';

export default class Decor {
    readonly y: number;
    x: number;
    z: number;
    readonly wshape: number;
    readonly angle: number;
    model: Model;
    readonly typecode: number;
    readonly typecode2: number;

    constructor(y: number, x: number, z: number, wshape: number, angle: number, model: Model, typecode: number, info: number) {
        this.y = y;
        this.x = x;
        this.z = z;
        this.wshape = wshape;
        this.angle = angle;
        this.model = model;
        this.typecode = typecode;
        this.typecode2 = info;
    }
}
