import { ITableState } from "./table-state";

export class ShowdownState implements ITableState {

    isHandInProgress(): boolean {
        return true;
    }


}