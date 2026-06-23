import type IfType from '#/config/IfType.js';
import Linkable from '#/datastruct/Linkable.js';

export default class HookReq extends Linkable {
    drop: IfType | null = null;
    opbase: string | null = null;
    component: IfType | null = null;
    opindex: number = 0;
    keyCode: number = 0;
    mouseY: number = 0;
    keyChar: number = 0;
    mouseX: number = 0;
    field686: boolean = false;
    onop: (number | string | null)[] | null = null;
}
