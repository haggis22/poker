import { ITableState } from "./table-state";
import { ICommand } from "../../../commands/command";


export class DealState implements ITableState {

    public isFaceUp: boolean;

    constructor(isFaceUp: boolean) {

        this.isFaceUp = isFaceUp;

    }

    isHandInProgress(): boolean {
        return true;
    }


}