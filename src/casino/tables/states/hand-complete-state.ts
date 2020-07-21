import { ITableState } from "./table-state";

export class HandCompleteState implements ITableState {

    isHandInProgress(): boolean {
        return false;
    }


}