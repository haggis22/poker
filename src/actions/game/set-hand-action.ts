import { Action } from "../action";
import { Hand } from "../../hands/hand";

export class SetHandAction implements Action {

    public tableID: number;
    public seatIndex: number;
    public hasHand: boolean;

    constructor(tableID: number, seatIndex: number, hasHand: boolean) {
        this.tableID = tableID;
        this.seatIndex = seatIndex;
        this.hasHand = hasHand;
    }


}