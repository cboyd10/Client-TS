import type {PluginBridge} from '#/client/plugin/PluginBridge.js';
import type {PluginDescriptor} from '#/client/plugin/PluginManager.js';

// custom: Feather-style "camera" line icon (MIT-licensed glyph set).
const ICON_CAMERA =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>' +
    '<circle cx="12" cy="13" r="4"></circle>' +
    '</svg>';

// custom (issue #106): absolute bounds the slider's two handles (and the
// live-zoom marker) are drawn across. Deliberately inside the
// visibilityMatrix precompute's ~+-1300-unit tolerance around its 1200
// center (see .claude/context/adr/issue-6-camera-zoom-distance-field.md)
// but close to the edge on the high end -- minor pop-in/culling at that
// extreme is an accepted trade-off, not a bug to chase (see the ADR and
// this issue's Implementation Notes).
const ABS_MIN = 100;
const ABS_MAX = 2400;

// custom (issue #106): the scroll-wheel/::zoom sub-range a never-configured
// player gets, and what the Reset button restores -- distinct from
// ABS_MIN/ABS_MAX, which the handles themselves can never be dragged past.
const DEFAULT_RANGE_MIN = 400;
const DEFAULT_RANGE_MAX = 1800;
// custom (issue #106): matches Client.ts's reverted cameraZoom field default
// (the pre-ADR-6 vanilla distance).
const DEFAULT_ZOOM = 600;

const SLIDER_STEP = 10;

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function percentOfTrack(value: number): number {
    return ((value - ABS_MIN) / (ABS_MAX - ABS_MIN)) * 100;
}

// custom: read the persisted {min, max} sub-range from the camera plugin's
// config blob, falling back to the default 400-1800 range when unset or
// invalid (never-configured player, or corrupted/foreign JSON) -- mirrors
// XpTrackerPlugin.ts's readStoredTarget()'s defensive unknown-narrowing.
function readRange(bridge: PluginBridge): {min: number; max: number} {
    const config = bridge.getPluginConfig('camera');
    const rawMin: unknown = config.min;
    const rawMax: unknown = config.max;

    const min: number = typeof rawMin === 'number' && rawMin >= ABS_MIN && rawMin <= ABS_MAX ? rawMin : DEFAULT_RANGE_MIN;
    const max: number = typeof rawMax === 'number' && rawMax >= ABS_MIN && rawMax <= ABS_MAX ? rawMax : DEFAULT_RANGE_MAX;

    return min <= max ? {min, max} : {min: DEFAULT_RANGE_MIN, max: DEFAULT_RANGE_MAX};
}

