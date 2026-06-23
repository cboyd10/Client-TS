import ModelSource, { type SceneTag } from '#/dash3d/ModelSource.js';

export default class GroundObject {
    height: number = 0;
    z: number = 0;
    typecode: SceneTag = 0;
    topObj: ModelSource | null = null;
    y: number = 0;
    bottomObj: ModelSource | null = null;
    middleObj: ModelSource | null = null;
    x: number = 0;
}
