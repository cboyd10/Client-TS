import type {PluginBridge} from '#/client/plugin/PluginBridge.js';
import type {PluginConfig, PluginDescriptor} from '#/client/plugin/PluginManager.js';

// custom (issue #107): Feather-style "volume-2" line icon (MIT-licensed
// glyph set) -- the plugin's sidebar tab icon.
const ICON_VOLUME =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>' +
    '<path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>' +
    '</svg>';

// custom (issue #107): Feather-style "volume-1" line icon, shown on the mute
// button while its channel is unmuted.
const ICON_VOLUME_ON =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>' +
    '<path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>' +
    '</svg>';

// custom (issue #107): Feather-style "volume-x" line icon, shown on the mute
// button while its channel is muted.
const ICON_VOLUME_OFF =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>' +
    '<line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>' +
    '</svg>';

type SoundChannel = {
    label: string;
    trimKey: 'musicTrim' | 'effectsTrim';
    mutedKey: 'musicMuted' | 'effectsMuted';
};

// custom (issue #107): Music covers both jingles and background songs (they
// share the client's single midiVolume field -- no separate jingle volume
// exists in the engine), Effects covers all JagFX wave sounds.
const CHANNELS: SoundChannel[] = [
    {label: 'Music', trimKey: 'musicTrim', mutedKey: 'musicMuted'},
    {label: 'Effects', trimKey: 'effectsTrim', mutedKey: 'effectsMuted'}
];

// custom (issue #107): read a channel's persisted trim (0-1 fraction, where 1
// is neutral -- byte-for-byte the legacy varp-driven volume), defaulting to
// neutral when unset or invalid. Client.ts mirrors this same default/validation
// so a player who never opens this panel gets identical audio behavior.
function readTrim(config: PluginConfig, key: string): number {
    const raw: unknown = config[key];
    return typeof raw === 'number' && raw >= 0 && raw <= 1 ? raw : 1;
}

function readMuted(config: PluginConfig, key: string): boolean {
    return config[key] === true;
}

function renderChannelRow(channel: SoundChannel, bridge: PluginBridge): HTMLElement {
    const config: PluginConfig = bridge.getPluginConfig('sound');
    const trim: number = readTrim(config, channel.trimKey);
    const muted: boolean = readMuted(config, channel.mutedKey);

    const row: HTMLDivElement = document.createElement('div');
    row.className = 'plugin-sound-row';

    const header: HTMLDivElement = document.createElement('div');
    header.className = 'plugin-sound-row-header';

    const label: HTMLSpanElement = document.createElement('span');
    label.className = 'plugin-sound-row-label';
    label.textContent = channel.label;
    header.appendChild(label);

    const value: HTMLSpanElement = document.createElement('span');
    value.className = 'plugin-sound-row-value';
    value.textContent = `${Math.round(trim * 100)}%`;
    header.appendChild(value);

    row.appendChild(header);

    const sliderRow: HTMLDivElement = document.createElement('div');
    sliderRow.className = 'plugin-sound-slider-row';

    const muteButton: HTMLButtonElement = document.createElement('button');
    muteButton.type = 'button';
    muteButton.className = muted ? 'plugin-sound-mute-btn plugin-sound-mute-btn--active' : 'plugin-sound-mute-btn';
    muteButton.innerHTML = muted ? ICON_VOLUME_OFF : ICON_VOLUME_ON;
    const muteLabel: string = muted ? `Unmute ${channel.label}` : `Mute ${channel.label}`;
    muteButton.setAttribute('aria-label', muteLabel);
    muteButton.title = muteLabel;
    // custom: mute is a boolean layered on top of the trim value -- toggling
    // it never writes trimKey, so unmuting always restores the exact trim
    // value that was active before muting.
    muteButton.addEventListener('click', (): void => {
        bridge.setPluginConfig('sound', {[channel.mutedKey]: !muted});
    });
    sliderRow.appendChild(muteButton);

    const slider: HTMLInputElement = document.createElement('input');
    slider.type = 'range';
    slider.className = 'plugin-sound-slider';
    slider.min = '0';
    slider.max = '100';
    slider.step = '1';
    slider.value = String(Math.round(trim * 100));
    slider.disabled = muted;
    slider.setAttribute('aria-label', `${channel.label} volume trim`);

    // custom: live-update the displayed percentage on every drag tick, but
    // only persist (bridge.setPluginConfig) on drag-end -- a range input's
    // native 'change' event fires on pointerup/keyboard-commit, exactly the
    // debounce this issue requires so localStorage isn't written on every
    // intermediate 'input' tick.
    slider.addEventListener('input', (): void => {
        value.textContent = `${slider.value}%`;
    });
    slider.addEventListener('change', (): void => {
        bridge.setPluginConfig('sound', {[channel.trimKey]: Number(slider.value) / 100});
    });
    sliderRow.appendChild(slider);

    row.appendChild(sliderRow);

    return row;
}

function renderPanel(bridge: PluginBridge): HTMLElement {
    const container: HTMLDivElement = document.createElement('div');
    container.className = 'plugin-sound-panel';

    for (const channel of CHANNELS) {
        container.appendChild(renderChannelRow(channel, bridge));
    }

    return container;
}

const soundPlugin: PluginDescriptor = {
    id: 'sound',
    displayName: 'Sound',
    icon: ICON_VOLUME,
    // custom (issue #108): the panel is reachable on the pre-login/title
    // screen so its Music trim can control the boot music (Client.ts's
    // maininit() -> saveMidi() -> playMidi() chain, which runs before login).
    // Effects has no pre-login use case (no wave sounds play before login)
    // but stays visible rather than hidden -- it's simply inert pre-login.
    worksPreLogin: true,
    defaultEnabled: true,
    renderPanel
};

export default soundPlugin;
