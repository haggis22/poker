import { TableState } from "./table-state";

export class HandCompleteState implements TableState {

    isHandInProgress(): boolean {
        return false;
    }


}