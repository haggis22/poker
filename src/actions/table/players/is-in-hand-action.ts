import { TableAction } from "../table-action";

export class IsInHandAction extends TableAction {

    public seatIndex: number;
    public isInHand: boolean;


    constructor(tableID: number, seatIndex: number, isInHand: boolean) {

        super(tableID);

        this.seatIndex = seatIndex;
        this.isInHand = isInHand;

    }

}