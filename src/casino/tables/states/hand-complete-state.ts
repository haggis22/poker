import { TableState } from "./table-state";

export class HandCompleteState implements TableState {

    isHandInProgress(): boolean {
        return true;
    }

    requiresMultiplePlayers(): boolean {
        return false;
    }



}