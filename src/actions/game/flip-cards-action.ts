import { Action } from "../action";
import { Hand } from "../../hands/hand";

export class FlipCardsAction implements Action {

    public tableID: number;
    public seatIndex: number;
    public hand: Hand;

    constructor(tableID: number, seatIndex: number, hand: Hand) {

        this.tableID = tableID;
        this.seatIndex = seatIndex;
        this.hand = hand;

    }

}