import { TableCommand } from "./table-command";

export class SitInCommand extends TableCommand {

    public userID: number;


    constructor(tableID: number, userID: number) {

        super(tableID);

        this.userID = userID;
    }

}