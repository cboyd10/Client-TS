import AnimFrame from '#/dash3d/AnimFrame.js';

import Jagfile from '#/io/Jagfile.js';
import Packet from '#/io/Packet.js';

export default class SeqType {
    static numDefinitions: number = 0;
    static list: SeqType[] = [];

    numFrames: number = 0;
    frames: Int16Array | null = null;
    iframes: Int16Array | null = null;
    delay: Int16Array | null = null;
    loops: number = -1;
    walkmerge: Int32Array | null = null;
    reachforward: boolean = false;
    priority: number = 5;
    replaceheldleft: number = -1;
    replaceheldright: number = -1;
    maxloops: number = 99;

    duration: number = 0;

    static init(config: Jagfile): void {
        const dat: Packet = new Packet(config.read('seq.dat'));

        this.numDefinitions = dat.g2();
        this.list = new Array(this.numDefinitions);

        for (let id: number = 0; id < this.numDefinitions; id++) {
            if (!this.list[id]) {
                this.list[id] = new SeqType();
            }

            this.list[id].decode(dat);
        }
    }

    decode(dat: Packet): void {
        while (true) {
            const code = dat.g1();
            if (code === 0) {
                break;
            }

            if (code === 1) {
                this.numFrames = dat.g1();
                this.frames = new Int16Array(this.numFrames);
                this.iframes = new Int16Array(this.numFrames);
                this.delay = new Int16Array(this.numFrames);

                for (let i: number = 0; i < this.numFrames; i++) {
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
                this.reachforward = true;
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

        if (this.numFrames === 0) {
            this.numFrames = 1;

            this.frames = new Int16Array(1);
            this.frames[0] = -1;

            this.iframes = new Int16Array(1);
            this.iframes[0] = -1;

            this.delay = new Int16Array(1);
            this.delay[0] = -1;
        }
    }
}
