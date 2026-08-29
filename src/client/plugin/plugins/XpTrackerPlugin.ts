import {SKILL_ACCENT_COLORS, xpTrackerFormatHms, xpTrackerFormatXp} from '#/client/Client.js';
import type {PluginBridge, XpTrackerCardData} from '#/client/plugin/PluginBridge.js';
import type {PluginDescriptor} from '#/client/plugin/PluginManager.js';

// custom: Feather-style "bar-chart-2" line icon (MIT-licensed glyph set).
const ICON_BAR_GRAPH = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>';

function renderCard(card: XpTrackerCardData): HTMLElement {
    const el: HTMLDivElement = document.createElement('div');
    el.className = 'plugin-xptracker-card';
    el.draggable = true;
    el.dataset.skillId = String(card.skillId);

    const head: HTMLDivElement = document.createElement('div');
    head.className = 'plugin-xptracker-card-head';

    const accentColor: string | undefined = SKILL_ACCENT_COLORS[card.skillId];

    const badge: HTMLDivElement = document.createElement('div');
    badge.className = 'plugin-xptracker-card-badge';
    if (accentColor) {
        badge.style.borderColor = accentColor;
    }
    if (card.iconDataUrl !== null) {
        const icon: HTMLImageElement = document.createElement('img');
        icon.src = card.iconDataUrl;
        icon.alt = card.skillName;
        badge.appendChild(icon);
    } else {
        badge.textContent = card.skillName.slice(0, 2).toUpperCase();
    }
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

    attachDragReorder(container, bridge);

    return container;
}

// custom: native HTML5 drag-and-drop reorder (issue #84) -- no touch/pointer
// fallback needed since PluginSidebar.init() already early-returns on
// isMobile(). Persists the full new skill-id order into config on drop so it
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
