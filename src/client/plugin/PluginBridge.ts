import type {PluginConfig, PluginDescriptor} from '#/client/plugin/PluginManager.js';

// custom: per-skill card data for the XP Tracker plugin's sidebar content
// panel. Web-friendly mirror of Client's internal (canvas-only) XpTrackerPanel
// shape -- no Pix8 sprite, just enough to render a DOM card.
export type XpTrackerCardData = {
    skillId: number;
    skillName: string;
    calculating: boolean;
    xpPerHour: number;
    xpLeft: number;
    baseLevel: number;
    percentToLevel: number;
    secondsToLevel: number;
    // custom: pre-converted staticon sprite as a data URL (see Pix8.toDataURL),
    // cached per skill id. null when this skill has no staticon mapping
    // (e.g. Slayer, skill 18) -- renderCard() falls back to the text badge.
    iconDataUrl: string | null;
};

// custom: the sole surface PluginSidebar (a page-level DOM component with no
// access to Client's private canvas/game state) is allowed to touch. Populated
// once on `window.pluginBridge` when Client is constructed.
export type PluginBridge = {
    isLoggedIn(): boolean;
    getPluginDescriptors(): PluginDescriptor[];
    isPluginEnabled(id: string): boolean;
    setPluginEnabled(id: string, enabled: boolean): void;
    getPluginConfig(id: string): PluginConfig;
    setPluginConfig(id: string, partial: PluginConfig): void;
    onPluginChange(listener: () => void): () => void;
    getXpTrackerCards(): XpTrackerCardData[];
    // custom: total horizontal px the sidebar currently occupies (40px icon
    // column, +225px more while a content panel is open) -- read by
    // client.ejs's setSize('auto') so the canvas never renders clipped
    // under the sidebar.
    getSidebarWidth(): number;
};

declare global {
    interface Window {
        pluginBridge?: PluginBridge;
    }
}
