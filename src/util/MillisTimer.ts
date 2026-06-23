import MonotonicTime from '#/util/MonotonicTime.js';
import ThreadSleep from '#/util/ThreadSleep.js';
import Timer from '#/util/Timer.js';

export default class MillisTimer extends Timer {
    readonly otim: number[] = new Array(10);
    ratio = 256;
    delta = 1;
    ntime = MonotonicTime.currentTime();
    countValue = 0; // todo: count
    opos = 0;

    constructor() {
        super();
        for (let i = 0; i < 10; i++) {
            this.otim[i] = this.ntime;
        }
    }

    override reset(): void {
        for (let i = 0; i < 10; i++) {
            this.otim[i] = 0;
        }
    }

    override async count(mindel: number, deltime: number): Promise<number> {
        const lastRatio = this.ratio;
        this.ratio = 300;
        const lastDelta = this.delta;
        this.delta = 1;
        this.ntime = MonotonicTime.currentTime();
        if (this.otim[this.opos] === 0) {
            this.delta = lastDelta;
            this.ratio = lastRatio;
        } else if (this.otim[this.opos] < this.ntime) {
            this.ratio = (Math.imul(deltime, 2560) / (this.ntime - this.otim[this.opos])) | 0;
        }
        if (this.ratio < 25) {
            this.ratio = 25;
        }
        if (this.ratio > 256) {
            this.ratio = 256;
            this.delta = (deltime - (this.ntime - this.otim[this.opos]) / 10) | 0;
        }
        if (this.delta > deltime) {
            this.delta = deltime;
        }
        this.otim[this.opos] = this.ntime;
        this.opos = (this.opos + 1) % 10;
        if (this.delta > 1) {
            for (let var5 = 0; var5 < 10; var5++) {
                if (this.otim[var5] !== 0) {
                    this.otim[var5] += this.delta;
                }
            }
        }
        if (this.delta < mindel) {
            this.delta = mindel;
        }
        let loops = 0;
        await ThreadSleep.sleepPrecise(this.delta);
        while (this.countValue < 256) {
            loops++;
            this.countValue += this.ratio;
        }
        this.countValue &= 0xff;
        return loops;
    }
}
