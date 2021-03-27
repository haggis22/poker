import { TableCommand } from "./table-command";

export class StandUpCommand extends TableCommand {

    public tableID: number;


    constructor(tableID: number) {

        super(tableID);

    }

}