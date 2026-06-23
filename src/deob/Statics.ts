export default class Statics {
    static readonly field224: number[] = [
        0, 0, 0, 0, 8, 0, -1, 0, 0, 0, 2, 3, -2, 0, 0, 0, -1, -2, 0, -2, 0, -2, 24, 0, 0, 7, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 5, -2, 2, 0, 0, 0, 0, 0, 0, 14, 0, 0, 0, 8, -1, 0, 1, 0, 0, 0, 6, 0, -1, 2, 0,
        10, 0, -2, 0, 0, 0, 0, 1, 0, 3, 0, 2, 5, 0, 0, 0, 0, 0, 0, 6, 0, 0, 5, 4, -1, 0, 0, 0, 0, 0, 0, 20, 0, -2, 0, 0, 5, 3, 0, -2, -1, 0, 0, 10, 0, 0, 15, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, -2, 7, 0, 0, 0, 10, 0, 0, 0, 0, 0, 0, 12, 1, 0, 5, 15, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 2, 0, 0, 0, 0, 0, 0, 0, 4, -1, 6, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 2, 0, -2, -1, -2, 4, 0, 5, 6, 0, 0, 0, 0, 4, 3, 0, 4, 0, 0, -1, 6, -1, 0, 0, 0, 0, 0, 0, 0, 9, -2, 0, 0, 0, 0, 0, 6, 6, 6, 6, 0, 0, 0, 0, 0, -2, 7,
        0, 7, -1, 0, -1, 0, 3, 0, 8, 0, 2, 4, 4, 8, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0
    ];
    static field2920: Int32Array | null = null;
    static field1734: Int32Array | null = null;

    static method740(): void {
        if (Statics.field1734 !== null && Statics.field2920 !== null) {
            return;
        }
        Statics.field1734 = new Int32Array(256);
        Statics.field2920 = new Int32Array(256);
        for (let var0 = 0; var0 < 256; var0++) {
            const var1 = (var0 / 255.0) * 6.283185307179586;
            Statics.field1734[var0] = (Math.sin(var1) * 4096.0) | 0;
            Statics.field2920[var0] = (Math.cos(var1) * 4096.0) | 0;
        }
    }

    static method1080(arg0: number, arg1: number): number {
        const var2 = (arg1 - 1) & (arg0 >> 31);
        return (var2 + ((arg0 + (arg0 >>> 31)) % arg1)) | 0;
    }

    static method812(arg0: number, arg1: { nextInt(): number }): number {
        if (arg0 <= 0) {
            throw new Error();
        } else if (Statics.method1017(arg0)) {
            return Number((BigInt(arg1.nextInt() >>> 0) * BigInt(arg0)) >> 32n);
        } else {
            const var2 = (-2147483648 - Number(4294967296n % BigInt(arg0))) | 0;
            let var3: number;
            do {
                var3 = arg1.nextInt();
            } while (var2 <= var3);
            return Statics.method1080(var3, arg0);
        }
    }

    static method1017(arg0: number): boolean {
        return ((-arg0 & arg0) | 0) === arg0;
    }
}
