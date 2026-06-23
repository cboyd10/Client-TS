import { Client } from '#/client/Client.js';
import ClientGosubFrame from '#/client/ClientGosubFrame.js';
import ClientInvCache from '#/client/ClientInvCache.js';
import ClientKeyboardListener from '#/client/ClientKeyboardListener.js';
import QuickChatPhrase from '#/client/QuickChatPhrase.js';
import JagException from '#/callstack/JagException.js';
import ClientScript from '#/client/ClientScript.js';
import HookReq from '#/client/HookReq.js';
import SubInterface from '#/client/SubInterface.js';
import IntNode from '#/datastruct/IntNode.js';
import Packet from '#/io/Packet.js';
import JagString from '#/jstring/JagString.js';
import IfType from '#/config/IfType.js';
import EnumType from '#/config/EnumType.js';
import FloType from '#/config/FloType.js';
import InvType from '#/config/InvType.js';
import LocType from '#/config/LocType.js';
import NpcType from '#/config/NpcType.js';
import ObjType from '#/config/ObjType.js';
import ParamType from '#/config/ParamType.js';
import QuickChatCatTypeList from '#/config/QuickChatCatTypeList.js';
import QuickChatPhraseType from '#/config/QuickChatPhraseType.js';
import ServerActive from '#/config/ServerActive.js';
import StructType from '#/config/StructType.js';
import VarCache from '#/var/VarCache.js';
import WordPack from '#/wordfilter2/WordPack.js';
import PixfontGeneric from '#/graphics/PixfontGeneric.js';
import SoftwarePixFont from '#/graphics/SoftwarePixFont.js';
import Text from '#/constants/Text.js';
import TitleScreen from '#/client/TitleScreen.js';

export default class ScriptRunner {
    static intStack: Int32Array = new Int32Array(1000);
    static stringStack: (string | null)[] = new Array(1000).fill(null);
    static frames: (ClientGosubFrame | null)[] = new Array(50).fill(null);
    static arrayLengths: Int32Array = new Int32Array(5);
    static arrays: Int32Array[] = Array.from({ length: 5 }, () => new Int32Array(5000));
    static varcStr: (string | null)[] = new Array(1000).fill(null);
    static readonly field3563: string = 'Clientscript error - check log for details';
    static readonly field1468: string = '';
    static readonly field3010: string = '%0a - in: ';
    static readonly field356: string = '%0a - via: ';
    static readonly field2496: string = '%0a - non-existant gosub script-num: ';
    static readonly field288: string = 'Clientscript error in: ';
    static readonly field970: string = 'Apr';
    static readonly field977: string = 'Jun';
    static readonly field978: string = 'Aug';
    static readonly field980: string = 'Sep';
    static readonly field981: string = 'Mar';
    static readonly field985: string = 'Dec';
    static readonly field987: string = 'May';
    static readonly field988: string = 'Jan';
    static readonly field989: string = 'Oct';
    static readonly field991: string = 'Nov';
    static readonly field995: string = 'Feb';
    static readonly field996: string = 'Jul';
    static readonly months: string[] = [
        ScriptRunner.field988,
        ScriptRunner.field995,
        ScriptRunner.field981,
        ScriptRunner.field970,
        ScriptRunner.field987,
        ScriptRunner.field977,
        ScriptRunner.field996,
        ScriptRunner.field978,
        ScriptRunner.field980,
        ScriptRunner.field989,
        ScriptRunner.field991,
        ScriptRunner.field985
    ];
    static readonly field2171: string = '-';
    static readonly field207: string = 'null';
    static readonly field3141: string = '<img=1>';
    static readonly field3554: string = '<img=0>';
    static readonly field3707: string = 'event_opbase';
    static readonly field669: string = Text.field668;
    static readonly field1355: string = Text.field1356;
    static readonly field1308: string = Text.field1320;
    static readonly field3817: string = Text.field3828;
    static readonly field2564: string = Text.field2562;
    static readonly field3690: string = Text.field3699;
    static readonly field3703: string = Text.field3689;
    static readonly field4467: string = Text.field4462;
    static readonly field3084: string = Text.field3094;
    static readonly field4050: string = Text.field4053;
    static readonly field488: string = Text.field491;
    static readonly field1837: string = Text.field1839;
    static readonly field4363: string = Text.field4361;
    static readonly field696: string = Text.field688;
    static readonly field1083: string = Text.field1078;
    static readonly field612: string = Text.field611;
    static readonly field263: string = Text.field272;
    static readonly calendar: Date = new Date(0);
    static fp: number = 0;
    static stringLocals: (string | null)[] = [];
    static intLocals: Int32Array = new Int32Array(0);
    static field226: QuickChatPhrase | null = null;
    static activeComponent2: IfType | null = null;
    static activeComponent: IfType | null = null;

