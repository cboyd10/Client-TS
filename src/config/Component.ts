import JagFile from '#/io/JagFile.js';
import Packet from '#/io/Packet.js';

import Model from '#/dash3d/Model.js';
import PixFont from '#/graphics/PixFont.js';

import LruCache from '#/datastruct/LruCache.js';
import JString from '#/datastruct/JString.js';

import Pix2D from '#/graphics/Pix2D.js';
import Pix32 from '#/graphics/Pix32.js';

import { TypedArray1d } from '#/util/Arrays.js';

export const enum ComponentType {
    TYPE_LAYER = 0,
    TYPE_UNUSED = 1, // TODO
    TYPE_INV = 2,
    TYPE_RECT = 3,
    TYPE_TEXT = 4,
    TYPE_GRAPHIC = 5,
    TYPE_MODEL = 6,
    TYPE_INV_TEXT = 7,
};

export const enum ButtonType {
    BUTTON_OK = 1,
    BUTTON_TARGET = 2,
    BUTTON_CLOSE = 3,
    BUTTON_TOGGLE = 4,
    BUTTON_SELECT = 5,
    BUTTON_CONTINUE = 6,
};

export default class Component {
    static types: Component[] = [];
    invSlotObjId: Int32Array | null = null;
    invSlotObjCount: Int32Array | null = null;
    seqFrame: number = 0;
    seqCycle: number = 0;
    id: number = -1;
    layer: number = -1;
    type: number = -1;
    buttonType: number = -1;
    clientCode: number = 0;
    width: number = 0;
    height: number = 0;
    x: number = 0;
    y: number = 0;
    scripts: (Uint16Array | null)[] | null = null;
    scriptComparator: Uint8Array | null = null;
    scriptOperand: Uint16Array | null = null;
    overlayer: number = -1;
    scroll: number = 0;
    scrollPosition: number = 0;
    hide: boolean = false;
    children: number[] | null = null;
    activeModel: Model | null = null;
    anim: number = -1;
    activeAnim: number = -1;
    zoom: number = 0;
    xan: number = 0;
    yan: number = 0;
    targetVerb: string | null = null;
    targetText: string | null = null;
    targetMask: number = -1;
    option: string | null = null;
    static imageCache: LruCache<Pix32> | null = null;
    static modelCache: LruCache<Model> | null = null;
    marginX: number = 0;
    marginY: number = 0;
    colour: number = 0;
    activeColour: number = 0;
    overColour: number = 0;
    model: Model | null = null;
    graphic: Pix32 | null = null;
    activeGraphic: Pix32 | null = null;
    font: PixFont | null = null;
    text: string | null = null;
    activeText: string | null = null;
    draggable: boolean = false;
    interactable: boolean = false;
    usable: boolean = false;
    fill: boolean = false;
    center: boolean = false;
    shadowed: boolean = false;
    invSlotOffsetX: Int16Array | null = null;
    invSlotOffsetY: Int16Array | null = null;
    childX: number[] | null = null;
    childY: number[] | null = null;
    invSlotGraphic: (Pix32 | null)[] | null = null;
    iop: (string | null)[] | null = null;

