import Pix3D from '#/dash3d/Pix3D.js';
import PixMap from '#/graphics/PixMap.js';

import JagException from '#/callstack/JagException.js';
import JagString from '#/jstring/JagString.js';
import MonotonicTime from '#/util/MonotonicTime.js';
import ThreadSleep from '#/util/ThreadSleep.js';
import Timer from '#/util/Timer.js';

export default abstract class GameShell {
    static shell: GameShell | null = null;
    static killtime = 0;
    static alreadyshutdown = false;
    alreadyerrored = false;
    static updateCount = 0;
    static deltime = 20;
    static mindel = 1;
    static fps = 0;
    static timer: Timer | null = null;
    static drawTime: number[] = new Array(32).fill(0);
    static drawPos = 0;
    static updateTime: number[] = new Array(32).fill(0);
    static updatePos = 0;
    static sWid = 0;
    static sHei = 0;
    static progressBar: HTMLCanvasElement | null = null;
    static drawArea: PixMap = new PixMap(0, 0);
    static fullredraw = true;
    static redrawNum = 500;
    static focus_in = true;
    static focus = false;

    abstract mainquit(): void;
    abstract maininit(): Promise<void> | void;
    abstract mainloop(): Promise<void> | void;
    abstract mainredraw(): Promise<void> | void;
    abstract onKilled(): void;
    abstract init(): void;

    constructor() {
        try {
            if (GameShell.shell !== null) {
                this.error('alreadyloaded');
                return;
            }

            const canvas = document.getElementById('canvas') as HTMLCanvasElement;
            const canvas2d = canvas.getContext('2d', {
                alpha: false
            }) as CanvasRenderingContext2D;
            canvas.tabIndex = -1;
            canvas2d.fillStyle = 'black';
            canvas2d.fillRect(0, 0, canvas.width, canvas.height);

            GameShell.canvas = canvas;
            GameShell.shell = this;
            GameShell.sWid = canvas.width;
            GameShell.sHei = canvas.height;
        } catch (e) {
            JagException.report(null, e);
            this.error('crash');
        }
    }

    protected get sWid(): number {
        return GameShell.canvas!.width;
    }

    protected get sHei(): number {
        return GameShell.canvas!.height;
    }

    public startApplication(arg0: number, arg1: number, arg2: number, arg3: number, _arg4: number, _arg6: string | null): void {
        try {
            GameShell.sWid = arg2;
            GameShell.sHei = arg1;
            GameShell.shell = this;
            JagException.revision = arg3;
            GameShell.canvas!.width = arg2;
            GameShell.canvas!.height = arg1;
            GameShell.drawArea = new PixMap(arg2, arg1);
            Pix3D.setRenderClipping();
            void this.run();
        } catch (e) {
            JagException.report(null, e);
        }
    }

    public startCommon(arg0: number): void {
        try {
            if (GameShell.shell === null) {
                GameShell.sWid = 765;
                GameShell.sHei = 503;
                GameShell.shell = this;
                JagException.revision = 500;
                void this.run();
            } else {
                GameShell.loaded++;
                if (GameShell.loaded >= 3) {
                    this.error('alreadyloaded');
                } else {
                    this.getAppletContext()?.showDocument(this.getDocumentBase(), '_self');
                }
            }
        } catch (e) {
            JagException.report(null, e);
            this.error('crash');
        }
    }

    public addcanvas(): void {
        GameShell.canvas!.width = GameShell.sWid || GameShell.canvas!.width;
        GameShell.canvas!.height = GameShell.sHei || GameShell.canvas!.height;
        GameShell.canvas!.tabIndex = -1;
        GameShell.canvas!.focus();
        GameShell.fullredraw = true;
        GameShell.lastCanvasReplace = MonotonicTime.currentTime();
    }

    public checkhost(): boolean {
        let host = this.getDocumentBase().hostname.toLowerCase();
        if (host === 'localhost' || host === 'jagex.com' || host.endsWith('.jagex.com')) {
            return true;
        } else if (host === 'runescape.com' || host.endsWith('.runescape.com')) {
            return true;
        } else if (host.endsWith('127.0.0.1')) {
            return true;
        }
        while (host.length > 0) {
            const code = host.charCodeAt(host.length - 1);
            if (code < 48 || code > 57) {
                break;
            }
            host = host.substring(0, host.length - 1);
        }
        if (host.endsWith('192.168.1.')) {
            return true;
        }
        this.error('invalidhost');
        return false;
    }

