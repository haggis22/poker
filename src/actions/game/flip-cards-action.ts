import { Action } from "../action";
import { Hand } from "../../hands/hand";

export class FlipCardsAction implements Action {

    public tableID: number;
    public seatID: number;
    public hand: Hand;

    constructor(tableID: number, seatID: number, hand: Hand) {

        this.tableID = tableID;
        this.seatID = seatID;
        this.hand = hand;

    }

}