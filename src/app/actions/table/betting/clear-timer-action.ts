import { TableAction } from "../table-action";
import { Bet } from "../../../casino/tables/betting/bet";

export class ClearTimerAction extends TableAction {

    public seatIndex: number;

    constructor(tableID: number, seatIndex: number) {

        super(tableID);

        this.seatIndex = seatIndex;

    }

}