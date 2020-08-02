import { Command } from "../command";

export class FoldCommand implements Command {

    public tableID: number;
    public playerID: number;


    constructor(tableID: number, playerID: number) {
        this.tableID = tableID;
        this.playerID = playerID;
    }

}