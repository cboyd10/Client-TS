export default class Ground {
    static readonly drawVertexX: Int32Array = new Int32Array(6);
    static readonly drawVertexY: Int32Array = new Int32Array(6);
    static readonly drawTextureVertexX: Int32Array = new Int32Array(6);
    static readonly drawTextureVertexY: Int32Array = new Int32Array(6);
    static readonly drawTextureVertexZ: Int32Array = new Int32Array(6);

    // prettier-ignore
    private static readonly defShapeP: Int8Array[] = [
        Int8Array.of(1, 3, 5, 7),
        Int8Array.of(1, 3, 5, 7),
        Int8Array.of(1, 3, 5, 7),
        Int8Array.of(1, 3, 5, 7, 6),
        Int8Array.of(1, 3, 5, 7, 6),
        Int8Array.of(1, 3, 5, 7, 6),
        Int8Array.of(1, 3, 5, 7, 6),
        Int8Array.of(1, 3, 5, 7, 2, 6),
        Int8Array.of(1, 3, 5, 7, 2, 8),
        Int8Array.of(1, 3, 5, 7, 2, 8),
        Int8Array.of(1, 3, 5, 7, 11, 12),
        Int8Array.of(1, 3, 5, 7, 11, 12),
        Int8Array.of(1, 3, 5, 7, 13, 14)
    ];

    // prettier-ignore
    private static readonly defShapeF: Int8Array[] = [
        Int8Array.of(0, 1, 2, 3, 0, 0, 1, 3),
        Int8Array.of(1, 1, 2, 3, 1, 0, 1, 3),
        Int8Array.of(0, 1, 2, 3, 1, 0, 1, 3),
        Int8Array.of(0, 0, 1, 2, 0, 0, 2, 4, 1, 0, 4, 3),
        Int8Array.of(0, 0, 1, 4, 0, 0, 4, 3, 1, 1, 2, 4),
        Int8Array.of(0, 0, 4, 3, 1, 0, 1, 2, 1, 0, 2, 4),
        Int8Array.of(0, 1, 2, 4, 1, 0, 1, 4, 1, 0, 4, 3),
        Int8Array.of(0, 4, 1, 2, 0, 4, 2, 5, 1, 0, 4, 5, 1, 0, 5, 3),
        Int8Array.of(0, 4, 1, 2, 0, 4, 2, 3, 0, 4, 3, 5, 1, 0, 4, 5),
        Int8Array.of(0, 0, 4, 5, 1, 4, 1, 2, 1, 4, 2, 3, 1, 4, 3, 5),
        Int8Array.of(0, 0, 1, 5, 0, 1, 4, 5, 0, 1, 2, 4, 1, 0, 5, 3, 1, 5, 4, 3, 1, 4, 2, 3),
        Int8Array.of(1, 0, 1, 5, 1, 1, 4, 5, 1, 1, 2, 4, 0, 0, 5, 3, 0, 5, 4, 3, 0, 4, 2, 3),
        Int8Array.of(1, 0, 5, 4, 1, 0, 1, 5, 0, 0, 4, 3, 0, 4, 5, 3, 0, 5, 2, 3, 0, 1, 2, 5)
    ];

    private static readonly FULL_SQUARE: number = 128;
    private static readonly HALF_SQUARE: number = (this.FULL_SQUARE / 2) | 0;
    private static readonly CORNER_SMALL: number = (this.FULL_SQUARE / 4) | 0;
    private static readonly CORNER_BIG: number = ((this.FULL_SQUARE * 3) / 4) | 0;

    // ----

    readonly vertexX: Int32Array;
    readonly vertexY: Int32Array;
    readonly vertexZ: Int32Array;
    readonly faceColourA: Int32Array;
    readonly faceColourB: Int32Array;
    readonly faceColourC: Int32Array;
    readonly faceVertexA: Int32Array;
    readonly faceVertexB: Int32Array;
    readonly faceVertexC: Int32Array;
    readonly faceTexture: Int32Array | null;
    readonly flat: boolean;
    readonly minimapUnderlay: number;
    readonly minimapOverlay: number;
    readonly overlayShape: number;
    readonly overlayRotation: number;

    constructor(
        tileX: number,
        shape: number,
        southeastColor2: number,
        heightSE: number,
        northeastColor1: number,
        rotation: number,
        southwestColor1: number,
        heightNW: number,
        underlay: number,
        southwestColor2: number,
        textureId: number,
        northwestColor2: number,
        overlay: number,
        heightNE: number,
        northeastColor2: number,
        northwestColor1: number,
        heightSW: number,
        tileZ: number,
        southeastColor1: number
    ) {
        this.flat = !(heightSW !== heightSE || heightSW !== heightNE || heightSW !== heightNW);
        this.overlayShape = shape;
        this.overlayRotation = rotation;
        this.minimapOverlay = overlay;
        this.minimapUnderlay = underlay;

        const points: Int8Array = Ground.defShapeP[shape];
        const vertexCount: number = points.length;
        this.vertexX = new Int32Array(vertexCount);
        this.vertexY = new Int32Array(vertexCount);
        this.vertexZ = new Int32Array(vertexCount);
        const primaryColors: Int32Array = new Int32Array(vertexCount);
        const secondaryColors: Int32Array = new Int32Array(vertexCount);

        const sceneX: number = tileX * Ground.FULL_SQUARE;
        const sceneZ: number = tileZ * Ground.FULL_SQUARE;

        for (let v: number = 0; v < vertexCount; v++) {
            let type: number = points[v];

            if ((type & 0x1) === 0 && type <= 8) {
                type = ((type - rotation - rotation - 1) & 0x7) + 1;
            }

            if (type > 8 && type <= 12) {
                type = ((type - rotation - 9) & 0x3) + 9;
            }

            if (type > 12 && type <= 16) {
                type = ((type - rotation - 13) & 0x3) + 13;
            }

            let x: number;
            let z: number;
            let y: number;
            let color1: number;
            let color2: number;

            if (type === 1) {
                x = sceneX;
                z = sceneZ;
                y = heightSW;
                color1 = southwestColor1;
                color2 = southwestColor2;
            } else if (type === 2) {
                x = sceneX + Ground.HALF_SQUARE;
                z = sceneZ;
                y = (heightSW + heightSE) >> 1;
                color1 = (southwestColor1 + southeastColor1) >> 1;
                color2 = (southwestColor2 + southeastColor2) >> 1;
            } else if (type === 3) {
                x = sceneX + Ground.FULL_SQUARE;
                z = sceneZ;
                y = heightSE;
                color1 = southeastColor1;
                color2 = southeastColor2;
            } else if (type === 4) {
                x = sceneX + Ground.FULL_SQUARE;
                z = sceneZ + Ground.HALF_SQUARE;
                y = (heightSE + heightNE) >> 1;
                color1 = (southeastColor1 + northeastColor1) >> 1;
                color2 = (southeastColor2 + northeastColor2) >> 1;
            } else if (type === 5) {
                x = sceneX + Ground.FULL_SQUARE;
                z = sceneZ + Ground.FULL_SQUARE;
                y = heightNE;
                color1 = northeastColor1;
                color2 = northeastColor2;
            } else if (type === 6) {
                x = sceneX + Ground.HALF_SQUARE;
                z = sceneZ + Ground.FULL_SQUARE;
                y = (heightNE + heightNW) >> 1;
                color1 = (northeastColor1 + northwestColor1) >> 1;
                color2 = (northeastColor2 + northwestColor2) >> 1;
            } else if (type === 7) {
                x = sceneX;
                z = sceneZ + Ground.FULL_SQUARE;
                y = heightNW;
                color1 = northwestColor1;
                color2 = northwestColor2;
            } else if (type === 8) {
                x = sceneX;
                z = sceneZ + Ground.HALF_SQUARE;
                y = (heightNW + heightSW) >> 1;
                color1 = (northwestColor1 + southwestColor1) >> 1;
                color2 = (northwestColor2 + southwestColor2) >> 1;
            } else if (type === 9) {
                x = sceneX + Ground.HALF_SQUARE;
                z = sceneZ + Ground.CORNER_SMALL;
                y = (heightSW + heightSE) >> 1;
                color1 = (southwestColor1 + southeastColor1) >> 1;
                color2 = (southwestColor2 + southeastColor2) >> 1;
            } else if (type === 10) {
                x = sceneX + Ground.CORNER_BIG;
                z = sceneZ + Ground.HALF_SQUARE;
                y = (heightSE + heightNE) >> 1;
                color1 = (southeastColor1 + northeastColor1) >> 1;
                color2 = (southeastColor2 + northeastColor2) >> 1;
            } else if (type === 11) {
                x = sceneX + Ground.HALF_SQUARE;
                z = sceneZ + Ground.CORNER_BIG;
                y = (heightNE + heightNW) >> 1;
                color1 = (northeastColor1 + northwestColor1) >> 1;
                color2 = (northeastColor2 + northwestColor2) >> 1;
            } else if (type === 12) {
                x = sceneX + Ground.CORNER_SMALL;
                z = sceneZ + Ground.HALF_SQUARE;
                y = (heightNW + heightSW) >> 1;
                color1 = (northwestColor1 + southwestColor1) >> 1;
                color2 = (northwestColor2 + southwestColor2) >> 1;
            } else if (type === 13) {
                x = sceneX + Ground.CORNER_SMALL;
                z = sceneZ + Ground.CORNER_SMALL;
                y = heightSW;
                color1 = southwestColor1;
                color2 = southwestColor2;
            } else if (type === 14) {
                x = sceneX + Ground.CORNER_BIG;
                z = sceneZ + Ground.CORNER_SMALL;
                y = heightSE;
                color1 = southeastColor1;
                color2 = southeastColor2;
            } else if (type === 15) {
                x = sceneX + Ground.CORNER_BIG;
                z = sceneZ + Ground.CORNER_BIG;
                y = heightNE;
                color1 = northeastColor1;
                color2 = northeastColor2;
            } else {
                x = sceneX + Ground.CORNER_SMALL;
                z = sceneZ + Ground.CORNER_BIG;
                y = heightNW;
                color1 = northwestColor1;
                color2 = northwestColor2;
            }

            this.vertexX[v] = x;
            this.vertexY[v] = y;
            this.vertexZ[v] = z;
            primaryColors[v] = color1;
            secondaryColors[v] = color2;
        }

        const paths: Int8Array = Ground.defShapeF[shape];
        const triangleCount: number = (paths.length / 4) | 0;
        this.faceVertexA = new Int32Array(triangleCount);
        this.faceVertexB = new Int32Array(triangleCount);
        this.faceVertexC = new Int32Array(triangleCount);
        this.faceColourA = new Int32Array(triangleCount);
        this.faceColourB = new Int32Array(triangleCount);
        this.faceColourC = new Int32Array(triangleCount);

        if (textureId !== -1) {
            this.faceTexture = new Int32Array(triangleCount);
        } else {
            this.faceTexture = null;
        }

        let index: number = 0;
        for (let t: number = 0; t < triangleCount; t++) {
            const color: number = paths[index];
            let a: number = paths[index + 1];
            let b: number = paths[index + 2];
            let c: number = paths[index + 3];
            index += 4;

            if (a < 4) {
                a = (a - rotation) & 0x3;
            }

            if (b < 4) {
                b = (b - rotation) & 0x3;
            }

            if (c < 4) {
                c = (c - rotation) & 0x3;
            }

            this.faceVertexA[t] = a;
            this.faceVertexB[t] = b;
            this.faceVertexC[t] = c;

            if (color === 0) {
                this.faceColourA[t] = primaryColors[a];
                this.faceColourB[t] = primaryColors[b];
                this.faceColourC[t] = primaryColors[c];

                if (this.faceTexture) {
                    this.faceTexture[t] = -1;
                }
            } else {
                this.faceColourA[t] = secondaryColors[a];
                this.faceColourB[t] = secondaryColors[b];
                this.faceColourC[t] = secondaryColors[c];

                if (this.faceTexture) {
                    this.faceTexture[t] = textureId;
                }
            }
        }
    }
}