    public error(message: string): void {
        if (this.alreadyerrored) {
            return;
        }

        this.alreadyerrored = true;

        if (!process.env.BUILD_DEV) {
            const page = `error_game_${message}`;
            globalThis.console.log(page);
            try {
                this.getAppletContext()?.showDocument(new URL(`${page}.ws`, this.getCodeBase()), '_self');
            } catch {
                // ignore browser navigation failures
            }
        }
    }

    async run() {
        try {
            GameShell.canvas!.onfocus = this.focusGained.bind(this);
            GameShell.canvas!.onblur = this.focusLost.bind(this);

            if (('ontouchstart' in window || navigator.maxTouchPoints > 0 || (navigator as any).msMaxTouchPoints > 0) && !('ontouchstart' in window)) {
                // edge case: we can't control canvas touch action behavior to allow zooming
                // device has a touch screen but browser does not expose touchstart
                GameShell.canvas!.style.touchAction = 'none';
            }

            GameShell.canvas!.oncontextmenu = (e: MouseEvent): void => {
                e.preventDefault();
            };

            window.oncontextmenu = (e: MouseEvent): void => {
                e.preventDefault();
            };

            await this.drawProgress('Loading...', 0);
            await this.maininit();

            GameShell.timer = await Timer.create();
            while (GameShell.killtime === 0 || MonotonicTime.currentTime() < GameShell.killtime) {
                GameShell.updateCount = await GameShell.timer.count(GameShell.mindel, GameShell.deltime);

                for (let i: number = 0; i < GameShell.updateCount; i++) {
                    await this.mainloopwrapper();
                }

                await this.mainredrawwrapper();
            }
        } catch (e) {
            JagException.report(null, e);
            this.error('crash');
        }

        this.shutdown(true);
    }

    public shutdown(clean: boolean): void {
        if (GameShell.alreadyshutdown) {
            return;
        }

        GameShell.alreadyshutdown = true;

        try {
            this.mainquit();
        } catch {}

        GameShell.canvas!.onfocus = null;
        GameShell.canvas!.onblur = null;
        GameShell.canvas!.oncontextmenu = null;
        window.oncontextmenu = null;
        this.onKilled();
        console.log('Shutdown complete - clean:' + clean);
    }

    public destroy(): void {
        if (GameShell.shell === this && !GameShell.alreadyshutdown) {
            GameShell.killtime = MonotonicTime.currentTime();
            this.shutdown(false);
        }
    }

    public update(graphics?: unknown): void {
        this.paint(graphics);
    }

    public paint(_graphics?: unknown): void {
        if (GameShell.shell !== this || GameShell.alreadyshutdown) {
            return;
        }
        GameShell.fullredraw = true;
    }

    protected start() {
        if (GameShell.shell === this && !GameShell.alreadyshutdown) {
            GameShell.killtime = 0;
        }
    }

    protected stop() {
        if (GameShell.shell === this && !GameShell.alreadyshutdown) {
            GameShell.killtime = MonotonicTime.currentTime() + 4000;
        }
    }

    public static resetProgress(): void {
        GameShell.progressFont = null;
        GameShell.progressFontMetrics = null;
        GameShell.progressBar = null;
    }

    public static pushUID192(packet: { pdata(length: number, src: Uint8Array): void }): void {
        const bytes = new Uint8Array(24);
        // todo: write to local storage
        packet.pdata(24, bytes);
    }

    public static updateUID192(packet: { data: Uint8Array; pos: number }): void {
        // todo: write to localStorage
        packet.pos += 24;
    }

    public static setFramerate(rate: number): void {
        GameShell.deltime = (1000 / rate) | 0;
    }

    public static openUrl(url: JagString | string | URL): void {
        try {
            const href = url instanceof URL ? url.href : url.toString();
            globalThis.open?.(new URL(href, GameShell.shell?.getCodeBase() ?? globalThis.location?.href).href, '_blank');
        } catch {}
    }

