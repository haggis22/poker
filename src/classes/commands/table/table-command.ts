import { Command } from "../command";

export class TableCommand extends Command {

    public tableID: number;

    constructor(tableID: number) {

        super();

        this.tableID = tableID;
    }



}