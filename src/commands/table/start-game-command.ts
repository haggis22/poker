import { ICommand } from "../command";

export class StartGameCommand implements ICommand {

    public tableID: number;

    constructor(tableID: number) {
        this.tableID = tableID;
    }

}