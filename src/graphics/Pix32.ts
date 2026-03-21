import Pix2D from '#/graphics/Pix2D.js';
import { decodeJpeg } from '#/graphics/Jpeg.js';
import Pix8 from '#/graphics/Pix8.js';

import JagFile from '#/io/JagFile.js';
import Packet from '#/io/Packet.js';

export default class Pix32 extends Pix2D {
    data: Int32Array;
    wi: number;
    hi: number;
    xof: number;
    yof: number;
    owi: number;
    ohi: number;

    constructor(width: number, height: number) {
        super();

        this.data = new Int32Array(width * height);
        this.wi = this.owi = width;
        this.hi = this.ohi = height;
        this.xof = this.yof = 0;
    }

    static async fromJpeg(archive: JagFile, name: string): Promise<Pix32> {
        const dat: Uint8Array | null = archive.read(name + '.dat');
        if (!dat) {
            throw new Error();
        }

        const jpeg: ImageData = await decodeJpeg(dat);
        const image: Pix32 = new Pix32(jpeg.width, jpeg.height);

        const data: Uint32Array = new Uint32Array(jpeg.data.buffer);
        const pixels: Int32Array = image.data;
        for (let i: number = 0; i < pixels.length; i++) {
            const pixel: number = data[i];
            pixels[i] = (((pixel >> 24) & 0xff) << 24) | ((pixel & 0xff) << 16) | (((pixel >> 8) & 0xff) << 8) | ((pixel >> 16) & 0xff);
        }
        return image;
    }

    static depack(archive: JagFile, name: string, sprite: number = 0): Pix32 {
        const dat: Packet = new Packet(archive.read(name + '.dat'));
        const index: Packet = new Packet(archive.read('index.dat'));

        // cropW/cropH are shared across all sprites in a single image
        index.pos = dat.g2();
        const cropW: number = index.g2();
        const cropH: number = index.g2();

        // palette is shared across all images in a single archive
        const paletteCount: number = index.g1();
        const palette: number[] = [];
        const length: number = paletteCount - 1;
        for (let i: number = 0; i < length; i++) {
            // the first color (0) is reserved for transparency
            palette[i + 1] = index.g3();

            // black (0) will become transparent, make it black (1) so it's visible
            if (palette[i + 1] === 0) {
                palette[i + 1] = 1;
            }
        }

        // advance to sprite
        for (let i: number = 0; i < sprite; i++) {
            index.pos += 2;
            dat.pos += index.g2() * index.g2();
            index.pos += 1;
        }

        if (dat.pos > dat.length || index.pos > index.length) {
            throw new Error();
        }

        // read sprite
        const cropX: number = index.g1();
        const cropY: number = index.g1();
        const width: number = index.g2();
        const height: number = index.g2();

        const image: Pix32 = new Pix32(width, height);
        image.xof = cropX;
        image.yof = cropY;
        image.owi = cropW;
        image.ohi = cropH;

        const pixelOrder: number = index.g1();
        if (pixelOrder === 0) {
            const length: number = image.wi * image.hi;
            for (let i: number = 0; i < length; i++) {
                image.data[i] = palette[dat.g1()];
            }
        } else if (pixelOrder === 1) {
            const width: number = image.wi;
            for (let x: number = 0; x < width; x++) {
                const height: number = image.hi;
                for (let y: number = 0; y < height; y++) {
                    image.data[x + y * width] = palette[dat.g1()];
                }
            }
        }

        return image;
    }

    setPixels(): void {
        Pix2D.setPixels(this.data, this.wi, this.hi);
    }

    rgbAdjust(r: number, g: number, b: number): void {
        for (let i: number = 0; i < this.data.length; i++) {
            const rgb: number = this.data[i];

            if (rgb !== 0) {
                let red: number = (rgb >> 16) & 0xff;
                red += r;
                if (red < 1) {
                    red = 1;
                } else if (red > 255) {
                    red = 255;
                }

                let green: number = (rgb >> 8) & 0xff;
                green += g;
                if (green < 1) {
                    green = 1;
                } else if (green > 255) {
                    green = 255;
                }

                let blue: number = rgb & 0xff;
                blue += b;
                if (blue < 1) {
                    blue = 1;
                } else if (blue > 255) {
                    blue = 255;
                }

                this.data[i] = (red << 16) + (green << 8) + blue;
            }
        }
    }

