import { Action } from "../action";
import { Table } from "../../casino/tables/table";

export class TableSnapshotAction implements Action {


    public table: Table;

    constructor(table: Table) {
        this.table = table;
    }

}