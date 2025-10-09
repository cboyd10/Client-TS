import Model from '#/dash3d/Model.js';

export default class Decor {
    readonly y: number;
    x: number;
    z: number;
    readonly angle1: number;
    readonly angle2: number;
    model: Model;
    readonly typecode: number;
    readonly info: number; // byte

    constructor(y: number, x: number, z: number, type: number, angle: number, model: Model, typecode: number, info: number) {
        this.y = y;
        this.x = x;
        this.z = z;
        this.angle1 = type;
        this.angle2 = angle;
        this.model = model;
        this.typecode = typecode;
        this.info = info;
    }
}
