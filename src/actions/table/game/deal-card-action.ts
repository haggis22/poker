import { TableAction } from "../table-action";
import { Card } from "../../../cards/card";

export class DealCardAction extends TableAction {

    public tableID: number;
    public seatIndex: number;
    public card: Card;

    constructor(tableID: number, seatIndex: number, card: Card) {

        super(tableID);

        this.seatIndex = seatIndex;
        this.card = card;

    }


    public toString(): string {
        return JSON.stringify(this);
    }

}