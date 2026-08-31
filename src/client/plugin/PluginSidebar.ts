import type {PluginBridge} from '#/client/plugin/PluginBridge.js';
import type {PluginConfig, PluginDescriptor} from '#/client/plugin/PluginManager.js';

const ICON_COLUMN_WIDTH = 40;
const CONTENT_PANEL_WIDTH = 225;
const CONTENT_REFRESH_MS = 1000;
const SETTINGS_PANEL_ID = 'settings';
// custom (issue #109): mobile-only sizing. NATIVE_CANVAS_WIDTH mirrors the
// canvas's native 765px width, which #73's mobile 1.0x scale floor in
// engine/view/client.ejs guarantees is the effective on-screen canvas width
// on mobile -- this constant is deliberately independent of that file (see
// class comment below) rather than read from it.
const NATIVE_CANVAS_WIDTH = 765;
const MIN_CONTENT_PANEL_WIDTH = 150;

// custom: Feather-style "settings" line icon (MIT-licensed glyph set).
const ICON_SETTINGS =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="12" cy="12" r="3"></circle>' +
    '<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>' +
    '</svg>';

const STYLES = `
#plugin-sidebar { display: flex; flex-direction: row; align-items: stretch; background: #000; font-family: Arial, Helvetica, sans-serif; }
.plugin-sidebar-icons { width: ${ICON_COLUMN_WIDTH}px; flex: 0 0 ${ICON_COLUMN_WIDTH}px; display: flex; flex-direction: column; align-items: center; background: #1b1b1b; border-left: 1px solid #333; padding-top: 4px; }
.plugin-sidebar-icon { width: 32px; height: 32px; margin: 4px 0; padding: 0; border: 1px solid #444; border-radius: 4px; background: #2a2a2a; color: #ccc; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.plugin-sidebar-icon:hover { background: #3a3a3a; color: #fff; }
.plugin-sidebar-icon svg { width: 18px; height: 18px; }
.plugin-sidebar-cog { color: #04A800; }
.plugin-sidebar-content { width: ${CONTENT_PANEL_WIDTH}px; flex: 0 0 ${CONTENT_PANEL_WIDTH}px; background: #111; border-left: 1px solid #333; color: #ddd; font-size: 12px; overflow-y: auto; box-sizing: border-box; padding: 6px; }
.plugin-settings-row { display: flex; align-items: center; justify-content: space-between; padding: 6px 4px; border-bottom: 1px solid #262626; }
.plugin-toggle { position: relative; display: inline-block; width: 32px; height: 18px; flex: 0 0 32px; }
.plugin-toggle input { opacity: 0; width: 0; height: 0; }
.plugin-toggle-slider { position: absolute; inset: 0; background: #444; border-radius: 9px; transition: background-color .15s; }
.plugin-toggle-slider::before { content: ''; position: absolute; width: 14px; height: 14px; left: 2px; top: 2px; background: #ccc; border-radius: 50%; transition: transform .15s; }
.plugin-toggle input:checked + .plugin-toggle-slider { background: #04A800; }
.plugin-toggle input:checked + .plugin-toggle-slider::before { transform: translateX(14px); background: #fff; }
.plugin-toggle input:disabled + .plugin-toggle-slider { opacity: 0.4; cursor: not-allowed; }
.plugin-panel-empty { color: #888; padding: 8px 4px; }
.plugin-xptracker-total-card { border: 1px solid #04A800; border-radius: 4px; padding: 6px; margin-bottom: 8px; background: #10210f; }
.plugin-xptracker-card { border: 1px solid #333; border-radius: 4px; padding: 6px; margin-bottom: 6px; cursor: grab; }
.plugin-xptracker-card-dragging { opacity: 0.4; }
.plugin-xptracker-reset-btn { margin-left: auto; width: 18px; height: 18px; flex: 0 0 18px; padding: 0; border: 1px solid #444; border-radius: 4px; background: #2a2a2a; color: #ccc; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.plugin-xptracker-reset-btn:hover { background: #3a3a3a; color: #fff; }
.plugin-xptracker-reset-btn svg { width: 11px; height: 11px; }
.plugin-xptracker-row { display: flex; align-items: flex-start; gap: 8px; }
.plugin-xptracker-icon { width: 24px; height: 24px; border-radius: 5px; background: #202020; border: 1px solid #333; color: #04A800; font-size: 9px; font-weight: bold; display: flex; align-items: center; justify-content: center; flex: 0 0 24px; overflow: hidden; }
.plugin-xptracker-icon img { width: 16px; height: 16px; object-fit: contain; image-rendering: pixelated; }
.plugin-xptracker-icon svg { width: 15px; height: 15px; }
.plugin-xptracker-metrics { display: grid; grid-template-columns: 1fr; row-gap: 2px; flex: 1 1 auto; min-width: 0; }
.plugin-xptracker-metrics--2col { grid-template-columns: 1fr 1fr; column-gap: 8px; }
.plugin-xptracker-metric { display: flex; align-items: baseline; gap: 4px; line-height: 1.5; white-space: nowrap; }
.plugin-xptracker-metric-label { font-size: 11px; color: #9aa39a; }
.plugin-xptracker-metric-value { font-size: 12px; color: #f2f2f2; font-weight: 600; font-variant-numeric: tabular-nums; }
.plugin-xptracker-card-calculating { color: #cc0; font-size: 11px; line-height: 1.5; }
.plugin-xptracker-card-bar-track { position: relative; height: 16px; background: #333; border: 1px solid #000; border-radius: 2px; overflow: hidden; margin-top: 8px; }
.plugin-xptracker-card-bar-fill { position: absolute; inset: 0; width: 0; background: #04A800; }
.plugin-xptracker-card-bar-fill--paused { background: #777; }
.plugin-xptracker-card-bar-label { position: absolute; inset: 0; text-align: center; line-height: 16px; font-size: 10px; color: #fff; }
.plugin-xptracker-card-bar-level-left { position: absolute; left: 4px; top: 0; line-height: 16px; font-size: 10px; color: #fff; }
.plugin-xptracker-card-bar-level-right { position: absolute; right: 4px; top: 0; line-height: 16px; font-size: 10px; color: #fff; }
.plugin-settings-subsection { padding: 2px 4px 8px 12px; border-bottom: 1px solid #262626; }
.plugin-settings-subrow { display: flex; align-items: center; justify-content: space-between; padding: 4px 0; font-size: 11px; color: #ccc; gap: 6px; }
.plugin-settings-number-input { width: 48px; background: #1b1b1b; border: 1px solid #444; color: #ddd; font-size: 11px; padding: 2px 4px; border-radius: 2px; box-sizing: border-box; }
.plugin-xptracker-card-target-row { display: flex; align-items: center; gap: 4px; margin-top: 4px; }
.plugin-xptracker-card-target-input { width: 52px; background: #1b1b1b; border: 1px solid #444; color: #ddd; font-size: 11px; padding: 2px 4px; border-radius: 2px; box-sizing: border-box; }
.plugin-xptracker-card-target-input:focus { outline: none; border-color: #04A800; }
.plugin-xptracker-card-target-input-invalid { border-color: #c33; }
.plugin-xptracker-card-target-clear { background: #2a2a2a; border: 1px solid #444; color: #ccc; font-size: 10px; padding: 2px 6px; border-radius: 2px; cursor: pointer; }
.plugin-xptracker-card-target-clear:disabled { opacity: 0.4; cursor: not-allowed; }
.plugin-xptracker-card-target-clear:hover:not(:disabled) { background: #3a3a3a; color: #fff; }
/* custom (issue #109): mobile touch-target enlargement. Each rule reaches at
   least a 44x44px effective hit area -- via padding/min-width/min-height,
   not necessarily a 44px visual size (e.g. the toggle keeps its 32x18
   slider, just inside a 44x44 tappable label). Desktop's rules above are
   untouched; these only apply when PluginSidebar.buildDom() adds the
   plugin-sidebar--mobile modifier class to the sidebar root. */
.plugin-sidebar--mobile .plugin-toggle { width: 44px; height: 44px; flex: 0 0 44px; display: inline-flex; align-items: center; justify-content: center; }
.plugin-sidebar--mobile .plugin-toggle-slider { position: static; width: 32px; height: 18px; flex: 0 0 auto; }
.plugin-sidebar--mobile .plugin-xptracker-reset-btn { width: 44px; height: 44px; flex: 0 0 44px; }
.plugin-sidebar--mobile .plugin-xptracker-reset-btn svg { width: 16px; height: 16px; }
.plugin-sidebar--mobile .plugin-settings-number-input { min-height: 44px; padding: 4px 8px; font-size: 14px; }
.plugin-sidebar--mobile .plugin-xptracker-card-target-input { min-height: 44px; padding: 4px 8px; font-size: 14px; }
.plugin-sidebar--mobile .plugin-xptracker-card-target-clear { min-width: 44px; min-height: 44px; padding: 8px 10px; }
`;