    static executeScript(req: HookReq): void;
    static executeScript(req: HookReq, opcount: number): void;
    static executeScript(req: HookReq, opcount: number = 200000): void {
        const var2 = req.onop!;

        const var3 = var2[0] as number;
        let script = ClientScript.get(var3);
        if (script === null) {
            return;
        }

        let isp = 0;
        let ssp = 0;
        this.fp = 0;
        let pc = -1;
        let intOperands = script.intOperands!;
        let reportOpcode: number = -1;
        let instructions = script.instructions!;

        try {
            this.intLocals = new Int32Array(script.intLocalCount);
            this.stringLocals = new Array(script.stringLocalCount).fill(null);
            let var11 = 0;
            let var12 = 0;

            for (let var13 = 1; var13 < var2.length; var13++) {
                if (typeof var2[var13] === 'number') {
                    let var14 = var2[var13] as number;
                    if (var14 === -2147483647) {
                        var14 = req.mouseX;
                    }
                    if (var14 === -2147483646) {
                        var14 = req.mouseY;
                    }
                    if (var14 === -2147483645) {
                        var14 = req.component === null ? -1 : req.component.parentId;
                    }
                    if (var14 === -2147483644) {
                        var14 = req.opindex;
                    }
                    if (var14 === -2147483643) {
                        var14 = req.component === null ? -1 : req.component.subId;
                    }
                    if (var14 === -2147483642) {
                        var14 = req.drop === null ? -1 : req.drop.parentId;
                    }
                    if (var14 === -2147483641) {
                        var14 = req.drop === null ? -1 : req.drop.subId;
                    }
                    if (var14 === -2147483640) {
                        var14 = req.keyCode;
                    }
                    if (var14 === -2147483639) {
                        var14 = req.keyChar;
                    }
                    this.intLocals[var12++] = var14;
                } else if (typeof var2[var13] === 'string') {
                    let var15: string | null = var2[var13] as string;
                    if (var15 === this.field3707) {
                        var15 = req.opbase;
                    }
                    this.stringLocals[var11++] = var15;
                }
            }

            let var16 = 0;
            label2550: while (true) {
                var16++;
                if (opcount < var16) {
                    throw new Error('slow');
                }
                pc++;
                const opcode = instructions[pc];
                reportOpcode = opcode;
                if (opcode < 100) {
                    if (opcode === 0) {
                        this.intStack[isp++] = intOperands[pc];
                        continue;
                    }
                    if (opcode === 1) {
                        const var17 = intOperands[pc];
                        this.intStack[isp++] = VarCache.var[var17];
                        continue;
                    }
                    if (opcode === 2) {
                        const var18 = intOperands[pc];
                        isp--;
                        VarCache.var[var18] = this.intStack[isp];
                        continue;
                    }
                    if (opcode === 3) {
                        this.stringStack[ssp++] = script.stringOperands![pc];
                        continue;
                    }
                    if (opcode === 6) {
                        pc += intOperands[pc];
                        continue;
                    }
                    if (opcode === 7) {
                        isp -= 2;
                        if (this.intStack[isp] !== this.intStack[isp + 1]) {
                            pc += intOperands[pc];
                        }
                        continue;
                    }
                    if (opcode === 8) {
                        isp -= 2;
                        if (this.intStack[isp + 1] === this.intStack[isp]) {
                            pc += intOperands[pc];
                        }
                        continue;
                    }
                    if (opcode === 9) {
                        isp -= 2;
                        if (this.intStack[isp + 1] > this.intStack[isp]) {
                            pc += intOperands[pc];
                        }
                        continue;
                    }
                    if (opcode === 10) {
                        isp -= 2;
                        if (this.intStack[isp] > this.intStack[isp + 1]) {
                            pc += intOperands[pc];
                        }
                        continue;
                    }
                    if (opcode === 21) {
                        if (this.fp === 0) {
                            return;
                        }
                        const var19 = this.frames[--this.fp]!;
                        this.stringLocals = var19.stringLocals!;
                        this.intLocals = var19.intLocals!;
                        script = var19.script!;
                        pc = var19.pc;
                        intOperands = script.intOperands!;
                        instructions = script.instructions!;
                        continue;
                    }
                    if (opcode === 25) {
                        const var20 = intOperands[pc];
                        this.intStack[isp++] = VarCache.getVarbit(var20);
                        continue;
                    }
                    if (opcode === 27) {
                        const var21 = intOperands[pc];
                        isp--;
                        VarCache.setVarbit(var21, this.intStack[isp]);
                        continue;
                    }
                    if (opcode === 31) {
                        isp -= 2;
                        if (this.intStack[isp + 1] >= this.intStack[isp]) {
                            pc += intOperands[pc];
                        }
                        continue;
                    }
                    if (opcode === 32) {
                        isp -= 2;
                        if (this.intStack[isp] >= this.intStack[isp + 1]) {
                            pc += intOperands[pc];
                        }
                        continue;
                    }
                    if (opcode === 33) {
                        this.intStack[isp++] = this.intLocals[intOperands[pc]];
                        continue;
                    }
                    if (opcode === 34) {
                        const var10001 = intOperands[pc];
                        isp--;
                        this.intLocals[var10001] = this.intStack[isp];
                        continue;
                    }
                    if (opcode === 35) {
                        this.stringStack[ssp++] = this.stringLocals[intOperands[pc]];
                        continue;
                    }
                    if (opcode === 36) {
                        const var10001 = intOperands[pc];
                        ssp--;
                        this.stringLocals[var10001] = this.stringStack[ssp];
                        continue;
                    }
                    if (opcode === 37) {
                        const var22 = intOperands[pc];
                        ssp -= var22;
                        const var23Strings = new Array<JagString>(var22);
                        for (let var23Index = 0; var23Index < var22; var23Index++) {
                            const var23Part = this.stringStack[ssp + var23Index];
                            var23Strings[var23Index] = var23Part == null ? JagString.STRING_NULL : JagString.wrap(var23Part);
                        }
                        const var23 = JagString.joinRange(var22, var23Strings, 0).toString();
                        this.stringStack[ssp++] = var23;
                        continue;
                    }
                    if (opcode === 38) {
                        isp--;
                        continue;
                    }
                    if (opcode === 39) {
                        ssp--;
                        continue;
                    }
                    if (opcode === 40) {
                        const var24 = intOperands[pc];
                        const var25 = ClientScript.get(var24)!;
                        const var26 = new Array(var25.stringLocalCount).fill(null);
                        const var27 = new Int32Array(var25.intLocalCount);
                        for (let var28 = 0; var28 < var25.intArgCount; var28++) {
                            var27[var28] = this.intStack[var28 + isp - var25.intArgCount];
                        }
                        for (let var29 = 0; var29 < var25.stringArgCount; var29++) {
                            var26[var29] = this.stringStack[var29 + ssp - var25.stringArgCount];
                        }
                        isp -= var25.intArgCount;
                        ssp -= var25.stringArgCount;
                        const var30 = new ClientGosubFrame();
                        var30.script = script;
                        var30.stringLocals = this.stringLocals;
                        var30.pc = pc;
                        var30.intLocals = this.intLocals;
                        if (this.fp >= this.frames.length) {
                            throw new Error();
                        }
                        script = var25;
                        pc = -1;
                        this.frames[this.fp++] = var30;
                        instructions = var25.instructions!;
                        this.intLocals = var27;
                        intOperands = var25.intOperands!;
                        this.stringLocals = var26;
                        continue;
                    }
                    if (opcode === 42) {
                        this.intStack[isp++] = VarCache.varcInt[intOperands[pc]];
                        continue;
                    }
                    if (opcode === 43) {
                        const var10001 = intOperands[pc];
                        isp--;
                        VarCache.varcInt[var10001] = this.intStack[isp];
                        continue;
                    }
                    if (opcode === 44) {
                        const var31 = intOperands[pc] >> 16;
                        isp--;
                        const var32 = this.intStack[isp];
                        const var33 = intOperands[pc] & 0xffff;
                        if (var32 >= 0 && var32 <= 5000) {
                            this.arrayLengths[var31] = var32;
                            let var34 = -1;
                            if (var33 === 105) {
                                var34 = 0;
                            }
                            let var35 = 0;
                            while (true) {
                                if (var35 >= var32) {
                                    continue label2550;
                                }
                                this.arrays[var31][var35] = var34;
                                var35++;
                            }
                        }
                        throw new Error();
                    }
                    if (opcode === 45) {
                        const var36 = intOperands[pc];
                        isp--;
                        const var37 = this.intStack[isp];
                        if (var37 >= 0 && this.arrayLengths[var36] > var37) {
                            this.intStack[isp++] = this.arrays[var36][var37];
                            continue;
                        }
                        throw new Error();
                    }
                    if (opcode === 46) {
                        isp -= 2;
                        const var38 = this.intStack[isp];
                        const var39 = intOperands[pc];
                        if (var38 >= 0 && var38 < this.arrayLengths[var39]) {
                            this.arrays[var39][var38] = this.intStack[isp + 1];
                            continue;
                        }
                        throw new Error();
                    }
                    if (opcode === 47) {
                        let var40 = this.varcStr[intOperands[pc]];
                        if (var40 === null) {
                            var40 = this.field207;
                        }
                        this.stringStack[ssp++] = var40;
                        continue;
                    }
                    if (opcode === 48) {
                        const var10001 = intOperands[pc];
                        ssp--;
                        this.varcStr[var10001] = this.stringStack[ssp];
                        continue;
                    }
                    if (opcode === 51) {
                        const var41 = script.switchTables![intOperands[pc]];
                        isp--;
                        const var42 = var41.find(BigInt(this.intStack[isp])) as IntNode | null;
                        if (var42 !== null) {
                            pc += var42.value;
                        }
                        continue;
                    }
                }

                const activeSecond = intOperands[pc] === 1;
                let effectiveOpcode = opcode;
                if (effectiveOpcode < 300) {
                    if (effectiveOpcode === 100) {
                        isp -= 3;
                        const var44 = this.intStack[isp];
                        const var45 = this.intStack[isp + 1];
                        const var46 = this.intStack[isp + 2];
                        if (var45 === 0) {
                            throw new Error();
                        }
                        const var47 = IfType.get(var44)!;
                        if (var47.subcomponents === null) {
                            var47.subcomponents = new Array(var46 + 1).fill(null) as unknown as IfType[];
                        }
                        if (var46 >= var47.subcomponents.length) {
                            const var48 = new Array(var46 + 1).fill(null) as unknown as IfType[];
                            for (let var49 = 0; var49 < var47.subcomponents.length; var49++) {
                                var48[var49] = var47.subcomponents[var49];
                            }
                            var47.subcomponents = var48;
                        }
                        if (var46 > 0 && var47.subcomponents[var46 - 1] === null) {
                            throw new Error('Gap at:' + (var46 - 1));
                        }
                        const var50 = new IfType();
                        var50.v3 = true;
                        var50.subId = var46;
                        var50.type = var45;
                        var50.layerId = var50.parentId = var47.parentId;
                        var47.subcomponents[var46] = var50;
                        if (activeSecond) {
                            this.activeComponent2 = var50;
                        } else {
                            this.activeComponent = var50;
                        }
                        Client.componentUpdated(var47);
                        continue;
                    }
                    if (effectiveOpcode === 101) {
                        const var51 = (activeSecond ? this.activeComponent2 : this.activeComponent)!;
                        if (var51.subId === -1) {
                            if (activeSecond) {
                                throw new Error('Tried to .cc_delete static .active-component!');
                            }
                            throw new Error('Tried to cc_delete static active-component!');
                        }
                        const var52 = IfType.get(var51.parentId)!;
                        var52.subcomponents![var51.subId] = null as unknown as IfType;
                        Client.componentUpdated(var52);
                        continue;
                    }
                    if (effectiveOpcode === 102) {
                        isp--;
                        const var53 = IfType.get(this.intStack[isp])!;
                        var53.subcomponents = null;
                        Client.componentUpdated(var53);
                        continue;
                    }
                    if (effectiveOpcode === 200) {
                        isp -= 2;
                        const var54 = this.intStack[isp + 1];
                        const var55 = this.intStack[isp];
                        const var56 = IfType.get(var54, var55);
                        if (var56 !== null && var54 !== -1) {
                            this.intStack[isp++] = 1;
                            if (activeSecond) {
                                this.activeComponent2 = var56;
                            } else {
                                this.activeComponent = var56;
                            }
                            continue;
                        }
                        this.intStack[isp++] = 0;
                        continue;
                    }
                    if (effectiveOpcode === 201) {
                        isp--;
                        const var57 = this.intStack[isp];
                        const var58 = IfType.get(var57);
                        if (var58 === null) {
                            this.intStack[isp++] = 0;
                        } else {
                            this.intStack[isp++] = 1;
                            if (activeSecond) {
                                this.activeComponent2 = var58;
                            } else {
                                this.activeComponent = var58;
                            }
                        }
                        continue;
                    }
                } else if (effectiveOpcode < 500) {
                    if (effectiveOpcode === 403) {
                        isp -= 2;
                        let var372 = this.intStack[isp];
                        if (var372 >= 7) {
                            var372 -= 7;
                        }
                        const var373 = this.intStack[isp + 1];
                        Client.localPlayer!.model!.idkChangePart(var372, var373);
                        continue;
                    }
                    if (effectiveOpcode === 404) {
                        isp -= 2;
                        const var374 = this.intStack[isp + 1];
                        const var375 = this.intStack[isp];
                        Client.localPlayer!.model!.idkChangeColour(var374, var375);
                        continue;
                    }
                    if (effectiveOpcode === 410) {
                        isp--;
                        const var376 = this.intStack[isp] !== 0;
                        Client.localPlayer!.model!.idkChangeGender(var376);
                        continue;
                    }
                } else if ((effectiveOpcode >= 1000 && effectiveOpcode < 1100) || (effectiveOpcode >= 2000 && effectiveOpcode < 2100)) {
                    let var368: IfType;
                    if (effectiveOpcode < 2000) {
                        var368 = (activeSecond ? this.activeComponent2 : this.activeComponent)!;
                    } else {
                        effectiveOpcode -= 1000;
                        isp--;
                        var368 = IfType.get(this.intStack[isp])!;
                    }
                    if (effectiveOpcode === 1000) {
                        var368.xAlignment = 0;
                        isp -= 2;
                        var368.renderX = var368.x = this.intStack[isp];
                        var368.yAlignment = 0;
                        var368.renderY = var368.y = this.intStack[isp + 1];
                        Client.componentUpdated(var368);
                        continue;
                    }
                    if (effectiveOpcode === 1001) {
                        var368.widthAlignment = 0;
                        isp -= 2;
                        var368.renderWidth = var368.width = this.intStack[isp];
                        var368.modelBaseWidth = 0;
                        var368.heightAlignment = 0;
                        var368.renderHeight = var368.height = this.intStack[isp + 1];
                        var368.modelBaseHeight = 0;
                        Client.componentUpdated(var368);
                        if (var368.type === 0) {
                            Client.computeLayerLayout(false, var368);
                        }
                        Client.computeComponentLayout(var368);
                        continue;
                    }
                    if (effectiveOpcode === 1003) {
                        isp--;
                        const var369 = this.intStack[isp] === 1;
                        if (var368.hide !== var369) {
                            var368.hide = var369;
                            Client.componentUpdated(var368);
                        }
                        continue;
                    }
                    if (effectiveOpcode === 1004) {
                        isp -= 4;
                        var368.x = this.intStack[isp];
                        var368.y = this.intStack[isp + 1];
                        let var370 = this.intStack[isp + 2];
                        let var371 = this.intStack[isp + 3];
                        if (var371 < 0) {
                            var371 = 0;
                        } else if (var371 > 2) {
                            var371 = 2;
                        }
                        var368.yAlignment = var371 + 3;
                        if (var370 < 0) {
                            var370 = 0;
                        } else if (var370 > 2) {
                            var370 = 2;
                        }
                        var368.xAlignment = var370 + 3;
                        Client.componentUpdated(var368);
                        Client.computeComponentLayout(var368);
                        continue;
                    }
                    if (effectiveOpcode === 1005) {
                        var368.xAlignment = 2;
                        isp -= 2;
                        var368.x = this.intStack[isp];
                        var368.yAlignment = 2;
                        var368.y = this.intStack[isp + 1];
                        Client.componentUpdated(var368);
                        if (var368.type === 0) {
                            Client.computeLayerLayout(false, var368);
                        }
                        Client.computeComponentLayout(var368);
                        continue;
                    }
                } else if ((effectiveOpcode >= 1100 && effectiveOpcode < 1200) || (effectiveOpcode >= 2100 && effectiveOpcode < 2200)) {
                    let var365: IfType;
                    if (effectiveOpcode >= 2000) {
                        isp--;
                        var365 = IfType.get(this.intStack[isp])!;
                        effectiveOpcode -= 1000;
                    } else {
                        var365 = (activeSecond ? this.activeComponent2 : this.activeComponent)!;
                    }
                    if (effectiveOpcode === 1100) {
                        isp -= 2;
                        var365.scrollPosX = this.intStack[isp];
                        if (var365.scrollWidth - var365.renderWidth < var365.scrollPosX) {
                            var365.scrollPosX = var365.scrollWidth - var365.renderWidth;
                        }
                        if (var365.scrollPosX < 0) {
                            var365.scrollPosX = 0;
                        }
                        var365.scrollPosY = this.intStack[isp + 1];
                        if (var365.scrollPosY > var365.scrollHeight - var365.renderHeight) {
                            var365.scrollPosY = var365.scrollHeight - var365.renderHeight;
                        }
                        if (var365.scrollPosY < 0) {
                            var365.scrollPosY = 0;
                        }
                        Client.componentUpdated(var365);
                        continue;
                    }
                    if (effectiveOpcode === 1101) {
                        isp--;
                        var365.colour = this.intStack[isp];
                        Client.componentUpdated(var365);
                        continue;
                    }
                    if (effectiveOpcode === 1102) {
                        isp--;
                        var365.fill = this.intStack[isp] === 1;
                        Client.componentUpdated(var365);
                        continue;
                    }
                    if (effectiveOpcode === 1103) {
                        isp--;
                        var365.trans = this.intStack[isp];
                        Client.componentUpdated(var365);
                        continue;
                    }
                    if (effectiveOpcode === 1104) {
                        isp--;
                        var365.lineWidth = this.intStack[isp];
                        Client.componentUpdated(var365);
                        continue;
                    }
                    if (effectiveOpcode === 1105) {
                        isp--;
                        var365.graphic = this.intStack[isp];
                        Client.componentUpdated(var365);
                        continue;
                    }
                    if (effectiveOpcode === 1106) {
                        isp--;
                        var365.rotate = this.intStack[isp];
                        Client.componentUpdated(var365);
                        continue;
                    }
                    if (effectiveOpcode === 1107) {
                        isp--;
                        var365.tiling = this.intStack[isp] === 1;
                        Client.componentUpdated(var365);
                        continue;
                    }
                    if (effectiveOpcode === 1108) {
                        var365.model1Type = 1;
                        isp--;
                        var365.model1Id = this.intStack[isp];
                        Client.componentUpdated(var365);
                        continue;
                    }
                    if (effectiveOpcode === 1109) {
                        isp -= 6;
                        var365.field3365 = this.intStack[isp];
                        var365.field3498 = this.intStack[isp + 1];
                        var365.modelXAn = this.intStack[isp + 2];
                        var365.modelYAn = this.intStack[isp + 3];
                        var365.modelZAn = this.intStack[isp + 4];
                        var365.modelZoom = this.intStack[isp + 5];
                        Client.componentUpdated(var365);
                        continue;
                    }
                    if (effectiveOpcode === 1110) {
                        isp--;
                        const var366 = this.intStack[isp];
                        if (var365.modelAnim !== var366) {
                            var365.animCycle = 0;
                            var365.modelAnim = var366;
                            var365.animFrame = 0;
                            Client.componentUpdated(var365);
                        }
                        continue;
                    }
                    if (effectiveOpcode === 1111) {
                        isp--;
                        var365.orthog = this.intStack[isp] === 1;
                        Client.componentUpdated(var365);
                        continue;
                    }
                    if (effectiveOpcode === 1112) {
                        ssp--;
                        const var367 = this.stringStack[ssp];
                        if (!JagString.wrap(var367!).strEquals(var365.text === null ? null : JagString.wrap(var365.text))) {
                            var365.text = var367;
                            Client.componentUpdated(var365);
                        }
                        continue;
                    }
                    if (effectiveOpcode === 1113) {
                        isp--;
                        var365.font = this.intStack[isp];
                        Client.componentUpdated(var365);
                        continue;
                    }
                    if (effectiveOpcode === 1114) {
                        isp -= 3;
                        var365.hAlign = this.intStack[isp];
                        var365.vAlign = this.intStack[isp + 1];
                        var365.lineHeight = this.intStack[isp + 2];
                        Client.componentUpdated(var365);
                        continue;
                    }
                    if (effectiveOpcode === 1115) {
                        isp--;
                        var365.shadow = this.intStack[isp] === 1;
                        Client.componentUpdated(var365);
                        continue;
                    }
                    if (effectiveOpcode === 1116) {
                        isp--;
                        var365.outline = this.intStack[isp];
                        Client.componentUpdated(var365);
                        continue;
                    }
                    if (effectiveOpcode === 1117) {
                        isp--;
                        var365.shadowColour = this.intStack[isp];
                        Client.componentUpdated(var365);
                        continue;
                    }
                    if (effectiveOpcode === 1118) {
                        isp--;
                        var365.vFlip = this.intStack[isp] === 1;
                        Client.componentUpdated(var365);
                        continue;
                    }
                    if (effectiveOpcode === 1119) {
                        isp--;
                        var365.hFlip = this.intStack[isp] === 1;
                        Client.componentUpdated(var365);
                        continue;
                    }
                    if (effectiveOpcode === 1120) {
                        isp -= 2;
                        var365.scrollWidth = this.intStack[isp];
                        var365.scrollHeight = this.intStack[isp + 1];
                        Client.componentUpdated(var365);
                        if (var365.type === 0) {
                            Client.computeLayerLayout(false, var365);
                        }
                        continue;
                    }
                    if (effectiveOpcode === 1121) {
                        Client.componentUpdated(var365);
                        isp--;
                        continue;
                    }
                    if (effectiveOpcode === 1122) {
                        isp--;
                        var365.field3477 = this.intStack[isp] === 1;
                        Client.componentUpdated(var365);
                        continue;
                    }
                } else if ((effectiveOpcode >= 1200 && effectiveOpcode < 1300) || (effectiveOpcode >= 2200 && effectiveOpcode < 2300)) {
                    let var59: IfType;
                    if (effectiveOpcode >= 2000) {
                        effectiveOpcode -= 1000;
                        isp--;
                        var59 = IfType.get(this.intStack[isp])!;
                    } else {
                        var59 = (activeSecond ? this.activeComponent2 : this.activeComponent)!;
                    }
                    Client.componentUpdated(var59);
                    if (effectiveOpcode === 1200 || effectiveOpcode === 1205) {
                        isp -= 2;
                        const var60 = this.intStack[isp + 1];
                        const var61 = this.intStack[isp];
                        if (var61 === -1) {
                            var59.invobject = -1;
                            var59.model1Id = -1;
                            var59.model1Type = 1;
                        } else {
                            var59.invobject = var61;
                            var59.invcount = var60;
                            const var62 = ObjType.list(var61);
                            var59.field3365 = var62.xof2d;
                            var59.modelYAn = var62.yan2d;
                            var59.field3498 = var62.yof2d;
                            if (effectiveOpcode === 1205) {
                                var59.showCount = false;
                            } else {
                                var59.showCount = true;
                            }
                            var59.modelXAn = var62.xan2d;
                            var59.modelZAn = var62.zan2d;
                            var59.modelZoom = var62.zoom2d;
                            if (var59.modelBaseWidth > 0) {
                                var59.modelZoom = (Math.imul(var59.modelZoom, 32) / var59.modelBaseWidth) | 0;
                            } else if (var59.width > 0) {
                                var59.modelZoom = (Math.imul(var59.modelZoom, 32) / var59.width) | 0;
                            }
                        }
                        continue;
                    }
                    if (effectiveOpcode === 1201) {
                        var59.model1Type = 2;
                        isp--;
                        var59.model1Id = this.intStack[isp];
                        continue;
                    }
                    if (effectiveOpcode === 1202) {
                        var59.model1Type = 3;
                        var59.model1Id = Client.localPlayer!.model!.method1427();
                        continue;
                    }
                    if (effectiveOpcode === 1203) {
                        var59.model1Type = 6;
                        isp--;
                        var59.model1Id = this.intStack[isp];
                        continue;
                    }
                    if (effectiveOpcode === 1204) {
                        var59.model1Type = 5;
                        isp--;
                        var59.model1Id = this.intStack[isp];
                        continue;
                    }
                } else if ((effectiveOpcode < 1300 || effectiveOpcode >= 1400) && (effectiveOpcode < 2300 || effectiveOpcode >= 2400)) {
                    if ((effectiveOpcode >= 1400 && effectiveOpcode < 1500) || (effectiveOpcode >= 2400 && effectiveOpcode < 2500)) {
                        let var63: Int32Array | null = null;
                        let var64: IfType;
                        if (effectiveOpcode < 2000) {
                            var64 = (activeSecond ? this.activeComponent2 : this.activeComponent)!;
                        } else {
                            isp--;
                            var64 = IfType.get(this.intStack[isp])!;
                            effectiveOpcode -= 1000;
                        }
                        ssp--;
                        let var65 = JagString.wrap(this.stringStack[ssp]!);
                        if (Number(var65.length) > 0 && var65.charAt(Number(var65.length) - 1) === 89) {
                            isp--;
                            let var66 = this.intStack[isp];
                            if (var66 > 0) {
                                var63 = new Int32Array(var66);
                                while (var66-- > 0) {
                                    isp--;
                                    var63[var66] = this.intStack[isp];
                                }
                            }
                            var65 = var65.substring(0, Number(var65.length) - 1);
                        }
                        let var67: (number | string | null)[] | null = new Array(Number(var65.length) + 1).fill(null);
                        for (let var68 = var67.length - 1; var68 >= 1; var68--) {
                            if (var65.charAt(var68 - 1) === 115) {
                                ssp--;
                                var67[var68] = this.stringStack[ssp];
                            } else {
                                isp--;
                                var67[var68] = this.intStack[isp];
                            }
                        }
                        isp--;
                        const var69 = this.intStack[isp];
                        if (var69 === -1) {
                            var67 = null;
                        } else {
                            var67[0] = var69;
                        }
                        if (effectiveOpcode === 1417) {
                            var64.onscrollwheel = var67;
                        }
                        if (effectiveOpcode === 1403) {
                            var64.onmouseover = var67;
                        }
                        if (effectiveOpcode === 1421) {
                            var64.onclantransmit = var67;
                        }
                        if (effectiveOpcode === 1407) {
                            var64.onvartransmit = var67;
                            var64.onvartransmitlist = var63;
                        }
                        if (effectiveOpcode === 1408) {
                            var64.ontimer = var67;
                        }
                        if (effectiveOpcode === 1412) {
                            var64.onmouserepeat = var67;
                        }
                        if (effectiveOpcode === 1418) {
                            var64.onchattransmit = var67;
                        }
                        if (effectiveOpcode === 1405) {
                            var64.ondrag = var67;
                        }
                        if (effectiveOpcode === 1402) {
                            var64.onrelease = var67;
                        }
                        if (effectiveOpcode === 1420) {
                            var64.onfriendtransmit = var67;
                        }
                        if (effectiveOpcode === 1400) {
                            var64.onclick = var67;
                        }
                        if (effectiveOpcode === 1425) {
                            var64.onstocktransmit = var67;
                        }
                        if (effectiveOpcode === 1404) {
                            var64.onmouseleave = var67;
                        }
                        if (effectiveOpcode === 1427) {
                            var64.onresize = var67;
                        }
                        if (effectiveOpcode === 1423) {
                            var64.ondialogabort = var67;
                        }
                        if (effectiveOpcode === 1401) {
                            var64.onhold = var67;
                        }
                        if (effectiveOpcode === 1422) {
                            var64.onmisctransmit = var67;
                        }
                        if (effectiveOpcode === 1409) {
                            var64.onop = var67;
                        }
                        if (effectiveOpcode === 1419) {
                            var64.onkey = var67;
                        }
                        if (effectiveOpcode === 1414) {
                            var64.oninvtransmit = var67;
                            var64.oninvtransmitlist = var63;
                        }
                        if (effectiveOpcode === 1406) {
                            var64.ontargetleave = var67;
                        }
                        var64.hashook = true;
                        if (effectiveOpcode === 1411) {
                            var64.onclickrepeat = var67;
                        }
                        if (effectiveOpcode === 1415) {
                            var64.onstattransmitlist = var63;
                            var64.onstattransmit = var67;
                        }
                        if (effectiveOpcode === 1416) {
                            var64.ontargetenter = var67;
                        }
                        if (effectiveOpcode === 1424) {
                            var64.onsubchange = var67;
                        }
                        if (effectiveOpcode === 1410) {
                            var64.ondragcomplete = var67;
                        }
                        continue;
                    }
                    if (effectiveOpcode < 1600) {
                        const var70 = (activeSecond ? this.activeComponent2 : this.activeComponent)!;
                        if (effectiveOpcode === 1500) {
                            this.intStack[isp++] = var70.renderX;
                            continue;
                        }
                        if (effectiveOpcode === 1501) {
                            this.intStack[isp++] = var70.renderY;
                            continue;
                        }
                        if (effectiveOpcode === 1502) {
                            this.intStack[isp++] = var70.renderWidth;
                            continue;
                        }
                        if (effectiveOpcode === 1503) {
                            this.intStack[isp++] = var70.renderHeight;
                            continue;
                        }
                        if (effectiveOpcode === 1504) {
                            this.intStack[isp++] = var70.hide ? 1 : 0;
                            continue;
                        }
                        if (effectiveOpcode === 1505) {
                            this.intStack[isp++] = var70.layerId;
                            continue;
                        }
                    } else if (effectiveOpcode < 1700) {
                        const var71 = (activeSecond ? this.activeComponent2 : this.activeComponent)!;
                        if (effectiveOpcode === 1600) {
                            this.intStack[isp++] = var71.scrollPosX;
                            continue;
                        }
                        if (effectiveOpcode === 1601) {
                            this.intStack[isp++] = var71.scrollPosY;
                            continue;
                        }
                        if (effectiveOpcode === 1602) {
                            this.stringStack[ssp++] = var71.text;
                            continue;
                        }
                        if (effectiveOpcode === 1603) {
                            this.intStack[isp++] = var71.scrollWidth;
                            continue;
                        }
                        if (effectiveOpcode === 1604) {
                            this.intStack[isp++] = var71.scrollHeight;
                            continue;
                        }
                        if (effectiveOpcode === 1605) {
                            this.intStack[isp++] = var71.modelZoom;
                            continue;
                        }
                        if (effectiveOpcode === 1606) {
                            this.intStack[isp++] = var71.modelXAn;
                            continue;
                        }
                        if (effectiveOpcode === 1607) {
                            this.intStack[isp++] = var71.modelZAn;
                            continue;
                        }
                        if (effectiveOpcode === 1608) {
                            this.intStack[isp++] = var71.modelYAn;
                            continue;
                        }
                        if (effectiveOpcode === 1609) {
                            this.intStack[isp++] = var71.trans;
                            continue;
                        }
                    } else if (effectiveOpcode < 1800) {
                        const var72 = (activeSecond ? this.activeComponent2 : this.activeComponent)!;
                        if (effectiveOpcode === 1700) {
                            this.intStack[isp++] = var72.invobject;
                            continue;
                        }
                        if (effectiveOpcode === 1701) {
                            if (var72.invobject === -1) {
                                this.intStack[isp++] = 0;
                            } else {
                                this.intStack[isp++] = var72.invcount;
                            }
                            continue;
                        }
                        if (effectiveOpcode === 1702) {
                            this.intStack[isp++] = var72.subId;
                            continue;
                        }
                    } else if (effectiveOpcode < 1900) {
                        const var73 = (activeSecond ? this.activeComponent2 : this.activeComponent)!;
                        if (effectiveOpcode === 1800) {
                            this.intStack[isp++] = ServerActive.targetMask(Client.getActive(var73));
                            continue;
                        }
                        if (effectiveOpcode === 1801) {
                            isp--;
                            const var74 = this.intStack[isp];
                            const var383 = var74 - 1;
                            if (var73.opNames !== null && var73.opNames.length > var383 && var73.opNames[var383] !== null) {
                                this.stringStack[ssp++] = var73.opNames[var383];
                                continue;
                            }
                            this.stringStack[ssp++] = this.field1468;
                            continue;
                        }
                        if (effectiveOpcode === 1802) {
                            if (var73.baseOpName === null) {
                                this.stringStack[ssp++] = this.field1468;
                            } else {
                                this.stringStack[ssp++] = var73.baseOpName;
                            }
                            continue;
                        }
                    } else if (effectiveOpcode < 2600) {
                        isp--;
                        const var75 = IfType.get(this.intStack[isp])!;
                        if (effectiveOpcode === 2500) {
                            this.intStack[isp++] = var75.renderX;
                            continue;
                        }
                        if (effectiveOpcode === 2501) {
                            this.intStack[isp++] = var75.renderY;
                            continue;
                        }
                        if (effectiveOpcode === 2502) {
                            this.intStack[isp++] = var75.renderWidth;
                            continue;
                        }
                        if (effectiveOpcode === 2503) {
                            this.intStack[isp++] = var75.renderHeight;
                            continue;
                        }
                        if (effectiveOpcode === 2504) {
                            this.intStack[isp++] = var75.hide ? 1 : 0;
                            continue;
                        }
                        if (effectiveOpcode === 2505) {
                            this.intStack[isp++] = var75.layerId;
                            continue;
                        }
                    } else if (effectiveOpcode < 2700) {
                        isp--;
                        const var76 = IfType.get(this.intStack[isp])!;
                        if (effectiveOpcode === 2600) {
                            this.intStack[isp++] = var76.scrollPosX;
                            continue;
                        }
                        if (effectiveOpcode === 2601) {
                            this.intStack[isp++] = var76.scrollPosY;
                            continue;
                        }
                        if (effectiveOpcode === 2602) {
                            this.stringStack[ssp++] = var76.text;
                            continue;
                        }
                        if (effectiveOpcode === 2603) {
                            this.intStack[isp++] = var76.scrollWidth;
                            continue;
                        }
                        if (effectiveOpcode === 2604) {
                            this.intStack[isp++] = var76.scrollHeight;
                            continue;
                        }
                        if (effectiveOpcode === 2605) {
                            this.intStack[isp++] = var76.modelZoom;
                            continue;
                        }
                        if (effectiveOpcode === 2606) {
                            this.intStack[isp++] = var76.modelXAn;
                            continue;
                        }
                        if (effectiveOpcode === 2607) {
                            this.intStack[isp++] = var76.modelZAn;
                            continue;
                        }
                        if (effectiveOpcode === 2608) {
                            this.intStack[isp++] = var76.modelYAn;
                            continue;
                        }
                        if (effectiveOpcode === 2609) {
                            this.intStack[isp++] = var76.trans;
                            continue;
                        }
                    } else if (effectiveOpcode < 2800) {
                        if (effectiveOpcode === 2700) {
                            isp--;
                            const var351 = IfType.get(this.intStack[isp])!;
                            this.intStack[isp++] = var351.invobject;
                            continue;
                        }
                        if (effectiveOpcode === 2701) {
                            isp--;
                            const var352 = IfType.get(this.intStack[isp])!;
                            if (var352.invobject === -1) {
                                this.intStack[isp++] = 0;
                            } else {
                                this.intStack[isp++] = var352.invcount;
                            }
                            continue;
                        }
                        if (effectiveOpcode === 2702) {
                            isp--;
                            const var353 = this.intStack[isp];
                            const var354 = Client.subinterfaces.find(BigInt(var353)) as SubInterface | null;
                            if (var354 === null) {
                                this.intStack[isp++] = 0;
                            } else {
                                this.intStack[isp++] = 1;
                            }
                            continue;
                        }
                        if (effectiveOpcode === 2703) {
                            isp--;
                            const var355 = IfType.get(this.intStack[isp])!;
                            if (var355.subcomponents === null) {
                                this.intStack[isp++] = 0;
                                continue;
                            }
                            let var356 = var355.subcomponents.length;
                            for (let var357 = 0; var357 < var355.subcomponents.length; var357++) {
                                if (var355.subcomponents[var357] === null) {
                                    var356 = var357;
                                    break;
                                }
                            }
                            this.intStack[isp++] = var356;
                            continue;
                        }
                        if (effectiveOpcode === 2704 || effectiveOpcode === 2705) {
                            isp -= 2;
                            const var358 = this.intStack[isp];
                            const var359 = this.intStack[isp + 1];
                            const var360 = Client.subinterfaces.find(BigInt(var358)) as SubInterface | null;
                            if (var360 !== null && var360.id === var359) {
                                this.intStack[isp++] = 1;
                                continue;
                            }
                            this.intStack[isp++] = 0;
                            continue;
                        }
                    } else if (effectiveOpcode < 2900) {
                        isp--;
                        const var77 = IfType.get(this.intStack[isp])!;
                        if (effectiveOpcode === 2800) {
                            this.intStack[isp++] = ServerActive.targetMask(Client.getActive(var77));
                            continue;
                        }
                        if (effectiveOpcode === 2801) {
                            isp--;
                            const var78 = this.intStack[isp];
                            const var384 = var78 - 1;
                            if (var77.opNames !== null && var77.opNames.length > var384 && var77.opNames[var384] !== null) {
                                this.stringStack[ssp++] = var77.opNames[var384];
                                continue;
                            }
                            this.stringStack[ssp++] = this.field1468;
                            continue;
                        }
                        if (effectiveOpcode === 2802) {
                            if (var77.baseOpName === null) {
                                this.stringStack[ssp++] = this.field1468;
                            } else {
                                this.stringStack[ssp++] = var77.baseOpName;
                            }
                            continue;
                        }
                    } else if (effectiveOpcode < 3200) {
                        if (effectiveOpcode === 3100) {
                            ssp--;
                            const var336 = this.stringStack[ssp]!;
                            Client.addChat(var336, 0, this.field1468);
                            continue;
                        }
                        if (effectiveOpcode === 3101) {
                            isp -= 2;
                            Client.triggerPlayerAnim(this.intStack[isp], this.intStack[isp + 1], Client.localPlayer!);
                            continue;
                        }
                        if (effectiveOpcode === 3103) {
                            Client.closeModal();
                            continue;
                        }
                        if (effectiveOpcode === 3104) {
                            ssp--;
                            const var337 = JagString.wrap(this.stringStack[ssp]!);
                            let var338 = 0;
                            if (var337.isDecimal()) {
                                var338 = var337.toInt();
                            }
                            Client.out.p1Enc(152);
                            Client.out.p4(var338);
                            continue;
                        }
                        if (effectiveOpcode === 3105) {
                            ssp--;
                            const var339 = this.stringStack[ssp]!;
                            Client.out.p1Enc(54);
                            Client.out.p8(JagString.fromLatin1String(var339).toUserhash());
                            continue;
                        }
                        if (effectiveOpcode === 3106) {
                            ssp--;
                            const var340 = this.stringStack[ssp]!;
                            Client.out.p1Enc(60);
                            Client.out.p1(Packet.pjstrlen(var340));
                            Client.out.pjstr(var340);
                            continue;
                        }
                        if (effectiveOpcode === 3107) {
                            isp--;
                            const var341 = this.intStack[isp];
                            ssp--;
                            const var342 = this.stringStack[ssp]!;
                            Client.opPlayer(var342, var341);
                            continue;
                        }
                        if (effectiveOpcode === 3108) {
                            isp -= 3;
                            const var343 = this.intStack[isp];
                            const var344 = this.intStack[isp + 1];
                            const var345 = this.intStack[isp + 2];
                            const var346 = IfType.get(var345);
                            Client.dragTryPickup(var343, var344, var346);
                            continue;
                        }
                        if (effectiveOpcode === 3109) {
                            isp -= 2;
                            const var347 = this.intStack[isp];
                            const var348 = this.intStack[isp + 1];
                            const var349 = activeSecond ? this.activeComponent2 : this.activeComponent;
                            Client.dragTryPickup(var347, var348, var349);
                            continue;
                        }
                        if (effectiveOpcode === 3110) {
                            isp--;
                            const var350 = this.intStack[isp];
                            Client.out.p1Enc(194);
                            Client.out.p2(var350);
                            continue;
                        }
                    } else if (effectiveOpcode < 3300) {
                        if (effectiveOpcode === 3200) {
                            isp -= 3;
                            Client.playSynth(this.intStack[isp + 1], this.intStack[isp + 2], this.intStack[isp]);
                            continue;
                        }
                        if (effectiveOpcode === 3201) {
                            isp--;
                            Client.playSongs(this.intStack[isp]);
                            continue;
                        }
                        if (effectiveOpcode === 3202) {
                            isp -= 2;
                            Client.playJingle(this.intStack[isp], this.intStack[isp + 1]);
                            continue;
                        }
                    } else if (effectiveOpcode < 3400) {
                        if (effectiveOpcode === 3300) {
                            this.intStack[isp++] = Client.loopCycle;
                            continue;
                        }
                        if (effectiveOpcode === 3301) {
                            isp -= 2;
                            const var314 = this.intStack[isp + 1];
                            const var315 = this.intStack[isp];
                            this.intStack[isp++] = ClientInvCache.getType(var314, var315);
                            continue;
                        }
                        if (effectiveOpcode === 3302) {
                            isp -= 2;
                            const var316 = this.intStack[isp];
                            const var317 = this.intStack[isp + 1];
                            this.intStack[isp++] = ClientInvCache.getCount(var316, var317);
                            continue;
                        }
                        if (effectiveOpcode === 3303) {
                            isp -= 2;
                            const var318 = this.intStack[isp + 1];
                            const var319 = this.intStack[isp];
                            this.intStack[isp++] = ClientInvCache.invTotal(var319, var318);
                            continue;
                        }
                        if (effectiveOpcode === 3304) {
                            isp--;
                            const var320 = this.intStack[isp];
                            this.intStack[isp++] = InvType.list(var320).size;
                            continue;
                        }
                        if (effectiveOpcode === 3305) {
                            isp--;
                            const var321 = this.intStack[isp];
                            this.intStack[isp++] = Client.statEffectiveLevel[var321];
                            continue;
                        }
                        if (effectiveOpcode === 3306) {
                            isp--;
                            const var322 = this.intStack[isp];
                            this.intStack[isp++] = Client.statBaseLevel[var322];
                            continue;
                        }
                        if (effectiveOpcode === 3307) {
                            isp--;
                            const var323 = this.intStack[isp];
                            this.intStack[isp++] = Client.statXP[var323];
                            continue;
                        }
                        if (effectiveOpcode === 3308) {
                            const var324 = Client.minusedlevel;
                            const var325 = (Client.localPlayer!.z >> 7) + Client.mapBuildBaseZ;
                            const var326 = Client.mapBuildBaseX + (Client.localPlayer!.x >> 7);
                            this.intStack[isp++] = (var325 + (var326 << 14) + (var324 << 28)) | 0;
                            continue;
                        }
                        if (effectiveOpcode === 3309) {
                            isp--;
                            const var327 = this.intStack[isp];
                            this.intStack[isp++] = (var327 >> 14) & 0x3fff;
                            continue;
                        }
                        if (effectiveOpcode === 3310) {
                            isp--;
                            const var328 = this.intStack[isp];
                            this.intStack[isp++] = var328 >> 28;
                            continue;
                        }
                        if (effectiveOpcode === 3311) {
                            isp--;
                            const var329 = this.intStack[isp];
                            this.intStack[isp++] = var329 & 0x3fff;
                            continue;
                        }
                        if (effectiveOpcode === 3312) {
                            this.intStack[isp++] = Client.memServer ? 1 : 0;
                            continue;
                        }
                        if (effectiveOpcode === 3313) {
                            isp -= 2;
                            const var330 = this.intStack[isp + 1];
                            const var331 = this.intStack[isp] + 32768;
                            this.intStack[isp++] = ClientInvCache.getType(var330, var331);
                            continue;
                        }
                        if (effectiveOpcode === 3314) {
                            isp -= 2;
                            const var332 = this.intStack[isp] + 32768;
                            const var333 = this.intStack[isp + 1];
                            this.intStack[isp++] = ClientInvCache.getCount(var332, var333);
                            continue;
                        }
                        if (effectiveOpcode === 3315) {
                            isp -= 2;
                            const var334 = this.intStack[isp] + 32768;
                            const var335 = this.intStack[isp + 1];
                            this.intStack[isp++] = ClientInvCache.invTotal(var334, var335);
                            continue;
                        }
                        if (effectiveOpcode === 3316) {
                            if (Client.staffmodlevel < 2) {
                                this.intStack[isp++] = 0;
                            } else {
                                this.intStack[isp++] = Client.staffmodlevel;
                            }
                            continue;
                        }
                        if (effectiveOpcode === 3317) {
                            this.intStack[isp++] = Client.rebootTimer;
                            continue;
                        }
                        if (effectiveOpcode === 3318) {
                            this.intStack[isp++] = Client.worldid;
                            continue;
                        }
                        if (effectiveOpcode === 3321) {
                            this.intStack[isp++] = Client.runenergy;
                            continue;
                        }
                        if (effectiveOpcode === 3322) {
                            this.intStack[isp++] = Client.runweight;
                            continue;
                        }
                        if (effectiveOpcode === 3323) {
                            if (Client.blackmarks >= 5 && Client.blackmarks <= 9) {
                                this.intStack[isp++] = 1;
                                continue;
                            }
                            this.intStack[isp++] = 0;
                            continue;
                        }
                        if (effectiveOpcode === 3324) {
                            if (Client.blackmarks >= 5 && Client.blackmarks <= 9) {
                                this.intStack[isp++] = Client.blackmarks;
                                continue;
                            }
                            this.intStack[isp++] = 0;
                            continue;
                        }
                        if (effectiveOpcode === 3325) {
                            if (Client.membersAccount > 0) {
                                this.intStack[isp++] = 1;
                            } else {
                                this.intStack[isp++] = 0;
                            }
                            continue;
                        }
                        if (effectiveOpcode === 3326) {
                            this.intStack[isp++] = Client.localPlayer!.combatLevel;
                            continue;
                        }
                        if (effectiveOpcode === 3327) {
                            this.intStack[isp++] = Client.localPlayer!.model!.gender ? 1 : 0;
                            continue;
                        }
                        if (effectiveOpcode === 3328) {
                            this.intStack[isp++] = Client.underage;
                            continue;
                        }
                        if (effectiveOpcode === 3329) {
                            this.intStack[isp++] = Client.mapQuickchat;
                            continue;
                        }
                    } else if (effectiveOpcode < 3500) {
                        if (effectiveOpcode === 3400) {
                            isp -= 2;
                            const var306 = this.intStack[isp];
                            const var307 = this.intStack[isp + 1];
                            const var308 = EnumType.list(var306);
                            this.stringStack[ssp++] = var308.getValueString(var307);
                            continue;
                        }
                        if (effectiveOpcode === 3408) {
                            isp -= 4;
                            const var309 = this.intStack[isp + 1];
                            const var310 = this.intStack[isp + 2];
                            const var311 = this.intStack[isp + 3];
                            const var312 = this.intStack[isp];
                            const var313 = EnumType.list(var310);
                            if (var312 === var313.inputtype && var309 === var313.outputtype) {
                                if (var309 === 115) {
                                    this.stringStack[ssp++] = var313.getValueString(var311);
                                } else {
                                    this.intStack[isp++] = var313.getValueInt(var311);
                                }
                                continue;
                            }
                            if (var309 === 115) {
                                this.stringStack[ssp++] = this.field207;
                            } else {
                                this.intStack[isp++] = 0;
                            }
                            continue;
                        }
                    } else if (effectiveOpcode < 3700) {
                        if (effectiveOpcode === 3600) {
                            if (Client.friendServerStatus === 0) {
                                this.intStack[isp++] = -2;
                            } else if (Client.friendServerStatus === 1) {
                                this.intStack[isp++] = -1;
                            } else {
                                this.intStack[isp++] = Client.friendCount;
                            }
                            continue;
                        }
                        if (effectiveOpcode === 3601) {
                            isp--;
                            const var79 = this.intStack[isp];
                            if (Client.friendServerStatus === 2 && var79 < Client.friendCount) {
                                this.stringStack[ssp++] = Client.field370[var79]!.toString();
                                continue;
                            }
                            this.stringStack[ssp++] = this.field1468;
                            continue;
                        }
                        if (effectiveOpcode === 3602) {
                            isp--;
                            const var80 = this.intStack[isp];
                            if (Client.friendServerStatus === 2 && var80 < Client.friendCount) {
                                this.intStack[isp++] = Client.field3092[var80];
                                continue;
                            }
                            this.intStack[isp++] = 0;
                            continue;
                        }
                        if (effectiveOpcode === 3603) {
                            isp--;
                            const var81 = this.intStack[isp];
                            if (Client.friendServerStatus === 2 && var81 < Client.friendCount) {
                                this.intStack[isp++] = Client.field845[var81];
                                continue;
                            }
                            this.intStack[isp++] = 0;
                            continue;
                        }
                        if (effectiveOpcode === 3604) {
                            ssp--;
                            const var82 = this.stringStack[ssp]!;
                            isp--;
                            const var83 = this.intStack[isp];
                            Client.setFriendRank(var82, var83);
                            continue;
                        }
                        if (effectiveOpcode === 3605) {
                            ssp--;
                            const var84 = this.stringStack[ssp]!;
                            Client.addFriend(JagString.fromLatin1String(var84).toUserhash());
                            continue;
                        }
                        if (effectiveOpcode === 3606) {
                            ssp--;
                            const var85 = this.stringStack[ssp]!;
                            Client.delFriend(JagString.fromLatin1String(var85).toUserhash());
                            continue;
                        }
                        if (effectiveOpcode === 3607) {
                            ssp--;
                            const var86 = this.stringStack[ssp]!;
                            Client.addIgnore(JagString.fromLatin1String(var86).toUserhash());
                            continue;
                        }
                        if (effectiveOpcode === 3608) {
                            ssp--;
                            const var87 = this.stringStack[ssp]!;
                            Client.delIgnore(JagString.fromLatin1String(var87).toUserhash());
                            continue;
                        }
                        if (effectiveOpcode === 3609) {
                            ssp--;
                            let var88 = this.stringStack[ssp]!;
                            if (var88.startsWith(this.field3554) || var88.startsWith(this.field3141)) {
                                var88 = var88.substring(7);
                            }
                            this.intStack[isp++] = Client.isFriend(var88) ? 1 : 0;
                            continue;
                        }
                        if (effectiveOpcode === 3610) {
                            isp--;
                            const var89 = this.intStack[isp];
                            if (Client.friendServerStatus === 2 && Client.friendCount > var89) {
                                this.stringStack[ssp++] = Client.field3238[var89];
                                continue;
                            }
                            this.stringStack[ssp++] = this.field1468;
                            continue;
                        }
                        if (effectiveOpcode === 3611) {
                            if (Client.chatDisplayName === null) {
                                this.stringStack[ssp++] = this.field1468;
                            } else {
                                this.stringStack[ssp++] = JagString.fromLatin1String(Client.chatDisplayName).toScreenName().toString();
                            }
                            continue;
                        }
                        if (effectiveOpcode === 3612) {
                            if (Client.chatDisplayName === null) {
                                this.intStack[isp++] = 0;
                            } else {
                                this.intStack[isp++] = Client.friendChatCount;
                            }
                            continue;
                        }
                        if (effectiveOpcode === 3613) {
                            isp--;
                            const var90 = this.intStack[isp];
                            if (Client.chatDisplayName !== null && Client.friendChatCount > var90) {
                                this.stringStack[ssp++] = Client.friendChatList![var90]!.name!.toScreenName().toString();
                                continue;
                            }
                            this.stringStack[ssp++] = this.field1468;
                            continue;
                        }
                        if (effectiveOpcode === 3614) {
                            isp--;
                            const var91 = this.intStack[isp];
                            if (Client.chatDisplayName !== null && Client.friendChatCount > var91) {
                                this.intStack[isp++] = Client.friendChatList![var91]!.world;
                                continue;
                            }
                            this.intStack[isp++] = 0;
                            continue;
                        }
                        if (effectiveOpcode === 3615) {
                            isp--;
                            const var92 = this.intStack[isp];
                            if (Client.chatDisplayName !== null && Client.friendChatCount > var92) {
                                this.intStack[isp++] = Client.friendChatList![var92]!.rank;
                                continue;
                            }
                            this.intStack[isp++] = 0;
                            continue;
                        }
                        if (effectiveOpcode === 3616) {
                            this.intStack[isp++] = Client.chatMinKick;
                            continue;
                        }
                        if (effectiveOpcode === 3617) {
                            ssp--;
                            const var93 = this.stringStack[ssp]!;
                            Client.friendsChatKickUser(var93);
                            continue;
                        }
                        if (effectiveOpcode === 3618) {
                            this.intStack[isp++] = Client.chatRank;
                            continue;
                        }
                        if (effectiveOpcode === 3619) {
                            ssp--;
                            const var94 = this.stringStack[ssp]!;
                            Client.friendsChatJoinChat(JagString.fromLatin1String(var94).toUserhash());
                            continue;
                        }
                        if (effectiveOpcode === 3620) {
                            Client.friendsChatLeaveChat();
                            continue;
                        }
                        if (effectiveOpcode === 3621) {
                            if (Client.friendServerStatus === 0) {
                                this.intStack[isp++] = -1;
                            } else {
                                this.intStack[isp++] = Client.privateMessageCount;
                            }
                            continue;
                        }
                        if (effectiveOpcode === 3622) {
                            isp--;
                            const var95 = this.intStack[isp];
                            if (Client.friendServerStatus !== 0 && var95 < Client.privateMessageCount) {
                                this.stringStack[ssp++] = JagString.toRawUsername(Client.messageIds[var95])!.toScreenName().toString();
                                continue;
                            }
                            this.stringStack[ssp++] = this.field1468;
                            continue;
                        }
                        if (effectiveOpcode === 3623) {
                            ssp--;
                            let var96 = this.stringStack[ssp]!;
                            if (var96.startsWith(this.field3554) || var96.startsWith(this.field3141)) {
                                var96 = var96.substring(7);
                            }
                            this.intStack[isp++] = Client.isIgnored(var96) ? 1 : 0;
                            continue;
                        }
                        if (effectiveOpcode === 3624) {
                            isp--;
                            const var97 = this.intStack[isp];
                            if (Client.friendChatList !== null && Client.friendChatCount > var97 && Client.friendChatList![var97]!.name!.equalsIgnoreCase(Client.localPlayer!.name === null ? null : JagString.wrap(Client.localPlayer!.name))) {
                                this.intStack[isp++] = 1;
                                continue;
                            }
                            this.intStack[isp++] = 0;
                            continue;
                        }
                        if (effectiveOpcode === 3625) {
                            if (Client.chatOwnerName === null) {
                                this.stringStack[ssp++] = this.field1468;
                            } else {
                                this.stringStack[ssp++] = JagString.fromLatin1String(Client.chatOwnerName).toScreenName().toString();
                            }
                            continue;
                        }
                        if (effectiveOpcode === 3626) {
                            isp--;
                            const var98 = this.intStack[isp];
                            if (Client.chatDisplayName !== null && Client.friendChatCount > var98) {
                                this.stringStack[ssp++] = Client.friendChatList![var98]!.displayName;
                                continue;
                            }
                            this.stringStack[ssp++] = this.field1468;
                            continue;
                        }
                        if (effectiveOpcode === 3627) {
                            isp--;
                            const var99 = this.intStack[isp];
                            if (Client.friendServerStatus === 2 && var99 >= 0 && var99 < Client.friendCount) {
                                this.intStack[isp++] = Client.field1120[var99] ? 1 : 0;
                                continue;
                            }
                            this.intStack[isp++] = 0;
                            continue;
                        }
                        if (effectiveOpcode === 3628) {
                            ssp--;
                            let var100 = this.stringStack[ssp]!;
                            if (var100.startsWith(this.field3554) || var100.startsWith(this.field3141)) {
                                var100 = var100.substring(7);
                            }
                            this.intStack[isp++] = Client.getFriendIndex(var100);
                            continue;
                        }
                    } else if (effectiveOpcode < 4000) {
                        if (effectiveOpcode === 3903) {
                            isp--;
                            const var101 = this.intStack[isp];
                            this.intStack[isp++] = Client.field140[var101].getType();
                            continue;
                        }
                        if (effectiveOpcode === 3904) {
                            isp--;
                            const var102 = this.intStack[isp];
                            this.intStack[isp++] = Client.field140[var102].item;
                            continue;
                        }
                        if (effectiveOpcode === 3905) {
                            isp--;
                            const var103 = this.intStack[isp];
                            this.intStack[isp++] = Client.field140[var103].price;
                            continue;
                        }
                        if (effectiveOpcode === 3906) {
                            isp--;
                            const var104 = this.intStack[isp];
                            this.intStack[isp++] = Client.field140[var104].count;
                            continue;
                        }
                        if (effectiveOpcode === 3907) {
                            isp--;
                            const var105 = this.intStack[isp];
                            this.intStack[isp++] = Client.field140[var105].completedCount;
                            continue;
                        }
                        if (effectiveOpcode === 3908) {
                            isp--;
                            const var106 = this.intStack[isp];
                            this.intStack[isp++] = Client.field140[var106].completedGold;
                            continue;
                        }
                        if (effectiveOpcode === 3910) {
                            isp--;
                            const var107 = this.intStack[isp];
                            const var108 = Client.field140[var107].getState();
                            this.intStack[isp++] = var108 === 0 ? 1 : 0;
                            continue;
                        }
                        if (effectiveOpcode === 3911) {
                            isp--;
                            const var109 = this.intStack[isp];
                            const var110 = Client.field140[var109].getState();
                            this.intStack[isp++] = var110 === 2 ? 1 : 0;
                            continue;
                        }
                        if (effectiveOpcode === 3912) {
                            isp--;
                            const var111 = this.intStack[isp];
                            const var112 = Client.field140[var111].getState();
                            this.intStack[isp++] = var112 === 5 ? 1 : 0;
                            continue;
                        }
                        if (effectiveOpcode === 3913) {
                            isp--;
                            const var113 = this.intStack[isp];
                            const var114 = Client.field140[var113].getState();
                            this.intStack[isp++] = var114 === 1 ? 1 : 0;
                            continue;
                        }
                    } else if (effectiveOpcode < 4100) {
                        if (effectiveOpcode === 4000) {
                            isp -= 2;
                            const var115 = this.intStack[isp];
                            const var116 = this.intStack[isp + 1];
                            this.intStack[isp++] = (var115 + var116) | 0;
                            continue;
                        }
                        if (effectiveOpcode === 4001) {
                            isp -= 2;
                            const var117 = this.intStack[isp];
                            const var118 = this.intStack[isp + 1];
                            this.intStack[isp++] = (var117 - var118) | 0;
                            continue;
                        }
                        if (effectiveOpcode === 4002) {
                            isp -= 2;
                            const var119 = this.intStack[isp + 1];
                            const var120 = this.intStack[isp];
                            this.intStack[isp++] = Math.imul(var120, var119);
                            continue;
                        }
                        if (effectiveOpcode === 4003) {
                            isp -= 2;
                            const var121 = this.intStack[isp];
                            const var122 = this.intStack[isp + 1];
                            if (var122 === 0) {
                                throw new Error();
                            }
                            this.intStack[isp++] = (var121 / var122) | 0;
                            continue;
                        }
                        if (effectiveOpcode === 4004) {
                            isp--;
                            const var123 = this.intStack[isp];
                            this.intStack[isp++] = (Math.random() * var123) | 0;
                            continue;
                        }
                        if (effectiveOpcode === 4005) {
                            isp--;
                            const var124 = this.intStack[isp];
                            this.intStack[isp++] = (((var124 + 1) | 0) * Math.random()) | 0;
                            continue;
                        }
                        if (effectiveOpcode === 4006) {
                            isp -= 5;
                            const var125 = this.intStack[isp];
                            const var126 = this.intStack[isp + 1];
                            const var127 = this.intStack[isp + 2];
                            const var128 = this.intStack[isp + 3];
                            const var129 = this.intStack[isp + 4];
                            if (var128 - var127 === 0) {
                                throw new Error();
                            }
                            this.intStack[isp++] = (var125 + ((Math.imul(var129 - var127, -var125 + var126) / (var128 - var127)) | 0)) | 0;
                            continue;
                        }
                        if (effectiveOpcode === 4007) {
                            isp -= 2;
                            const var130: bigint = BigInt(this.intStack[isp + 1]);
                            const var132: bigint = BigInt(this.intStack[isp]);
                            this.intStack[isp++] = Number(BigInt.asIntN(32, BigInt.asIntN(64, var130 * var132) / 100n + var132));
                            continue;
                        }
                        if (effectiveOpcode === 4008) {
                            isp -= 2;
                            const var134 = this.intStack[isp];
                            const var135 = this.intStack[isp + 1];
                            this.intStack[isp++] = (0x1 << var135) | var134;
                            continue;
                        }
                        if (effectiveOpcode === 4009) {
                            isp -= 2;
                            const var136 = this.intStack[isp + 1];
                            const var137 = this.intStack[isp];
                            this.intStack[isp++] = var137 & (-(0x1 << var136) - 1);
                            continue;
                        }
                        if (effectiveOpcode === 4010) {
                            isp -= 2;
                            const var138 = this.intStack[isp + 1];
                            const var139 = this.intStack[isp];
                            this.intStack[isp++] = (var139 & (0x1 << var138)) === 0 ? 0 : 1;
                            continue;
                        }
                        if (effectiveOpcode === 4011) {
                            isp -= 2;
                            const var140 = this.intStack[isp + 1];
                            const var141 = this.intStack[isp];
                            if (var140 === 0) {
                                throw new Error();
                            }
                            this.intStack[isp++] = var141 % var140;
                            continue;
                        }
                        if (effectiveOpcode === 4012) {
                            isp -= 2;
                            const var142 = this.intStack[isp];
                            const var143 = this.intStack[isp + 1];
                            if (var142 === 0) {
                                this.intStack[isp++] = 0;
                            } else {
                                const value = Math.pow(var142, var143);
                                this.intStack[isp++] = Number.isNaN(value) ? 0 : value > 0x7fffffff ? 0x7fffffff : value < -0x80000000 ? -0x80000000 : Math.trunc(value);
                            }
                            continue;
                        }
                        if (effectiveOpcode === 4013) {
                            isp -= 2;
                            const var144 = this.intStack[isp];
                            const var145 = this.intStack[isp + 1];
                            if (var144 === 0) {
                                this.intStack[isp++] = 0;
                            } else if (var145 === 0) {
                                this.intStack[isp++] = 0x7fffffff;
                            } else {
                                const result = Math.pow(var144, 1.0 / var145);
                                this.intStack[isp++] = Number.isNaN(result) ? 0 : result > 0x7fffffff ? 0x7fffffff : result < -0x80000000 ? -0x80000000 : Math.trunc(result);
                            }
                            continue;
                        }
                        if (effectiveOpcode === 4014) {
                            isp -= 2;
                            const var146 = this.intStack[isp + 1];
                            const var147 = this.intStack[isp];
                            this.intStack[isp++] = var146 & var147;
                            continue;
                        }
                        if (effectiveOpcode === 4015) {
                            isp -= 2;
                            const var148 = this.intStack[isp + 1];
                            const var149 = this.intStack[isp];
                            this.intStack[isp++] = var149 | var148;
                            continue;
                        }
                        if (effectiveOpcode === 4016) {
                            isp -= 2;
                            const var150 = this.intStack[isp];
                            const var151 = this.intStack[isp + 1];
                            this.intStack[isp++] = var150 < var151 ? var150 : var151;
                            continue;
                        }
                        if (effectiveOpcode === 4017) {
                            isp -= 2;
                            const var152 = this.intStack[isp];
                            const var153 = this.intStack[isp + 1];
                            this.intStack[isp++] = var152 <= var153 ? var153 : var152;
                            continue;
                        }
                        if (effectiveOpcode === 4018) {
                            isp -= 3;
                            const var154: bigint = BigInt(this.intStack[isp]);
                            const var156: bigint = BigInt(this.intStack[isp + 1]);
                            const var158: bigint = BigInt(this.intStack[isp + 2]);
                            this.intStack[isp++] = Number(BigInt.asIntN(32, BigInt.asIntN(64, var158 * var154) / var156));
                            continue;
                        }
                    } else if (effectiveOpcode < 4200) {
                        if (effectiveOpcode === 4100) {
                            ssp--;
                            let var254 = this.stringStack[ssp];
                            isp--;
                            const var255 = this.intStack[isp];
                            this.stringStack[ssp++] = JagString.join([var254 === null ? JagString.STRING_NULL : JagString.wrap(var254), JagString.parseInt(var255)]).toString();
                            continue;
                        }
                        if (effectiveOpcode === 4101) {
                            ssp -= 2;
                            let var256 = this.stringStack[ssp + 1];
                            let var257 = this.stringStack[ssp];
                            this.stringStack[ssp++] = JagString.join([var257 === null ? JagString.STRING_NULL : JagString.wrap(var257), var256 === null ? JagString.STRING_NULL : JagString.wrap(var256)]).toString();
                            continue;
                        }
                        if (effectiveOpcode === 4102) {
                            ssp--;
                            let var258 = this.stringStack[ssp];
                            isp--;
                            const var259 = this.intStack[isp];
                            this.stringStack[ssp++] = JagString.join([var258 === null ? JagString.STRING_NULL : JagString.wrap(var258), JagString.formatIntSigned(var259)]).toString();
                            continue;
                        }
                        if (effectiveOpcode === 4103) {
                            ssp--;
                            const var260 = JagString.wrap(this.stringStack[ssp]!);
                            this.stringStack[ssp++] = var260.toLowerCase().toString();
                            continue;
                        }
                        if (effectiveOpcode === 4104) {
                            isp--;
                            const var261 = this.intStack[isp];
                            const var262 = Number(BigInt.asIntN(64, (BigInt(var261) + 11745n) * 86400000n));
                            const var263 = new Date(var262);
                            const var264 = var263.getDate();
                            const var265 = var263.getMonth();
                            const var266 = var263.getFullYear();
                            this.stringStack[ssp++] = JagString.join([JagString.parseInt(var264), JagString.wrap(this.field2171), JagString.wrap(this.months[var265]), JagString.wrap(this.field2171), JagString.parseInt(var266)]).toString();
                            continue;
                        }
                        if (effectiveOpcode === 4105) {
                            ssp -= 2;
                            const var267 = this.stringStack[ssp];
                            const var268 = this.stringStack[ssp + 1];
                            if (Client.localPlayer!.model! !== null && Client.localPlayer!.model!.gender) {
                                this.stringStack[ssp++] = var268;
                                continue;
                            }
                            this.stringStack[ssp++] = var267;
                            continue;
                        }
                        if (effectiveOpcode === 4106) {
                            isp--;
                            const var269 = this.intStack[isp];
                            this.stringStack[ssp++] = JagString.parseInt(var269).toString();
                            continue;
                        }
                        if (effectiveOpcode === 4107) {
                            ssp -= 2;
                            this.intStack[isp++] = JagString.wrap(this.stringStack[ssp]!).compareSorted(JagString.wrap(this.stringStack[ssp + 1]!));
                            continue;
                        }
                        if (effectiveOpcode === 4108) {
                            isp -= 2;
                            const var270 = this.intStack[isp];
                            ssp--;
                            const var271 = this.stringStack[ssp]!;
                            const var272 = this.intStack[isp + 1];
                            const var273 = Client.fontmetrics!.getFile(0, var272)!;
                            const var274 = new SoftwarePixFont(var273);
                            var274.setIcons(Client.modIcons, null);
                            this.intStack[isp++] = var274.predictLinesMultiline(var271, var270);
                            continue;
                        }
                        if (effectiveOpcode === 4109) {
                            isp -= 2;
                            ssp--;
                            const var275 = this.stringStack[ssp]!;
                            const var276 = this.intStack[isp + 1];
                            const var277 = this.intStack[isp];
                            const var278 = Client.fontmetrics!.getFile(0, var276)!;
                            const var279 = new SoftwarePixFont(var278);
                            var279.setIcons(Client.modIcons, null);
                            this.intStack[isp++] = var279.predictWidthMultiline(var275, var277);
                            continue;
                        }
                        if (effectiveOpcode === 4110) {
                            ssp -= 2;
                            const var280 = this.stringStack[ssp + 1];
                            const var281 = this.stringStack[ssp];
                            isp--;
                            if (this.intStack[isp] === 1) {
                                this.stringStack[ssp++] = var281;
                            } else {
                                this.stringStack[ssp++] = var280;
                            }
                            continue;
                        }
                        if (effectiveOpcode === 4111) {
                            ssp--;
                            const var282 = JagString.wrap(this.stringStack[ssp]!);
                            this.stringStack[ssp++] = PixfontGeneric.escape(var282.toString());
                            continue;
                        }
                        if (effectiveOpcode === 4112) {
                            isp--;
                            const var283 = this.intStack[isp];
                            ssp--;
                            const var284 = this.stringStack[ssp];
                            if (var283 === -1) {
                                throw new Error('null char');
                            }
                            this.stringStack[ssp++] = JagString.wrap(var284!).appendChar(var283).toString();
                            continue;
                        }
                        if (effectiveOpcode === 4113) {
                            isp--;
                            const var285 = this.intStack[isp];
                            this.intStack[isp++] = JagString.isPrintableChar(var285) ? 1 : 0;
                            continue;
                        }
                        if (effectiveOpcode === 4114) {
                            isp--;
                            const var286 = this.intStack[isp];
                            this.intStack[isp++] = JagString.isAlphanumericChar(var286) ? 1 : 0;
                            continue;
                        }
                        if (effectiveOpcode === 4115) {
                            isp--;
                            const var287 = this.intStack[isp];
                            this.intStack[isp++] = JagString.isLetterChar(var287) ? 1 : 0;
                            continue;
                        }
                        if (effectiveOpcode === 4116) {
                            isp--;
                            const var288 = this.intStack[isp];
                            this.intStack[isp++] = JagString.isDigitChar(var288) ? 1 : 0;
                            continue;
                        }
                        if (effectiveOpcode === 4117) {
                            ssp--;
                            const var289 = this.stringStack[ssp];
                            if (var289 === null) {
                                this.intStack[isp++] = 0;
                            } else {
                                this.intStack[isp++] = Number(JagString.wrap(var289).length);
                            }
                            continue;
                        }
                        if (effectiveOpcode === 4118) {
                            isp -= 2;
                            ssp--;
                            const var290 = JagString.wrap(this.stringStack[ssp]!);
                            const var291 = this.intStack[isp + 1];
                            const var292 = this.intStack[isp];
                            this.stringStack[ssp++] = var290.substring(var292, var291).toString();
                            continue;
                        }
                        if (effectiveOpcode === 4119) {
                            ssp--;
                            const var293 = JagString.wrap(this.stringStack[ssp]!);
                            const var294 = JagString.newStringBuilder(Number(var293.length));
                            let var295 = false;
                            for (let var296 = 0; var293.length > var296; var296++) {
                                const var297 = var293.charAt(var296);
                                if (var297 === 60) {
                                    var295 = true;
                                } else if (var297 === 62) {
                                    var295 = false;
                                } else if (!var295) {
                                    var294.append(var297);
                                }
                            }
                            var294.compact();
                            this.stringStack[ssp++] = var294.toString();
                            continue;
                        }
                        if (effectiveOpcode === 4120) {
                            isp -= 2;
                            ssp--;
                            const var298 = JagString.wrap(this.stringStack[ssp]!);
                            const var299 = this.intStack[isp];
                            const var300 = this.intStack[isp + 1];
                            this.intStack[isp++] = var298.indexOfChar(var299, var300);
                            continue;
                        }
                        if (effectiveOpcode === 4121) {
                            ssp -= 2;
                            const var301 = JagString.wrap(this.stringStack[ssp + 1]!);
                            isp--;
                            const var302 = this.intStack[isp];
                            const var303 = JagString.wrap(this.stringStack[ssp]!);
                            this.intStack[isp++] = var303.indexOfFrom(var302, var301);
                            continue;
                        }
                        if (effectiveOpcode === 4122) {
                            isp--;
                            const var304 = this.intStack[isp];
                            this.intStack[isp++] = JagString.toLowerCaseChar(var304);
                            continue;
                        }
                        if (effectiveOpcode === 4123) {
                            isp--;
                            const var305 = this.intStack[isp];
                            this.intStack[isp++] = JagString.toUpperCaseChar(var305);
                            continue;
                        }
                    } else if (effectiveOpcode < 4300) {
                        if (effectiveOpcode === 4200) {
                            isp--;
                            const var160 = this.intStack[isp];
                            this.stringStack[ssp++] = ObjType.list(var160).name;
                            continue;
                        }
                        if (effectiveOpcode === 4201) {
                            isp -= 2;
                            const var161 = this.intStack[isp];
                            const var162 = this.intStack[isp + 1];
                            const var163 = ObjType.list(var161);
                            if (var162 >= 1 && var162 <= 5 && var163.op![var162 - 1] !== null) {
                                this.stringStack[ssp++] = var163.op![var162 - 1];
                                continue;
                            }
                            this.stringStack[ssp++] = this.field1468;
                            continue;
                        }
                        if (effectiveOpcode === 4202) {
                            isp -= 2;
                            const var164 = this.intStack[isp + 1];
                            const var165 = this.intStack[isp];
                            const var166 = ObjType.list(var165);
                            if (var164 >= 1 && var164 <= 5 && var166.iop![var164 - 1] !== null) {
                                this.stringStack[ssp++] = var166.iop![var164 - 1];
                                continue;
                            }
                            this.stringStack[ssp++] = this.field1468;
                            continue;
                        }
                        if (effectiveOpcode === 4203) {
                            isp--;
                            const var167 = this.intStack[isp];
                            this.intStack[isp++] = ObjType.list(var167).cost;
                            continue;
                        }
                        if (effectiveOpcode === 4204) {
                            isp--;
                            const var168 = this.intStack[isp];
                            this.intStack[isp++] = ObjType.list(var168).stackable === 1 ? 1 : 0;
                            continue;
                        }
                        if (effectiveOpcode === 4205) {
                            isp--;
                            const var169 = this.intStack[isp];
                            const var170 = ObjType.list(var169);
                            if (var170.certtemplate === -1 && var170.certlink >= 0) {
                                this.intStack[isp++] = var170.certlink;
                                continue;
                            }
                            this.intStack[isp++] = var169;
                            continue;
                        }
                        if (effectiveOpcode === 4206) {
                            isp--;
                            const var171 = this.intStack[isp];
                            const var172 = ObjType.list(var171);
                            if (var172.certtemplate >= 0 && var172.certlink >= 0) {
                                this.intStack[isp++] = var172.certlink;
                                continue;
                            }
                            this.intStack[isp++] = var171;
                            continue;
                        }
                        if (effectiveOpcode === 4207) {
                            isp--;
                            const var173 = this.intStack[isp];
                            this.intStack[isp++] = ObjType.list(var173).members ? 1 : 0;
                            continue;
                        }
                        if (effectiveOpcode === 4208) {
                            isp -= 2;
                            const var174 = this.intStack[isp + 1];
                            const var175 = this.intStack[isp];
                            const var176 = ParamType.list(var174);
                            if (var176.isString()) {
                                this.stringStack[ssp++] = ObjType.list(var175).getParamString(var176.defaultString, var174);
                            } else {
                                this.intStack[isp++] = ObjType.list(var175).getParamInt(var174, var176.defaultInt);
                            }
                            continue;
                        }
                        if (effectiveOpcode === 4210) {
                            isp--;
                            const var177 = this.intStack[isp];
                            ssp--;
                            const var178 = this.stringStack[ssp]!;
                            ObjType.method467(var177 === 1, var178);
                            this.intStack[isp++] = ObjType.field3893;
                            continue;
                        }
                        if (effectiveOpcode === 4211) {
                            if (ObjType.field1210 !== null && ObjType.field3893 > ObjType.field2107) {
                                this.intStack[isp++] = ObjType.field1210[ObjType.field2107++] & 0xffff;
                                continue;
                            }
                            this.intStack[isp++] = -1;
                            continue;
                        }
                        if (effectiveOpcode === 4212) {
                            ObjType.field2107 = 0;
                            continue;
                        }
                    } else if (effectiveOpcode < 4400) {
                        if (effectiveOpcode === 4300) {
                            isp -= 2;
                            const var179 = this.intStack[isp];
                            const var180 = this.intStack[isp + 1];
                            const var181 = ParamType.list(var180);
                            if (var181.isString()) {
                                this.stringStack[ssp++] = NpcType.list(var179).getParamString(var180, var181.defaultString);
                            } else {
                                this.intStack[isp++] = NpcType.list(var179).getParamInt(var181.defaultInt, var180);
                            }
                            continue;
                        }
                    } else if (effectiveOpcode >= 4500) {
                        if (effectiveOpcode >= 4600) {
                            if (effectiveOpcode < 5100) {
                                if (effectiveOpcode === 5000) {
                                    this.intStack[isp++] = Client.chatPublicMode;
                                    continue;
                                }
                                if (effectiveOpcode === 5001) {
                                    isp -= 3;
                                    Client.chatPublicMode = this.intStack[isp];
                                    Client.chatPrivateMode = this.intStack[isp + 1];
                                    Client.chatTradeMode = this.intStack[isp + 2];
                                    Client.out.p1Enc(115);
                                    Client.out.p1(Client.chatPublicMode);
                                    Client.out.p1(Client.chatPrivateMode);
                                    Client.out.p1(Client.chatTradeMode);
                                    continue;
                                }
                                if (effectiveOpcode === 5002) {
                                    isp -= 2;
                                    const var182 = this.intStack[isp];
                                    ssp--;
                                    const var183 = this.stringStack[ssp]!;
                                    const var184 = this.intStack[isp + 1];
                                    Client.out.p1Enc(99);
                                    Client.out.p8(JagString.fromLatin1String(var183).toUserhash());
                                    Client.out.p1(var182 - 1);
                                    Client.out.p1(var184);
                                    continue;
                                }
                                if (effectiveOpcode === 5003) {
                                    isp--;
                                    const var185 = this.intStack[isp];
                                    let var186: string | null = null;
                                    if (var185 < 100) {
                                        var186 = Client.chatText[var185];
                                    }
                                    if (var186 === null) {
                                        var186 = this.field1468;
                                    }
                                    this.stringStack[ssp++] = var186;
                                    continue;
                                }
                                if (effectiveOpcode === 5004) {
                                    let var187 = -1;
                                    isp--;
                                    const var188 = this.intStack[isp];
                                    if (var188 < 100 && Client.chatText[var188] !== null) {
                                        var187 = Client.chatType[var188];
                                    }
                                    this.intStack[isp++] = var187;
                                    continue;
                                }
                                if (effectiveOpcode === 5005) {
                                    this.intStack[isp++] = Client.chatPrivateMode;
                                    continue;
                                }
                                if (effectiveOpcode === 5008) {
                                    ssp--;
                                    let var189 = this.stringStack[ssp]!;
                                    if (var189.startsWith('::')) {
                                        Client.doCheat(var189);
                                        continue;
                                    }
                                    if (Client.staffmodlevel === 0 && (Client.underage === 1 || Client.mapQuickchat === 1)) {
                                        continue;
                                    }
                                    const var190 = var189.toLowerCase();
                                    let var191 = 0;
                                    if (var190.startsWith(this.field488)) {
                                        var189 = var189.substring(this.field488.length);
                                        var191 = 0;
                                    } else if (var190.startsWith(this.field1837)) {
                                        var191 = 1;
                                        var189 = var189.substring(this.field1837.length);
                                    } else if (var190.startsWith(this.field2564)) {
                                        var189 = var189.substring(this.field2564.length);
                                        var191 = 2;
                                    } else if (var190.startsWith(this.field4467)) {
                                        var191 = 3;
                                        var189 = var189.substring(this.field4467.length);
                                    } else if (var190.startsWith(this.field4363)) {
                                        var189 = var189.substring(this.field4363.length);
                                        var191 = 4;
                                    } else if (var190.startsWith(this.field1355)) {
                                        var189 = var189.substring(this.field1355.length);
                                        var191 = 5;
                                    } else if (var190.startsWith(this.field669)) {
                                        var189 = var189.substring(this.field669.length);
                                        var191 = 6;
                                    } else if (var190.startsWith(this.field3690)) {
                                        var191 = 7;
                                        var189 = var189.substring(this.field3690.length);
                                    } else if (var190.startsWith(this.field696)) {
                                        var189 = var189.substring(this.field696.length);
                                        var191 = 8;
                                    } else if (var190.startsWith(this.field3817)) {
                                        var189 = var189.substring(this.field3817.length);
                                        var191 = 9;
                                    } else if (var190.startsWith(this.field3084)) {
                                        var191 = 10;
                                        var189 = var189.substring(this.field3084.length);
                                    } else if (var190.startsWith(this.field3703)) {
                                        var189 = var189.substring(this.field3703.length);
                                        var191 = 11;
                                    } else if (Client.lang !== 0) {
                                        if (var190.startsWith(Text.CHATCOL_YELLOW)) {
                                            var191 = 0;
                                            var189 = var189.substring(Text.CHATCOL_YELLOW.length);
                                        } else if (var190.startsWith(Text.CHATCOL_RED)) {
                                            var189 = var189.substring(Text.CHATCOL_RED.length);
                                            var191 = 1;
                                        } else if (var190.startsWith(Text.CHATCOL_GREEN)) {
                                            var191 = 2;
                                            var189 = var189.substring(Text.CHATCOL_GREEN.length);
                                        } else if (var190.startsWith(Text.CHATCOL_CYAN)) {
                                            var191 = 3;
                                            var189 = var189.substring(Text.CHATCOL_CYAN.length);
                                        } else if (var190.startsWith(Text.CHATCOL_PURPLE)) {
                                            var189 = var189.substring(Text.CHATCOL_PURPLE.length);
                                            var191 = 4;
                                        } else if (var190.startsWith(Text.CHATCOL_WHITE)) {
                                            var189 = var189.substring(Text.CHATCOL_WHITE.length);
                                            var191 = 5;
                                        } else if (var190.startsWith(Text.CHATEFFECT_FLASH1)) {
                                            var189 = var189.substring(Text.CHATEFFECT_FLASH1.length);
                                            var191 = 6;
                                        } else if (var190.startsWith(Text.CHATEFFECT_FLASH2)) {
                                            var191 = 7;
                                            var189 = var189.substring(Text.CHATEFFECT_FLASH2.length);
                                        } else if (var190.startsWith(Text.CHATEFFECT_FLASH3)) {
                                            var189 = var189.substring(Text.CHATEFFECT_FLASH3.length);
                                            var191 = 8;
                                        } else if (var190.startsWith(Text.CHATEFFECT_GLOW1)) {
                                            var189 = var189.substring(Text.CHATEFFECT_GLOW1.length);
                                            var191 = 9;
                                        } else if (var190.startsWith(Text.CHATEFFECT_GLOW2)) {
                                            var191 = 10;
                                            var189 = var189.substring(Text.CHATEFFECT_GLOW2.length);
                                        } else if (var190.startsWith(Text.CHATEFFECT_GLOW3)) {
                                            var189 = var189.substring(Text.CHATEFFECT_GLOW3.length);
                                            var191 = 11;
                                        }
                                    }
                                    const var192 = var189.toLowerCase();
                                    let var193 = 0;
                                    if (var192.startsWith(this.field1083)) {
                                        var193 = 1;
                                        var189 = var189.substring(this.field1083.length);
                                    } else if (var192.startsWith(this.field612)) {
                                        var189 = var189.substring(this.field612.length);
                                        var193 = 2;
                                    } else if (var192.startsWith(this.field1308)) {
                                        var193 = 3;
                                        var189 = var189.substring(this.field1308.length);
                                    } else if (var192.startsWith(this.field263)) {
                                        var193 = 4;
                                        var189 = var189.substring(this.field263.length);
                                    } else if (var192.startsWith(this.field4050)) {
                                        var189 = var189.substring(this.field4050.length);
                                        var193 = 5;
                                    } else if (Client.lang !== 0) {
                                        if (var192.startsWith(Text.CHATEFFECT_WAVE)) {
                                            var193 = 1;
                                            var189 = var189.substring(Text.CHATEFFECT_WAVE.length);
                                        } else if (var192.startsWith(Text.CHATEFFECT_WAVE2)) {
                                            var189 = var189.substring(Text.CHATEFFECT_WAVE2.length);
                                            var193 = 2;
                                        } else if (var192.startsWith(Text.CHATEFFECT_SHAKE)) {
                                            var189 = var189.substring(Text.CHATEFFECT_SHAKE.length);
                                            var193 = 3;
                                        } else if (var192.startsWith(Text.CHATEFFECT_SCROLL)) {
                                            var193 = 4;
                                            var189 = var189.substring(Text.CHATEFFECT_SCROLL.length);
                                        } else if (var192.startsWith(Text.CHATEFFECT_SLIDE)) {
                                            var193 = 5;
                                            var189 = var189.substring(Text.CHATEFFECT_SLIDE.length);
                                        }
                                    }
                                    Client.out.p1Enc(189);
                                    Client.out.p1(0);
                                    const var194 = Client.out.pos;
                                    Client.out.p1(var191);
                                    Client.out.p1(var193);
                                    WordPack.pack(Client.out, var189);
                                    Client.out.psize1(Client.out.pos - var194);
                                    continue;
                                }
                                if (effectiveOpcode === 5009) {
                                    ssp -= 2;
                                    const var195 = this.stringStack[ssp]!;
                                    const var196 = this.stringStack[ssp + 1]!;
                                    if (Client.staffmodlevel !== 0 || (Client.underage !== 1 && Client.mapQuickchat !== 1)) {
                                        Client.out.p1Enc(80);
                                        Client.out.p1(0);
                                        const var197 = Client.out.pos;
                                        Client.out.p8(JagString.fromLatin1String(var195).toUserhash());
                                        WordPack.pack(Client.out, var196);
                                        Client.out.psize1(Client.out.pos - var197);
                                    }
                                    continue;
                                }
                                if (effectiveOpcode === 5010) {
                                    isp--;
                                    const var198 = this.intStack[isp];
                                    let var199: string | null = null;
                                    if (var198 < 100) {
                                        var199 = Client.chatUsername[var198];
                                    }
                                    if (var199 === null) {
                                        var199 = this.field1468;
                                    }
                                    this.stringStack[ssp++] = var199;
                                    continue;
                                }
                                if (effectiveOpcode === 5011) {
                                    let var200: string | null = null;
                                    isp--;
                                    const var201 = this.intStack[isp];
                                    if (var201 < 100) {
                                        var200 = Client.chatScreenName[var201];
                                    }
                                    if (var200 === null) {
                                        var200 = this.field1468;
                                    }
                                    this.stringStack[ssp++] = var200;
                                    continue;
                                }
                                if (effectiveOpcode === 5012) {
                                    let var202 = -1;
                                    isp--;
                                    const var203 = this.intStack[isp];
                                    if (var203 < 100) {
                                        var202 = Client.field2483[var203];
                                    }
                                    this.intStack[isp++] = var202;
                                    continue;
                                }
                                if (effectiveOpcode === 5015) {
                                    let var204;
                                    if (Client.localPlayer === null || Client.localPlayer!.name === null) {
                                        var204 = TitleScreen.loginUser;
                                    } else {
                                        var204 = Client.localPlayer!.name;
                                    }
                                    this.stringStack[ssp++] = var204;
                                    continue;
                                }
                                if (effectiveOpcode === 5016) {
                                    this.intStack[isp++] = Client.chatTradeMode;
                                    continue;
                                }
                                if (effectiveOpcode === 5017) {
                                    this.intStack[isp++] = Client.chatHistoryLength;
                                    continue;
                                }
                                if (effectiveOpcode === 5050) {
                                    isp--;
                                    const var205 = this.intStack[isp];
                                    this.stringStack[ssp++] = QuickChatCatTypeList.list(var205).description;
                                    continue;
                                }
                                if (effectiveOpcode === 5051) {
                                    isp--;
                                    const var206 = this.intStack[isp];
                                    const var207 = QuickChatCatTypeList.list(var206);
                                    if (var207.subcategoryIds === null) {
                                        this.intStack[isp++] = 0;
                                    } else {
                                        this.intStack[isp++] = var207.subcategoryIds.length;
                                    }
                                    continue;
                                }
                                if (effectiveOpcode === 5052) {
                                    isp -= 2;
                                    const var208 = this.intStack[isp];
                                    const var209 = this.intStack[isp + 1];
                                    const var210 = QuickChatCatTypeList.list(var208);
                                    const var211 = var210.subcategoryIds![var209];
                                    this.intStack[isp++] = var211;
                                    continue;
                                }
                                if (effectiveOpcode === 5053) {
                                    isp--;
                                    const var212 = this.intStack[isp];
                                    const var213 = QuickChatCatTypeList.list(var212);
                                    if (var213.phraseIds === null) {
                                        this.intStack[isp++] = 0;
                                    } else {
                                        this.intStack[isp++] = var213.phraseIds.length;
                                    }
                                    continue;
                                }
                                if (effectiveOpcode === 5054) {
                                    isp -= 2;
                                    const var214 = this.intStack[isp];
                                    const var215 = this.intStack[isp + 1];
                                    this.intStack[isp++] = QuickChatCatTypeList.list(var214).phraseIds![var215];
                                    continue;
                                }
                                if (effectiveOpcode === 5055) {
                                    isp--;
                                    const var216 = this.intStack[isp];
                                    this.stringStack[ssp++] = QuickChatPhraseType.list(var216).getText();
                                    continue;
                                }
                                if (effectiveOpcode === 5056) {
                                    isp--;
                                    const var217 = this.intStack[isp];
                                    const var218 = QuickChatPhraseType.list(var217);
                                    if (var218.autoResponses === null) {
                                        this.intStack[isp++] = 0;
                                    } else {
                                        this.intStack[isp++] = var218.autoResponses.length;
                                    }
                                    continue;
                                }
                                if (effectiveOpcode === 5057) {
                                    isp -= 2;
                                    const var219 = this.intStack[isp + 1];
                                    const var220 = this.intStack[isp];
                                    this.intStack[isp++] = QuickChatPhraseType.list(var220).autoResponses![var219];
                                    continue;
                                }
                                if (effectiveOpcode === 5058) {
                                    this.field226 = new QuickChatPhrase();
                                    isp--;
                                    this.field226.id = this.intStack[isp];
                                    this.field226.type = QuickChatPhraseType.list(this.field226.id);
                                    this.field226.dynamics = new Int32Array(this.field226.type.getDynamicCommandCount());
                                    continue;
                                }
                                if (effectiveOpcode === 5059) {
                                    Client.out.p1Enc(197);
                                    Client.out.p1(0);
                                    const var221 = Client.out.pos;
                                    Client.out.p1(0);
                                    Client.out.p2(this.field226!.id);
                                    this.field226!.type!.encodeMessage(Client.out, this.field226!.dynamics!);
                                    Client.out.psize1(Client.out.pos - var221);
                                    continue;
                                }
                                if (effectiveOpcode === 5060) {
                                    ssp--;
                                    const var222 = this.stringStack[ssp]!;
                                    Client.out.p1Enc(242);
                                    Client.out.p1(0);
                                    const var223 = Client.out.pos;
                                    Client.out.p8(JagString.fromLatin1String(var222).toUserhash());
                                    Client.out.p2(this.field226!.id);
                                    this.field226!.type!.encodeMessage(Client.out, this.field226!.dynamics!);
                                    Client.out.psize1(Client.out.pos - var223);
                                    continue;
                                }
                                if (effectiveOpcode === 5061) {
                                    Client.out.p1Enc(197);
                                    Client.out.p1(0);
                                    const var224 = Client.out.pos;
                                    Client.out.p1(1);
                                    Client.out.p2(this.field226!.id);
                                    this.field226!.type!.encodeMessage(Client.out, this.field226!.dynamics!);
                                    Client.out.psize1(Client.out.pos - var224);
                                    continue;
                                }
                                if (effectiveOpcode === 5062) {
                                    isp -= 2;
                                    const var225 = this.intStack[isp + 1];
                                    const var226 = this.intStack[isp];
                                    this.intStack[isp++] = QuickChatCatTypeList.list(var226).subcategoryShortcuts![var225];
                                    continue;
                                }
                                if (effectiveOpcode === 5063) {
                                    isp -= 2;
                                    const var227 = this.intStack[isp + 1];
                                    const var228 = this.intStack[isp];
                                    this.intStack[isp++] = QuickChatCatTypeList.list(var228).phraseShortcuts![var227];
                                    continue;
                                }
                                if (effectiveOpcode === 5064) {
                                    isp -= 2;
                                    const var229 = this.intStack[isp];
                                    const var230 = this.intStack[isp + 1];
                                    if (var230 === -1) {
                                        this.intStack[isp++] = -1;
                                    } else {
                                        this.intStack[isp++] = QuickChatCatTypeList.list(var229).getSubcategoryByShortcut(var230);
                                    }
                                    continue;
                                }
                                if (effectiveOpcode === 5065) {
                                    isp -= 2;
                                    const var231 = this.intStack[isp];
                                    const var232 = this.intStack[isp + 1];
                                    if (var232 === -1) {
                                        this.intStack[isp++] = -1;
                                    } else {
                                        this.intStack[isp++] = QuickChatCatTypeList.list(var231).getPhraseByShortcut(var232);
                                    }
                                    continue;
                                }
                                if (effectiveOpcode === 5066) {
                                    isp--;
                                    const var233 = this.intStack[isp];
                                    this.intStack[isp++] = QuickChatPhraseType.list(var233).getDynamicCommandCount();
                                    continue;
                                }
                                if (effectiveOpcode === 5067) {
                                    isp -= 2;
                                    const var234 = this.intStack[isp];
                                    const var235 = this.intStack[isp + 1];
                                    const var236 = QuickChatPhraseType.list(var234).getDynamicCommand(var235);
                                    this.intStack[isp++] = var236;
                                    continue;
                                }
                                if (effectiveOpcode === 5068) {
                                    isp -= 2;
                                    const var237 = this.intStack[isp + 1];
                                    const var238 = this.intStack[isp];
                                    this.field226!.dynamics![var238] = var237;
                                    continue;
                                }
                                if (effectiveOpcode === 5069) {
                                    isp -= 2;
                                    const var239 = this.intStack[isp];
                                    const var240 = this.intStack[isp + 1];
                                    this.field226!.dynamics![var239] = var240;
                                    continue;
                                }
                                if (effectiveOpcode === 5070) {
                                    isp -= 3;
                                    const var241 = this.intStack[isp];
                                    const var242 = this.intStack[isp + 1];
                                    const var243 = this.intStack[isp + 2];
                                    const var244 = QuickChatPhraseType.list(var241);
                                    if (var244.getDynamicCommand(var242) !== 0) {
                                        throw new Error('bad command');
                                    }
                                    this.intStack[isp++] = var244.getDynamicCommandParam(var243, var242);
                                    continue;
                                }
                            } else if (effectiveOpcode < 5200) {
                                if (effectiveOpcode === 5100) {
                                    if (ClientKeyboardListener.keyHeld[86]) {
                                        this.intStack[isp++] = 1;
                                    } else {
                                        this.intStack[isp++] = 0;
                                    }
                                    continue;
                                }
                                if (effectiveOpcode === 5101) {
                                    if (ClientKeyboardListener.keyHeld[82]) {
                                        this.intStack[isp++] = 1;
                                    } else {
                                        this.intStack[isp++] = 0;
                                    }
                                    continue;
                                }
                                if (effectiveOpcode === 5102) {
                                    if (ClientKeyboardListener.keyHeld[81]) {
                                        this.intStack[isp++] = 1;
                                    } else {
                                        this.intStack[isp++] = 0;
                                    }
                                    continue;
                                }
                            } else if (effectiveOpcode < 5300) {
                                if (effectiveOpcode === 5200) {
                                    isp--;
                                    // WorldMap.setZoom(this.intStack[isp]);
                                    continue;
                                }
                                if (effectiveOpcode === 5201) {
                                    this.intStack[isp++] = 0; // WorldMap.getZoom();
                                    continue;
                                }
                                if (effectiveOpcode === 5202) {
                                    isp--;
                                    // WorldMap.flashMapFunction(this.intStack[isp]);
                                    continue;
                                }
                                if (effectiveOpcode === 5203) {
                                    ssp--;
                                    // WorldMap.jumpToLabel(JagString.wrap(this.stringStack[ssp]!));
                                    continue;
                                }
                                if (effectiveOpcode === 5204) {
                                    this.stringStack[ssp - 1] = ''; // WorldMap.getLabelName(JagString.wrap(this.stringStack[ssp - 1]!)).toString();
                                    continue;
                                }
                                if (effectiveOpcode === 5205) {
                                    ssp--;
                                    // WorldMap.setMap(JagString.wrap(this.stringStack[ssp]!));
                                    continue;
                                }
                            } else if (effectiveOpcode >= 5400) {
                                if (effectiveOpcode < 5500) {
                                    if (effectiveOpcode === 5400) {
                                        ssp -= 2;
                                        const var245 = this.stringStack[ssp]!;
                                        const var246 = this.stringStack[ssp + 1]!;
                                        isp--;
                                        const var247 = this.intStack[isp];
                                        Client.out.p1Enc(85);
                                        Client.out.p1(Packet.pjstrlen(var245) + Packet.pjstrlen(var246) + 1);
                                        Client.out.pjstr(var245);
                                        Client.out.pjstr(var246);
                                        Client.out.p1(var247);
                                        continue;
                                    }
                                    if (effectiveOpcode === 5401) {
                                        isp -= 2;
                                        Client.clientpalette[this.intStack[isp]] = FloType.getColour(this.intStack[isp + 1]);
                                        ObjType.resetModelCache();
                                        ObjType.resetSpriteCache();
                                        NpcType.resetModelCache();
                                        NpcType.resetHeadModelCache();
                                        Client.redrawAllComponents();
                                        continue;
                                    }
                                }
                            } else if (effectiveOpcode === 5304) {
                                this.intStack[isp++] = 0;
                                continue;
                            }
                        } else if (effectiveOpcode === 4500) {
                            isp -= 2;
                            const var248 = this.intStack[isp + 1];
                            const var249 = this.intStack[isp];
                            const var250 = ParamType.list(var248);
                            if (var250.isString()) {
                                this.stringStack[ssp++] = StructType.list(var249).getParamString(var250.defaultString, var248);
                            } else {
                                this.intStack[isp++] = StructType.list(var249).getParamInt(var250.defaultInt, var248);
                            }
                            continue;
                        }
                    } else if (effectiveOpcode === 4400) {
                        isp -= 2;
                        const var251 = this.intStack[isp];
                        const var252 = this.intStack[isp + 1];
                        const var253 = ParamType.list(var252);
                        if (var253.isString()) {
                            this.stringStack[ssp++] = LocType.list(var251).getParamString(var253.defaultString, var252);
                        } else {
                            this.intStack[isp++] = LocType.list(var251).getParamInt(var253.defaultInt, var252);
                        }
                        continue;
                    }
                } else {
                    let var361: IfType;
                    if (effectiveOpcode < 2000) {
                        var361 = (activeSecond ? this.activeComponent2 : this.activeComponent)!;
                    } else {
                        isp--;
                        var361 = IfType.get(this.intStack[isp])!;
                        effectiveOpcode -= 1000;
                    }
                    if (effectiveOpcode === 1300) {
                        isp--;
                        const var362 = this.intStack[isp] - 1;
                        if (var362 >= 0 && var362 <= 9) {
                            ssp--;
                            var361.setOpName(this.stringStack[ssp], var362);
                            continue;
                        }
                        ssp--;
                        continue;
                    }
                    if (effectiveOpcode === 1301) {
                        isp -= 2;
                        const var363 = this.intStack[isp];
                        const var364 = this.intStack[isp + 1];
                        var361.draggable = IfType.get(var364, var363);
                        continue;
                    }
                    if (effectiveOpcode === 1302) {
                        isp--;
                        var361.draggablebehavior = this.intStack[isp] === 1;
                        continue;
                    }
                    if (effectiveOpcode === 1303) {
                        isp--;
                        var361.dragdeadzone = this.intStack[isp];
                        continue;
                    }
                    if (effectiveOpcode === 1304) {
                        isp--;
                        var361.dragdeadtime = this.intStack[isp];
                        continue;
                    }
                    if (effectiveOpcode === 1305) {
                        ssp--;
                        var361.baseOpName = this.stringStack[ssp];
                        continue;
                    }
                    if (effectiveOpcode === 1306) {
                        ssp--;
                        var361.targetVerb = this.stringStack[ssp];
                        continue;
                    }
                    if (effectiveOpcode === 1307) {
                        var361.opNames = null;
                        continue;
                    }
                }
                throw new Error();
            }
        } catch (var381) {
            if (script.name === null) {
                if (Client.modewhere !== 0) {
                    Client.addChat(this.field3563, 0, this.field1468);
                }
                JagException.report(`CS2 - scr:${script.key} op:${reportOpcode}`, var381);
            } else {
                let var378 = `${this.field3010}${script.name}`;
                for (let var379 = this.fp - 1; var379 >= 0; var379--) {
                    var378 += `${this.field356}${this.frames[var379]!.script!.name}`;
                }
                if (reportOpcode === 40) {
                    const var380 = intOperands[pc];
                    var378 += `${this.field2496}${JagString.parseInt(var380).toString()}`;
                }
                if (Client.modewhere !== 0) {
                    Client.addChat(this.field288 + script.name, 0, this.field1468);
                }
                JagException.report(`CS2 - scr:${script.key} op:${reportOpcode}${var378}`, var381);
            }
        }
    }

    static executeOnLoad(arg0: number): void {
        if (arg0 === -1 || !IfType.openInterface(arg0)) {
            return;
        }
        const var1 = IfType.list[arg0]!;
        for (let var2 = 0; var2 < var1.length; var2++) {
            const var3 = var1[var2];
            if (var3.onload !== null) {
                const var4 = new HookReq();
                var4.component = var3;
                var4.onop = var3.onload;
                ScriptRunner.executeScript(var4, 2000000);
            }
        }
    }
}
