import {xpTrackerFormatHms, xpTrackerFormatXp} from '#/client/Client.js';
import type {PluginBridge, XpTrackerCardData} from '#/client/plugin/PluginBridge.js';
import type {PluginDescriptor} from '#/client/plugin/PluginManager.js';

// custom: Feather-style "bar-chart-2" line icon (MIT-licensed glyph set).
const ICON_BAR_GRAPH = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>';

// custom (issue #86): read the raw stored target straight from the plugin
// config blob (not from XpTrackerCardData -- which only carries derived,
// already-validated numbers recomputed once a second) so the control's
// displayed value always mirrors exactly what's persisted.
function readStoredTarget(bridge: PluginBridge, skillId: number): number | null {
    const levelTargets: unknown = bridge.getPluginConfig('xpTracker').levelTargets;
    if (typeof levelTargets !== 'object' || levelTargets === null) {
        return null;
    }
    const raw: unknown = (levelTargets as Record<string, unknown>)[String(skillId)];
    return typeof raw === 'number' && Number.isInteger(raw) ? raw : null;
}

function readLevelTargets(bridge: PluginBridge): Record<string, number> {
    const levelTargets: unknown = bridge.getPluginConfig('xpTracker').levelTargets;
    return typeof levelTargets === 'object' && levelTargets !== null ? {...(levelTargets as Record<string, number>)} : {};
}

// custom (issue #86): inline target-level number input + clear button for a
// card's bar area. Validates as an integer strictly greater than baseLevel
// and at most 99 on commit (Enter or blur); an invalid value is flagged and
// left uncommitted -- the stored config is never touched.
function renderTargetControl(card: XpTrackerCardData, bridge: PluginBridge): HTMLElement {
    const row: HTMLDivElement = document.createElement('div');
    row.className = 'plugin-xptracker-card-target-row';

    const input: HTMLInputElement = document.createElement('input');
    input.type = 'number';
    input.className = 'plugin-xptracker-card-target-input';
    input.placeholder = 'Target lvl';
    input.min = String(card.baseLevel + 1);
    input.max = '99';
    input.step = '1';
    const stored: number | null = readStoredTarget(bridge, card.skillId);
    if (stored !== null) {
        input.value = String(stored);
    }

    const clearButton: HTMLButtonElement = document.createElement('button');
    clearButton.type = 'button';
    clearButton.className = 'plugin-xptracker-card-target-clear';
    clearButton.textContent = 'Clear';
    clearButton.title = 'Clear target level';
    clearButton.disabled = stored === null;

    const commit = (): void => {
        const raw: string = input.value.trim();
        if (raw === '') {
            return;
        }

        const parsed: number = Number(raw);
        if (!Number.isInteger(parsed) || parsed <= card.baseLevel || parsed > 99) {
            input.classList.add('plugin-xptracker-card-target-input-invalid');
            return;
        }
        input.classList.remove('plugin-xptracker-card-target-input-invalid');

        const levelTargets: Record<string, number> = readLevelTargets(bridge);
        levelTargets[String(card.skillId)] = parsed;
        bridge.setPluginConfig('xpTracker', {levelTargets});
        clearButton.disabled = false;
    };

    input.addEventListener('keydown', (e: KeyboardEvent): void => {
        if (e.key === 'Enter') {
            commit();
            input.blur();
        }
    });
    input.addEventListener('blur', commit);
    input.addEventListener('input', (): void => input.classList.remove('plugin-xptracker-card-target-input-invalid'));
    row.appendChild(input);

    clearButton.addEventListener('click', (): void => {
        const levelTargets: Record<string, number> = readLevelTargets(bridge);
        delete levelTargets[String(card.skillId)];
        bridge.setPluginConfig('xpTracker', {levelTargets});
        input.value = '';
        input.classList.remove('plugin-xptracker-card-target-input-invalid');
        clearButton.disabled = true;
    });
    row.appendChild(clearButton);

    return row;
}

function renderCard(card: XpTrackerCardData, bridge: PluginBridge): HTMLElement {
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
        barFill.className = 'plugin-xptracker-card-bar-fill';
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
        barLevelRight.textContent = String(card.targetLevel ?? card.baseLevel + 1);
        barTrack.appendChild(barLevelRight);

        el.appendChild(barTrack);
        el.appendChild(renderTargetControl(card, bridge));
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
        container.appendChild(renderCard(card, bridge));
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
