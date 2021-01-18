import { Table } from "./table";

export interface TableObserver {


    notifyTableUpdated(table: Table);

}