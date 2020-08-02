import { Action } from "../action";

export class BetReturnedAction implements Action {

    public tableID: number;
    public seatIndex: number;
    public amount: number;

    constructor(tableID: number, seatIndex: number, amount: number) {

        this.tableID = tableID;
        this.seatIndex = seatIndex;
        this.amount = amount;

    }

}