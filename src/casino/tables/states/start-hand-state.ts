import { ITableState } from "./table-state";

export class StartHandState implements ITableState {

    isHandInProgress(): boolean {
        return true;
    }


}