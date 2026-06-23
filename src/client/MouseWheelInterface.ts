import ClientMouseWheelListener from '#/client/ClientMouseWheelListener.js';

export default abstract class MouseWheelInterface {
    static create(): MouseWheelInterface | null {
        try {
            return new ClientMouseWheelListener();
        } catch {
            return null;
        }
    }

    abstract addListeners(target: HTMLElement): void;

    abstract getRotation(): number;

    abstract removeListeners(target: HTMLElement): void;
}
