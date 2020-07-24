import { Action } from "../action";
import { Seat } from "../../casino/tables/seat";

export class MoveButtonAction implements Action {

    public tableID: number;
    public seatID: number;

    constructor(tableID: number, seatID: number) {
        this.tableID = tableID;
        this.seatID = seatID;
    }

}