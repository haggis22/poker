import { TableState } from "../table-state";

export class BlindsAndAntesState implements TableState {

    constructor() {
    }

    isHandInProgress(): boolean {
        // Make sure we realize that the hand has "started" so that no-one else can jump in after we have set up the blinds order
        return true;
    }

    requiresMultiplePlayers(): boolean {

        // This indicates whether we need multiple players that *already have a Hand*
        // But for BlindsAndAntesState, this is where we set up whether or not they have a hand
        return false;
    }

}