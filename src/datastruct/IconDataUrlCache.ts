// custom (issue #148): generic icon data-URL cache, extracted from the two
// independent bespoke caches XpTracker (issue #103) and LootTracker (issue
// #141) each grew to fix the same bug class -- permanently caching a failed
// lookup before an on-demand asset finished loading. Given a key and a
// resolver, returns the cached value if present; otherwise calls the
// resolver and only caches the result if it resolved (non-null), so an
// unresolved key is retried for free on the caller's next invocation
// (e.g. the plugin sidebar's 1-second panel refresh) rather than permanently
// caching a premature null.
export default class IconDataUrlCache<K> {
    private readonly cache: Map<K, string> = new Map();

    get(key: K, resolve: () => string | null): string | null {
        const cached: string | undefined = this.cache.get(key);
        if (cached !== undefined) {
            return cached;
        }

        const resolved: string | null = resolve();
        if (resolved !== null) {
            this.cache.set(key, resolved);
        }
        return resolved;
    }
}
