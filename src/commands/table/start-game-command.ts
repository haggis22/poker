import { Command } from "../command";

export class StartGameCommand implements Command {

    public tableID: number;

    constructor(tableID: number) {
        this.tableID = tableID;
    }

}