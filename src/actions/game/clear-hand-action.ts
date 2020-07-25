import { Action } from "../action";

export class ClearHandAction implements Action {

    public tableID: number;
    public seatID: number;

    constructor(tableID: number, seatID: number) {
        this.tableID = tableID;
        this.seatID = seatID;
    }


}