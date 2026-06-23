export default class GameCanvas {
    readonly field1198: { update: (arg0: unknown) => void; paint: (arg0: unknown) => void };

    constructor(arg0: { update: (arg0: unknown) => void; paint: (arg0: unknown) => void }) {
        this.field1198 = arg0;
    }

    update(arg0: unknown): void {
        this.field1198.update(arg0);
    }

    paint(arg0: unknown): void {
        this.field1198.paint(arg0);
    }
}