    hflip(): void {
        const pixels: Int32Array = this.data;
        const width: number = this.wi;
        const height: number = this.hi;

        for (let y: number = 0; y < height; y++) {
            const div: number = (width / 2) | 0;
            for (let x: number = 0; x < div; x++) {
                const off1: number = x + y * width;
                const off2: number = width - x - 1 + y * width;

                const tmp: number = pixels[off1];
                pixels[off1] = pixels[off2];
                pixels[off2] = tmp;
            }
        }
    }

    vflip(): void {
        const pixels: Int32Array = this.data;
        const width: number = this.wi;
        const height: number = this.hi;

        for (let y: number = 0; y < ((height / 2) | 0); y++) {
            for (let x: number = 0; x < width; x++) {
                const off1: number = x + y * width;
                const off2: number = x + (height - y - 1) * width;

                const tmp: number = pixels[off1];
                pixels[off1] = pixels[off2];
                pixels[off2] = tmp;
            }
        }
    }

    quickPlotSprite(x: number, y: number): void {
        x |= 0;
        y |= 0;

        x += this.xof;
        y += this.yof;

        let dstOff: number = x + y * Pix2D.width;
        let srcOff: number = 0;

        let h: number = this.hi;
        let w: number = this.wi;

        let dstStep: number = Pix2D.width - w;
        let srcStep: number = 0;

        if (y < Pix2D.clipMinX) {
            const cutoff: number = Pix2D.clipMinX - y;
            h -= cutoff;
            y = Pix2D.clipMinX;
            srcOff += cutoff * w;
            dstOff += cutoff * Pix2D.width;
        }

        if (y + h > Pix2D.clipMaxX) {
            h -= y + h - Pix2D.clipMaxX;
        }

        if (x < Pix2D.clipMinY) {
            const cutoff: number = Pix2D.clipMinY - x;
            w -= cutoff;
            x = Pix2D.clipMinY;
            srcOff += cutoff;
            dstOff += cutoff;
            srcStep += cutoff;
            dstStep += cutoff;
        }

        if (x + w > Pix2D.right) {
            const cutoff: number = x + w - Pix2D.right;
            w -= cutoff;
            srcStep += cutoff;
            dstStep += cutoff;
        }

        if (w > 0 && h > 0) {
            this.plotQuick(w, h, this.data, srcOff, srcStep, Pix2D.pixels, dstOff, dstStep);
        }
    }

    private plotQuick(w: number, h: number, src: Int32Array, srcOff: number, srcStep: number, dst: Int32Array, dstOff: number, dstStep: number): void {
        const qw: number = -(w >> 2);
        w = -(w & 0x3);

        for (let y: number = -h; y < 0; y++) {
            for (let x: number = qw; x < 0; x++) {
                dst[dstOff++] = src[srcOff++];
                dst[dstOff++] = src[srcOff++];
                dst[dstOff++] = src[srcOff++];
                dst[dstOff++] = src[srcOff++];
            }

            for (let x: number = w; x < 0; x++) {
                dst[dstOff++] = src[srcOff++];
            }

            dstOff += dstStep;
            srcOff += srcStep;
        }
    }

