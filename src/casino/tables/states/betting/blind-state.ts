import { TableState } from "../table-state";

export class BlindState implements TableState {

    constructor() {
    }

    isHandInProgress(): boolean {
        return true;
    }

    requiresMultiplePlayers(): boolean {

        // This indicates whether we need multiple players that *already have a Hand*
        // But for AnteState and BlindState, this is where we set up whether or not they have a hand
        return false;
    }

}