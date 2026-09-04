import {xpTrackerFormatXp} from '#/client/Client.js';
import type {LootTrackerGroupData, LootTrackerItemData, PluginBridge} from '#/client/plugin/PluginBridge.js';
import type {PluginDescriptor} from '#/client/plugin/PluginManager.js';

// custom (issue #126): Feather-style "package" line icon (MIT-licensed glyph
// set). Used only for the plugin's sidebar tab icon.
const ICON_PACKAGE =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>' +
    '<polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>' +
    '</svg>';

// custom (issue #126): reused Feather-style "refresh-cw" glyph -- same icon as
// XpTrackerPlugin's reset buttons, following the shared icon-button convention.
const ICON_REFRESH =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline>' +
    '<path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>' +
    '</svg>';

// custom (issue #134 restyle): Feather-style "briefcase" glyph, stood in for
// a backpack/inventory icon on the Total card.
const ICON_BACKPACK =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>' +
    '<path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>' +
    '</svg>';

function makeResetButton(label: string, onReset: () => void): HTMLButtonElement {
    const btn: HTMLButtonElement = document.createElement('button');
    btn.type = 'button';
    btn.className = 'plugin-loottracker-reset-btn';
    btn.innerHTML = ICON_REFRESH;
    btn.setAttribute('aria-label', label);
    btn.title = label;
    btn.addEventListener('click', (): void => onReset());
    return btn;
}

// custom (issue #126): one grid cell -- the item's inventory-style icon with
// its tracked quantity badged in the corner, RuneLite loot-tracker style.
function makeItemCell(item: LootTrackerItemData): HTMLDivElement {
    const cell: HTMLDivElement = document.createElement('div');
    cell.className = 'plugin-loottracker-item';
    cell.title = `${item.name}\n${item.count.toLocaleString()} (${xpTrackerFormatXp(item.value)} gp)`;

    if (item.iconDataUrl !== null) {
        const img: HTMLImageElement = document.createElement('img');
        img.className = 'plugin-loottracker-item-icon';
        img.src = item.iconDataUrl;
        img.alt = item.name;
        cell.appendChild(img);
    } else {
        const fallback: HTMLDivElement = document.createElement('div');
        fallback.className = 'plugin-loottracker-item-icon plugin-loottracker-item-icon-fallback';
        fallback.textContent = item.name.slice(0, 2).toUpperCase();
        cell.appendChild(fallback);
    }

    const badge: HTMLDivElement = document.createElement('div');
    badge.className = 'plugin-loottracker-item-count';
    badge.textContent = xpTrackerFormatXp(item.count);
    cell.appendChild(badge);

    return cell;
}

// custom (issue #134 restyle): matches the RuneLite loot-tracker header --
// white monster name + gray kill count on the left (one line, ellipsized
// together), total value on the far right, no icon badge.
function renderGroupHeader(monsterName: string, kills: number, totalValue: number, onReset: () => void, resetLabel: string): HTMLElement {
    const row: HTMLDivElement = document.createElement('div');
    row.className = 'plugin-loottracker-row';

    const title: HTMLDivElement = document.createElement('div');
    title.className = 'plugin-loottracker-header-title';

    const name: HTMLSpanElement = document.createElement('span');
    name.className = 'plugin-loottracker-header-name';
    name.textContent = monsterName;
    title.appendChild(name);

    const count: HTMLSpanElement = document.createElement('span');
    count.className = 'plugin-loottracker-header-count';
    count.textContent = ` × ${kills.toLocaleString()}`;
    title.appendChild(count);

    row.appendChild(title);

    const value: HTMLDivElement = document.createElement('div');
    value.className = 'plugin-loottracker-header-value';
    value.textContent = `${xpTrackerFormatXp(totalValue)} gp`;
    row.appendChild(value);

    row.appendChild(makeResetButton(resetLabel, onReset));

    return row;
}

function renderCard(group: LootTrackerGroupData, bridge: PluginBridge): HTMLElement {
    const el: HTMLDivElement = document.createElement('div');
    el.className = 'plugin-loottracker-card';

    el.appendChild(renderGroupHeader(group.monsterName, group.kills, group.totalValue, (): void => bridge.resetLootTrackerGroup(group.sourceNpc), `Reset ${group.monsterName} loot`));

    const grid: HTMLDivElement = document.createElement('div');
    grid.className = 'plugin-loottracker-grid';
    for (const item of group.items) {
        grid.appendChild(makeItemCell(item));
    }
    el.appendChild(grid);

    return el;
}

// custom (issue #134 restyle): backpack icon + "Total count" / "Total value"
// lines, replacing the name/kills header layout the Total card previously
// shared with per-monster cards -- kills isn't a meaningful "total" across
// every monster's card the way item count and value are.
function renderTotalCard(bridge: PluginBridge, groups: LootTrackerGroupData[]): HTMLElement {
    const el: HTMLDivElement = document.createElement('div');
    el.className = 'plugin-loottracker-total-card';

    const row: HTMLDivElement = document.createElement('div');
    row.className = 'plugin-loottracker-row';

    const icon: HTMLDivElement = document.createElement('div');
    icon.className = 'plugin-loottracker-total-icon';
    icon.innerHTML = ICON_BACKPACK;
    row.appendChild(icon);

    const totalCount: number = groups.reduce((s: number, g: LootTrackerGroupData): number => s + g.items.reduce((si: number, i: LootTrackerItemData): number => si + i.count, 0), 0);
    const totalValue: number = groups.reduce((s: number, g: LootTrackerGroupData): number => s + g.totalValue, 0);

    const info: HTMLDivElement = document.createElement('div');
    info.className = 'plugin-loottracker-total-info';

    const countLine: HTMLDivElement = document.createElement('div');
    countLine.textContent = `Total count: ${totalCount.toLocaleString()}`;
    info.appendChild(countLine);

    const valueLine: HTMLDivElement = document.createElement('div');
    valueLine.textContent = `Total value: ${xpTrackerFormatXp(totalValue)}`;
    info.appendChild(valueLine);

    row.appendChild(info);
    row.appendChild(
        makeResetButton('Reset all tracked loot', (): void => {
            for (const group of groups) {
                bridge.resetLootTrackerGroup(group.sourceNpc);
            }
        })
    );

    el.appendChild(row);

    return el;
}

function renderPanel(bridge: PluginBridge): HTMLElement {
    const container: HTMLDivElement = document.createElement('div');
    container.className = 'plugin-loottracker-panel';

    const groups: LootTrackerGroupData[] = bridge.getLootTrackerGroups();
    if (groups.length === 0) {
        const empty: HTMLDivElement = document.createElement('div');
        empty.className = 'plugin-panel-empty';
        empty.textContent = 'No loot tracked yet.';
        container.appendChild(empty);
        return container;
    }

    // custom: total card is always pinned first, computed fresh from `groups`
    // on every render -- matches XpTrackerPlugin's renderTotalCard pattern.
    container.appendChild(renderTotalCard(bridge, groups));

    for (const group of groups) {
        container.appendChild(renderCard(group, bridge));
    }

    return container;
}

const lootTrackerPlugin: PluginDescriptor = {
    id: 'lootTracker',
    displayName: 'Loot Tracker',
    icon: ICON_PACKAGE,
    worksPreLogin: false,
    defaultEnabled: true,
    renderPanel
};

export default lootTrackerPlugin;