// custom: RuneLite-style DOM plugin panel, injected into document.body at
// runtime (following MobileKeyboard.ts's DOM-injection pattern). Reads/writes
// exclusively through the PluginBridge -- never touches Client internals or
// localStorage directly.
// custom (issue #109): on mobile, reuses this exact same icon-column +
// content-panel DOM instead of an overlay/bottom-sheet, un-suppressing
// itself whenever evaluateMobileFit() finds enough letterboxed space beside
// the canvas. Deliberately has zero coupling to engine/view/client.ejs --
// see NATIVE_CANVAS_WIDTH above -- it only ever reads window.innerWidth.
class PluginSidebar {
    private bridge: PluginBridge | null = null;
    private root: HTMLDivElement | null = null;
    private iconColumn: HTMLDivElement | null = null;
    private contentPanel: HTMLDivElement | null = null;
    private openId: string | null = null;
    private refreshTimer: ReturnType<typeof setInterval> | null = null;
    // custom (issue #109): the mobile-clamped content panel width computed by
    // evaluateMobileFit() -- Math.min(CONTENT_PANEL_WIDTH, Math.max(
    // MIN_CONTENT_PANEL_WIDTH, availableWidth - ICON_COLUMN_WIDTH)). Unused
    // on desktop, which always renders at the fixed CONTENT_PANEL_WIDTH.
    private mobileContentWidth: number = CONTENT_PANEL_WIDTH;
    // custom (cboyd10/runescape#104): true while a native HTML5 drag gesture
    // is in progress inside contentPanel -- set by listeners on contentPanel
    // itself in buildDom(), which native drag events bubble up to regardless
    // of which plugin (e.g. XpTrackerPlugin's attachDragReorder) started
    // them. Generic on purpose: PluginSidebar doesn't need to know which
    // plugin, or which of its classes, is dragging.
    private dragActive = false;

