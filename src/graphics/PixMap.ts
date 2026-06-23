import Pix2D from '#/graphics/Pix2D.js';

export default class PixMap {
    data: Int32Array;
    width: number;
    height: number;
    image: ImageData | null;

    protected ctx: CanvasRenderingContext2D;
    protected paint: Uint32Array;

    constructor(
        width: number = 0,
        height: number = 0,
        ctx: CanvasRenderingContext2D = (document.getElementById('canvas') as HTMLCanvasElement).getContext('2d', {
            alpha: false
        }) as CanvasRenderingContext2D
    ) {
        this.data = new Int32Array(0);
        this.width = 0;
        this.height = 0;
        this.ctx = ctx;
        this.image = null;
        this.paint = new Uint32Array(0);
        if (width === 0 || height === 0) {
            return;
        }
        this.width = width;
        this.height = height;
        this.data = new Int32Array(width * height);

        this.image = this.ctx.createImageData(width, height);
        this.paint = new Uint32Array(this.image.data.buffer);

        this.bind();
    }

    static method1259(width: number, _component: unknown, height: number): PixMap {
        return new PixMap(width, height);
    }

    bind(): void {
        Pix2D.setPixels(this.data, this.width, this.height);
    }

    create(height: number, width: number, _component?: unknown): void {
        this.width = width;
        this.height = height;
        this.data = new Int32Array(width * height);
        this.image = this.ctx.createImageData(width, height);
        this.paint = new Uint32Array(this.image.data.buffer);
        this.bind();
    }

    draw(x: number, y: number): void {
        if (!this.image) {
            return;
        }
        const data = this.data;
        const paint = this.paint;
        const len = data.length;

        let i = 0;
        const unroll = len - (len % 4);

        for (; i < unroll; i += 4) {
            const p0 = data[i];
            const p1 = data[i + 1];
            const p2 = data[i + 2];
            const p3 = data[i + 3];

            paint[i] = ((p0 & 0xff0000) >> 16) | (p0 & 0xff00) | ((p0 & 0xff) << 16) | 0xff000000;
            paint[i + 1] = ((p1 & 0xff0000) >> 16) | (p1 & 0xff00) | ((p1 & 0xff) << 16) | 0xff000000;
            paint[i + 2] = ((p2 & 0xff0000) >> 16) | (p2 & 0xff00) | ((p2 & 0xff) << 16) | 0xff000000;
            paint[i + 3] = ((p3 & 0xff0000) >> 16) | (p3 & 0xff00) | ((p3 & 0xff) << 16) | 0xff000000;
        }

        for (; i < len; i++) {
            const pixel = data[i];
            paint[i] = ((pixel & 0xff0000) >> 16) | (pixel & 0xff00) | ((pixel & 0xff) << 16) | 0xff000000;
        }
        this.ctx.putImageData(this.image, x, y);
    }
}
