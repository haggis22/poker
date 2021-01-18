import { TableAction } from "../table-action";

export class SeatVacatedAction extends TableAction {

    public seatIndex: number;

    constructor(tableID: number, seatIndex: number) {

        super(tableID);

        this.seatIndex = seatIndex;

    }

}