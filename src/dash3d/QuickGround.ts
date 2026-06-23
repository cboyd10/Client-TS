export default class QuickGround {
    readonly colourNW: number;
    readonly colourSW: number;
    readonly texture: number;
    readonly colourNE: number;
    flat: boolean = true;
    readonly minimapRgb: number;
    readonly colourSE: number;

    constructor(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number, arg6: boolean) {
        this.colourNW = arg3;
        this.flat = arg6;
        this.colourSW = arg0;
        this.colourSE = arg1;
        this.texture = arg4;
        this.minimapRgb = arg5;
        this.colourNE = arg2;
    }
}
