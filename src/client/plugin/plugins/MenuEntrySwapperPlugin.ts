import type {PluginBridge} from '#/client/plugin/PluginBridge.js';
import PluginManager, {type PluginDescriptor} from '#/client/plugin/PluginManager.js';

// custom (issue #110): one stored shift-click rule -- a specific (action,
// target) menu-row pair, either bubbled to the default/top slot ('priority')
// or removed from the menu entirely ('hidden'). Array order in plugin config
// is the recency/stack order: most-recently-changed rule last. Client.ts's
// cycleMenuEntry()/applyMenuEntrySwapperRules() own reading and writing this
// list during gameplay; this file only renders/removes what's already there.
export type MenuEntrySwapperRule = {
    action: string;
    target: string;
    state: 'priority' | 'hidden';
};

// custom: Feather-style "list" line icon (MIT-licensed glyph set), distinct
// from XP Tracker's bar-graph icon -- used only for this plugin's sidebar
// tab icon.
const ICON_LIST =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line>' +
    '<line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>' +
    '</svg>';

// custom (issue #110): Feather-style "x" line icon (MIT-licensed glyph set),
// reused from scratch here (XpTrackerPlugin.ts's remove/reset icon is a
// refresh glyph, not a delete one) for this panel's per-row remove control.
const ICON_REMOVE =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>' +
    '</svg>';

// custom (issue #110): reads the stored rule list straight from
// PluginManager -- no PluginBridge surface exists for this (rules are pure
// plugin config, not derived from live game state), matching how Client.ts
// itself reads/writes xpTracker's hiddenSkills/cardOrder directly rather
// than through the bridge. Defensive against a missing/malformed blob, same
// validation as Client.ts's own readMenuEntrySwapperRules().
function readRules(): MenuEntrySwapperRule[] {
    const raw: unknown = PluginManager.getConfig('menuEntrySwapper').rules;
    if (!Array.isArray(raw)) {
        return [];
    }

    const rules: MenuEntrySwapperRule[] = [];
    for (const entry of raw) {
        if (
            typeof entry === 'object' &&
            entry !== null &&
            typeof (entry as MenuEntrySwapperRule).action === 'string' &&
            typeof (entry as MenuEntrySwapperRule).target === 'string' &&
            ((entry as MenuEntrySwapperRule).state === 'priority' || (entry as MenuEntrySwapperRule).state === 'hidden')
        ) {
            rules.push(entry as MenuEntrySwapperRule);
        }
    }
    return rules;
}

function removeRule(rule: MenuEntrySwapperRule): void {
    const rules: MenuEntrySwapperRule[] = readRules().filter((r: MenuEntrySwapperRule): boolean => !(r.action === rule.action && r.target === rule.target));
    PluginManager.setConfig('menuEntrySwapper', {rules});
}

function renderRuleRow(rule: MenuEntrySwapperRule): HTMLElement {
    const row: HTMLDivElement = document.createElement('div');
    row.className = 'plugin-menu-entry-swapper-row';

    const text: HTMLDivElement = document.createElement('div');
    text.className = 'plugin-menu-entry-swapper-text';

    const actionTarget: HTMLSpanElement = document.createElement('span');
    actionTarget.className = 'plugin-menu-entry-swapper-action-target';
    actionTarget.textContent = `${rule.action} ${rule.target}`;
    text.appendChild(actionTarget);

    const state: HTMLSpanElement = document.createElement('span');
    state.className = rule.state === 'priority' ? 'plugin-menu-entry-swapper-state plugin-menu-entry-swapper-state--priority' : 'plugin-menu-entry-swapper-state plugin-menu-entry-swapper-state--hidden';
    state.textContent = rule.state === 'priority' ? 'Priority' : 'Hidden';
    text.appendChild(state);

    row.appendChild(text);

    const removeButton: HTMLButtonElement = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'plugin-menu-entry-swapper-remove-btn';
    removeButton.innerHTML = ICON_REMOVE;
    removeButton.setAttribute('aria-label', `Remove rule for ${rule.action} ${rule.target}`);
    removeButton.title = `Remove rule for ${rule.action} ${rule.target}`;
    // custom (issue #110): no manual re-render here -- PluginManager.setConfig
    // already calls notify(), which PluginSidebar is subscribed to
    // (bridge.onPluginChange in its init()) and reacts to by rebuilding
    // whichever panel is currently open. Same mechanism XpTrackerPlugin's
    // toggle/config changes rely on.
    removeButton.addEventListener('click', (): void => removeRule(rule));
    row.appendChild(removeButton);

    return row;
}

// custom (issue #110): lists every stored rule, most-recently-changed first
// (the reverse of storage order) -- matches the top of this visible list to
// the top of the in-game default/priority stack (Client.ts's priority pass
// bubbles the most-recently-set rule to the topmost menu row). View +
// remove only: rules are only ever created via the in-game shift-click
// gesture, never from this panel.
function renderPanel(_bridge: PluginBridge): HTMLElement {
    const container: HTMLDivElement = document.createElement('div');
    container.className = 'plugin-menu-entry-swapper-panel';

    const rules: MenuEntrySwapperRule[] = readRules();
    if (rules.length === 0) {
        const empty: HTMLDivElement = document.createElement('div');
        empty.className = 'plugin-panel-empty';
        empty.textContent = 'No rules yet -- shift-click a menu option in-game to add one.';
        container.appendChild(empty);
        return container;
    }

    const displayOrder: MenuEntrySwapperRule[] = [...rules].reverse();
    for (const rule of displayOrder) {
        container.appendChild(renderRuleRow(rule));
    }

    return container;
}

const menuEntrySwapperPlugin: PluginDescriptor = {
    id: 'menuEntrySwapper',
    displayName: 'Menu Entry Swapper',
    icon: ICON_LIST,
    worksPreLogin: false,
    defaultEnabled: true,
    renderPanel
};

export default menuEntrySwapperPlugin;