    public static method1132(value: JagString | string): void {
        if (typeof document === 'undefined') {
            return;
        }
        try {
            const cookieValue = value.toString();
            const prefix = GameShell.shell?.getParameter('cookieprefix') ?? '';
            const host = GameShell.shell?.getParameter('cookiehost') ?? globalThis.location?.hostname ?? '';
            let cookie = `${prefix}settings=${cookieValue}; version=1; path=/; domain=${host}`;
            if (cookieValue.length === 0) {
                cookie += '; Expires=Thu, 01-Jan-1970 00:00:00 GMT; Max-Age=0';
            } else {
                cookie += `; Expires=${GameShell.method1139(MonotonicTime.currentTime() + 94608000000).toString()}; Max-Age=94608000`;
            }
            document.cookie = cookie;
        } catch {}
    }

    public static method1139(time: number): JagString {
        const date = new Date(time);
        const day = date.getUTCDay();
        const dateOfMonth = date.getUTCDate();
        const month = date.getUTCMonth();
        const year = date.getUTCFullYear();
        const hour = date.getUTCHours();
        const minute = date.getUTCMinutes();
        const second = date.getUTCSeconds();
        return JagString.join([
            JagString.wrap(GameShell.field1673[day]),
            JagString.wrap(GameShell.field3772),
            JagString.parseInt((dateOfMonth / 10) | 0),
            JagString.parseInt(dateOfMonth % 10),
            JagString.wrap(GameShell.field3135),
            JagString.wrap(GameShell.field658[month]),
            JagString.wrap(GameShell.field3135),
            JagString.parseInt(year),
            JagString.wrap(GameShell.field4262),
            JagString.parseInt((hour / 10) | 0),
            JagString.parseInt(hour % 10),
            JagString.wrap(GameShell.field1959),
            JagString.parseInt((minute / 10) | 0),
            JagString.parseInt(minute % 10),
            JagString.wrap(GameShell.field1959),
            JagString.parseInt((second / 10) | 0),
            JagString.parseInt(second % 10),
            JagString.wrap(GameShell.field82)
        ]);
    }

    public static doneslowupdate(): void {
        GameShell.timer?.reset();
        for (let i: number = 0; i < 32; i++) {
            GameShell.drawTime[i] = 0;
        }
        for (let i: number = 0; i < 32; i++) {
            GameShell.updateTime[i] = 0;
        }
        GameShell.updateCount = 0;
    }

    protected async mainredrawwrapper(): Promise<void> {
        const time: number = MonotonicTime.currentTime();
        const previous: number = GameShell.drawTime[GameShell.drawPos];
        GameShell.drawTime[GameShell.drawPos] = time;
        GameShell.drawPos = (GameShell.drawPos + 1) & 0x1f;

        if (previous !== 0 && previous < time) {
            const delta: number = time - previous;
            GameShell.fps = (((delta >> 1) + 32000) / delta) | 0;
        }

        if (GameShell.redrawNum++ > 50) {
            GameShell.redrawNum -= 50;
            GameShell.fullredraw = true;
        }

        await this.mainredraw();
    }

    protected async mainloopwrapper(): Promise<void> {
        const time: number = MonotonicTime.currentTime();
        const previous: number = GameShell.updateTime[GameShell.updatePos];
        GameShell.updateTime[GameShell.updatePos] = time;
        GameShell.updatePos = (GameShell.updatePos + 1) & 0x1f;

        GameShell.focus = GameShell.focus_in;
        await this.mainloop();
    }

    protected async drawProgress(message: string, progress: number): Promise<void> {
        const width: number = this.sWid;
        const height: number = this.sHei;

        if (GameShell.fullredraw) {
            const canvas2d = GameShell.canvas!.getContext('2d', {
                alpha: false
            }) as CanvasRenderingContext2D;
            canvas2d.fillStyle = 'black';
            canvas2d.fillRect(0, 0, width, height);
            GameShell.fullredraw = false;
        }

        const x: number = ((width / 2) | 0) - 152;
        const y: number = ((height / 2) | 0) - 18;
        const fillWidth: number = progress * 3;

        if (!GameShell.progressBar) {
            GameShell.progressBar = document.createElement('canvas');
            GameShell.progressBar.width = 304;
            GameShell.progressBar.height = 34;
        }

        const ctx = GameShell.progressBar.getContext('2d', { alpha: false });
        if (ctx) {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, 304, 34);
            ctx.fillStyle = 'rgb(140, 17, 17)';
            ctx.fillRect(0, 0, 304, 1);
            ctx.fillRect(0, 33, 304, 1);
            ctx.fillRect(0, 0, 1, 34);
            ctx.fillRect(303, 0, 1, 34);
            ctx.fillRect(2, 2, fillWidth, 30);
            ctx.fillStyle = 'black';
            ctx.fillRect(1, 1, 302, 1);
            ctx.fillRect(1, 32, 302, 1);
            ctx.fillRect(1, 1, 1, 32);
            ctx.fillRect(302, 1, 1, 32);
            ctx.fillRect(fillWidth + 2, 2, 300 - fillWidth, 30);
            ctx.font = 'bold 13px Helvetica, sans-serif';
            ctx.fillStyle = 'white';
            ctx.textBaseline = 'alphabetic';
            ctx.textAlign = 'left';
            ctx.fillText(message, (304 - ctx.measureText(message).width) / 2, 22);
            const canvas2d = GameShell.canvas!.getContext('2d', {
                alpha: false
            }) as CanvasRenderingContext2D;
            canvas2d.drawImage(GameShell.progressBar, x, y);
        }

