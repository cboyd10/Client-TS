export default abstract class Timer {
    static async create(): Promise<Timer> {
        try {
            const NanoTimer = (await import('#/util/NanoTimer.js')).default;
            return new NanoTimer();
        } catch (e) {
            const MillisTimer = (await import('#/util/MillisTimer.js')).default;
            return new MillisTimer();
        }
    }

    abstract count(mindel: number, deltime: number): Promise<number>;

    abstract reset(): void;
}
