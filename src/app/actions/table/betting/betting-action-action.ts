import { TableAction } from "../table-action";

export class BettingActionAction extends TableAction {

    public seatIndex: number;
    public action: string;

    constructor(tableID: number, seatIndex: number, action: string) {

        super(tableID);

        this.seatIndex = seatIndex;
        this.action = action;

    }

}