    init(bridge: PluginBridge): void {
        if (this.bridge !== null) {
            return;
        }

        this.bridge = bridge;
        this.injectStyles();
        bridge.onPluginChange((): void => this.onPluginChange());

        if (this.isMobile()) {
            // custom (issue #109): re-evaluated on every resize -- covers
            // orientation change with no separate listener, matching
            // client.ejs's existing resize-driven canvas auto-sizing -- since
            // a rotated device can gain or lose the letterboxed space the
            // sidebar needs. Desktop never attaches this listener and never
            // tears itself down after construction.
            window.addEventListener('resize', (): void => this.evaluateMobileFit());
            this.evaluateMobileFit();
        } else {
            this.buildDom();
            this.renderIcons();
        }
    }

    // custom: total horizontal px the sidebar currently occupies -- read by
    // client.ejs's setSize('auto') via PluginBridge.getSidebarWidth().
    getTotalWidth(): number {
        if (this.root === null) {
            return 0;
        }

        return ICON_COLUMN_WIDTH + (this.openId !== null ? (this.isMobile() ? this.mobileContentWidth : CONTENT_PANEL_WIDTH) : 0);
    }

    // custom (issue #109): computes whether the sidebar fits in the
    // letterboxed space left beside the canvas on mobile, and
    // initializes/tears down the DOM sidebar accordingly. availableWidth <
    // ICON_COLUMN_WIDTH + MIN_CONTENT_PANEL_WIDTH naturally covers portrait
    // orientation too (no side letterboxing there) without a separate
    // orientation check.
    private evaluateMobileFit(): void {
        const availableWidth: number = window.innerWidth - NATIVE_CANVAS_WIDTH;
        const fits: boolean = availableWidth >= ICON_COLUMN_WIDTH + MIN_CONTENT_PANEL_WIDTH;

        if (!fits) {
            this.teardownMobileSidebar();
            return;
        }

        this.mobileContentWidth = Math.min(CONTENT_PANEL_WIDTH, Math.max(MIN_CONTENT_PANEL_WIDTH, availableWidth - ICON_COLUMN_WIDTH));

        if (this.root === null) {
            this.buildDom();
            this.renderIcons();
            return;
        }

        if (this.contentPanel !== null) {
            this.contentPanel.style.flex = `0 0 ${this.mobileContentWidth}px`;
            this.contentPanel.style.width = `${this.mobileContentWidth}px`;
        }
    }

