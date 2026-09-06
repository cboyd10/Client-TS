import {xpTrackerFormatXp} from '#/client/Client.js';
import type {FishingCatchItemData, FishingCatchSummary, PluginBridge} from '#/client/plugin/PluginBridge.js';
import type {PluginDescriptor} from '#/client/plugin/PluginManager.js';

// custom (issue #149): simple line-art fish glyph (matches the Feather-style
// stroke convention every other plugin's sidebar icon uses, though this
// particular glyph isn't part of the actual Feather set).
const ICON_FISH =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M6.5 12c0-3 4-6.5 10-6.5 2 0 3.5 1 3.5 1s-1 3-1 5.5 1 5.5 1 5.5-1.5 1-3.5 1c-6 0-10-3.5-10-6.5z"></path>' +
    '<path d="M6.5 12 2 8.5v7z"></path>' +
    '<circle cx="16.5" cy="10" r="0.75" fill="currentColor" stroke="none"></circle>' +
    '</svg>';

// custom (issue #153, copied from LootTrackerPlugin.ts's own copy): Feather-
// style "refresh-cw" glyph, same shared icon-button convention.
const ICON_REFRESH =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline>' +
    '<path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>' +
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

// custom (issue #153): one catch-grid cell, reusing LootTrackerPlugin's own
// makeItemCell shape/CSS classes exactly (per the Acceptance Criteria) --
// the 2-letter text fallback only renders when iconDataUrl is null, matching
// LootTrackerPlugin.ts's own fallback behavior.
function makeCatchCell(item: FishingCatchItemData): HTMLDivElement {
    const cell: HTMLDivElement = document.createElement('div');
    cell.className = 'plugin-loottracker-item';
    cell.title = `${item.name}\n${item.count.toLocaleString()}`;

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

// custom (issue #149, real counts wired by #153): the plugin shell's Total
// card, styled per the Acceptance Criteria to match the existing green
// Total-card convention (see PluginSidebar.ts's plugin-fishing-total-card
// rule). Catch count / XP gained / xp-per-hour now reflect the session
// summary built by Client.buildFishingCatches() (see #153's comId-scoped,
// XP-gated inventory diff), matching the confirmed mockup's "128 caught *
// 1,240 xp" / "612 xp/hr" layout.
function renderTotalCard(bridge: PluginBridge, summary: FishingCatchSummary): HTMLElement {
    const el: HTMLDivElement = document.createElement('div');
    el.className = 'plugin-fishing-total-card';

    const row: HTMLDivElement = document.createElement('div');
    row.className = 'plugin-fishing-row';

    const icon: HTMLDivElement = document.createElement('div');
    icon.className = 'plugin-fishing-icon';
    const iconDataUrl: string | null = bridge.getFishingIcon();
    if (iconDataUrl !== null) {
        const img: HTMLImageElement = document.createElement('img');
        img.src = iconDataUrl;
        img.alt = 'Fishing';
        icon.appendChild(img);
    } else {
        icon.innerHTML = ICON_FISH;
    }
    row.appendChild(icon);

    const metrics: HTMLDivElement = document.createElement('div');
    metrics.className = 'plugin-fishing-metrics';

    const catchesLabel: HTMLSpanElement = document.createElement('span');
    catchesLabel.className = 'plugin-fishing-metric-label';
    catchesLabel.textContent = 'Catches:';
    metrics.appendChild(catchesLabel);

    const catchesValue: HTMLSpanElement = document.createElement('span');
    catchesValue.className = 'plugin-fishing-metric-value';
    catchesValue.textContent = `${summary.totalCatches.toLocaleString()} · ${xpTrackerFormatXp(summary.totalXp)} xp`;
    metrics.appendChild(catchesValue);

    const xpLabel: HTMLSpanElement = document.createElement('span');
    xpLabel.className = 'plugin-fishing-metric-label';
    xpLabel.textContent = 'XP/hr:';
    metrics.appendChild(xpLabel);

    const xpValue: HTMLSpanElement = document.createElement('span');
    xpValue.className = 'plugin-fishing-metric-value';
    xpValue.textContent = summary.xpPerHour > 0 ? `${xpTrackerFormatXp(summary.xpPerHour)} xp` : '--';
    metrics.appendChild(xpValue);

    row.appendChild(metrics);
    row.appendChild(makeResetButton('Reset tracked catches', (): void => bridge.resetFishingCatches()));
    el.appendChild(row);

    return el;
}

// custom (issue #153): "Catches this session" grid, reusing LootTrackerPlugin's
// existing grid CSS classes directly (per the Acceptance Criteria) rather
// than writing parallel classes.
function renderCatchGrid(summary: FishingCatchSummary): HTMLElement | null {
    if (summary.items.length === 0) {
        return null;
    }

    const grid: HTMLDivElement = document.createElement('div');
    grid.className = 'plugin-loottracker-grid';
    for (const item of summary.items) {
        grid.appendChild(makeCatchCell(item));
    }
    return grid;
}

function renderPanel(bridge: PluginBridge): HTMLElement {
    const container: HTMLDivElement = document.createElement('div');
    container.className = 'plugin-fishing-panel';

    const summary: FishingCatchSummary = bridge.getFishingCatches();
    container.appendChild(renderTotalCard(bridge, summary));

    const grid: HTMLElement | null = renderCatchGrid(summary);
    if (grid !== null) {
        container.appendChild(grid);
    }

    const hint: HTMLDivElement = document.createElement('div');
    hint.className = 'plugin-fishing-hint';
    hint.textContent = 'Fishing spots are highlighted on the map and minimap while this plugin is enabled.';
    container.appendChild(hint);

    return container;
}

const fishingPlugin: PluginDescriptor = {
    id: 'fishing',
    displayName: 'Fishing',
    icon: ICON_FISH,
    worksPreLogin: false,
    defaultEnabled: true,
    renderPanel
};

export default fishingPlugin;
