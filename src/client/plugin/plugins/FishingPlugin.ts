import type {PluginBridge} from '#/client/plugin/PluginBridge.js';
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

// custom (issue #149): the plugin shell's Total card, styled per the
// Acceptance Criteria to match the existing green Total-card convention
// (see PluginSidebar.ts's plugin-fishing-total-card rule) -- session catch
// count and XP fields render as 0/empty placeholders until a later issue
// ("Fishing: per-species catch counter") wires real per-species tracking
// data in. Only the Fishing skill icon (sourced from the shared icon cache
// built in #148) is real as of this issue.
function renderTotalCard(bridge: PluginBridge): HTMLElement {
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
    catchesValue.textContent = '0';
    metrics.appendChild(catchesValue);

    const xpLabel: HTMLSpanElement = document.createElement('span');
    xpLabel.className = 'plugin-fishing-metric-label';
    xpLabel.textContent = 'XP Gained:';
    metrics.appendChild(xpLabel);

    const xpValue: HTMLSpanElement = document.createElement('span');
    xpValue.className = 'plugin-fishing-metric-value';
    xpValue.textContent = '--';
    metrics.appendChild(xpValue);

    row.appendChild(metrics);
    el.appendChild(row);

    return el;
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

// custom (issue #150): Active Spot card -- a live "Moves in" countdown for
// the nearest fishing spot with an armed relocation timer (see
// PluginBridge.getFishingActiveSpot(); "nearest" is that method's definition
// of "the" active spot, there being no client-side interaction-target
// tracking to key off instead). Returns null (renders nothing) when there's
// no active spot, rather than an empty placeholder card. Refreshed every
// second by PluginSidebar's existing CONTENT_REFRESH_MS redraw, same as
// every other plugin card -- no separate timer of its own.
function renderActiveSpotCard(bridge: PluginBridge): HTMLElement | null {
    const spot = bridge.getFishingActiveSpot();
    if (spot === null) {
        return null;
    }

    const el: HTMLDivElement = document.createElement('div');
    el.className = 'plugin-fishing-active-spot-card';

    const row: HTMLDivElement = document.createElement('div');
    row.className = 'plugin-fishing-active-spot-row';

    const label: HTMLSpanElement = document.createElement('span');
    label.className = 'plugin-fishing-active-spot-label';
    label.textContent = 'Moves in:';
    row.appendChild(label);

    const value: HTMLSpanElement = document.createElement('span');
    value.className = 'plugin-fishing-active-spot-value';
    value.textContent = formatMoveCountdown(spot.secondsRemaining);
    row.appendChild(value);

    el.appendChild(row);
    return el;
}

function renderPanel(bridge: PluginBridge): HTMLElement {
    const container: HTMLDivElement = document.createElement('div');
    container.className = 'plugin-fishing-panel';
    container.appendChild(renderTotalCard(bridge));

    const activeSpotCard: HTMLElement | null = renderActiveSpotCard(bridge);
    if (activeSpotCard !== null) {
        container.appendChild(activeSpotCard);
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
