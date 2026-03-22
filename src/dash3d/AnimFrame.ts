import AnimBase, { AnimTransform } from '#/dash3d/AnimBase.js';

import JagFile from '#/io/JagFile.js';
import Packet from '#/io/Packet.js';

export default class AnimFrame {
    static list: AnimFrame[] = [];

    delay: number = 0;
    base: AnimBase | null = null;
    size: number = 0;
    ti: Int32Array | null = null; // transform index
    tx: Int32Array | null = null; // transform x
    ty: Int32Array | null = null; // transform y
    tz: Int32Array | null = null; // transform z

    static init(models: JagFile): void {
        const head: Packet = new Packet(models.read('frame_head.dat'));
        const tran1: Packet = new Packet(models.read('frame_tran1.dat'));
        const tran2: Packet = new Packet(models.read('frame_tran2.dat'));
        const del: Packet = new Packet(models.read('frame_del.dat'));

        const total: number = head.g2();
        head.pos += 2; // const count = head.g2();

        const tempTi: Int32Array = new Int32Array(500);
        const tempTx: Int32Array = new Int32Array(500);
        const tempTy: Int32Array = new Int32Array(500);
        const tempTz: Int32Array = new Int32Array(500);

        for (let i: number = 0; i < total; i++) {
            const id: number = head.g2();

            const frame: AnimFrame = (this.list[id] = new AnimFrame());
            frame.delay = del.g1();

            const baseId: number = head.g2();
            const base: AnimBase = AnimBase.list[baseId];
            frame.base = base;

            const groupCount: number = head.g1();
            let lastGroup: number = -1;
            let current: number = 0;

            for (let j: number = 0; j < groupCount; j++) {
                if (!base.type) {
                    throw new Error();
                }

                const flags: number = tran1.g1();
                if (flags > 0) {
                    if (base.type[j] !== 0) {
                        for (let group: number = j - 1; group > lastGroup; group--) {
                            if (base.type[group] === 0) {
                                tempTi[current] = group;
                                tempTx[current] = 0;
                                tempTy[current] = 0;
                                tempTz[current] = 0;
                                current++;
                                break;
                            }
                        }
                    }

                    tempTi[current] = j;

                    let defaultValue: number = 0;
                    if (base.type[tempTi[current]] === AnimTransform.SCALE) {
                        defaultValue = 128;
                    }

                    if ((flags & 0x1) === 0) {
                        tempTx[current] = defaultValue;
                    } else {
                        tempTx[current] = tran2.gsmarts();
                    }

                    if ((flags & 0x2) === 0) {
                        tempTy[current] = defaultValue;
                    } else {
                        tempTy[current] = tran2.gsmarts();
                    }

                    if ((flags & 0x4) === 0) {
                        tempTz[current] = defaultValue;
                    } else {
                        tempTz[current] = tran2.gsmarts();
                    }

                    lastGroup = j;
                    current++;
                }
            }

            frame.size = current;
            frame.ti = new Int32Array(current);
            frame.tx = new Int32Array(current);
            frame.ty = new Int32Array(current);
            frame.tz = new Int32Array(current);

            for (let j: number = 0; j < current; j++) {
                frame.ti[j] = tempTi[j];
                frame.tx[j] = tempTx[j];
                frame.ty[j] = tempTy[j];
                frame.tz[j] = tempTz[j];
            }
        }
    }
}
