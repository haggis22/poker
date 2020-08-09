import { Action } from "../action";
import { PrivateAction } from "../private-action";
import { Card } from "../../cards/card";

export class DealCardAction implements Action, PrivateAction {

    public tableID: number;
    public userID: number;
    public seatIndex: number;
    public card: Card;

    constructor(tableID: number, userID: number, seatIndex: number, card: Card) {

        this.tableID = tableID;
        this.userID = userID;
        this.seatIndex = seatIndex;
        this.card = card;

    }


    public toString(): string {
        return JSON.stringify(this);
    }

}