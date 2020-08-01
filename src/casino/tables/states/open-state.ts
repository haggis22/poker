import { TableState } from "./table-state";

export class OpenState implements TableState {

    isHandInProgress(): boolean {
        return false;
    }


}