import { TableState } from "../table-state";

export class AnteState implements TableState {

    constructor() {
    }

    isHandInProgress(): boolean {
        return true;
    }

    requiresMultiplePlayers(): boolean {
        return true;
    }

}