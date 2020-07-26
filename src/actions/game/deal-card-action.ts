import { Action } from "../action";
import { Card } from "../../cards/card";
import { Seat } from "../../casino/tables/seat";

export class DealCardAction implements Action {

    public tableID: number;
    public seatIndex: number;
    public card: Card;

    constructor(tableID: number, seatIndex: number, card: Card) {

        this.tableID = tableID;
        this.seatIndex = seatIndex;
        this.card = card;

    }


}