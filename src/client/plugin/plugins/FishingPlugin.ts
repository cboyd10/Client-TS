import {xpTrackerFormatXp} from '#/client/Client.js';
import type {FishingActiveSpotData, FishingCatchChanceData, FishingCatchItemData, FishingCatchSummary, PluginBridge} from '#/client/plugin/PluginBridge.js';
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

// custom (issue #150): zero-padded MM:SS, matching Client.ts's
// xpTrackerFormatHms formatting style (colon-separated, 2-digit segments)
// but only the two segments this countdown ever needs -- the fishing spot
// relocation range is ~280-530 ticks (~2:48-5:18), well under an hour, so an
// HH:MM:SS format would only add a constant, pointless "00:" prefix.
function formatMoveCountdown(totalSeconds: number): string {
    const minutes: number = Math.floor(totalSeconds / 60);
    const seconds: number = totalSeconds % 60;
    return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
}

// custom (issue #150 + #151, reconciled on merge): the Active Spot card --
// one shared box built from two independent data sources. #151's rows list
// each fish species reachable with the player's currently held tool at a
// nearby spot, with a server-computed catch-chance % (bar-chart row shape:
// plugin-fishing-chance-*). #150's row is a live "Moves in" countdown for
// the nearest fishing spot with an armed relocation timer (plain
// label:value row shape: plugin-fishing-timer-*; "nearest" is
// PluginBridge.getFishingActiveSpot()'s own definition of "the" active
// spot, there being no client-side interaction-target tracking to key off
// instead). The two data sources are independent (a nearby spot can have
// catch-chance rows, a countdown, both, or -- if the player isn't near any
// covered spot and no spot's timer is armed -- neither, in which case this
// returns null and the card doesn't render at all). Refreshed every second
// by PluginSidebar's existing CONTENT_REFRESH_MS redraw, same as every
// other plugin card -- neither half keeps a separate timer of its own.
function renderSpotCard(bridge: PluginBridge): HTMLElement | null {
    const entries: FishingCatchChanceData[] = bridge.getFishingCatchChances();
    const spot: FishingActiveSpotData | null = bridge.getFishingActiveSpot();
    if (entries.length === 0 && spot === null) {
        return null;
    }

    const card: HTMLDivElement = document.createElement('div');
    card.className = 'plugin-fishing-spot-card';

    const head: HTMLDivElement = document.createElement('div');
    head.className = 'plugin-fishing-spot-head';
    head.textContent = 'Active Spot';
    card.appendChild(head);

    for (const entry of entries) {
        const row: HTMLDivElement = document.createElement('div');
        row.className = 'plugin-fishing-chance-row';

        const name: HTMLSpanElement = document.createElement('span');
        name.className = 'plugin-fishing-chance-name';
        name.textContent = entry.name;
        row.appendChild(name);

        const barTrack: HTMLDivElement = document.createElement('div');
        barTrack.className = 'plugin-fishing-chance-bar-track';
        const barFill: HTMLDivElement = document.createElement('div');
        barFill.className = 'plugin-fishing-chance-bar-fill';
        barFill.style.width = `${Math.max(0, Math.min(100, entry.percent))}%`;
        barTrack.appendChild(barFill);
        row.appendChild(barTrack);

        const pct: HTMLSpanElement = document.createElement('span');
        pct.className = 'plugin-fishing-chance-pct';
        pct.textContent = `${entry.percent}%`;
        row.appendChild(pct);

        card.appendChild(row);
    }

    if (spot !== null) {
        const row: HTMLDivElement = document.createElement('div');
        row.className = 'plugin-fishing-timer-row';

        const label: HTMLSpanElement = document.createElement('span');
        label.className = 'plugin-fishing-timer-label';
        label.textContent = 'Moves in:';
        row.appendChild(label);

        const value: HTMLSpanElement = document.createElement('span');
        value.className = 'plugin-fishing-timer-value';
        value.textContent = formatMoveCountdown(spot.secondsRemaining);
        row.appendChild(value);

        card.appendChild(row);
    }

    return card;
}

function renderPanel(bridge: PluginBridge): HTMLElement {
    const container: HTMLDivElement = document.createElement('div');
    container.className = 'plugin-fishing-panel';

    const summary: FishingCatchSummary = bridge.getFishingCatches();
    container.appendChild(renderTotalCard(bridge, summary));

    const spotCard: HTMLElement | null = renderSpotCard(bridge);
    if (spotCard !== null) {
        container.appendChild(spotCard);
    }

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
