import { TableAction } from "../table-action";

export class MoveButtonAction extends TableAction {

    public seatIndex: number;

    constructor(tableID: number, seatIndex: number) {

        super(tableID);

        this.seatIndex = seatIndex;
    }

}