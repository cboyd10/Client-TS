export default class WorldRegion {
    static rotateX(x: number, z: number, rotation: number) {
        rotation &= 3;

        if (rotation == 0) {
            return x;
        } else if (rotation == 1) {
            return z;
        } else if (rotation == 2) {
            return 7 - x;
        } else {
            return 7 - z;
        }
    }

    static rotateZ(x: number, z: number, rotation: number) {
        rotation &= 3;

        if (rotation == 0) {
            return z;
        } else if (rotation == 1) {
            return 7 - x;
        } else if (rotation == 2) {
            return 7 - z;
        } else {
            return x;
        }
    }

    static rotateLocX(x: number, z: number, width: number, length: number, rotation: number) {
        rotation &= 3;

        if (rotation == 0) {
            return x;
        } else if (rotation == 1) {
            return z;
        } else if (rotation == 2) {
            return 7 - x - (width - 1);
        } else {
            return 7 - z - (length - 1);
        }
    }

    static rotateLocZ(x: number, z: number, width: number, length: number, rotation: number) {
        rotation &= 3;

        if (rotation == 0) {
            return z;
        } else if (rotation == 1) {
            return 7 - x - (width - 1);
        } else if (rotation == 2) {
            return 7 - z - (length - 1);
        } else {
            return x;
        }
    }
}
