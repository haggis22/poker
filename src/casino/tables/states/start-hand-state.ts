import { TableState } from "./table-state";

export class StartHandState implements TableState {

    isHandInProgress(): boolean {
        return true;
    }


}