    // custom (issue #109): tears down the DOM sidebar when a resize/
    // orientation change no longer leaves enough letterboxed space for it --
    // mirrors buildDom()'s construction so getTotalWidth() correctly reports
    // 0 again (client.ejs's setSize('auto') reads this to reclaim the
    // canvas width).
    private teardownMobileSidebar(): void {
        if (this.root === null) {
            return;
        }

        this.close();
        this.root.remove();
        this.root = null;
        this.iconColumn = null;
        this.contentPanel = null;
    }

    private isMobile(): boolean {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|Mobile/i.test(navigator.userAgent)) {
            return true;
        }

        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    private injectStyles(): void {
        const style: HTMLStyleElement = document.createElement('style');
        style.textContent = STYLES;
        document.head.appendChild(style);
    }

    private buildDom(): void {
        this.root = document.createElement('div');
        this.root.id = 'plugin-sidebar';
        if (this.isMobile()) {
            this.root.classList.add('plugin-sidebar--mobile');
        }

        this.contentPanel = document.createElement('div');
        this.contentPanel.className = 'plugin-sidebar-content';
        this.contentPanel.style.display = 'none';
        if (this.isMobile()) {
            // custom (issue #109): overrides the fixed-width CSS class rule
            // (flex-basis wins over width when both are set, so both are
            // set here) with the letterboxed-space-clamped width computed by
            // evaluateMobileFit() -- kept as an inline style rather than
            // templated into STYLES since it's a per-instance, runtime value.
            this.contentPanel.style.flex = `0 0 ${this.mobileContentWidth}px`;
            this.contentPanel.style.width = `${this.mobileContentWidth}px`;
        }
        // custom (cboyd10/runescape#104): native drag events bubble from
        // whatever inner element started the drag (e.g. a
        // .plugin-xptracker-card) up to contentPanel -- listening here once
        // covers every plugin's drag-and-drop without contentPanel needing to
        // know about any of them.
        this.contentPanel.addEventListener('dragstart', (): void => {
            this.dragActive = true;
        });
        this.contentPanel.addEventListener('dragend', (): void => {
            this.dragActive = false;
        });
        this.contentPanel.addEventListener('drop', (): void => {
            this.dragActive = false;
        });
        this.root.appendChild(this.contentPanel);

        this.iconColumn = document.createElement('div');
        this.iconColumn.className = 'plugin-sidebar-icons';
        this.root.appendChild(this.iconColumn);

        const cogButton: HTMLButtonElement = document.createElement('button');
        cogButton.type = 'button';
        cogButton.className = 'plugin-sidebar-icon plugin-sidebar-cog';
        cogButton.innerHTML = ICON_SETTINGS;
        cogButton.setAttribute('aria-label', 'Plugin settings');
        cogButton.addEventListener('click', (): void => this.toggle(SETTINGS_PANEL_ID));
        this.iconColumn.appendChild(cogButton);

        document.body.appendChild(this.root);
    }