    static unpack(interfaces: JagFile, media: JagFile, fonts: PixFont[]): void {
        this.imageCache = new LruCache(50000);
        this.modelCache = new LruCache(50000);

        const data: Packet = new Packet(interfaces.read('data'));
        let layer: number = -1;

        const count = data.g2();
        this.types = new Array(count);

        while (data.pos < data.length) {
            let id: number = data.g2();
            if (id === 65535) {
                layer = data.g2();
                id = data.g2();
            }

            const com: Component = (this.types[id] = new Component());
            com.id = id;
            com.layer = layer;
            com.type = data.g1();
            com.buttonType = data.g1();
            com.clientCode = data.g2();
            com.width = data.g2();
            com.height = data.g2();

            com.overlayer = data.g1();
            if (com.overlayer === 0) {
                com.overlayer = -1;
            } else {
                com.overlayer = ((com.overlayer - 1) << 8) + data.g1();
            }

            const comparatorCount: number = data.g1();
            if (comparatorCount > 0) {
                com.scriptComparator = new Uint8Array(comparatorCount);
                com.scriptOperand = new Uint16Array(comparatorCount);

                for (let i: number = 0; i < comparatorCount; i++) {
                    com.scriptComparator[i] = data.g1();
                    com.scriptOperand[i] = data.g2();
                }
            }

            const scriptCount: number = data.g1();
            if (scriptCount > 0) {
                com.scripts = new TypedArray1d(scriptCount, null);

                for (let i: number = 0; i < scriptCount; i++) {
                    const opcodeCount: number = data.g2();

                    const script: Uint16Array = new Uint16Array(opcodeCount);
                    com.scripts[i] = script;
                    for (let j: number = 0; j < opcodeCount; j++) {
                        script[j] = data.g2();
                    }
                }
            }

            if (com.type === ComponentType.TYPE_LAYER) {
                com.scroll = data.g2();
                com.hide = data.g1() === 1;

                const childCount: number = data.g1();
                com.children = new Array(childCount);
                com.childX = new Array(childCount);
                com.childY = new Array(childCount);

                for (let i: number = 0; i < childCount; i++) {
                    com.children[i] = data.g2();
                    com.childX[i] = data.g2b();
                    com.childY[i] = data.g2b();
                }
            }

            if (com.type === ComponentType.TYPE_UNUSED) {
                data.pos += 3;
            }

            if (com.type === ComponentType.TYPE_INV) {
                com.invSlotObjId = new Int32Array(com.width * com.height);
                com.invSlotObjCount = new Int32Array(com.width * com.height);

                com.draggable = data.g1() === 1;
                com.interactable = data.g1() === 1;
                com.usable = data.g1() === 1;
                com.marginX = data.g1();
                com.marginY = data.g1();

                com.invSlotOffsetX = new Int16Array(20);
                com.invSlotOffsetY = new Int16Array(20);
                com.invSlotGraphic = new TypedArray1d(20, null);

                for (let i: number = 0; i < 20; i++) {
                    if (data.g1() === 1) {
                        com.invSlotOffsetX[i] = data.g2b();
                        com.invSlotOffsetY[i] = data.g2b();

                        const graphic: string = data.gjstr();
                        if (graphic.length > 0) {
                            const spriteIndex: number = graphic.lastIndexOf(',');
                            com.invSlotGraphic[i] = this.getImage(media, graphic.substring(0, spriteIndex), parseInt(graphic.substring(spriteIndex + 1)));
                        }
                    }
                }

                com.iop = new TypedArray1d(5, null);
                for (let i: number = 0; i < 5; i++) {
                    com.iop[i] = data.gjstr();
                    if (com.iop[i]!.length === 0) {
                        com.iop[i] = null;
                    }
                }
            }

            if (com.type === ComponentType.TYPE_RECT) {
                com.fill = data.g1() === 1;
            }

            if (com.type === ComponentType.TYPE_TEXT || com.type === ComponentType.TYPE_UNUSED) {
                com.center = data.g1() === 1;
                const font: number = data.g1();
                if (fonts) {
                    com.font = fonts[font];
                }
                com.shadowed = data.g1() === 1;
            }

            if (com.type === ComponentType.TYPE_TEXT) {
                com.text = data.gjstr();
                com.activeText = data.gjstr();
            }

            if (com.type === ComponentType.TYPE_UNUSED || com.type === ComponentType.TYPE_RECT || com.type === ComponentType.TYPE_TEXT) {
                com.colour = data.g4();
            }

            if (com.type === ComponentType.TYPE_RECT || com.type === ComponentType.TYPE_TEXT) {
                com.activeColour = data.g4();
                com.overColour = data.g4();
            }

            if (com.type === ComponentType.TYPE_GRAPHIC) {
                const graphic: string = data.gjstr();
                if (graphic.length > 0) {
                    const index: number = graphic.lastIndexOf(',');
                    com.graphic = this.getImage(media, graphic.substring(0, index), parseInt(graphic.substring(index + 1), 10));
                }
                const activeGraphic: string = data.gjstr();
                if (activeGraphic.length > 0) {
                    const index: number = activeGraphic.lastIndexOf(',');
                    com.activeGraphic = this.getImage(media, activeGraphic.substring(0, index), parseInt(activeGraphic.substring(index + 1), 10));
                }
            }

            if (com.type === ComponentType.TYPE_MODEL) {
                const model: number = data.g1();
                if (model !== 0) {
                    com.model = this.getModel(((model - 1) << 8) + data.g1());
                }

                const activeModel: number = data.g1();
                if (activeModel !== 0) {
                    com.activeModel = this.getModel(((activeModel - 1) << 8) + data.g1());
                }

                com.anim = data.g1();
                if (com.anim === 0) {
                    com.anim = -1;
                } else {
                    com.anim = ((com.anim - 1) << 8) + data.g1();
                }

                com.activeAnim = data.g1();
                if (com.activeAnim === 0) {
                    com.activeAnim = -1;
                } else {
                    com.activeAnim = ((com.activeAnim - 1) << 8) + data.g1();
                }

                com.zoom = data.g2();
                com.xan = data.g2();
                com.yan = data.g2();
            }

            if (com.type === ComponentType.TYPE_INV_TEXT) {
                com.invSlotObjId = new Int32Array(com.width * com.height);
                com.invSlotObjCount = new Int32Array(com.width * com.height);

                com.center = data.g1() === 1;
                const font: number = data.g1();
                if (fonts) {
                    com.font = fonts[font];
                }
                com.shadowed = data.g1() === 1;
                com.colour = data.g4();
                com.marginX = data.g2b();
                com.marginY = data.g2b();
                com.interactable = data.g1() === 1;

                com.iop = new TypedArray1d(5, null);
                for (let i: number = 0; i < 5; i++) {
                    com.iop[i] = data.gjstr();
                    if (com.iop[i]!.length === 0) {
                        com.iop[i] = null;
                    }
                }
            }

            if (com.buttonType === ButtonType.BUTTON_TARGET || com.type === ComponentType.TYPE_INV) {
                com.targetVerb = data.gjstr();
                com.targetText = data.gjstr();
                com.targetMask = data.g2();
            }

            if (com.buttonType === ButtonType.BUTTON_OK || com.buttonType === ButtonType.BUTTON_TOGGLE || com.buttonType === ButtonType.BUTTON_SELECT || com.buttonType === ButtonType.BUTTON_CONTINUE) {
                com.option = data.gjstr();

                if (com.option.length === 0) {
                    if (com.buttonType === ButtonType.BUTTON_OK) {
                        com.option = 'Ok';
                    } else if (com.buttonType === ButtonType.BUTTON_TOGGLE) {
                        com.option = 'Select';
                    } else if (com.buttonType === ButtonType.BUTTON_SELECT) {
                        com.option = 'Select';
                    } else if (com.buttonType === ButtonType.BUTTON_CONTINUE) {
                        com.option = 'Continue';
                    }
                }
            }
        }

        this.imageCache = null;
        this.modelCache = null;
    }

