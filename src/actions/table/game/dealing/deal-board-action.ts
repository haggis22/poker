import { Card } from "../../../../cards/card";
import { TableAction } from "../../table-action";

export class DealBoardAction extends TableAction {

    public tableID: number;
    public cards: Array<Card>;


    constructor(tableID: number, cards: Array<Card>) {

        super(tableID);

        this.cards = [...cards];

    }


}