    private toggle(id: string): void {
        if (this.openId === id) {
            this.close();
        } else {
            this.open(id);
        }
    }

    private open(id: string): void {
        this.openId = id;
        this.renderContent();
        if (this.contentPanel !== null) {
            this.contentPanel.style.display = 'block';
        }
        this.startAutoRefresh();
    }

    private close(): void {
        this.openId = null;
        if (this.contentPanel !== null) {
            this.contentPanel.style.display = 'none';
            this.contentPanel.innerHTML = '';
        }
        this.stopAutoRefresh();
    }

    private startAutoRefresh(): void {
        this.stopAutoRefresh();
        this.refreshTimer = setInterval((): void => {
            // custom (issue #86): the auto-refresh tick tears down and rebuilds
            // the whole content panel every second (see renderContent below).
            // Skip a tick while an input inside it is focused so an in-progress
            // edit (e.g. typing a target level) doesn't get wiped mid-keystroke.
            if (this.contentPanel !== null && document.activeElement instanceof HTMLInputElement && this.contentPanel.contains(document.activeElement)) {
                return;
            }
            // custom (cboyd10/runescape#104): same reasoning, for a native
            // drag-and-drop gesture in progress -- the dragged DOM node being
            // torn down and rebuilt mid-gesture is why reordering practically
            // never worked. The panel is at most one refresh tick (1s) stale
            // for the duration of a drag, which is an acceptable tradeoff.
            if (this.dragActive) {
                return;
            }
            this.renderContent();
        }, CONTENT_REFRESH_MS);
    }

