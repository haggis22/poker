import { Action } from "../action";

export class ClearHandAction implements Action {

    public tableID: number;
    public seatIndex: number;

    constructor(tableID: number, seatIndex: number) {
        this.tableID = tableID;
        this.seatIndex = seatIndex;
    }


}