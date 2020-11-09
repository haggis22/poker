import { TableState } from "../table-state";


export class DealState implements TableState {

    public isFaceUp: boolean;

    constructor(isFaceUp: boolean) {

        this.isFaceUp = isFaceUp;

    }

    isHandInProgress(): boolean {
        return true;
    }

    requiresMultiplePlayers(): boolean {
        return true;
    }

}