    private stopAutoRefresh(): void {
        if (this.refreshTimer !== null) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    private onPluginChange(): void {
        this.renderIcons();

        if (this.openId !== null && this.openId !== SETTINGS_PANEL_ID && this.bridge !== null && !this.bridge.isPluginEnabled(this.openId)) {
            this.close();
            return;
        }

        if (this.openId !== null) {
            this.renderContent();
        }
    }

    private renderIcons(): void {
        if (this.iconColumn === null || this.bridge === null) {
            return;
        }

        this.iconColumn.querySelectorAll('.plugin-sidebar-plugin-icon').forEach((el: Element): void => el.remove());

        for (const descriptor of this.bridge.getPluginDescriptors()) {
            if (!this.bridge.isPluginEnabled(descriptor.id)) {
                continue;
            }

            const button: HTMLButtonElement = document.createElement('button');
            button.type = 'button';
            button.className = 'plugin-sidebar-icon plugin-sidebar-plugin-icon';
            button.innerHTML = descriptor.icon;
            button.setAttribute('aria-label', descriptor.displayName);
            button.addEventListener('click', (): void => this.toggle(descriptor.id));
            this.iconColumn.appendChild(button);
        }
    }

    private renderContent(): void {
        if (this.contentPanel === null || this.bridge === null || this.openId === null) {
            return;
        }

        this.contentPanel.innerHTML = '';
        this.contentPanel.appendChild(this.openId === SETTINGS_PANEL_ID ? this.renderSettingsList(this.bridge) : this.renderPluginPanel(this.bridge, this.openId));
    }

    private renderPluginPanel(bridge: PluginBridge, id: string): HTMLElement {
        const descriptor: PluginDescriptor | undefined = bridge.getPluginDescriptors().find((d: PluginDescriptor): boolean => d.id === id);
        if (descriptor === undefined) {
            const empty: HTMLDivElement = document.createElement('div');
            empty.className = 'plugin-panel-empty';
            return empty;
        }

        return descriptor.renderPanel(bridge);
    }

    private renderSettingsList(bridge: PluginBridge): HTMLElement {
        const list: HTMLDivElement = document.createElement('div');
        list.className = 'plugin-settings-list';

        for (const descriptor of bridge.getPluginDescriptors()) {
            const row: HTMLDivElement = document.createElement('div');
            row.className = 'plugin-settings-row';

            const name: HTMLSpanElement = document.createElement('span');
            name.textContent = descriptor.displayName;
            row.appendChild(name);

            const toggleLabel: HTMLLabelElement = document.createElement('label');
            toggleLabel.className = 'plugin-toggle';

            const toggleInput: HTMLInputElement = document.createElement('input');
            toggleInput.type = 'checkbox';
            toggleInput.checked = bridge.isPluginEnabled(descriptor.id);
            toggleInput.disabled = !descriptor.worksPreLogin && !bridge.isLoggedIn();
            toggleInput.addEventListener('change', (): void => bridge.setPluginEnabled(descriptor.id, toggleInput.checked));
            toggleLabel.appendChild(toggleInput);

            const slider: HTMLSpanElement = document.createElement('span');
            slider.className = 'plugin-toggle-slider';
            toggleLabel.appendChild(slider);

            row.appendChild(toggleLabel);
            list.appendChild(row);

            // custom (issue #87): xpTracker-specific pause settings, shown as a small
            // sub-section under its own row -- panel-level (not per-card), so they live
            // here rather than inside XpTrackerPlugin.ts's renderPanel().
            if (descriptor.id === 'xpTracker') {
                list.appendChild(this.renderXpTrackerPauseSettings(bridge));
            }
        }

        return list;
    }

    private renderXpTrackerPauseSettings(bridge: PluginBridge): HTMLElement {
        const config: PluginConfig = bridge.getPluginConfig('xpTracker');
        const pauseAfterMinutes: number = typeof config.pauseAfterMinutes === 'number' && config.pauseAfterMinutes > 0 ? config.pauseAfterMinutes : 0;
        const pauseOnLogout: boolean = config.pauseOnLogout === true;

        const sub: HTMLDivElement = document.createElement('div');
        sub.className = 'plugin-settings-subsection';

        const pauseAfterRow: HTMLDivElement = document.createElement('div');
        pauseAfterRow.className = 'plugin-settings-subrow';

        const pauseAfterLabel: HTMLSpanElement = document.createElement('span');
        pauseAfterLabel.textContent = 'Pause after (minutes)';
        pauseAfterRow.appendChild(pauseAfterLabel);

        const pauseAfterInput: HTMLInputElement = document.createElement('input');
        pauseAfterInput.type = 'number';
        pauseAfterInput.min = '0';
        pauseAfterInput.className = 'plugin-settings-number-input';
        pauseAfterInput.placeholder = 'Off';
        pauseAfterInput.value = pauseAfterMinutes > 0 ? String(pauseAfterMinutes) : '';
        pauseAfterInput.addEventListener('change', (): void => {
            const parsed: number = parseInt(pauseAfterInput.value, 10);
            bridge.setPluginConfig('xpTracker', {pauseAfterMinutes: Number.isFinite(parsed) && parsed > 0 ? parsed : 0});
        });
        pauseAfterRow.appendChild(pauseAfterInput);
        sub.appendChild(pauseAfterRow);

        const pauseLogoutRow: HTMLDivElement = document.createElement('div');
        pauseLogoutRow.className = 'plugin-settings-subrow';

        const pauseLogoutLabel: HTMLSpanElement = document.createElement('span');
        pauseLogoutLabel.textContent = 'Pause on logout';
        pauseLogoutRow.appendChild(pauseLogoutLabel);

        const logoutToggleLabel: HTMLLabelElement = document.createElement('label');
        logoutToggleLabel.className = 'plugin-toggle';

        const logoutToggleInput: HTMLInputElement = document.createElement('input');
        logoutToggleInput.type = 'checkbox';
        logoutToggleInput.checked = pauseOnLogout;
        logoutToggleInput.addEventListener('change', (): void => bridge.setPluginConfig('xpTracker', {pauseOnLogout: logoutToggleInput.checked}));
        logoutToggleLabel.appendChild(logoutToggleInput);

        const logoutSlider: HTMLSpanElement = document.createElement('span');
        logoutSlider.className = 'plugin-toggle-slider';
        logoutToggleLabel.appendChild(logoutSlider);

        pauseLogoutRow.appendChild(logoutToggleLabel);
        sub.appendChild(pauseLogoutRow);

        return sub;
    }
}

export default new PluginSidebar();