    plotSprite(x: number, y: number): void {
        x |= 0;
        y |= 0;

        x += this.xof;
        y += this.yof;

        let dstOff: number = x + y * Pix2D.width;
        let srcOff: number = 0;

        let h: number = this.hi;
        let w: number = this.wi;

        let dstStep: number = Pix2D.width - w;
        let srcStep: number = 0;

        if (y < Pix2D.clipMinX) {
            const cutoff: number = Pix2D.clipMinX - y;
            h -= cutoff;
            y = Pix2D.clipMinX;
            srcOff += cutoff * w;
            dstOff += cutoff * Pix2D.width;
        }

        if (y + h > Pix2D.clipMaxX) {
            h -= y + h - Pix2D.clipMaxX;
        }

        if (x < Pix2D.clipMinY) {
            const cutoff: number = Pix2D.clipMinY - x;
            w -= cutoff;
            x = Pix2D.clipMinY;
            srcOff += cutoff;
            dstOff += cutoff;
            srcStep += cutoff;
            dstStep += cutoff;
        }

        if (x + w > Pix2D.right) {
            const cutoff: number = x + w - Pix2D.right;
            w -= cutoff;
            srcStep += cutoff;
            dstStep += cutoff;
        }

        if (w > 0 && h > 0) {
            this.plot(w, h, this.data, srcOff, srcStep, Pix2D.pixels, dstOff, dstStep);
        }
    }

    private plot(w: number, h: number, src: Int32Array, srcOff: number, srcStep: number, dst: Int32Array, dstOff: number, dstStep: number): void {
        const qw: number = -(w >> 2);
        w = -(w & 0x3);

        for (let y: number = -h; y < 0; y++) {
            for (let x: number = qw; x < 0; x++) {
                let rgb: number = src[srcOff++];
                if (rgb === 0) {
                    dstOff++;
                } else {
                    dst[dstOff++] = rgb;
                }

                rgb = src[srcOff++];
                if (rgb === 0) {
                    dstOff++;
                } else {
                    dst[dstOff++] = rgb;
                }

                rgb = src[srcOff++];
                if (rgb === 0) {
                    dstOff++;
                } else {
                    dst[dstOff++] = rgb;
                }

                rgb = src[srcOff++];
                if (rgb === 0) {
                    dstOff++;
                } else {
                    dst[dstOff++] = rgb;
                }
            }

            for (let x: number = w; x < 0; x++) {
                const rgb: number = src[srcOff++];
                if (rgb === 0) {
                    dstOff++;
                } else {
                    dst[dstOff++] = rgb;
                }
            }

            dstOff += dstStep;
            srcOff += srcStep;
        }
    }

    transPlotSprite(alpha: number, x: number, y: number): void {
        x |= 0;
        y |= 0;

        x += this.xof;
        y += this.yof;

        let dstStep: number = x + y * Pix2D.width;
        let srcStep: number = 0;
        let h: number = this.hi;
        let w: number = this.wi;
        let dstOff: number = Pix2D.width - w;
        let srcOff: number = 0;

        if (y < Pix2D.clipMinX) {
            const cutoff: number = Pix2D.clipMinX - y;
            h -= cutoff;
            y = Pix2D.clipMinX;
            srcStep += cutoff * w;
            dstStep += cutoff * Pix2D.width;
        }

        if (y + h > Pix2D.clipMaxX) {
            h -= y + h - Pix2D.clipMaxX;
        }

        if (x < Pix2D.clipMinY) {
            const cutoff: number = Pix2D.clipMinY - x;
            w -= cutoff;
            x = Pix2D.clipMinY;
            srcStep += cutoff;
            dstStep += cutoff;
            srcOff += cutoff;
            dstOff += cutoff;
        }

        if (x + w > Pix2D.right) {
            const cutoff: number = x + w - Pix2D.right;
            w -= cutoff;
            srcOff += cutoff;
            dstOff += cutoff;
        }

        if (w > 0 && h > 0) {
            this.tranSprite(w, h, this.data, srcStep, srcOff, Pix2D.pixels, dstStep, dstOff, alpha);
        }
    }

    private tranSprite(w: number, h: number, src: Int32Array, srcOff: number, srcStep: number, dst: Int32Array, dstOff: number, dstStep: number, alpha: number): void {
        const invAlpha: number = 256 - alpha;

        for (let y: number = -h; y < 0; y++) {
            for (let x: number = -w; x < 0; x++) {
                const rgb: number = src[srcOff++];
                if (rgb === 0) {
                    dstOff++;
                } else {
                    const dstRgb: number = dst[dstOff];
                    dst[dstOff++] = ((((rgb & 0xff00ff) * alpha + (dstRgb & 0xff00ff) * invAlpha) & 0xff00ff00) + (((rgb & 0xff00) * alpha + (dstRgb & 0xff00) * invAlpha) & 0xff0000)) >> 8;
                }
            }

            dstOff += dstStep;
            srcOff += srcStep;
        }
    }

