import { TableState } from "./table-state";

export class StartHandState implements TableState {

    isHandInProgress(): boolean {
        return true;
    }

    // Perhaps - counter-intuitive, but this sets up the hand, so no-one has a hand yet
    requiresMultiplePlayers(): boolean {
        return false;
    }


}