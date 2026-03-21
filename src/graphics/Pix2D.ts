import Linkable2 from '#/datastruct/Linkable2.js';

export default class Pix2D extends Linkable2 {
    static pixels: Int32Array = new Int32Array();

    static width: number = 0;
    static height: number = 0;

    static clipMinX: number = 0;
    static clipMaxX: number = 0;
    static clipMinY: number = 0;
    static right: number = 0;

    static sizeX: number = 0;
    static maxX: number = 0;
    static maxY: number = 0;

    static setPixels(pixels: Int32Array, width: number, height: number): void {
        this.pixels = pixels;
        this.width = width;
        this.height = height;
        this.setClipping(0, 0, width, height);
    }

    static resetClipping(): void {
        this.clipMinY = 0;
        this.clipMinX = 0;
        this.right = this.width;
        this.clipMaxX = this.height;
        this.sizeX = this.right - 1;
        this.maxX = (this.right / 2) | 0;
    }

    static setClipping(left: number, top: number, right: number, bottom: number): void {
        if (left < 0) {
            left = 0;
        }

        if (top < 0) {
            top = 0;
        }

        if (right > this.width) {
            right = this.width;
        }

        if (bottom > this.height) {
            bottom = this.height;
        }

        this.clipMinX = top;
        this.clipMaxX = bottom;
        this.clipMinY = left;
        this.right = right;
        this.sizeX = this.right - 1;
        this.maxX = (this.right / 2) | 0;
        this.maxY = (this.clipMaxX / 2) | 0;
    }

    static cls(): void {
        const len: number = this.width * this.height;
        for (let i: number = 0; i < len; i++) {
            this.pixels[i] = 0;
        }
    }

    static fillRectTrans(x: number, y: number, width: number, height: number, rgb: number, alpha: number): void {
        if (x < this.clipMinY) {
            width -= this.clipMinY - x;
            x = this.clipMinY;
        }

        if (y < this.clipMinX) {
            height -= this.clipMinX - y;
            y = this.clipMinX;
        }

        if (x + width > this.right) {
            width = this.right - x;
        }

        if (y + height > this.clipMaxX) {
            height = this.clipMaxX - y;
        }

        const invAlpha: number = 256 - alpha;
        const r0: number = ((rgb >> 16) & 0xff) * alpha;
        const g0: number = ((rgb >> 8) & 0xff) * alpha;
        const b0: number = (rgb & 0xff) * alpha;
        const step: number = this.width - width;
        let offset: number = x + y * this.width;
        for (let i: number = 0; i < height; i++) {
            for (let j: number = -width; j < 0; j++) {
                const r1: number = ((this.pixels[offset] >> 16) & 0xff) * invAlpha;
                const g1: number = ((this.pixels[offset] >> 8) & 0xff) * invAlpha;
                const b1: number = (this.pixels[offset] & 0xff) * invAlpha;
                const color: number = (((r0 + r1) >> 8) << 16) + (((g0 + g1) >> 8) << 8) + ((b0 + b1) >> 8);
                this.pixels[offset++] = color;
            }
            offset += step;
        }
    }

    static fillRect(x: number, y: number, width: number, height: number, color: number): void {
        if (x < this.clipMinY) {
            width -= this.clipMinY - x;
            x = this.clipMinY;
        }

        if (y < this.clipMinX) {
            height -= this.clipMinX - y;
            y = this.clipMinX;
        }

        if (x + width > this.right) {
            width = this.right - x;
        }

        if (y + height > this.clipMaxX) {
            height = this.clipMaxX - y;
        }

        const step: number = this.width - width;
        let offset: number = x + y * this.width;
        for (let i: number = -height; i < 0; i++) {
            for (let j: number = -width; j < 0; j++) {
                this.pixels[offset++] = color;
            }

            offset += step;
        }
    }

    static drawRect(x: number, y: number, w: number, h: number, color: number): void {
        this.hline(x, y, color, w);
        this.hline(x, y + h - 1, color, w);
        this.vline(x, y, color, h);
        this.vline(x + w - 1, y, color, h);
    }

    static hline(x: number, y: number, color: number, width: number): void {
        if (y < this.clipMinX || y >= this.clipMaxX) {
            return;
        }

        if (x < this.clipMinY) {
            width -= this.clipMinY - x;
            x = this.clipMinY;
        }

        if (x + width > this.right) {
            width = this.right - x;
        }

        const off: number = x + y * this.width;
        for (let i: number = 0; i < width; i++) {
            this.pixels[off + i] = color;
        }
    }

    static vline(x: number, y: number, color: number, height: number): void {
        if (x < this.clipMinY || x >= this.right) {
            return;
        }

        if (y < this.clipMinX) {
            height -= this.clipMinX - y;
            y = this.clipMinX;
        }

        if (y + height > this.clipMaxX) {
            height = this.clipMaxX - y;
        }

        const off: number = x + y * this.width;
        for (let i: number = 0; i < height; i++) {
            this.pixels[off + i * this.width] = color;
        }
    }

    static drawLine(x1: number, y1: number, x2: number, y2: number, color: number): void {
        const dx: number = Math.abs(x2 - x1);
        const dy: number = Math.abs(y2 - y1);

        const sx: number = x1 < x2 ? 1 : -1;
        const sy: number = y1 < y2 ? 1 : -1;

        let err: number = dx - dy;

        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (x1 >= this.clipMinY && x1 < this.right && y1 >= this.clipMinX && y1 < this.clipMaxX) {
                this.pixels[x1 + y1 * this.width] = color;
            }

            if (x1 === x2 && y1 === y2) {
                break;
            }

            const e2: number = 2 * err;

            if (e2 > -dy) {
                err = err - dy;
                x1 = x1 + sx;
            }

            if (e2 < dx) {
                err = err + dx;
                y1 = y1 + sy;
            }
        }
    }

    static fillCircle(xCenter: number, yCenter: number, yRadius: number, rgb: number, alpha: number): void {
        const invAlpha: number = 256 - alpha;
        const r0: number = ((rgb >> 16) & 0xff) * alpha;
        const g0: number = ((rgb >> 8) & 0xff) * alpha;
        const b0: number = (rgb & 0xff) * alpha;

        let yStart: number = yCenter - yRadius;
        if (yStart < 0) {
            yStart = 0;
        }

        let yEnd: number = yCenter + yRadius;
        if (yEnd >= this.height) {
            yEnd = this.height - 1;
        }

        for (let y: number = yStart; y <= yEnd; y++) {
            const midpoint: number = y - yCenter;
            const xRadius: number = Math.sqrt(yRadius * yRadius - midpoint * midpoint) | 0;

            let xStart: number = xCenter - xRadius;
            if (xStart < 0) {
                xStart = 0;
            }

            let xEnd: number = xCenter + xRadius;
            if (xEnd >= this.width) {
                xEnd = this.width - 1;
            }

            let offset: number = xStart + y * this.width;
            for (let x: number = xStart; x <= xEnd; x++) {
                const r1: number = ((this.pixels[offset] >> 16) & 0xff) * invAlpha;
                const g1: number = ((this.pixels[offset] >> 8) & 0xff) * invAlpha;
                const b1: number = (this.pixels[offset] & 0xff) * invAlpha;
                const color: number = (((r0 + r1) >> 8) << 16) + (((g0 + g1) >> 8) << 8) + ((b0 + b1) >> 8);
                this.pixels[offset++] = color;
            }
        }
    }
}
