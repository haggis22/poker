import { TableAction } from "../../table-action";
import { Card } from "../../../../cards/card";

export class PotCardsUsedAction extends TableAction {

    public cards: Card[]

    constructor(tableID: number, cards: Card[]) {

        super(tableID);

        this.cards = [...cards];

    }

}