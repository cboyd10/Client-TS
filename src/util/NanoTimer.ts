import ThreadSleep from '#/util/ThreadSleep.js';
import Timer from '#/util/Timer.js';

export default class NanoTimer extends Timer {
    ntime = performance.now() * 1000000;

    override reset(): void {
        this.ntime = performance.now() * 1000000;
    }

    override async count(mindel: number, deltime: number): Promise<number> {
        const mindelNs = mindel * 1000000;
        let delta = this.ntime - performance.now() * 1000000;
        let loops = 0;
        if (delta < mindelNs) {
            delta = mindelNs;
        }
        await ThreadSleep.sleepPrecise((delta / 1000000) | 0);
        const now = performance.now() * 1000000;
        while (loops < 10 && (loops < 1 || this.ntime < now)) {
            loops++;
            this.ntime += deltime * 1000000;
        }
        if (now > this.ntime) {
            this.ntime = now;
        }
        return loops;
    }
}
