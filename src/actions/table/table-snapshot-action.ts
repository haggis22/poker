import { Action } from "../action";
import { Table } from "../../casino/tables/table";

export class TableSnapshotAction implements Action {

    public tableID: number;
    public table: Table;

    constructor(tableID: number, table: Table) {

        this.tableID = tableID;
        this.table = table;

    }

}