    private static getImage(media: JagFile, sprite: string, spriteId: number): Pix32 | null {
        const uid: bigint = (JString.hashCode(sprite) << 8n) | BigInt(spriteId);
        if (this.imageCache) {
            const image: Pix32 | null = this.imageCache.find(uid) as Pix32 | null;
            if (image) {
                return image;
            }
        }

        let image: Pix32;
        try {
            image = Pix32.depack(media, sprite, spriteId);
            this.imageCache?.put(uid, image);
        } catch (e) {
            return null;
        }
        return image;
    }

    private static getModel(id: number): Model {
        if (this.modelCache) {
            const model: Model | null = this.modelCache.find(BigInt(id)) as Model | null;
            if (model) {
                return model;
            }
        }
        const model: Model = Model.load(id);
        this.modelCache?.put(BigInt(id), model);
        return model;
    }

    getModel(primaryFrame: number, secondaryFrame: number, active: boolean): Model | null {
        let model: Model | null = this.model;
        if (active) {
            model = this.activeModel;
        }

        if (!model) {
            return null;
        }

        if (primaryFrame === -1 && secondaryFrame === -1 && !model.faceColour) {
            return model;
        }

        const tmp: Model = Model.copyForAnim(model, true, true, false);
        if (primaryFrame !== -1 || secondaryFrame !== -1) {
            tmp.prepareAnim();
        }

        if (primaryFrame !== -1) {
            tmp.animate(primaryFrame);
        }

        if (secondaryFrame !== -1) {
            tmp.animate(secondaryFrame);
        }

        tmp.calculateNormals(64, 768, -50, -10, -50, true);
        return tmp;
    }

