import ModelSource, { type SceneTag } from '#/dash3d/ModelSource.js';

export default class GroundDecor {
    z: number = 0;
    y: number = 0;
    model: ModelSource = null!;
    x: number = 0;
    typecode: SceneTag = 0;
}
