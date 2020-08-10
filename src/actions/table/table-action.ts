import { Action } from "../action";
import { Serializable } from "../../communication/serializable";

export class TableAction extends Action {

    public tableID: number;

    constructor(tableID: number) {

        super();

        this.tableID = tableID;

    }


}