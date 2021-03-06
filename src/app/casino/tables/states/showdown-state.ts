import { TableState } from "./table-state";

export class ShowdownState implements TableState {

    isHandInProgress(): boolean {
        return true;
    }

    requiresMultiplePlayers(): boolean {
        return false;
    }

}