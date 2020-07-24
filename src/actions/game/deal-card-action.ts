import { Action } from "../action";
import { Card } from "../../cards/card";
import { Seat } from "../../casino/tables/seat";

export class DealCardAction implements Action {

    public tableID: number;
    public seatID: number;
    public card: Card;

    constructor(tableID: number, seatID: number, card: Card) {

        this.tableID = tableID;
        this.seatID = seatID;
        this.card = card;

    }


}