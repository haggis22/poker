import { TableAction } from "../table-action";

export class SetHandAction extends TableAction {

    public seatIndex: number;
    public hasHand: boolean;

    constructor(tableID: number, seatIndex: number, hasHand: boolean) {

        super(tableID);

        this.seatIndex = seatIndex;
        this.hasHand = hasHand;
    }


}