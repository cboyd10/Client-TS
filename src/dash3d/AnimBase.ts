import Linkable from '#/datastruct/Linkable.js';
import Packet from '#/io/Packet.js';

export default class AnimBase extends Linkable {
    readonly type: Int32Array;
    readonly field1410: boolean[];
    readonly id: number;
    readonly size: number;
    readonly labels: Int32Array[];

    constructor(arg0: number, arg1: Uint8Array) {
        super();
        this.id = arg0;
        const var3 = new Packet(arg1);
        this.size = var3.g1();

        this.field1410 = new Array(this.size).fill(false);
        this.type = new Int32Array(this.size);
        this.labels = new Array(this.size);

        for (let var4 = 0; var4 < this.size; var4++) {
            this.type[var4] = var3.g1();
        }

        for (let var5 = 0; var5 < this.size; var5++) {
            this.field1410[var5] = var3.g1() === 1;
        }

        for (let var6 = 0; var6 < this.size; var6++) {
            this.labels[var6] = new Int32Array(var3.g1());
        }

        for (let var7 = 0; var7 < this.size; var7++) {
            for (let var8 = 0; var8 < this.labels[var7].length; var8++) {
                this.labels[var7][var8] = var3.g1();
            }
        }
    }
}
