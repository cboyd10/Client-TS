import type ClientScript from '#/client/ClientScript.js';

export default class ClientGosubFrame {
    intLocals: Int32Array | null = null;
    pc: number = -1;
    stringLocals: (string | null)[] | null = null;
    script: ClientScript | null = null;
}
