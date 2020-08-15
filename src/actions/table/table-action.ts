import { Action } from "../action";

export class TableAction extends Action {

    public tableID: number;

    constructor(tableID: number) {

        super();

        this.tableID = tableID;

    }


}