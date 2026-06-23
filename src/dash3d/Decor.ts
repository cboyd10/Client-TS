import ModelSource, { type SceneTag } from '#/dash3d/ModelSource.js';

export default class Decor {
    x: number = 0;
    typecode: SceneTag = 0;
    model: ModelSource = null!;
    model2: ModelSource | null = null;
    z: number = 0;
    wshape: number = 0;
    zof: number = 0;
    y: number = 0;
    xof: number = 0;
    yof: number = 0;
}