function renderPanel(bridge: PluginBridge): HTMLElement {
    const container: HTMLDivElement = document.createElement('div');
    container.className = 'plugin-camera-panel';

    const hint: HTMLDivElement = document.createElement('div');
    hint.className = 'plugin-camera-hint';
    hint.textContent = 'Sets the min/max scroll-wheel and ::zoom camera distance range. The white marker shows your current zoom.';
    container.appendChild(hint);

    const {min: storedMin, max: storedMax} = readRange(bridge);

    const trackWrap: HTMLDivElement = document.createElement('div');
    trackWrap.className = 'plugin-camera-track-wrap';

    const track: HTMLDivElement = document.createElement('div');
    track.className = 'plugin-camera-track';
    trackWrap.appendChild(track);

    const fill: HTMLDivElement = document.createElement('div');
    fill.className = 'plugin-camera-track-fill';
    track.appendChild(fill);

    const marker: HTMLDivElement = document.createElement('div');
    marker.className = 'plugin-camera-marker';
    marker.title = 'Current camera distance';
    trackWrap.appendChild(marker);

    const minInput: HTMLInputElement = document.createElement('input');
    minInput.type = 'range';
    minInput.className = 'plugin-camera-range plugin-camera-range-min';
    minInput.min = String(ABS_MIN);
    minInput.max = String(ABS_MAX);
    minInput.step = String(SLIDER_STEP);
    minInput.value = String(storedMin);
    minInput.setAttribute('aria-label', 'Minimum camera distance');
    trackWrap.appendChild(minInput);

    const maxInput: HTMLInputElement = document.createElement('input');
    maxInput.type = 'range';
    maxInput.className = 'plugin-camera-range plugin-camera-range-max';
    maxInput.min = String(ABS_MIN);
    maxInput.max = String(ABS_MAX);
    maxInput.step = String(SLIDER_STEP);
    maxInput.value = String(storedMax);
    maxInput.setAttribute('aria-label', 'Maximum camera distance');
    trackWrap.appendChild(maxInput);

    container.appendChild(trackWrap);

    const labelsRow: HTMLDivElement = document.createElement('div');
    labelsRow.className = 'plugin-camera-labels';

    const minLabel: HTMLSpanElement = document.createElement('span');
    labelsRow.appendChild(minLabel);

    const zoomLabel: HTMLSpanElement = document.createElement('span');
    zoomLabel.className = 'plugin-camera-label-zoom';
    labelsRow.appendChild(zoomLabel);

    const maxLabel: HTMLSpanElement = document.createElement('span');
    labelsRow.appendChild(maxLabel);

    container.appendChild(labelsRow);

    // custom: live-updates the fill bar + min/max labels from the two
    // handles' current (possibly not-yet-persisted) values -- runs on every
    // 'input' event so dragging feels responsive; persistence itself only
    // happens on 'change' (drag-end), see persistRange below.
    const updateRangeVisual = (): void => {
        const min: number = Number(minInput.value);
        const max: number = Number(maxInput.value);
        fill.style.left = `${percentOfTrack(min)}%`;
        fill.style.right = `${100 - percentOfTrack(max)}%`;
        minLabel.textContent = String(min);
        maxLabel.textContent = String(max);
    };

    // custom: positions the live-zoom marker from the bridge's current
    // cameraZoom -- re-read fresh (not cached) since PluginSidebar's 1s
    // auto-refresh tears down and rebuilds this whole panel, calling
    // renderPanel() again rather than mutating this closure in place.
    const updateMarker = (): void => {
        const zoom: number = clamp(bridge.getCameraZoom(), ABS_MIN, ABS_MAX);
        marker.style.left = `${percentOfTrack(zoom)}%`;
        zoomLabel.textContent = `Zoom: ${zoom}`;
    };

    // custom (AC): dragging one handle past the other clamps it live -- min
    // <= max is always enforced, and both handles are already confined to
    // [ABS_MIN, ABS_MAX] for free by the native <input type=range> min/max
    // attributes.
    minInput.addEventListener('input', (): void => {
        if (Number(minInput.value) > Number(maxInput.value)) {
            minInput.value = maxInput.value;
        }
        updateRangeVisual();
    });
    maxInput.addEventListener('input', (): void => {
        if (Number(maxInput.value) < Number(minInput.value)) {
            maxInput.value = minInput.value;
        }
        updateRangeVisual();
    });

    // custom (AC): persists only on drag-end -- native 'change' fires once
    // on pointerup/keyup-commit, never on the intermediate 'input' events
    // dragging fires continuously. Client.ts's PluginManager.onChange
    // listener picks this up and applies it to the live scroll-wheel/::zoom
    // clamp bounds.
    const persistRange = (): void => {
        bridge.setPluginConfig('camera', {min: Number(minInput.value), max: Number(maxInput.value)});
    };
    minInput.addEventListener('change', persistRange);
    maxInput.addEventListener('change', persistRange);

    updateRangeVisual();
    updateMarker();

    const resetButton: HTMLButtonElement = document.createElement('button');
    resetButton.type = 'button';
    resetButton.className = 'plugin-camera-reset-btn';
    resetButton.textContent = 'Reset';
    resetButton.title = 'Reset zoom range and current distance to defaults';
    resetButton.addEventListener('click', (): void => {
        minInput.value = String(DEFAULT_RANGE_MIN);
        maxInput.value = String(DEFAULT_RANGE_MAX);
        updateRangeVisual();
        // custom (AC): also writes zoom, equivalent to clearing the saved
        // camera config back to defaults -- Client.ts applies it to the
        // live cameraZoom the same way any other range/zoom config write is
        // applied (PluginManager.onChange).
        bridge.setPluginConfig('camera', {min: DEFAULT_RANGE_MIN, max: DEFAULT_RANGE_MAX, zoom: DEFAULT_ZOOM});
        updateMarker();
    });
    container.appendChild(resetButton);

    return container;
}

const cameraPlugin: PluginDescriptor = {
    id: 'camera',
    displayName: 'Camera',
    icon: ICON_CAMERA,
    worksPreLogin: false,
    defaultEnabled: true,
    renderPanel
};

export default cameraPlugin;
