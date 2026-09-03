import type {PluginConfig, PluginDescriptor} from '#/client/plugin/PluginManager.js';

// custom: per-skill card data for the XP Tracker plugin's sidebar content
// panel. Web-friendly mirror of Client's internal (canvas-only) XpTrackerPanel
// shape -- no Pix8 sprite, just enough to render a DOM card.
export type XpTrackerCardData = {
    skillId: number;
    skillName: string;
    calculating: boolean;
    xpGained: number;
    xpPerHour: number;
    xpLeft: number;
    baseLevel: number;
    percentToLevel: number;
    secondsToLevel: number;
    // custom (issue #87): true while this skill is auto-paused (idle timeout or
    // logout) -- stats above hold their frozen pre-pause values while true.
    paused: boolean;
    // custom: per-skill level target (issue #86) read from the xpTracker
    // plugin config's `levelTargets` map -- null when no target is set (or
    // the stored value fails validation), in which case progress is toward
    // baseLevel + 1 exactly as before.
    targetLevel: number | null;
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
    // custom (issue #88): re-seed one skill's tracked session (baseline/start
    // time/last-gain/pause state) to a fresh start, without touching any
    // per-skill config (e.g. a level target). The skill drops out of
    // getXpTrackerCards() until it next gains xp, same as a never-tracked
    // skill.
    resetXpTrackerSkill(skillId: number): void;
    // custom: total horizontal px the sidebar currently occupies (40px icon
    // column, +225px more while a content panel is open) -- read by
    // client.ejs's setSize('auto') so the canvas never renders clipped
    // under the sidebar.
    getSidebarWidth(): number;
    // custom (issue #109): backed by GameShell's existing `isMobile` getter
    // (not a new detection function) so page-level DOM plugin code
    // (XpTrackerPlugin.ts's drag-to-reorder gate) can match Client's own
    // mobile detection without reaching into Client internals directly.
    // Deliberately not consolidated with PluginSidebar.ts's own private
    // isMobile() (a separate regex/touch-detection copy) -- out of scope
    // for this issue.
    isMobile(): boolean;
    // custom (issue #106): live current camera-zoom distance (Client's
    // `cameraZoom` field), read fresh on every panel refresh for the Camera
    // plugin's live marker. The configured min/max range and a debounced
    // snapshot of this same value are read/written through the generic
    // getPluginConfig/setPluginConfig surface above (config id 'camera') --
    // no dedicated setter needed, since Client.ts applies range/zoom writes
    // back to itself via PluginManager.onChange.
    getCameraZoom(): number;
    // custom (issue #126): current loot-tracker groups, one per distinct
    // sourceNpc (plus the sourceNpc === -1 "Unknown" bucket when non-empty),
    // sorted by total value descending. Rebuilt fresh from persisted config on
    // every panel refresh -- no separate live-session cache.
    getLootTrackerGroups(): LootTrackerGroupData[];
    // custom (issue #126): clears one monster group's tracked kills/items
    // entirely (unlike XP Tracker's per-skill reset, there's no "session"
    // concept to re-seed -- a reset group simply drops out of
    // getLootTrackerGroups() until its sourceNpc next drops something).
    resetLootTrackerGroup(sourceNpc: number): void;
};

// custom (issue #126): one tracked item within a loot-tracker monster group --
// mirrors XpTrackerCardData's DOM-friendly shape (pre-converted icon data URL,
// no Pix32 sprite reaching page-level code).
export type LootTrackerItemData = {
    type: number;
    name: string;
    count: number;
    value: number;
    // custom: item icon rendered exactly as it appears in the inventory
    // (ObjType.getSprite + Pix32.toDataURL), null if the sprite couldn't be
    // rendered -- renderPanel() falls back to a text badge in that case.
    iconDataUrl: string | null;
};

// custom (issue #126): one monster group for the loot tracker sidebar panel --
// sourceNpc === -1 is the "Unknown" bucket (player-dropped items, static/quest
// spawns, or anything already on the ground before this shipped).
export type LootTrackerGroupData = {
    sourceNpc: number;
    monsterName: string;
    kills: number;
    totalValue: number;
    items: LootTrackerItemData[];
};

declare global {
    interface Window {
        pluginBridge?: PluginBridge;
    }
}
