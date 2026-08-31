import {SKILL_ACCENT_COLORS, xpTrackerFormatHms, xpTrackerFormatXp} from '#/client/Client.js';
import type {PluginBridge, XpTrackerCardData} from '#/client/plugin/PluginBridge.js';
import type {PluginDescriptor} from '#/client/plugin/PluginManager.js';

// custom: Feather-style "bar-chart-2" line icon (MIT-licensed glyph set).
// Used only for the plugin's sidebar tab icon -- unrelated to (and unchanged
// by) the Total card's icon below.
const ICON_BAR_GRAPH = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>';

// custom (issue #99): red/green/blue vertical-bar glyph for the Total card's
// icon slot -- distinct from ICON_BAR_GRAPH above (the plugin's monochrome
// sidebar tab icon, a different location, unchanged).
const ICON_TOTAL_GRAPH =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">' +
    '<rect x="1" y="9" width="3.4" height="6" rx="0.5" fill="#e0524b"></rect>' +
    '<rect x="6.3" y="4" width="3.4" height="11" rx="0.5" fill="#2fbf60"></rect>' +
    '<rect x="11.6" y="1" width="3.4" height="14" rx="0.5" fill="#4b8ee0"></rect>' +
    '</svg>';

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

// custom (issue #99): shared icon slot for both a skill card and the Total
// card (same 24x24 container) -- accentColor is undefined for the Total
// card's icon, which never has a per-skill border tint.
function makeIcon(iconDataUrl: string | null, fallbackText: string, accentColor: string | undefined): HTMLDivElement {
    const icon: HTMLDivElement = document.createElement('div');
    icon.className = 'plugin-xptracker-icon';
    if (accentColor) {
        icon.style.borderColor = accentColor;
    }
    if (iconDataUrl !== null) {
        const img: HTMLImageElement = document.createElement('img');
        img.src = iconDataUrl;
        img.alt = fallbackText;
        icon.appendChild(img);
    } else {
        icon.textContent = fallbackText.slice(0, 2).toUpperCase();
    }
    return icon;
}

// custom (issue #99): one `label: value` row, gray label / bold white value
// -- shared between a skill card's 2-column metric grid and the Total card's
// single-column one.
function makeMetric(label: string, value: string): HTMLDivElement {
    const metric: HTMLDivElement = document.createElement('div');
    metric.className = 'plugin-xptracker-metric';

    const labelEl: HTMLSpanElement = document.createElement('span');
    labelEl.className = 'plugin-xptracker-metric-label';
    labelEl.textContent = `${label}:`;
    metric.appendChild(labelEl);

    const valueEl: HTMLSpanElement = document.createElement('span');
    valueEl.className = 'plugin-xptracker-metric-value';
    valueEl.textContent = value;
    metric.appendChild(valueEl);

    return metric;
}

