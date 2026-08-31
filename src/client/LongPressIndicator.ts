// Duration must match the long-press hold time in Client.ts's pointerDown timer.
const DURATION_MS = 500;
const MAX_SIZE_PX = 40;

/**
 * Experimental: a growing-circle DOM overlay shown while a touch long-press
 * gesture is being held. Self-contained so it can be deleted or disabled
 * independently of the long-press detection/menu-opening logic it decorates.
 */
class LongPressIndicator {
    private readonly element: HTMLDivElement;

    constructor() {
        this.element = document.createElement('div');
        this.element.style.cssText = `
            position: fixed;
            pointer-events: none;
            box-sizing: border-box;
            border-radius: 50%;
            border: 2px solid rgba(255, 255, 255, 0.85);
            background: rgba(255, 255, 255, 0.25);
            width: 0px;
            height: 0px;
            transform: translate(-50%, -50%);
            transition: width ${DURATION_MS}ms linear, height ${DURATION_MS}ms linear;
            display: none;
            z-index: 9999;
        `;
        document.body.appendChild(this.element);
    }

    public show(x: number, y: number): void {
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
        this.element.style.display = 'block';
        this.element.style.width = '0px';
        this.element.style.height = '0px';

        // force layout so the width/height transition below starts from 0
        void this.element.offsetWidth;

        this.element.style.width = `${MAX_SIZE_PX}px`;
        this.element.style.height = `${MAX_SIZE_PX}px`;
    }

    public hide(): void {
        this.element.style.display = 'none';
        this.element.style.width = '0px';
        this.element.style.height = '0px';
    }
}

export default new LongPressIndicator();
