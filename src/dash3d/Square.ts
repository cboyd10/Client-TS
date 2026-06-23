import Linkable from '#/datastruct/Linkable.js';

import GroundDecor from '#/dash3d/GroundDecor.js';
import Sprite from '#/dash3d/Sprite.js';
import GroundObject from '#/dash3d/GroundObject.js';
import Ground from '#/dash3d/Ground.js';
import QuickGround from '#/dash3d/QuickGround.js';
import Wall from '#/dash3d/Wall.js';
import Decor from '#/dash3d/Decor.js';

export default class Square extends Linkable {
    spriteSpans: number = 0;
    readonly spriteSpan: Int32Array = new Int32Array(5);
    readonly sprites: (Sprite | null)[] = new Array(5).fill(null);
    readonly z: number;
    level: number;
    readonly originalLevel: number;
    readonly x: number;
    backWallTypes: number = 0;
    drawLevel: number = 0;
    blockLocSpans: number = 0;
    checkLocSpans: number = 0;
    inverseBlockLocSpans: number = 0;
    spriteCount: number = 0;
    wall: Wall | null = null;
    groundDecor: GroundDecor | null = null;
    groundObject: GroundObject | null = null;
    linkedSquare: Square | null = null;
    ground: Ground | null = null;
    decor: Decor | null = null;
    quickGround: QuickGround | null = null;
    drawFront: boolean = false;
    drawSprites: boolean = false;
    drawBack: boolean = false;

    constructor(arg0: number, arg1: number, arg2: number) {
        super();
        this.z = arg2;
        this.originalLevel = this.level = arg0;
        this.x = arg1;
    }
}
