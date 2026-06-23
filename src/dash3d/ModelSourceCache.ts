import LruCache from '#/datastruct/LruCache.js';
import ModelSourceNode from '#/datastruct/ModelSourceNode.js';
import ModelSource from '#/dash3d/ModelSource.js';

export default class ModelSourceCache {
    readonly field389: LruCache<ModelSourceNode> = new LruCache(30);

    constructor(_size: number) {}

    put(arg0: bigint, arg1: ModelSource): void {
        this.field389.put(arg0, new ModelSourceNode(arg1));
    }

    method133(arg0: bigint): void {
        this.field389.remove(arg0);
    }

    clear(): void {
        this.field389.clear();
    }

    find(arg0: bigint): ModelSource | null {
        const var3 = this.field389.find(arg0);
        return var3 == null ? null : var3.field1829;
    }
}
