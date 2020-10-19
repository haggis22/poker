import { TableAction } from "../table-action";

export class ClearHandAction extends TableAction {

    public tableID: number;
    public seatIndex: number;

    constructor(tableID: number, seatIndex: number) {

        super(tableID);

        this.seatIndex = seatIndex;

    }

}