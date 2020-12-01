import { Command } from "../command";

export class TableCommand extends Command {

    public userID: number;
    public tableID: number;

    constructor(tableID: number) {

        super();

        this.tableID = tableID;
    }



}