import { Command } from "../command";

export class FoldCommand implements Command {

    public tableID: number;
    public userID: number;


    constructor(tableID: number, userID: number) {
        this.tableID = tableID;
        this.userID = userID;
    }

}