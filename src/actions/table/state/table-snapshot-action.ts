import { TableAction } from "../table-action";
import { Table } from "../../../casino/tables/table";

export class TableSnapshotAction extends TableAction {

    public table: Table;

    constructor(tableID: number, table: Table) {

        super(tableID);

        this.table = table;

    }

}