import { Action } from "../action";
import { Seat } from "../../casino/tables/seat";

export class MoveButtonAction implements Action {

    public tableID: number;
    public seatIndex: number;

    constructor(tableID: number, seatIndex: number) {
        this.tableID = tableID;
        this.seatIndex = seatIndex;
    }

}