    getAbsoluteX(): number {
        if (this.layer === this.id) {
            return this.x;
        }

        let parent: Component = Component.types[this.layer];
        if (!parent.children || !parent.childX || !parent.childY) {
            return this.x;
        }

        let childIndex: number = parent.children.indexOf(this.id);
        if (childIndex === -1) {
            return this.x;
        }

        let x: number = parent.childX[childIndex];
        while (parent.layer !== parent.id) {
            const grandParent: Component = Component.types[parent.layer];
            if (grandParent.children && grandParent.childX && grandParent.childY) {
                childIndex = grandParent.children.indexOf(parent.id);
                if (childIndex !== -1) {
                    x += grandParent.childX[childIndex];
                }
            }
            parent = grandParent;
        }

        return x;
    }

    getAbsoluteY(): number {
        if (this.layer === this.id) {
            return this.y;
        }

        let parent: Component = Component.types[this.layer];
        if (!parent.children || !parent.childX || !parent.childY) {
            return this.y;
        }

        let childIndex: number = parent.children.indexOf(this.id);
        if (childIndex === -1) {
            return this.y;
        }

        let y: number = parent.childY[childIndex];
        while (parent.layer !== parent.id) {
            const grandParent: Component = Component.types[parent.layer];
            if (grandParent.children && grandParent.childX && grandParent.childY) {
                childIndex = grandParent.children.indexOf(parent.id);
                if (childIndex !== -1) {
                    y += grandParent.childY[childIndex];
                }
            }
            parent = grandParent;
        }

        return y;
    }

    outline(color: number): void {
        const x: number = this.getAbsoluteX();
        const y: number = this.getAbsoluteY();
        Pix2D.drawRect(x, y, this.width, this.height, color);
    }

    move(x: number, y: number): void {
        if (this.layer === this.id) {
            return;
        }

        this.x = 0;
        this.y = 0;

        const parent: Component = Component.types[this.layer];

        if (parent.children && parent.childX && parent.childY) {
            const childIndex: number = parent.children.indexOf(this.id);

            if (childIndex !== -1) {
                parent.childX[childIndex] = x;
                parent.childY[childIndex] = y;
            }
        }
    }

    delete(): void {
        if (this.layer === this.id) {
            return;
        }

        const parent: Component = Component.types[this.layer];

        if (parent.children && parent.childX && parent.childY) {
            const childIndex: number = parent.children.indexOf(this.id);

            if (childIndex !== -1) {
                parent.children.splice(childIndex, 1);
                parent.childX.splice(childIndex, 1);
                parent.childY.splice(childIndex, 1);
            }
        }
    }
}