    scanlineRotatePlotSprite(x: number, y: number, w: number, h: number, lineStart: Int32Array, lineWidth: Int32Array, anchorX: number, anchorY: number, theta: number, zoom: number): void {
        x |= 0;
        y |= 0;
        w |= 0;
        h |= 0;

        try {
            const centerX: number = (-w / 2) | 0;
            const centerY: number = (-h / 2) | 0;

            const sin: number = (Math.sin(theta / 326.11) * 65536.0) | 0;
            const cos: number = (Math.cos(theta / 326.11) * 65536.0) | 0;
            const sinZoom: number = (sin * zoom) >> 8;
            const cosZoom: number = (cos * zoom) >> 8;

            let leftX: number = (anchorX << 16) + centerY * sinZoom + centerX * cosZoom;
            let leftY: number = (anchorY << 16) + (centerY * cosZoom - centerX * sinZoom);
            let leftOff: number = x + y * Pix2D.width;

            for (let i: number = 0; i < h; i++) {
                const dstOff: number = lineStart[i];
                let dstX: number = leftOff + dstOff;

                let srcX: number = leftX + cosZoom * dstOff;
                let srcY: number = leftY - sinZoom * dstOff;

                for (let j: number = -lineWidth[i]; j < 0; j++) {
                    Pix2D.pixels[dstX++] = this.data[(srcX >> 16) + (srcY >> 16) * this.wi];
                    srcX += cosZoom;
                    srcY -= sinZoom;
                }

                leftX += sinZoom;
                leftY += cosZoom;
                leftOff += Pix2D.width;
            }
        } catch (e) {
            /* empty */
        }
    }

    scanlinePlotSprite(x: number, y: number, mask: Pix8): void {
        x |= 0;
        y |= 0;

        x += this.xof;
        y += this.yof;

        let dstStep: number = x + y * Pix2D.width;
        let srcStep: number = 0;
        let h: number = this.hi;
        let w: number = this.wi;
        let dstOff: number = Pix2D.width - w;
        let srcOff: number = 0;

        if (y < Pix2D.clipMinX) {
            const cutoff: number = Pix2D.clipMinX - y;
            h -= cutoff;
            y = Pix2D.clipMinX;
            srcStep += cutoff * w;
            dstStep += cutoff * Pix2D.width;
        }

        if (y + h > Pix2D.clipMaxX) {
            h -= y + h - Pix2D.clipMaxX;
        }

        if (x < Pix2D.clipMinY) {
            const cutoff: number = Pix2D.clipMinY - x;
            w -= cutoff;
            x = Pix2D.clipMinY;
            srcStep += cutoff;
            dstStep += cutoff;
            srcOff += cutoff;
            dstOff += cutoff;
        }

        if (x + w > Pix2D.right) {
            const cutoff: number = x + w - Pix2D.right;
            w -= cutoff;
            srcOff += cutoff;
            dstOff += cutoff;
        }

        if (w > 0 && h > 0) {
            this.plotScanline(w, h, this.data, srcOff, srcStep, Pix2D.pixels, dstStep, dstOff, mask.data);
        }
    }

