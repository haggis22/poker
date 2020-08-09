import { TableAction } from "../table-action";

export class BetReturnedAction extends TableAction {

    public seatIndex: number;
    public amount: number;

    constructor(tableID: number, seatIndex: number, amount: number) {

        super(tableID);

        this.seatIndex = seatIndex;
        this.amount = amount;

    }

}