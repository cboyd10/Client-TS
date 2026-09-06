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
// custom (issue #152): generic toast primitive timing -- how long a toast
// stays fully visible before its fade-out starts, and the fade's own
// duration (also used as the CSS transition length below, and as the delay
// before the DOM node is actually removed once the fade completes).
const TOAST_VISIBLE_MS = 4000;
const TOAST_FADE_MS = 300;

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
/* custom (issue #106): Camera plugin's dual-handle range slider + live-zoom
   marker. Two overlapping native <input type=range> elements share one
   visual track (pointer-events: none on the input itself, re-enabled only
   on its thumb pseudo-element, so a click always grabs whichever handle's
   thumb is under the cursor and the transparent track never intercepts
   clicks) -- the standard no-dependency technique for a dual-handle range
   slider from two native inputs. The marker is a plain non-interactive div,
   positioned the same way as the handles (by percent-of-track). */
.plugin-camera-panel { display: flex; flex-direction: column; gap: 8px; }
.plugin-camera-hint { color: #9aa39a; font-size: 11px; line-height: 1.4; }
.plugin-camera-track-wrap { position: relative; height: 24px; margin: 14px 4px 4px; }
.plugin-camera-track { position: absolute; left: 0; right: 0; top: 10px; height: 4px; background: #333; border: 1px solid #000; border-radius: 2px; overflow: hidden; }
.plugin-camera-track-fill { position: absolute; top: 0; bottom: 0; background: #04A800; }
.plugin-camera-marker { position: absolute; top: -3px; width: 2px; height: 12px; background: #fff; transform: translateX(-1px); pointer-events: none; }
.plugin-camera-range { position: absolute; left: 0; right: 0; top: 0; width: 100%; height: 24px; margin: 0; background: transparent; -webkit-appearance: none; appearance: none; pointer-events: none; }
.plugin-camera-range::-webkit-slider-runnable-track { background: transparent; height: 24px; }
.plugin-camera-range::-moz-range-track { background: transparent; height: 24px; border: none; }
.plugin-camera-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; pointer-events: auto; width: 12px; height: 18px; margin-top: 3px; background: #ccc; border: 1px solid #444; border-radius: 2px; cursor: pointer; }
.plugin-camera-range::-moz-range-thumb { pointer-events: auto; width: 12px; height: 18px; background: #ccc; border: 1px solid #444; border-radius: 2px; cursor: pointer; }
.plugin-camera-range:hover::-webkit-slider-thumb, .plugin-camera-range:focus::-webkit-slider-thumb { background: #fff; border-color: #04A800; }
.plugin-camera-range:hover::-moz-range-thumb, .plugin-camera-range:focus::-moz-range-thumb { background: #fff; border-color: #04A800; }
.plugin-camera-range-min { z-index: 3; }
.plugin-camera-range-max { z-index: 4; }
.plugin-camera-labels { display: flex; justify-content: space-between; font-size: 11px; color: #ccc; }
.plugin-camera-label-zoom { color: #f2f2f2; font-weight: 600; }
.plugin-camera-reset-btn { align-self: flex-start; background: #2a2a2a; border: 1px solid #444; color: #ccc; font-size: 11px; padding: 4px 10px; border-radius: 2px; cursor: pointer; }
.plugin-camera-reset-btn:hover { background: #3a3a3a; color: #fff; }
.plugin-menu-entry-swapper-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; border: 1px solid #333; border-radius: 4px; padding: 6px; margin-bottom: 6px; }
.plugin-menu-entry-swapper-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.plugin-menu-entry-swapper-action-target { font-size: 12px; color: #f2f2f2; overflow-wrap: anywhere; }
.plugin-menu-entry-swapper-state { font-size: 11px; font-weight: 600; width: fit-content; }
.plugin-menu-entry-swapper-state--priority { color: #04A800; }
.plugin-menu-entry-swapper-state--hidden { color: #c33; }
.plugin-menu-entry-swapper-remove-btn { margin-left: auto; width: 18px; height: 18px; flex: 0 0 18px; padding: 0; border: 1px solid #444; border-radius: 4px; background: #2a2a2a; color: #ccc; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.plugin-menu-entry-swapper-remove-btn:hover { background: #3a3a3a; color: #fff; }
.plugin-menu-entry-swapper-remove-btn svg { width: 11px; height: 11px; }
.plugin-sound-row { padding: 8px 4px; border-bottom: 1px solid #262626; }
.plugin-sound-row:last-child { border-bottom: none; }
.plugin-sound-row-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.plugin-sound-row-label { font-size: 12px; color: #ddd; font-weight: 600; }
.plugin-sound-row-value { font-size: 11px; color: #9aa39a; font-variant-numeric: tabular-nums; }
.plugin-sound-slider-row { display: flex; align-items: center; gap: 8px; }
.plugin-sound-slider { flex: 1 1 auto; accent-color: #04A800; }
.plugin-sound-slider:disabled { opacity: 0.4; }
.plugin-sound-mute-btn { flex: 0 0 auto; width: 26px; height: 26px; padding: 0; border: 1px solid #444; border-radius: 4px; background: #2a2a2a; color: #ccc; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.plugin-sound-mute-btn:hover { background: #3a3a3a; color: #fff; }
.plugin-sound-mute-btn--active { background: #5a1f1f; border-color: #c33; color: #ff8080; }
.plugin-sound-mute-btn svg { width: 14px; height: 14px; }
/* custom (issue #126, restyled issue #134): Loot Tracker -- matches the
   RuneLite loot-tracker layout: no icon badge, white monster name + gray
   kill count on one line (left), total value on the far right, item grid
   below each header with a yellow quantity badge in the corner. Card
   border/padding/margin and the Total card's accent border still follow
   the plugin-xptracker-* conventions. */
.plugin-loottracker-total-card { border: 1px solid #04A800; border-radius: 4px; padding: 6px; margin-bottom: 8px; background: #10210f; }
.plugin-loottracker-card { border: 1px solid #333; border-radius: 4px; padding: 6px; margin-bottom: 6px; }
.plugin-loottracker-row { display: flex; align-items: center; gap: 8px; }
.plugin-loottracker-header-title { flex: 1 1 auto; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.plugin-loottracker-header-name { font-size: 12px; color: #f2f2f2; font-weight: 600; }
.plugin-loottracker-header-count { font-size: 12px; color: #9aa39a; }
.plugin-loottracker-header-value { font-size: 12px; color: #c9aa71; font-variant-numeric: tabular-nums; flex: 0 0 auto; }
.plugin-loottracker-total-icon { width: 32px; height: 32px; border-radius: 5px; background: #16301a; border: 1px solid #04A800; color: #04A800; display: flex; align-items: center; justify-content: center; flex: 0 0 32px; overflow: hidden; }
.plugin-loottracker-total-icon svg { width: 18px; height: 18px; }
.plugin-loottracker-total-icon img { width: 22px; height: 22px; object-fit: contain; image-rendering: pixelated; }
.plugin-loottracker-total-info { display: flex; flex-direction: column; gap: 2px; flex: 1 1 auto; min-width: 0; font-size: 12px; color: #f2f2f2; font-variant-numeric: tabular-nums; }
.plugin-loottracker-reset-btn { width: 18px; height: 18px; flex: 0 0 18px; padding: 0; border: 1px solid #444; border-radius: 4px; background: #2a2a2a; color: #ccc; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.plugin-loottracker-reset-btn:hover { background: #3a3a3a; color: #fff; }
.plugin-loottracker-reset-btn svg { width: 11px; height: 11px; }
.plugin-loottracker-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(36px, 1fr)); gap: 4px; margin-top: 8px; }
.plugin-loottracker-item { position: relative; width: 36px; height: 36px; background: #202020; border: 1px solid #333; border-radius: 3px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.plugin-loottracker-item-icon { max-width: 32px; max-height: 32px; object-fit: contain; image-rendering: pixelated; }
.plugin-loottracker-item-icon-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; color: #9aa39a; }
.plugin-loottracker-item-count { position: absolute; top: 1px; left: 2px; font-size: 10px; font-weight: bold; color: #ffff00; text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000; line-height: 1; pointer-events: none; }
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
.plugin-sidebar--mobile .plugin-menu-entry-swapper-remove-btn { width: 44px; height: 44px; flex: 0 0 44px; }
.plugin-sidebar--mobile .plugin-menu-entry-swapper-remove-btn svg { width: 16px; height: 16px; }
.plugin-sidebar--mobile .plugin-settings-number-input { min-height: 44px; padding: 4px 8px; font-size: 14px; }
.plugin-sidebar--mobile .plugin-xptracker-card-target-input { min-height: 44px; padding: 4px 8px; font-size: 14px; }
.plugin-sidebar--mobile .plugin-xptracker-card-target-clear { min-width: 44px; min-height: 44px; padding: 8px 10px; }
.plugin-sidebar--mobile .plugin-camera-range::-webkit-slider-thumb { width: 22px; height: 44px; margin-top: -10px; }
.plugin-sidebar--mobile .plugin-camera-range::-moz-range-thumb { width: 22px; height: 44px; }
.plugin-sidebar--mobile .plugin-camera-reset-btn { min-width: 44px; min-height: 44px; padding: 8px 10px; }
.plugin-sidebar--mobile .plugin-loottracker-reset-btn { width: 44px; height: 44px; flex: 0 0 44px; }
.plugin-sidebar--mobile .plugin-loottracker-reset-btn svg { width: 16px; height: 16px; }
/* custom (issue #149): Fishing plugin shell -- per the Acceptance Criteria,
   this Total card matches the existing GREEN #04A800 convention exactly
   (same as plugin-xptracker-total-card/plugin-loottracker-total-card); the
   cyan accent is only for the tile-highlight primitive itself (and, per the
   confirmed mockup, Fishing-specific cards in later issues) -- not this
   card. */
.plugin-fishing-total-card { border: 1px solid #04A800; border-radius: 4px; padding: 6px; margin-bottom: 8px; background: #10210f; }
.plugin-fishing-row { display: flex; align-items: flex-start; gap: 8px; }
.plugin-fishing-icon { width: 24px; height: 24px; border-radius: 5px; background: #202020; border: 1px solid #04A800; color: #04A800; display: flex; align-items: center; justify-content: center; flex: 0 0 24px; overflow: hidden; }
.plugin-fishing-icon img { width: 16px; height: 16px; object-fit: contain; image-rendering: pixelated; }
.plugin-fishing-icon svg { width: 15px; height: 15px; }
.plugin-fishing-metrics { display: grid; grid-template-columns: auto 1fr; column-gap: 6px; row-gap: 2px; flex: 1 1 auto; min-width: 0; align-items: baseline; }
.plugin-fishing-metric-label { font-size: 11px; color: #9aa39a; }
.plugin-fishing-metric-value { font-size: 12px; color: #f2f2f2; font-weight: 600; font-variant-numeric: tabular-nums; }
.plugin-fishing-hint { color: #9aa39a; font-size: 11px; line-height: 1.4; padding: 4px 2px; }
/* custom (issue #152): generic toast primitive -- first consumer is Client's
   Fishing level-up detection. Styled per the confirmed mockup
   (.claude/context/mockups equivalent artifact linked from issue #152): the
   toast card itself matches the existing green Total-card convention
   exactly (border/background), but its icon chip is smaller (22px) with a
   slightly different chip background (#16301a, matching the mockup's own
   toast-icon rule) than the 24px/#202020 chip other plugin Total cards use
   -- a deliberately distinct, smaller treatment for an ephemeral toast vs. a
   persistent panel card. Fixed-position and independent of the sidebar's own
   open/closed content-panel state (and of whether the sidebar renders at
   all -- e.g. too-narrow mobile widths per evaluateMobileFit()), so a toast
   is always visible regardless of what the player currently has open. */
#plugin-toast-container { position: fixed; top: 16px; left: 50%; transform: translateX(-50%); z-index: 10000; display: flex; flex-direction: column; gap: 8px; align-items: center; pointer-events: none; }
.plugin-toast { display: flex; align-items: center; gap: 8px; border: 1px solid #04A800; background: #10210f; border-radius: 4px; padding: 7px 10px; max-width: 240px; opacity: 1; transition: opacity ${TOAST_FADE_MS}ms ease; }
.plugin-toast--hide { opacity: 0; }
.plugin-toast-icon { width: 22px; height: 22px; border-radius: 4px; background: #16301a; border: 1px solid #04A800; color: #04A800; display: flex; align-items: center; justify-content: center; flex: 0 0 22px; overflow: hidden; }
.plugin-toast-icon svg { width: 13px; height: 13px; }
.plugin-toast-icon img { width: 16px; height: 16px; object-fit: contain; image-rendering: pixelated; }
.plugin-toast-text { font-size: 11.5px; color: #f2f2f2; line-height: 1.35; }
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
    // custom (issue #152): lazily created on first showPluginToast() call,
    // appended directly to document.body -- deliberately independent of
    // `root`/`contentPanel` (which don't exist at all on a mobile width too
    // narrow to fit the sidebar, per evaluateMobileFit()) so a toast is never
    // silently dropped just because the sidebar itself isn't rendered.
    private toastContainer: HTMLDivElement | null = null;

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

    // custom (issue #152): generic toast primitive -- shows a transient,
    // auto-dismissing notification, independent of the icon-column/
    // content-panel open state. `icon` is inline SVG markup (or an <img>
    // tag's HTML), matching PluginDescriptor.icon's existing convention --
    // kept fully generic (icon + text only, no plugin-specific branching) per
    // the issue's request, so a later plugin can reuse this without any
    // changes here. First consumer: Client's Fishing level-up detection
    // (Client.ts's UPDATE_STAT handler), which calls this directly rather
    // than through PluginBridge -- Client already imports PluginSidebar
    // directly (see init()/getTotalWidth() call sites in
    // Client.initPluginBridge()), and the trigger here is Client-internal
    // state, not page-level DOM code needing a door into Client, so no new
    // PluginBridge surface is needed (mirrors updateFishingSpots()'s own
    // direct-Client-internal-consumer precedent from issue #149).
    showPluginToast(icon: string, text: string): void {
        if (this.toastContainer === null) {
            this.toastContainer = document.createElement('div');
            this.toastContainer.id = 'plugin-toast-container';
            document.body.appendChild(this.toastContainer);
        }

        const toast: HTMLDivElement = document.createElement('div');
        toast.className = 'plugin-toast';

        const iconEl: HTMLDivElement = document.createElement('div');
        iconEl.className = 'plugin-toast-icon';
        iconEl.innerHTML = icon;
        toast.appendChild(iconEl);

        const textEl: HTMLDivElement = document.createElement('div');
        textEl.className = 'plugin-toast-text';
        textEl.textContent = text;
        toast.appendChild(textEl);

        this.toastContainer.appendChild(toast);

        setTimeout((): void => {
            toast.classList.add('plugin-toast--hide');
            setTimeout((): void => toast.remove(), TOAST_FADE_MS);
        }, TOAST_VISIBLE_MS);
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