    private plotScanline(w: number, h: number, src: Int32Array, srcStep: number, srcOff: number, dst: Int32Array, dstOff: number, dstStep: number, mask: Int8Array): void {
        const qw: number = -(w >> 2);
        w = -(w & 0x3);

        for (let y: number = -h; y < 0; y++) {
            for (let x: number = qw; x < 0; x++) {
                let rgb: number = src[srcOff++];
                if (rgb !== 0 && mask[dstOff] === 0) {
                    dst[dstOff++] = rgb;
                } else {
                    dstOff++;
                }

                rgb = src[srcOff++];
                if (rgb !== 0 && mask[dstOff] === 0) {
                    dst[dstOff++] = rgb;
                } else {
                    dstOff++;
                }

                rgb = src[srcOff++];
                if (rgb !== 0 && mask[dstOff] === 0) {
                    dst[dstOff++] = rgb;
                } else {
                    dstOff++;
                }

                rgb = src[srcOff++];
                if (rgb !== 0 && mask[dstOff] === 0) {
                    dst[dstOff++] = rgb;
                } else {
                    dstOff++;
                }
            }

            for (let x: number = w; x < 0; x++) {
                const rgb: number = src[srcOff++];
                if (rgb !== 0 && mask[dstOff] === 0) {
                    dst[dstOff++] = rgb;
                } else {
                    dstOff++;
                }
            }

            dstOff += dstStep;
            srcOff += srcStep;
        }
    }

    scalePlotSprite(x: number, y: number, w: number, h: number): void {
        x |= 0;
        y |= 0;
        w |= 0;
        h |= 0;

        try {
            const currentW: number = this.wi;
            // const currentH: number = this.height; // dead code

            let offW: number = 0;
            let offH: number = 0;
            // let scaleWidth: number = (currentW << 16) / w; // dead code
            // let scaleHeight: number = (currentH << 16) / h; // dead code

            const cw: number = this.owi;
            const ch: number = this.ohi;
            const scaleCropWidth: number = ((cw << 16) / w) | 0;
            const scaleCropHeight: number = ((ch << 16) / h) | 0;

            x += ((this.xof * w + cw - 1) / cw) | 0;
            y += ((this.yof * h + ch - 1) / ch) | 0;

            if ((this.xof * w) % cw !== 0) {
                offW = (((cw - ((this.xof * w) % cw)) << 16) / w) | 0;
            }

            if ((this.yof * h) % ch !== 0) {
                offH = (((ch - ((this.yof * h) % ch)) << 16) / h) | 0;
            }

            w = ((w * (this.wi - (offW >> 16))) / cw) | 0;
            h = ((h * (this.hi - (offH >> 16))) / ch) | 0;

            let dstStep: number = x + y * Pix2D.width;
            let dstOff: number = Pix2D.width - w;

            if (y < Pix2D.clipMinX) {
                const cutoff: number = Pix2D.clipMinX - y;
                h -= cutoff;
                y = 0;
                dstStep += cutoff * Pix2D.width;
                offH += scaleCropHeight * cutoff;
            }

            if (y + h > Pix2D.clipMaxX) {
                h -= y + h - Pix2D.clipMaxX;
            }

            if (x < Pix2D.clipMinY) {
                const cutoff: number = Pix2D.clipMinY - x;
                w -= cutoff;
                x = 0;
                dstStep += cutoff;
                offW += scaleCropWidth * cutoff;
                dstOff += cutoff;
            }

            if (x + w > Pix2D.right) {
                const cutoff: number = x + w - Pix2D.right;
                w -= cutoff;
                dstOff += cutoff;
            }

            this.plotScale(w, h, this.data, offW, offH, Pix2D.pixels, dstOff, dstStep, currentW, scaleCropWidth, scaleCropHeight);
        } catch (e) {
            console.error('error in sprite clipping routine');
        }
    }

    private plotScale(w: number, h: number, src: Int32Array, offW: number, offH: number, dst: Int32Array, dstStep: number, dstOff: number, currentW: number, scaleCropWidth: number, scaleCropHeight: number): void {
        try {
            const lastOffW: number = offW;
            for (let y: number = -h; y < 0; y++) {
                const offY: number = (offH >> 16) * currentW;
                for (let x: number = -w; x < 0; x++) {
                    const rgb: number = src[(offW >> 16) + offY];
                    if (rgb === 0) {
                        dstOff++;
                    } else {
                        dst[dstOff++] = rgb;
                    }
                    offW += scaleCropWidth;
                }
                offH += scaleCropHeight;
                offW = lastOffW;
                dstOff += dstStep;
            }
        } catch (e) {
            console.error('error in plot_scale');
        }
    }
}
