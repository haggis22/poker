import { TableAction } from "../table-action";
import { Fold } from "../../../casino/tables/betting/fold";
import { Card } from "../../../cards/card";
import { FacedownCard } from "../../../cards/face-down-card";

export class FoldAction extends TableAction {

    public seatIndex: number;
    public fold: Fold;
    public cards: Array<Card | FacedownCard>;

    constructor(tableID: number, seatIndex: number, fold: Fold, cards: Array<Card | FacedownCard>) {

        super(tableID);

        this.seatIndex = seatIndex;
        this.fold = fold;
        this.cards = [...cards];

    }

}