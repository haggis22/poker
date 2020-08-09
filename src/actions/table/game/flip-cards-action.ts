import { TableAction } from "../table-action";
import { Hand } from "../../../hands/hand";

export class FlipCardsAction extends TableAction {

    public seatIndex: number;
    public hand: Hand;

    constructor(tableID: number, seatIndex: number, hand: Hand) {

        super(tableID);

        this.seatIndex = seatIndex;
        this.hand = hand;

    }

}