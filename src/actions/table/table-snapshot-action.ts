import { Action } from "../action";
import { Table } from "../../casino/tables/table";
import { PrivateAction } from "../private-action";

export class TableSnapshotAction implements Action, PrivateAction {

    public tableID: number;
    public userID: number;
    public table: Table;

    constructor(tableID: number, userID: number, table: Table) {

        this.tableID = tableID;
        this.userID = userID;
        this.table = table;

    }

}