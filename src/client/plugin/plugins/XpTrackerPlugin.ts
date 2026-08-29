import {xpTrackerFormatHms, xpTrackerFormatXp} from '#/client/Client.js';
import type {PluginBridge, XpTrackerCardData} from '#/client/plugin/PluginBridge.js';
import type {PluginDescriptor} from '#/client/plugin/PluginManager.js';

// custom: Feather-style "bar-chart-2" line icon (MIT-licensed glyph set).
const ICON_BAR_GRAPH = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>';

// custom (issue #88): Feather-style "refresh-cw" line icon (MIT-licensed
// glyph set), reused for both the per-card reset button and the total card's
// reset-all button -- follows PluginSidebar.ts's settings-cog icon-button
// convention (inline SVG, no new asset file).
const ICON_REFRESH =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline>' +
    '<path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>' +
    '</svg>';

function makeResetButton(label: string, onReset: () => void): HTMLButtonElement {
    const btn: HTMLButtonElement = document.createElement('button');
    btn.type = 'button';
    btn.className = 'plugin-xptracker-reset-btn';
    btn.innerHTML = ICON_REFRESH;
    btn.setAttribute('aria-label', label);
    btn.title = label;
    btn.addEventListener('click', (): void => onReset());
    return btn;
}

function renderCard(bridge: PluginBridge, card: XpTrackerCardData): HTMLElement {
    const el: HTMLDivElement = document.createElement('div');
    el.className = 'plugin-xptracker-card';

    const head: HTMLDivElement = document.createElement('div');
    head.className = 'plugin-xptracker-card-head';

    const badge: HTMLDivElement = document.createElement('div');
    badge.className = 'plugin-xptracker-card-badge';
    badge.textContent = card.skillName.slice(0, 2).toUpperCase();
    head.appendChild(badge);

    const name: HTMLSpanElement = document.createElement('span');
    name.className = 'plugin-xptracker-card-name';
    name.textContent = card.skillName;
    head.appendChild(name);

    head.appendChild(makeResetButton(`Reset ${card.skillName} tracking`, (): void => bridge.resetXpTrackerSkill(card.skillId)));

    el.appendChild(head);

    const stats: HTMLDivElement = document.createElement('div');
    stats.className = 'plugin-xptracker-card-stats';
    if (card.calculating) {
        stats.textContent = '(calculating...)';
        el.appendChild(stats);
    } else {
        const rows: string[] = [`XP Gained: ${xpTrackerFormatXp(card.xpGained)}`, `XP/hr: ${xpTrackerFormatXp(card.xpPerHour)}`];
        if (card.baseLevel < 99) {
            rows.push(`XP Left: ${xpTrackerFormatXp(card.xpLeft)}`);
            rows.push(`TTL: ${card.xpPerHour > 0 ? xpTrackerFormatHms(card.secondsToLevel) : '--'}`);
        }
        for (const row of rows) {
            const rowEl: HTMLDivElement = document.createElement('div');
            rowEl.className = 'plugin-xptracker-card-stat-row';
            rowEl.textContent = row;
            stats.appendChild(rowEl);
        }
        el.appendChild(stats);
    }

    if (!card.calculating && card.baseLevel < 99) {
        const barTrack: HTMLDivElement = document.createElement('div');
        barTrack.className = 'plugin-xptracker-card-bar-track';

        const barFill: HTMLDivElement = document.createElement('div');
        barFill.className = card.paused ? 'plugin-xptracker-card-bar-fill plugin-xptracker-card-bar-fill--paused' : 'plugin-xptracker-card-bar-fill';
        barFill.style.width = `${card.percentToLevel}%`;
        barTrack.appendChild(barFill);

        const barLevelLeft: HTMLDivElement = document.createElement('div');
        barLevelLeft.className = 'plugin-xptracker-card-bar-level-left';
        barLevelLeft.textContent = String(card.baseLevel);
        barTrack.appendChild(barLevelLeft);

        const barLabel: HTMLDivElement = document.createElement('div');
        barLabel.className = 'plugin-xptracker-card-bar-label';
        barLabel.textContent = `${card.percentToLevel.toFixed(0)}%`;
        barTrack.appendChild(barLabel);

        const barLevelRight: HTMLDivElement = document.createElement('div');
        barLevelRight.className = 'plugin-xptracker-card-bar-level-right';
        barLevelRight.textContent = String(card.baseLevel + 1);
        barTrack.appendChild(barLevelRight);

        el.appendChild(barTrack);
    }

    return el;
}

function renderTotalCard(bridge: PluginBridge, cards: XpTrackerCardData[]): HTMLElement {
    const el: HTMLDivElement = document.createElement('div');
    el.className = 'plugin-xptracker-total-card';

    const head: HTMLDivElement = document.createElement('div');
    head.className = 'plugin-xptracker-total-card-head';

    const label: HTMLSpanElement = document.createElement('span');
    label.className = 'plugin-xptracker-total-card-label';
    label.textContent = 'Total';
    head.appendChild(label);

    // custom (issue #88): resets every skill currently present in `cards`
    // (i.e. every currently-visible card), not every possible skill id.
    head.appendChild(makeResetButton('Reset all tracked skills', (): void => {
        for (const card of cards) {
            bridge.resetXpTrackerSkill(card.skillId);
        }
    }));

    el.appendChild(head);

    const totalGained: number = cards.reduce((s: number, c: XpTrackerCardData) => s + c.xpGained, 0);
    const totalPerHour: number = cards.reduce((s: number, c: XpTrackerCardData) => s + c.xpPerHour, 0);

    const rows: string[] = [`Total XP Gained: ${xpTrackerFormatXp(totalGained)}`, `Total XP/hr: ${xpTrackerFormatXp(totalPerHour)}`];
    for (const row of rows) {
        const rowEl: HTMLDivElement = document.createElement('div');
        rowEl.className = 'plugin-xptracker-total-card-row';
        rowEl.textContent = row;
        el.appendChild(rowEl);
    }

    return el;
}

function renderPanel(bridge: PluginBridge): HTMLElement {
    const container: HTMLDivElement = document.createElement('div');
    container.className = 'plugin-xptracker-panel';

    const cards: XpTrackerCardData[] = bridge.getXpTrackerCards();
    if (cards.length === 0) {
        const empty: HTMLDivElement = document.createElement('div');
        empty.className = 'plugin-panel-empty';
        empty.textContent = 'No XP gains tracked yet.';
        container.appendChild(empty);
        return container;
    }

    // custom: total card is always pinned first, computed fresh from `cards`
    // on every render -- never draggable/reorderable, unaffected by any
    // manual card order set via drag-to-reorder (#84).
    container.appendChild(renderTotalCard(bridge, cards));

    for (const card of cards) {
        container.appendChild(renderCard(bridge, card));
    }

    return container;
}

const xpTrackerPlugin: PluginDescriptor = {
    id: 'xpTracker',
    displayName: 'XP Tracker',
    icon: ICON_BAR_GRAPH,
    worksPreLogin: false,
    defaultEnabled: true,
    renderPanel
};

export default xpTrackerPlugin;
