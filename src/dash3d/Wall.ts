import ModelSource, { type SceneTag } from '#/dash3d/ModelSource.js';

export default class Wall {
    modelA: ModelSource = null!;
    z: number = 0;
    typeB: number = 0;
    typeA: number = 0;
    typecode: SceneTag = 0;
    x: number = 0;
    y: number = 0;
    modelB: ModelSource = null!;
}
