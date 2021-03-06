import { LobbyAction } from "./lobby-action";
import { TableSummary } from "../../casino/tables/table-summary";

export class ListTablesAction extends LobbyAction {

    public tables: TableSummary[];

    constructor(tables: TableSummary[]) {

        super();

        this.tables = [...tables];

    }

}