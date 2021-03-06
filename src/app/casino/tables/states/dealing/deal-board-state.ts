import { TableState } from "../table-state";


export class DealBoardState implements TableState {

    public numCards: number;

    constructor(numCards: number) {

        this.numCards = numCards;

    }

    isHandInProgress(): boolean {
        return true;
    }

    requiresMultiplePlayers(): boolean {
        return true;
    }

}