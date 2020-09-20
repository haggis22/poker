import { TableAction } from "../table-action";
import { Card } from "../../../cards/card";
import { FacedownCard } from "../../../cards/face-down-card";

export class DealCardAction extends TableAction {

    public tableID: number;
    public seatIndex: number;
    public card: Card | FacedownCard;

    constructor(tableID: number, seatIndex: number, card: Card | FacedownCard) {

        super(tableID);

        this.seatIndex = seatIndex;
        this.card = card;

    }


    public toString(): string {
        return JSON.stringify(this);
    }

}