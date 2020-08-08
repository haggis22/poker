import { User } from "../../players/user";
import { Command } from "../command";

export class TableSnapshotCommand implements Command {

    public tableID: number;
    public userID: number;


    constructor(tableID: number, userID: number) {
        this.tableID = tableID;
        this.userID = userID;
    }

}