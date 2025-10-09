import { ConfigType } from '#/config/ConfigType.js';

import AnimFrame from '#/dash3d/AnimFrame.js';

import Jagfile from '#/io/Jagfile.js';
import Packet from '#/io/Packet.js';

export default class SeqType extends ConfigType {
    static count: number = 0;
    static types: SeqType[] = [];

    frameCount: number = 0;
    frames: Int16Array | null = null;
    iframes: Int16Array | null = null;
    delay: Int16Array | null = null;
    loops: number = -1;
    walkmerge: Int32Array | null = null;
    stretches: boolean = false;
    priority: number = 5;
    replaceheldleft: number = -1;
    replaceheldright: number = -1;
    maxloops: number = 99;
    duration: number = 0;

    static unpack(config: Jagfile): void {
        const dat: Packet = new Packet(config.read('seq.dat'));

        this.count = dat.g2();
        this.types = new Array(this.count);

        for (let id: number = 0; id < this.count; id++) {
            if (!this.types[id]) {
                this.types[id] = new SeqType(id);
            }

            const seq = this.types[id].unpackType(dat);

            if (seq.frameCount === 0) {
                seq.frameCount = 1;

                seq.frames = new Int16Array(1);
                seq.frames[0] = -1;

                seq.iframes = new Int16Array(1);
                seq.iframes[0] = -1;

                seq.delay = new Int16Array(1);
                seq.delay[0] = -1;
            }

            this.types[id] = seq;
        }
    }

    unpack(code: number, dat: Packet): void {
        if (code === 1) {
            this.frameCount = dat.g1();
            this.frames = new Int16Array(this.frameCount);
            this.iframes = new Int16Array(this.frameCount);
            this.delay = new Int16Array(this.frameCount);

            for (let i: number = 0; i < this.frameCount; i++) {
                this.frames[i] = dat.g2();

                this.iframes[i] = dat.g2();
                if (this.iframes[i] === 65535) {
                    this.iframes[i] = -1;
                }

                this.delay[i] = dat.g2();
                if (this.delay[i] === 0) {
                    this.delay[i] = AnimFrame.instances[this.frames[i]].delay;
                }

                if (this.delay[i] === 0) {
                    this.delay[i] = 1;
                }

                this.duration += this.delay[i];
            }
        } else if (code === 2) {
            this.loops = dat.g2();
        } else if (code === 3) {
            const count: number = dat.g1();
            this.walkmerge = new Int32Array(count + 1);

            for (let i: number = 0; i < count; i++) {
                this.walkmerge[i] = dat.g1();
            }

            this.walkmerge[count] = 9999999;
        } else if (code === 4) {
            this.stretches = true;
        } else if (code === 5) {
            this.priority = dat.g1();
        } else if (code === 6) {
            this.replaceheldleft = dat.g2();
        } else if (code === 7) {
            this.replaceheldright = dat.g2();
        } else if (code === 8) {
            this.maxloops = dat.g1();
        } else {
            console.log('Error unrecognised seq config code: ', code);
        }
    }
}
