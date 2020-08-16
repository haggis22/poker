import { TableAction } from "../table-action";
import { TableState } from "../../../communication/serializable";

export class TableStateAction extends TableAction {

    public state: TableState

    constructor(tableID: number, state: TableState) {

        super(tableID);

        this.state = state;

    }

}