function renderCard(card: XpTrackerCardData, bridge: PluginBridge): HTMLElement {
    const el: HTMLDivElement = document.createElement('div');
    el.className = 'plugin-xptracker-card';
    // custom (issue #109): drag-to-reorder (#84/#104) is desktop-only --
    // native HTML5 DnD has no touch fallback, so the attribute itself must
    // be conditional now that the sidebar reaches mobile devices too.
    el.draggable = !bridge.isMobile();
    el.dataset.skillId = String(card.skillId);

    const accentColor: string | undefined = SKILL_ACCENT_COLORS[card.skillId];

    const row: HTMLDivElement = document.createElement('div');
    row.className = 'plugin-xptracker-row';
    row.appendChild(makeIcon(card.iconDataUrl, card.skillName, accentColor));

    if (card.calculating) {
        const calculating: HTMLDivElement = document.createElement('div');
        calculating.className = 'plugin-xptracker-card-calculating';
        calculating.textContent = '(calculating...)';
        row.appendChild(calculating);
    } else {
        const metrics: HTMLDivElement = document.createElement('div');
        metrics.className = 'plugin-xptracker-metrics plugin-xptracker-metrics--2col';
        metrics.appendChild(makeMetric('Gained', xpTrackerFormatXp(card.xpGained)));
        metrics.appendChild(makeMetric('XP/hr', xpTrackerFormatXp(card.xpPerHour)));
        if (card.baseLevel < 99) {
            metrics.appendChild(makeMetric('XP Left', xpTrackerFormatXp(card.xpLeft)));
            metrics.appendChild(makeMetric('TTL', card.xpPerHour > 0 ? xpTrackerFormatHms(card.secondsToLevel) : '--'));
        }
        row.appendChild(metrics);
    }

    row.appendChild(makeResetButton(`Reset ${card.skillName} tracking`, (): void => bridge.resetXpTrackerSkill(card.skillId)));
    el.appendChild(row);

    if (!card.calculating && card.baseLevel < 99) {
        const barTrack: HTMLDivElement = document.createElement('div');
        barTrack.className = 'plugin-xptracker-card-bar-track';

        const barFill: HTMLDivElement = document.createElement('div');
        barFill.className = card.paused ? 'plugin-xptracker-card-bar-fill plugin-xptracker-card-bar-fill--paused' : 'plugin-xptracker-card-bar-fill';
        barFill.style.width = `${card.percentToLevel}%`;
        if (accentColor) {
            barFill.style.background = accentColor;
        }
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

function renderTotalCard(bridge: PluginBridge, cards: XpTrackerCardData[]): HTMLElement {
    const el: HTMLDivElement = document.createElement('div');
    el.className = 'plugin-xptracker-total-card';

    const row: HTMLDivElement = document.createElement('div');
    row.className = 'plugin-xptracker-row';

    const icon: HTMLDivElement = document.createElement('div');
    icon.className = 'plugin-xptracker-icon';
    icon.innerHTML = ICON_TOTAL_GRAPH;
    // custom (issue #99): the "Total" text label was dropped along with every
    // skill card's name text -- this title is the icon's only accessible name.
    icon.title = 'Total tracked XP across all skills';
    row.appendChild(icon);

    const totalGained: number = cards.reduce((s: number, c: XpTrackerCardData) => s + c.xpGained, 0);
    const totalPerHour: number = cards.reduce((s: number, c: XpTrackerCardData) => s + c.xpPerHour, 0);

    const metrics: HTMLDivElement = document.createElement('div');
    metrics.className = 'plugin-xptracker-metrics';
    metrics.appendChild(makeMetric('Gained', xpTrackerFormatXp(totalGained)));
    metrics.appendChild(makeMetric('Per Hour', xpTrackerFormatXp(totalPerHour)));
    row.appendChild(metrics);

    // custom (issue #88): resets every skill currently present in `cards`
    // (i.e. every currently-visible card), not every possible skill id.
    row.appendChild(makeResetButton('Reset all tracked skills', (): void => {
        for (const card of cards) {
            bridge.resetXpTrackerSkill(card.skillId);
        }
    }));

    el.appendChild(row);

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
        container.appendChild(renderCard(card, bridge));
    }

    // custom (issue #109): no listeners attached at all on mobile -- native
    // HTML5 DnD has no touch fallback, and PluginSidebar no longer
    // early-returns on isMobile() (it reaches mobile devices per #109), so
    // this guard is now load-bearing rather than dead code.
    if (!bridge.isMobile()) {
        attachDragReorder(container, bridge);
    }

    return container;
}

// custom: native HTML5 drag-and-drop reorder (issue #84) -- no touch/pointer
// fallback exists, so renderPanel() only calls this when !bridge.isMobile().
// Persists the full new skill-id order into config on drop so it
// survives PluginSidebar's every-1000ms renderContent() rebuild, rather than
// relying on in-memory DOM position. Drag state (draggedSkillId) is a closure
// local, not module state -- attachDragReorder runs fresh on every renderPanel
// call, so nothing needs to be reset between panel rebuilds.
function attachDragReorder(container: HTMLDivElement, bridge: PluginBridge): void {
    let draggedSkillId: number | null = null;

    const cardOf = (target: EventTarget | null): HTMLElement | null => {
        if (!(target instanceof HTMLElement)) {
            return null;
        }
        return target.closest<HTMLElement>('.plugin-xptracker-card');
    };

    container.addEventListener('dragstart', (e: DragEvent): void => {
        const card: HTMLElement | null = cardOf(e.target);
        if (card === null || card.dataset.skillId === undefined) {
            return;
        }

        draggedSkillId = Number(card.dataset.skillId);
        card.classList.add('plugin-xptracker-card-dragging');
        if (e.dataTransfer !== null) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', card.dataset.skillId);
        }
    });

    container.addEventListener('dragend', (e: DragEvent): void => {
        cardOf(e.target)?.classList.remove('plugin-xptracker-card-dragging');
        draggedSkillId = null;
    });

    container.addEventListener('dragover', (e: DragEvent): void => {
        if (draggedSkillId === null) {
            return;
        }

        // required so the browser treats this container as a valid drop target
        e.preventDefault();
        if (e.dataTransfer !== null) {
            e.dataTransfer.dropEffect = 'move';
        }
    });

    container.addEventListener('drop', (e: DragEvent): void => {
        e.preventDefault();

        const dragged: number | null = draggedSkillId;
        draggedSkillId = null;
        if (dragged === null) {
            return;
        }

        const dropCard: HTMLElement | null = cardOf(e.target);
        if (dropCard === null || dropCard.dataset.skillId === undefined) {
            return;
        }

        const dropSkillId: number = Number(dropCard.dataset.skillId);
        if (dropSkillId === dragged) {
            return;
        }

        const cardEls: HTMLElement[] = Array.from(container.querySelectorAll<HTMLElement>('.plugin-xptracker-card'));
        const order: number[] = cardEls.map((el: HTMLElement): number => Number(el.dataset.skillId));

        const fromIndex: number = order.indexOf(dragged);
        const toIndex: number = order.indexOf(dropSkillId);
        if (fromIndex === -1 || toIndex === -1) {
            return;
        }

        order.splice(fromIndex, 1);
        order.splice(toIndex, 0, dragged);

        bridge.setPluginConfig('xpTracker', {cardOrder: order});
    });
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
