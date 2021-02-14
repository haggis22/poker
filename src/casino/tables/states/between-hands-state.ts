import { TableState } from "./table-state";

export class BetweenHandsState implements TableState {

    isHandInProgress(): boolean {
        return false;
    }

    requiresMultiplePlayers(): boolean {
        return false;
    }


}