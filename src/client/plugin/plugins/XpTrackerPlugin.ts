import {xpTrackerFormatHms, xpTrackerFormatXp} from '#/client/Client.js';
import type {PluginBridge, XpTrackerCardData} from '#/client/plugin/PluginBridge.js';
import type {PluginDescriptor} from '#/client/plugin/PluginManager.js';

// custom: Feather-style "bar-chart-2" line icon (MIT-licensed glyph set).
const ICON_BAR_GRAPH = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>';

function renderCard(card: XpTrackerCardData): HTMLElement {
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

    for (const card of cards) {
        container.appendChild(renderCard(card));
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
