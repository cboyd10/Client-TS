import type {PluginBridge} from '#/client/plugin/PluginBridge.js';

export type PluginConfig = Record<string, unknown>;

export type PluginDescriptor = {
    id: string;
    displayName: string;
    // inline SVG markup, e.g. '<svg ...>...</svg>'
    icon: string;
    worksPreLogin: boolean;
    defaultEnabled: boolean;
    // custom: builds this plugin's content-panel DOM (shown when its icon, or
    // the cog for the settings list, is clicked) -- keeps PluginSidebar fully
    // generic so a future plugin needs no PluginSidebar changes to slot in.
    renderPanel: (bridge: PluginBridge) => HTMLElement;
};

type PluginState = {
    enabled: boolean;
    config: PluginConfig;
};

type ChangeListener = () => void;

// custom: generic per-player plugin registry + state store, backing the DOM
// plugin sidebar (PluginSidebar.ts). One JSON blob per plugin per scope at
// localStorage key `plugin:<id>:<scope>` -- no per-feature keys.
class PluginManager {
    private descriptors: Map<string, PluginDescriptor> = new Map();
    private loggedInUsername: string | null = null;
    private listeners: Set<ChangeListener> = new Set();

    register(descriptor: PluginDescriptor): void {
        this.descriptors.set(descriptor.id, descriptor);
    }

    getDescriptors(): PluginDescriptor[] {
        return Array.from(this.descriptors.values());
    }

    getDescriptor(id: string): PluginDescriptor | undefined {
        return this.descriptors.get(id);
    }

    isLoggedIn(): boolean {
        return this.loggedInUsername !== null;
    }

    // custom: called by Client on login/logout with an already-normalized
    // (userhash) identifier, or null on logout. Seeds every worksPreLogin
    // plugin's per-username scope from the current 'guest' blob the first
    // time this username is seen -- a one-time copy, not a live link.
    setLoggedInUsername(username: string | null): void {
        if (username !== null) {
            for (const descriptor of this.descriptors.values()) {
                if (!descriptor.worksPreLogin) {
                    continue;
                }

                const usernameKey: string = this.storageKey(descriptor.id, username);
                if (localStorage.getItem(usernameKey) !== null) {
                    continue;
                }

                const guestBlob: string | null = localStorage.getItem(this.storageKey(descriptor.id, 'guest'));
                if (guestBlob !== null) {
                    localStorage.setItem(usernameKey, guestBlob);
                }
            }
        }

        this.loggedInUsername = username;
        this.notify();
    }

    isEnabled(id: string): boolean {
        return this.readState(id).enabled;
    }

    setEnabled(id: string, enabled: boolean): void {
        const state: PluginState = this.readState(id);
        state.enabled = enabled;
        this.writeState(id, state);
        this.notify();
    }

    getConfig(id: string): PluginConfig {
        return this.readState(id).config;
    }

    setConfig(id: string, partial: PluginConfig): void {
        const state: PluginState = this.readState(id);
        state.config = {...state.config, ...partial};
        this.writeState(id, state);
        this.notify();
    }

    // custom: subscribe to enabled/config/login-scope changes; returns an
    // unsubscribe function. Used by PluginSidebar to keep its DOM in sync.
    onChange(listener: ChangeListener): () => void {
        this.listeners.add(listener);
        return (): void => {
            this.listeners.delete(listener);
        };
    }

    private scope(): string {
        return this.loggedInUsername ?? 'guest';
    }

    private storageKey(id: string, scope: string): string {
        return `plugin:${id}:${scope}`;
    }

    private readState(id: string): PluginState {
        const descriptor: PluginDescriptor | undefined = this.descriptors.get(id);
        const defaultEnabled: boolean = descriptor?.defaultEnabled ?? false;

        const raw: string | null = localStorage.getItem(this.storageKey(id, this.scope()));
        if (raw === null) {
            return {enabled: defaultEnabled, config: {}};
        }

        try {
            const parsed: Partial<PluginState> = JSON.parse(raw) as Partial<PluginState>;
            return {
                enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : defaultEnabled,
                config: typeof parsed.config === 'object' && parsed.config !== null ? parsed.config : {}
            };
        } catch (_e) {
            return {enabled: defaultEnabled, config: {}};
        }
    }

    private writeState(id: string, state: PluginState): void {
        localStorage.setItem(this.storageKey(id, this.scope()), JSON.stringify(state));
    }

    private notify(): void {
        for (const listener of this.listeners) {
            listener();
        }
    }
}

export default new PluginManager();
