import type {PluginBridge} from '#/client/plugin/PluginBridge.js';
import type {PluginDescriptor} from '#/client/plugin/PluginManager.js';

const ICON_COLUMN_WIDTH = 40;
const CONTENT_PANEL_WIDTH = 225;
const CONTENT_REFRESH_MS = 1000;
const SETTINGS_PANEL_ID = 'settings';

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
.plugin-xptracker-card { border: 1px solid #333; border-radius: 4px; padding: 6px; margin-bottom: 6px; }
.plugin-xptracker-card-head { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.plugin-xptracker-card-badge { width: 20px; height: 20px; border-radius: 50%; background: #2a2a2a; border: 1px solid #444; color: #04A800; font-size: 9px; font-weight: bold; display: flex; align-items: center; justify-content: center; flex: 0 0 20px; }
.plugin-xptracker-card-name { font-weight: bold; }
.plugin-xptracker-card-stats { color: #cc0; font-size: 11px; margin-bottom: 4px; }
.plugin-xptracker-card-stat-row { line-height: 14px; }
.plugin-xptracker-card-bar-track { position: relative; height: 16px; background: #333; border: 1px solid #000; border-radius: 2px; overflow: hidden; }
.plugin-xptracker-card-bar-fill { position: absolute; inset: 0; width: 0; background: #04A800; }
.plugin-xptracker-card-bar-label { position: absolute; inset: 0; text-align: center; line-height: 16px; font-size: 10px; color: #fff; }
.plugin-xptracker-card-bar-level-left { position: absolute; left: 4px; top: 0; line-height: 16px; font-size: 10px; color: #fff; }
.plugin-xptracker-card-bar-level-right { position: absolute; right: 4px; top: 0; line-height: 16px; font-size: 10px; color: #fff; }
`;

// custom: RuneLite-style DOM plugin panel, injected into document.body at
// runtime (following MobileKeyboard.ts's DOM-injection pattern). Reads/writes
// exclusively through the PluginBridge -- never touches Client internals or
// localStorage directly. Desktop-only: never initialized when isMobile().
class PluginSidebar {
    private bridge: PluginBridge | null = null;
    private root: HTMLDivElement | null = null;
    private iconColumn: HTMLDivElement | null = null;
    private contentPanel: HTMLDivElement | null = null;
    private openId: string | null = null;
    private refreshTimer: ReturnType<typeof setInterval> | null = null;

    init(bridge: PluginBridge): void {
        if (this.isMobile() || this.root !== null) {
            return;
        }

        this.bridge = bridge;
        this.injectStyles();
        this.buildDom();
        bridge.onPluginChange((): void => this.onPluginChange());
        this.renderIcons();
    }

    // custom: total horizontal px the sidebar currently occupies -- read by
    // client.ejs's setSize('auto') via PluginBridge.getSidebarWidth().
    getTotalWidth(): number {
        if (this.root === null) {
            return 0;
        }

        return ICON_COLUMN_WIDTH + (this.openId !== null ? CONTENT_PANEL_WIDTH : 0);
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

        this.contentPanel = document.createElement('div');
        this.contentPanel.className = 'plugin-sidebar-content';
        this.contentPanel.style.display = 'none';
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
        this.refreshTimer = setInterval((): void => this.renderContent(), CONTENT_REFRESH_MS);
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
        }

        return list;
    }
}

export default new PluginSidebar();