        await ThreadSleep.sleep(5); // return a slice of time to the main loop so it can update the progress bar
    }

    public focusGained(_event?: FocusEvent): void {
        GameShell.focus_in = true;
        GameShell.fullredraw = true;
    }

    public focusLost(_event?: FocusEvent): void {
        GameShell.focus_in = false;
    }

    public windowActivated(_event?: unknown): void {}

    public windowClosed(_event?: unknown): void {}

    public windowClosing(_event?: unknown): void {
        this.destroy();
    }

    public windowDeactivated(_event?: unknown): void {}

    public windowDeiconified(_event?: unknown): void {}

    public windowIconified(_event?: unknown): void {}

    public windowOpened(_event?: unknown): void {}

    public getCodeBase(): URL {
        return new URL(globalThis.location?.href ?? 'http://localhost/');
    }

    public getDocumentBase(): URL {
        return new URL(globalThis.location?.href ?? 'http://localhost/');
    }

    public getAppletContext(): { showDocument: (url: URL, target?: string) => void } | null {
        return {
            showDocument: (url: URL, target?: string): void => {
                if (target === '_self') {
                    globalThis.location.href = url.href;
                } else {
                    globalThis.open?.(url.href, target ?? '_blank');
                }
            }
        };
    }

    public getParameter(name: string): string | null {
        try {
            return new URL(globalThis.location?.href ?? 'http://localhost/').searchParams.get(name);
        } catch {
            return null;
        }
    }

    static loaded: number = 0;
    static progressFont: unknown = null;
    static progressFontMetrics: unknown = null;
    static frame: Window | null = null;
    static canvas: HTMLCanvasElement | null = null;
    static lastCanvasReplace: number = 0;
    static readonly field920: string = '; Expires=Thu, 01-Jan-1970 00:00:00 GMT; Max-Age=0';
    static readonly field1982: string = '; Expires=';
    static readonly field4265: string = 'cookieprefix';
    static readonly field4516: string = 'cookiehost';
    static readonly field651: string = 'settings=';
    static readonly field1005: string = '; version=1; path=/; domain=';
    static readonly field591: string = '"';
    static readonly field1767: string = '; Max-Age=';
    static readonly field3237: string = 'document.cookie="';
    static readonly field4545: Date = new Date(0);
    static readonly field1672: string = 'Thu';
    static readonly field1679: string = 'Fri';
    static readonly field1681: string = 'Wed';
    static readonly field1690: string = 'Tue';
    static readonly field1692: string = 'Sun';
    static readonly field1685: string = 'Sat';
    static readonly field1691: string = 'Mon';
    static readonly field1673: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    static readonly field659: string = 'Nov';
    static readonly field661: string = 'Jun';
    static readonly field624: string = 'Jul';
    static readonly field628: string = 'Dec';
    static readonly field632: string = 'Aug';
    static readonly field653: string = 'Sep';
    static readonly field643: string = 'Mar';
    static readonly field645: string = 'Jan';
    static readonly field640: string = 'Oct';
    static readonly field642: string = 'Feb';
    static readonly field652: string = 'Apr';
    static readonly field656: string = 'May';
    static readonly field658: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    static readonly field3135: string = '-';
    static readonly field4262: string = ' ';
    static readonly field1959: string = ':';
    static readonly field82: string = ' GMT';
    static readonly field3772: string = ', ';
    static loadingText: string | null = null;
}
